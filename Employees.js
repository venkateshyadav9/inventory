import React, { useEffect, useState } from "react";
import axios from "axios";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function Employees() {

    const [employees, setEmployees] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");

    const [formData, setFormData] = useState({
        employeeCode: "",
        employeeName: "",
        email: "",
        status: "Active"
    });

    /* ================= FETCH ================= */
    const fetchEmployees = async () => {
        const res = await axios.get("http://localhost:5016/employees");
        setEmployees(res.data);
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    /* ================= ADD ================= */
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        await axios.post("http://localhost:5016/employees", formData);

        setFormData({
            employeeCode: "",
            employeeName: "",
            email: "",
            status: "Active"
        });

        fetchEmployees();
    };

    /* ================= EXCEL EXPORT ================= */
    const exportXLSX = () => {
        if (!employees?.length) {
            alert("No data to export");
            return;
        }

        // Transform backend PascalCase → Clean Excel headers
        const exportData = employees.map(emp => ({
            "ID": emp.employeeId || emp.EmployeeId,
            "Code": emp.employeeCode || emp.EmployeeCode,
            "Name": emp.employeeName || emp.EmployeeName,
            "Email": emp.email || emp.Email,
            "Status": emp.status || emp.Status
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);

        // Auto-size columns
        worksheet['!cols'] = [
            { wch: 8 },  // ID
            { wch: 15 }, // Code
            { wch: 25 }, // Name
            { wch: 30 }, // Email
            { wch: 12 }  // Status
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array"
        });

        saveAs(
            new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }),
            `Employees_${new Date().toISOString().slice(0, 10)}.xlsx`
        );
    };

    // const renderHeader = () => {
    //     return (
    //         <div style={{ display: "flex", justifyContent: "flex-end" }}>
    //             <span className="p-input-icon-right">

    //                 <InputText
    //                     value={globalFilter}
    //                     onChange={(e) => setGlobalFilter(e.target.value)}
    //                     placeholder="Search Employee..."
    //                 />
    //                 <i className="pi pi-search"
    //                     style={{
    //                         position: "absolute",
    //                         right: "10px",
    //                         top: "50%",
    //                         transform: "translateY(-50%)",
    //                         color: "#6b7280"
    //                     }}
    //                 />
    //             </span>
    //         </div>
    //     );
    // };

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
                        placeholder="Search Employee..."
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
    /* ================= ROW EDIT ================= */
    const onRowEditComplete = async (e) => {
        const { newData } = e;

        await axios.put(
            `http://localhost:5016/employees/${newData.employeeId}`,
            newData
        );

        fetchEmployees();
    };

    /* ================= EDITORS ================= */

    const textEditor = (options) => (
        <InputText
            value={options.value}
            onChange={(e) => options.editorCallback(e.target.value)}
        />
    );

    const statusOptions = [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" }
    ];

    const statusEditor = (options) => (
        <Dropdown
            value={options.value}
            options={statusOptions}
            onChange={(e) => options.editorCallback(e.value)}
            placeholder="Select Status"
        />
    );

    /* ================= UI ================= */

    return (

        <div style={{
            maxWidth: "1500px",
            margin: "20px 20px 20px 60px",
            padding: "20px",
            // background: "#f8f0f0",
            background: "linear-gradient(135deg, #46c372, #bb86f3)",
            // backgroundImage: "url('/Images/Chip.jpg')",
            // backgroundSize: "cover",
            // backgroundPosition: "center",
            // backgroundRepeat: "no-repeat",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
        }}>

            <h2>Employees</h2>

            {/* ADD FORM */}
            <form
                onSubmit={handleSubmit}
                style={{ display: "flex", gap: "20px", marginBottom: "20px" }}
            >

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <label style={{ marginBottom: "5px", fontWeight: "bold" }}>
                        Employee Code
                    </label>
                    <InputText
                        name="employeeCode"
                        value={formData.employeeCode}
                        onChange={handleChange}
                        placeholder="Employee Code"
                        required
                        keyfilter="alphanum"
                        maxLength={10}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <label style={{ marginBottom: "5px", fontWeight: "bold" }}>
                        Employee Name
                    </label>
                    <InputText
                        name="employeeName"
                        value={formData.employeeName}
                        onChange={handleChange}
                        placeholder="Employee Name"
                        required
                        keyfilter={/^[a-zA-Z \s]+$/}
                        maxLength={20}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <label style={{ marginBottom: "5px", fontWeight: "bold" }}>
                        Employee Email
                    </label>
                    <InputText
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Employee Email"
                        required
                        keyfilter="email"
                        maxLength={20}
                    />
                </div>

                {/* <div style={{ display: "flex", flexDirection: "column" }}>
                    <label style={{ marginBottom: "5px", fontWeight: "bold" }}>
                        Employee Status
                    </label>
                    <Dropdown
                        value={formData.status}
                        options={statusOptions}
                        onChange={(e) =>
                            setFormData({ ...formData, status: e.value })
                        }
                    />
                </div> */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <label style={{ marginBottom: "5px", fontWeight: "bold" }}>
                        Employee Status
                    </label>

                    <Dropdown
                        value={formData.status}
                        options={statusOptions}
                        onChange={(e) =>
                            setFormData({ ...formData, status: e.value })
                        }
                        className="p-inputtext-sm"
                        style={{ height: "38px", minWidth: "150px" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    <Button
                        label="Add"
                        icon="pi pi-plus"
                        size="small"
                        style={{ height: "38px" }}
                    />
                </div>

            </form>


            {/* DATA TABLE */}
            <DataTable
                value={employees}
                editMode="row"
                dataKey="employeeId"
                rowsPerPageOptions={[5, 10, 20]}
                onRowEditComplete={onRowEditComplete}
                paginator rows={5}
                stripedRows
                showGridlines

                header={renderHeader()}
                globalFilter={globalFilter}
                globalFilterFields={["employeeId", "employeeCode", "employeeName", "email", "status"]}
            >
                <Column field="employeeId" header="ID" frozen />

                <Column
                    field="employeeCode"
                    header="Code"
                    editor={textEditor}
                />

                <Column
                    field="employeeName"
                    header="Name"
                    editor={textEditor}
                />

                <Column
                    field="email"
                    header="Email"
                    editor={textEditor}
                />

                <Column
                    field="status"
                    header="Status"
                    editor={statusEditor}
                />

                <Column
                    rowEditor
                    headerStyle={{ width: '8rem' }}
                    bodyStyle={{ textAlign: 'center' }}
                />

            </DataTable>

        </div>
    );
}

export default Employees;