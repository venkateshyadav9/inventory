using System;
using System.Collections.Generic;

namespace InventoryAPI.Models;

public partial class AssetIssue
{
    public int IssueId { get; set; }

    public int EmployeeId { get; set; }

    public int AssetId { get; set; }

    public int Quantity { get; set; }

    public DateTime IssueDate { get; set; }

    public string EmployeeName { get; set; } = null!;

    public string AssetName { get; set; } = null!;

    public virtual Asset Asset { get; set; } = null!;

    public virtual Employee Employee { get; set; } = null!;
}
