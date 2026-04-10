using InventoryAPI.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;

using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;



var builder = WebApplication.CreateBuilder(args);

// Database Connection
builder.Services.AddDbContext<InventoryContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

var app = builder.Build();

app.UseCors("AllowAll");


// Enable Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// ==========================
// Login APIs
// ==========================

// Login API
app.MapPost("/login", async (User loginUser, InventoryContext db) =>
{
    var user = await db.Users
        .FirstOrDefaultAsync(u => u.Username == loginUser.Username && u.Password == loginUser.Password);

    if (user == null) return Results.Unauthorized();

    return Results.Ok(new { userId = user.UserId, username = user.Username });
});


// ==========================
// ASSET APIs
// ==========================

// Get All Assets
app.MapGet("/assets", async (InventoryContext db) =>
    await db.Assets.ToListAsync());

// Get Asset By Id
app.MapGet("/assets/{id}", async (InventoryContext db, int id) =>
{
    var asset = await db.Assets.FindAsync(id);
    return asset is not null ? Results.Ok(asset) : Results.NotFound();
});

// Add Asset
app.MapPost("/assets", async (InventoryContext db, Asset asset) =>
{
    db.Assets.Add(asset);
    await db.SaveChangesAsync();
    return Results.Created($"/assets/{asset.AssetId}", asset);
});

// Update Asset
// app.MapPut("/assets/{id}", async (InventoryContext db, int id, Asset updatedAsset) =>
// {
//     var asset = await db.Assets.FindAsync(id);
//     if (asset is null) return Results.NotFound();

//     asset.AssetCode = updatedAsset.AssetCode;
//     asset.AssetName = updatedAsset.AssetName;
//     asset.Quantity = updatedAsset.Quantity;

//     await db.SaveChangesAsync();
//     return Results.Ok(asset);
// });

// Update Asset - FIXED
app.MapPut("/assets/{id}", async (InventoryContext db, int id, HttpContext context) =>
{
    try
    {
        // Read raw JSON and manually deserialize with correct casing
        using var reader = new StreamReader(context.Request.Body);
        var json = await reader.ReadToEndAsync();

        var jsonDoc = JsonDocument.Parse(json);
        var root = jsonDoc.RootElement;

        var asset = await db.Assets.FindAsync(id);
        if (asset is null) return Results.NotFound();

        // Map frontend camelCase to backend PascalCase
        asset.AssetCode = root.TryGetProperty("assetCode", out var codeProp) ? codeProp.GetString() : asset.AssetCode;
        asset.AssetName = root.TryGetProperty("assetName", out var nameProp) ? nameProp.GetString() : asset.AssetName;
        asset.Quantity = root.TryGetProperty("quantity", out var qtyProp) ? qtyProp.GetInt32() : asset.Quantity;

        await db.SaveChangesAsync();
        return Results.Ok(asset);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"PUT Error: {ex.Message}");
        return Results.Problem("Update failed - check server console");
    }
});



// Delete Asset
app.MapDelete("/assets/{id}", async (InventoryContext db, int id) =>
{
    var asset = await db.Assets.FindAsync(id);
    if (asset is null) return Results.NotFound();

    db.Assets.Remove(asset);
    await db.SaveChangesAsync();
    return Results.NoContent();
});


// ==========================
// EMPLOYEE APIs
// ==========================

// Get All Employees
app.MapGet("/employees", async (InventoryContext db) =>
    await db.Employees.ToListAsync());

// Add Employee
app.MapPost("/employees", async (InventoryContext db, Employee emp) =>
{
    db.Employees.Add(emp);
    await db.SaveChangesAsync();
    return Results.Created($"/employees/{emp.EmployeeId}", emp);
});

// Update Employee
app.MapPut("/employees/{id}", async (InventoryContext db, int id, Employee updatedEmp) =>
{
    var emp = await db.Employees.FindAsync(id);
    if (emp is null) return Results.NotFound();

    emp.EmployeeCode = updatedEmp.EmployeeCode;
    emp.EmployeeName = updatedEmp.EmployeeName;
    emp.Email = updatedEmp.Email;
    emp.Status = updatedEmp.Status;

    await db.SaveChangesAsync();
    return Results.Ok(emp);
});

// Delete Employee
app.MapDelete("/employees/{id}", async (InventoryContext db, int id) =>
{
    var emp = await db.Employees.FindAsync(id);
    if (emp is null) return Results.NotFound();

    db.Employees.Remove(emp);
    await db.SaveChangesAsync();
    return Results.NoContent();
});


// ==========================
// ISSUE ASSET API
// ==========================

// app.MapPost("/assetissues", async (InventoryContext db, AssetIssue issue) =>
// {
//     var employee = await db.Employees.FindAsync(issue.EmployeeId);
//     var asset = await db.Assets.FindAsync(issue.AssetId);

//     if (employee == null || asset == null)
//         return Results.BadRequest("Invalid Employee or Asset");

//     if (issue.Quantity > asset.Quantity)
//         return Results.BadRequest("Not enough stock available");

//     var newIssue = new AssetIssue
//     {
//         EmployeeId = issue.EmployeeId,
//         EmployeeName = employee.EmployeeName,
//         AssetId = issue.AssetId,
//         AssetName = asset.AssetName,
//         Quantity = issue.Quantity,
//         IssueDate = DateTime.Now
//     };

//     // Reduce quantity in Assets table
//     asset.Quantity -= issue.Quantity;

//     db.AssetIssues.Add(newIssue);
//     await db.SaveChangesAsync();

//     return Results.Ok(newIssue);
// });

// 🔥 NEW EMAIL-ENABLED /assetissues POST
app.MapPost("/assetissues", async (InventoryContext db, AssetIssue issue) =>
{
    var employee = await db.Employees.FindAsync(issue.EmployeeId);
    var asset = await db.Assets.FindAsync(issue.AssetId);

    if (employee == null || asset == null)
        return Results.BadRequest("Invalid Employee or Asset");

    if (issue.Quantity > asset.Quantity)
        return Results.BadRequest("Not enough stock available");

    var newIssue = new AssetIssue
    {
        EmployeeId = issue.EmployeeId,
        EmployeeName = employee.EmployeeName,
        AssetId = issue.AssetId,
        AssetName = asset.AssetName,
        Quantity = issue.Quantity,
        IssueDate = DateTime.Now
    };

    // Reduce stock
    asset.Quantity -= issue.Quantity;

    // 🔥 SEND EMAIL (won't crash if fails)
    try
    {
        if (!string.IsNullOrEmpty(employee.Email))
        {
            await SendIssueEmail(employee.Email, employee.EmployeeName, asset.AssetName, issue.Quantity);
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Email send failed: {ex.Message}");
        // Continue without email
    }

    db.AssetIssues.Add(newIssue);
    await db.SaveChangesAsync();

    return Results.Ok(newIssue);
});

// Get all issued assets
app.MapGet("/assetissues", async (InventoryContext db) =>
{
    var list = await db.AssetIssues
        .Select(ai => new AssetIssue // Use DTO instead of anonymous
        {
            IssueId = ai.IssueId,
            EmployeeName = ai.EmployeeName,
            AssetName = ai.AssetName,
            Quantity = ai.Quantity,
            IssueDate = ai.IssueDate
        })
        .ToListAsync();
    return Results.Ok(list);
});

// ==========================
// Return ASSET API
// ==========================

app.MapPost("/assetreturns", async (InventoryContext db, AssetReturn returnData) =>
{
    var issue = await db.AssetIssues.FindAsync(returnData.IssueId);
    if (issue == null)
        return Results.BadRequest("Issue not found");

    var totalReturned = await db.AssetReturns
        .Where(r => r.IssueId == returnData.IssueId)
        .SumAsync(r => (int?)r.ReturnQuantity) ?? 0;

    var balance = issue.Quantity - totalReturned;

    if (returnData.ReturnQuantity > balance)
        return Results.BadRequest("Return exceeds balance");

    var asset = await db.Assets.FindAsync(issue.AssetId);
    if (asset == null)
        return Results.BadRequest("Asset not found");

    // 🔥 Increase stock
    asset.Quantity += returnData.ReturnQuantity;

    returnData.ReturnDate = DateTime.Now;

    db.AssetReturns.Add(returnData);
    await db.SaveChangesAsync();

    return Results.Ok(returnData);
});

app.MapGet("/assetreturns", async (InventoryContext db) =>
    await db.AssetReturns.ToListAsync());


app.MapGet("/assetissues/byemployee/{employeeId}", async (InventoryContext db, int employeeId) =>
{
    var issues = await db.AssetIssues
        .Where(i => i.EmployeeId == employeeId)
        .Join(db.Assets,
              issue => issue.AssetId,
              asset => asset.AssetId,
              (issue, asset) => new
              {
                  issue.IssueId,
                  issue.EmployeeId,
                  issue.AssetId,
                  AssetName = asset.AssetName,
                  issue.Quantity,
                  issue.IssueDate
              })
        .ToListAsync();

    return Results.Ok(issues);
});



//Email sending method (dummy implementation)
async Task SendIssueEmail(string toEmail, string employeeName, string assetName, int quantity)
{
    var message = new MimeMessage();
    message.From.Add(new MailboxAddress("IT Admin", "venkateshnlr08@gmail.com"));
    message.To.Add(new MailboxAddress(employeeName, toEmail));
    message.Subject = $"Asset Issued: {assetName}";

    message.Body = new TextPart("plain")
    {
        Text = $@"
Hi {employeeName},

You have been issued:

📦 Asset: {assetName}
🔢 Quantity: {quantity}
📅 Issue Date: {DateTime.Now:dd/MM/yyyy HH:mm}

Please take good care of company assets.

Regards,
IT Administrator"
    };

    using var client = new SmtpClient();
    await client.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
    await client.AuthenticateAsync("venkateshnlr08@gmail.com", "jgzu uuaz sfgk cyjv");
    await client.SendAsync(message);
    await client.DisconnectAsync(true);
}

app.Run();
