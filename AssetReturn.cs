using System;
using System.Collections.Generic;

namespace InventoryAPI.Models;

public partial class AssetReturn
{
    public int ReturnId { get; set; }

    public int IssueId { get; set; }

    public int ReturnQuantity { get; set; }

    public DateTime ReturnDate { get; set; }

    public string? Condition { get; set; }

    public string? Remarks { get; set; }
}
