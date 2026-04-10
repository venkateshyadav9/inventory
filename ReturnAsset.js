import React, { useEffect, useState } from "react";
import axios from "axios";

function AssetReturn() {
    const [employees, setEmployees] = useState([]);
    const [issues, setIssues] = useState([]);
    const [returns, setReturns] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [returnQty, setReturnQty] = useState({});

    // Fetch Employees + Returns initially
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        const [empRes, returnRes] = await Promise.all([
            axios.get("http://localhost:5016/employees"),
            axios.get("http://localhost:5016/assetreturns")
        ]);

        setEmployees(empRes.data);
        setReturns(returnRes.data);
    };

    // When Employee selected
    const handleEmployeeChange = async (e) => {
        const empId = Number(e.target.value);
        setSelectedEmployee(empId);
        setSelectedIssue(null);

        const res = await axios.get(
            `http://localhost:5016/assetissues/byemployee/${empId}`
        );

        setIssues(res.data);
    };

    // Calculate balance dynamically
    const calculateBalance = (issue) => {
        const totalReturned = returns
            .filter(r => r.issueId === issue.issueId)
            .reduce((sum, r) => sum + r.returnQuantity, 0);

        return issue.quantity - totalReturned;
    };

    // const handleReturn = async (issue) => {
    //     const balance = calculateBalance(issue);

    //     if (balance <= 0) {
    //         alert("Already fully returned");
    //         return;
    //     }

    //     const qty = prompt(`Enter return quantity (Max ${balance})`);

    //     if (!qty || Number(qty) > balance) {
    //         alert("Invalid quantity");
    //         return;
    //     }

    //     const res = await axios.post("http://localhost:5016/assetreturns", {
    //         issueId: issue.issueId,
    //         returnQuantity: Number(qty),
    //         condition: "Good",
    //         remarks: ""
    //     });

    //     setReturns(prev => [...prev, res.data]);

    //     alert("Returned successfully!");

    //     handleEmployeeChange({ target: { value: selectedEmployee } });
    // };

    const handleReturn = async (issue) => {
        const balance = calculateBalance(issue);
        const qty = returnQty[issue.issueId];

        if (!qty || Number(qty) <= 0 || Number(qty) > balance) {
            alert("Invalid quantity");
            return;
        }

        const res = await axios.post("http://localhost:5016/assetreturns", {
            issueId: issue.issueId,
            returnQuantity: Number(qty),
            condition: "Good",
            remarks: ""
        });

        setReturns(prev => [...prev, res.data]);

        alert("Returned successfully!");

        setReturnQty(prev => ({ ...prev, [issue.issueId]: "" }));

        handleEmployeeChange({ target: { value: selectedEmployee } });
    };

    return (
        <div style={{
            maxWidth: "1500px", margin: "20px 20px 20px 60px", padding: "20px",
            // backgroundColor: "#fff",
            background: "linear-gradient(135deg, #37b162, #bb86f3)",
            borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
        }}>
            <h2>Asset Return</h2>



            {/* Employee Dropdown */}
            <div style={{ display: "flex", flexDirection: "column", width: "300px" }}>

                <label style={{ marginBottom: "5px", fontWeight: "bold" }}>
                    Employee
                </label>

                <select
                    value={selectedEmployee}
                    onChange={handleEmployeeChange}
                    style={{
                        padding: "10px",
                        fontSize: "16px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        width: "100%"
                    }}
                >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                        <option key={emp.employeeId} value={emp.employeeId}>
                            {emp.employeeName}
                        </option>
                    ))}
                </select>

            </div>


            {/* Issue Table */}
            {issues.length > 0 && (
                <table border="1" width="100%" style={{ marginTop: "20px" }}>
                    <thead>
                        <tr>
                            <th>IssueId</th>
                            <th>Asset Name</th>
                            <th>Issue Date</th>
                            <th>Issued Qty</th>
                            <th>Balance</th>
                            <th>Return Qty</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>

                        {
                            issues
                                .filter(issue => calculateBalance(issue) > 0)
                                .map(issue => (
                                    <tr key={issue.issueId}>
                                        <td>{issue.issueId}</td>
                                        <td>{issue.assetName}</td>
                                        <td>{issue.issueDate}</td>
                                        <td>{issue.quantity}</td>
                                        <td>{calculateBalance(issue)}</td>
                                        <td>
                                            <div style={{ display: "flex", gap: "10px" }}>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={calculateBalance(issue)}
                                                    value={returnQty[issue.issueId] || ""}
                                                    onChange={(e) =>
                                                        setReturnQty({
                                                            ...returnQty,
                                                            [issue.issueId]: e.target.value
                                                        })
                                                    }
                                                    style={{ width: "80px", padding: "5px" }}
                                                />

                                               
                                            </div>
                                        </td>
                                        <td>
                                        <button onClick={() => handleReturn(issue)}>
                                            Return
                                        </button>
                                        </td>
                                        {/* <td>
                                    <button onClick={() => handleReturn(issue)}>
                                        Return
                                    </button>
                                </td> */}
                                    </tr>
                                ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default AssetReturn;