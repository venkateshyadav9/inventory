using System;
using System.Collections.Generic;

namespace InventoryAPI.Models;

public partial class Asset
{
    public int AssetId { get; set; }

    public string AssetCode { get; set; } = null!;

    public string AssetName { get; set; } = null!;

    public int Quantity { get; set; }

    public virtual ICollection<AssetIssue> AssetIssues { get; set; } = new List<AssetIssue>();
}
