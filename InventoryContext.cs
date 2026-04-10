using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace InventoryAPI.Models;

public partial class InventoryContext : DbContext
{
    public InventoryContext()
    {
    }

    public InventoryContext(DbContextOptions<InventoryContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Asset> Assets { get; set; }

    public virtual DbSet<AssetIssue> AssetIssues { get; set; }

    public virtual DbSet<AssetReturn> AssetReturns { get; set; }

    public virtual DbSet<Employee> Employees { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=localhost;Database=INVENTORY;Trusted_Connection=True;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Asset>(entity =>
        {
            entity.HasKey(e => e.AssetId).HasName("PK__Assets__43492352194C948D");

            entity.HasIndex(e => e.AssetCode, "UQ__Assets__2DDE5240129C4F03").IsUnique();

            entity.Property(e => e.AssetCode).HasMaxLength(50);
            entity.Property(e => e.AssetName).HasMaxLength(150);
        });

        modelBuilder.Entity<AssetIssue>(entity =>
        {
            entity.HasKey(e => e.IssueId).HasName("PK__AssetIss__6C8616046588EAAB");

            entity.Property(e => e.AssetName).HasMaxLength(150);
            entity.Property(e => e.EmployeeName).HasMaxLength(150);
            entity.Property(e => e.IssueDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Asset).WithMany(p => p.AssetIssues)
                .HasForeignKey(d => d.AssetId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_AssetIssues_Asset");

            entity.HasOne(d => d.Employee).WithMany(p => p.AssetIssues)
                .HasForeignKey(d => d.EmployeeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_AssetIssues_Employee");
        });

        modelBuilder.Entity<AssetReturn>(entity =>
        {
            entity.HasKey(e => e.ReturnId).HasName("PK__AssetRet__F445E9A8B19ECB21");

            entity.Property(e => e.Condition).HasMaxLength(50);
            entity.Property(e => e.Remarks).HasMaxLength(250);
            entity.Property(e => e.ReturnDate).HasColumnType("datetime");
        });

        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.EmployeeId).HasName("PK__Employee__7AD04F11CF7B3EDE");

            entity.HasIndex(e => e.EmployeeCode, "UQ__Employee__1F642548F79DCE52").IsUnique();

            entity.Property(e => e.Email)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.EmployeeCode).HasMaxLength(50);
            entity.Property(e => e.EmployeeName).HasMaxLength(150);
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Active");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CC4C846E5E9D");

            entity.HasIndex(e => e.Username, "UQ__Users__536C85E496495240").IsUnique();

            entity.Property(e => e.Password).HasMaxLength(50);
            entity.Property(e => e.Username).HasMaxLength(50);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
