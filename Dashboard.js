import React from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
);

function Dashboard() {

    // Dummy Data (later connect to API)
    const totalAssets = 150;
    const issued = 60;
    const available = 90;
    const employees = 40;

    const barData = {
        labels: ["Boards", "Fixtures", "Tools", "Consumables"],
        datasets: [
            {
                label: "Assets Count",
                data: [40, 30, 50, 30],
                backgroundColor: "#22c55e"
            }
        ]
    };

    const pieData = {
        labels: ["Issued", "Available"],
        datasets: [
            {
                data: [issued, available],
                backgroundColor: ["#ef4444", "#3b82f6"]
            }
        ]
    };

    return (
        <div className="dashboard-page">

            <h2 className="dashboard-title">Embedded Inventory Dashboard</h2>

            {/* ===== STAT CARDS ===== */}
            <div className="dashboard-cards">
                <div className="card total">
                    <h3>Total Assets</h3>
                    <p>{totalAssets}</p>
                </div>

                <div className="card issued">
                    <h3>Issued</h3>
                    <p>{issued}</p>
                </div>

                <div className="card available">
                    <h3>Available</h3>
                    <p>{available}</p>
                </div>

                <div className="card employees">
                    <h3>Employees</h3>
                    <p>{employees}</p>
                </div>
            </div>

            {/* ===== CHART SECTION ===== */}
            <div className="chart-section">

                <div className="chart-box">
                    <h3>Assets by Category</h3>
                    <Bar data={barData} />
                </div>

                <div className="chart-box">
                    <h3>Issued vs Available</h3>
                    <Pie data={pieData} />
                </div>

            </div>

        </div>
    );
}

export default Dashboard;