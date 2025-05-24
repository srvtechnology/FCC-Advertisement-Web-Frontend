import React, { useEffect, useState } from "react";
import axiosClient from "../axios-client"; // Replace with your actual axios config
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const AmountChart = () => {
    const [amountTimeRange, setAmountTimeRange] = useState("monthly");
    const [bookings, setBookings] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [paidAmount, setPaidAmount] = useState(0);
    const [amountToPay, setAmountToPay] = useState(0);
    const [loading, setLoading] = useState(false);
    const [agents, setAgents] = useState([]);
    const [selectedagents, setSelectedAgents] = useState("");

    useEffect(() => {
        fetchAgents();
    }, []);


    const fetchAgents = () => {
        axiosClient
            .get("/agent-list")
            .then(({ data }) => setAgents(data))
            .catch(() => setAgents([]));
    };

    const getData = (filterType = "monthly", selectedagents = "") => {
        setLoading(true);
        axiosClient
            .post("/all-amount-data", {
                filter_type: filterType,
                agent_name: selectedagents,
            })
            .then(({ data }) => {
                setBookings(data || []);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setBookings([]);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        getData(amountTimeRange, selectedagents);
    }, [amountTimeRange, selectedagents]);

    useEffect(() => {
        if (!bookings || bookings.length === 0) {
            setTotalAmount(0);
            setPaidAmount(0);
            setAmountToPay(0);
            return;
        }

        let total = 0;
        let paid = 0;
        let pending = 0;

        bookings.forEach((b) => {
            let amount =
                b.payment != null
                    ? Number(b.payment?.amount) || 0
                    : Number(
                        b.space?.rate *
                        b.space?.area_advertise *
                        parseInt(b.space?.other_advertisement_sides_no ?? 1) || 0
                    );

            let paidAmount =
                b.payment != null
                    ? Number(b.payments_sum_payment_amount_1) || 0
                    : 0;

            total += amount;
            paid += paidAmount;
            pending += amount - paidAmount;
        });

        setTotalAmount(total);
        setPaidAmount(paid);
        setAmountToPay(pending);
    }, [bookings]);

    const chartData = {
        labels: ["Total Amount", "Paid Amount", "Remaining Amount"],
        datasets: [
            {
                label: "Amount",
                data: [totalAmount, paidAmount, amountToPay],
                backgroundColor: ["#4CAF50", "#2196F3", "#FF9800"],
                borderRadius: 5,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div style={{ padding: "20px", maxWidth: "700px", margin: "0 auto" }}>
            <h2>Amount Summary</h2>

            <div className="time-range-selector" style={{ marginBottom: "20px" }}>
                <button
                    className={amountTimeRange === "daily" ? "active" : ""}
                    onClick={() => setAmountTimeRange("daily")}
                >
                    Daily
                </button>
                <button
                    className={amountTimeRange === "monthly" ? "active" : ""}
                    onClick={() => setAmountTimeRange("monthly")}
                >
                    Monthly
                </button>
                <button
                    className={amountTimeRange === "6month" ? "active" : ""}
                    onClick={() => setAmountTimeRange("6month")}
                >
                    6 Months
                </button>
                <button
                    className={amountTimeRange === "yearly" ? "active" : ""}
                    onClick={() => setAmountTimeRange("yearly")}
                >
                    Yearly
                </button>
            </div>

            <div className="agent-selector">
                <label htmlFor="booking-agent-filter">Filter by Agent:</label>
                <select
                    id="booking-agent-filter"
                    value={selectedagents}
                    onChange={(e) => setSelectedAgents(e.target.value)}
                >
                    <option value="all">All Agents</option>
                    {agents?.map((option, index) => (
                        <option key={index} value={option?.name}>
                            {option?.name}
                        </option>
                    ))}
                </select>
            </div>
            <br></br>

            <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '500px',

            }}>
                {loading ? (
                    <p>Loading chart...</p>
                ) : (
                    <Bar data={chartData} options={chartOptions} />
                )}
            </div>
        </div>
    );
};

export default AmountChart;
