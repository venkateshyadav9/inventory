using System;
using System.Collections.Generic;

namespace InventoryAPI.Models;

public partial class Employee
{
    public int EmployeeId { get; set; }

    public string EmployeeCode { get; set; } = null!;

    public string EmployeeName { get; set; } = null!;

    public string Status { get; set; } = null!;

    public string? Email { get; set; }

    public virtual ICollection<AssetIssue> AssetIssues { get; set; } = new List<AssetIssue>();
}
