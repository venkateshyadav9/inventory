import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function Reports() {

    const dataTableRef = useRef(null);
    const [issuedAssets, setIssuedAssets] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");

    const fetchData = async () => {
        try {
            const issueRes = await axios.get("http://localhost:5016/assetissues");
            setIssuedAssets(issueRes.data);
        } catch (error) {
            console.error("Fetch Error:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    /* ================= EXCEL EXPORT ================= */
    const exportXLSX = () => {

        if (!issuedAssets?.length) {
            alert("No data to export");
            return;
        }

        const exportData = issuedAssets.map(item => ({
            "ID": item.issueId,
            "Employee": item.employeeName,
            "Asset": item.assetName,
            "Quantity": item.quantity,
            "Issue Date": new Date(item.issueDate).toLocaleDateString()
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);

        worksheet['!cols'] = [
            { wch: 10 },
            { wch: 20 },
            { wch: 25 },
            { wch: 12 },
            { wch: 18 }
        ];

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
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                {/* LEFT SIDE - SEARCH */}
                <span className="p-input-icon-right">
                    <InputText
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Search Report..."
                        style={{ width: "250px" }}
                    />
                    <i
                        className="pi pi-search"
                        style={{
                            position: "absolute",
                            right: "10px",
                            top: "70%",
                            transform: "translateY(-50%)",
                            color: "#6b7280"
                        }}
                    />
                </span>

                {/* RIGHT SIDE - EXPORT BUTTON */}
                <Button
                    label="Export XLSX"
                    icon="pi pi-file-excel"
                    style={{
                        backgroundColor: "#22c55e",
                        borderColor: "#22c55e",
                        color: "#fff"
                    }}
                    onClick={exportXLSX}
                />
            </div>
        );
    };

    return (
        <div style={{
            maxWidth: "1400px",
            margin: "20px auto",
            padding: "20px",
            background: "linear-gradient(135deg, #37b162, #bb86f3)",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
        }}>

            <h2>Issued Assets Report</h2>

            <DataTable
                ref={dataTableRef}
                value={issuedAssets}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 20]}
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
                    body={(row) => new Date(row.issueDate).toLocaleString()}
                    sortable
                />
            </DataTable>

        </div>
    );
}

export default Reports;