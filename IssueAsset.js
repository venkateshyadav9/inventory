import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "primereact/button";

function IssueAsset() {

    const dataTableRef = useRef(null);
    const [globalFilter, setGlobalFilter] = useState("");
    const [employees, setEmployees] = useState([]);
    const [assets, setAssets] = useState([]);
    const [issuedAssets, setIssuedAssets] = useState([]);
    const [formData, setFormData] = useState({
        employeeId: "",
        assetId: "",
        quantity: ""
    });



    // If you are not using filtering yet
    const getFilteredData = () => issuedAssets;

    // Fetch All Data
    const fetchData = async () => {
        try {
            const empRes = await axios.get("http://localhost:5016/employees");
            const assetRes = await axios.get("http://localhost:5016/assets");
            const issueRes = await axios.get("http://localhost:5016/assetissues");

            setEmployees(empRes.data);
            setAssets(assetRes.data);
            setIssuedAssets(issueRes.data);
        } catch (error) {
            console.error("Fetch Error:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post("http://localhost:5016/assetissues", {
                employeeId: Number(formData.employeeId),
                assetId: Number(formData.assetId),
                quantity: Number(formData.quantity)
            });

            alert("Asset Issued Successfully ✅");

            setFormData({ employeeId: "", assetId: "", quantity: "" });
            fetchData();

        } catch (error) {
            alert("Issue Failed ❌");
            console.error(error);
        }
    };

    /* ================= EXCEL EXPORT ================= */
    const exportXLSX = () => {
        console.log("issuedAssets before export:", issuedAssets); // DEBUG

        if (!issuedAssets?.length) {
            alert("No data to export");
            return;
        }

        // Transform data to match Excel column order + fix casing
        const exportData = issuedAssets.map(item => ({
            "ID": item.issueId,
            "Employee": item.employeeName,
            "Asset": item.assetName,
            "Quantity": item.quantity,
            "Issue Date": new Date(item.issueDate).toLocaleDateString()
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);

        // Auto-size columns
        const colWidths = [
            { wch: 10 }, // ID
            { wch: 20 }, // Employee  
            { wch: 25 }, // Asset
            { wch: 12 }, // Quantity
            { wch: 18 }  // Date
        ];
        worksheet['!cols'] = colWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Issued Assets");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        saveAs(
            new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }),
            `IssuedAssets_${new Date().toISOString().slice(0, 10)}.xlsx`
        );
    };

    const renderHeader = () => {
        return (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <span className="p-input-icon-right">

                    <InputText
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Search assets..."
                    />
                    <i className="pi pi-search"
                        style={{
                            position: "absolute",
                            right: "10px",
                            top: "70%",
                            transform: "translateY(-50%)",
                            color: "#6b7280"
                        }}
                    />
                </span>
            </div>
        );
    };

    // Date formatter for column
    const dateBodyTemplate = (rowData) => {
        return new Date(rowData.issueDate).toLocaleString();
    };

    return (
        <div style={{
            maxWidth: "1400px",
            margin: "20px auto",
            padding: "20px",
            //  backgroundColor: "#f1dbee",
            background: "linear-gradient(135deg, #37b162, #bb86f3)",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
        }}>

            <h2>Issue Asset</h2>

            {/* FORM */}
            <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
                <div style={{ display: "flex", gap: "20px", alignItems: "flex-end" }}>

                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <label style={{ fontWeight: "bold", marginBottom: "5px" }}>
                            Employee
                        </label>
                        <select
                            name="employeeId"
                            value={formData.employeeId}
                            onChange={handleChange}
                            required
                            style={{ padding: "8px", width: "220px" }}
                        >
                            <option value="">Select Employee</option>
                            {employees.map(emp => (
                                <option key={emp.employeeId} value={emp.employeeId}>
                                    {emp.employeeName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <label style={{ fontWeight: "bold", marginBottom: "5px" }}>
                            Asset
                        </label>
                        <select
                            name="assetId"
                            value={formData.assetId}
                            onChange={handleChange}
                            required
                            style={{ padding: "8px", width: "220px" }}
                        >
                            <option value="">Select Asset</option>
                            {assets.map(asset => (
                                <option key={asset.assetId} value={asset.assetId}>
                                    {asset.assetName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <label style={{ fontWeight: "bold", marginBottom: "5px" }}>
                            Quantity
                        </label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            required
                            min="1"
                            maxLength={2}
                            style={{ padding: "8px", width: "150px" }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            padding: "8px 20px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer"
                        }}
                    >
                        Issue
                    </button>

                </div>
            </form>

            {/* EXPORT BUTTON */}
            {/* <div style={{ display: "flex", marginBottom: "10px" }}>
                <Button
                    label="Export XLSX"
                    icon="pi pi-file-excel"
                    style={{
                        marginLeft: "auto",
                        backgroundColor: "#22c55e",
                        borderColor: "#22c55e",
                        color: "#fff"
                    }}
                    onClick={exportXLSX}
                />
            </div> */}

            {/* <h3>Issued Assets List</h3> */}

            {/* DATATABLE */}

            {/* <DataTable
                ref={dataTableRef}
                value={issuedAssets}
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 20]}
                responsiveLayout="scroll"
                stripedRows
                showGridlines

                header={renderHeader()}
                globalFilter={globalFilter}
                globalFilterFields={["issueId", "employeeName", "assetName", "quantity"]}
            >
                <Column field="issueId" header="ID" sortable />
                <Column field="employeeName" header="Employee" sortable />
                <Column field="assetName" header="Asset" sortable />
                <Column field="quantity" header="Quantity" sortable />
                <Column
                    field="issueDate"
                    header="Issue Date"
                    body={(row) =>
                        new Date(row.issueDate).toLocaleString()
                    }
                    sortable
                />
            </DataTable> */}


        </div>
    );
}

export default IssueAsset;