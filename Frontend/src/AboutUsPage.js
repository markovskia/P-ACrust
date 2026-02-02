import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import PACrustLogo from "./images/pacrustlogo.png";
import "./AboutUsPage.css";
import cart from "./images/shopping-cart.png";
import {Pie, Bar, Doughnut} from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
} from "chart.js";

ChartJS.register(
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
);

export default function AboutUsPage({loggedUser, setLoggedUser, logout}) {
    const navigate = useNavigate();

    const [cartCount, setCartCount] = useState(0);

    const addToCart = () => {
        setCartCount(cartCount + 1);
    };

    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
        setCartItems(storedCart);
        setCartCount(storedCart.length);
    }, []);

    const goToCheckout = () => {
        navigate("/checkout", {state: {cartItems}});
    };

    const [pizzaStats, setPizzaStats] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [monthlyStats, setMonthlyStats] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8000/api/stats/most-ordered/")
            .then(r => r.json())
            .then(data => setPizzaStats(data));

        fetch("http://localhost:8000/api/stats/users/")
            .then(r => r.json())
            .then(data => setUserStats(data));

        fetch("http://localhost:8000/api/stats/monthly-orders/")
            .then(r => r.json())
            .then(data => setMonthlyStats(data));
    }, []);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


    return (
        <div className="local-background-about-us">
            <div className="original-navigation-menu">
                <div className="navigation-bar">
                    <div className="logodiv">
                        <img className="logo" src={PACrustLogo} alt={PACrustLogo} onClick={() => navigate("/")}/>
                    </div>
                    <div className="divpart">
                        <p className="divpartP" onClick={() => navigate("/")}>HOME</p>
                    </div>
                    <div className="divpart">
                        <p className="divpartP" onClick={() => navigate("/menu")}>MENU</p>
                    </div>
                    <div className="divpart">
                        <p className="divpartP">ABOUT US</p>
                    </div>
                </div>
                <div className="nav-right-part">
                    <div className="phone">📞 075-142-589</div>
                    {loggedUser && (
                        <button className="logout-btn" onClick={() => {
                            localStorage.removeItem("cartItems");
                            logout();
                        }}>LOG OUT</button>
                    )}
                    <button
                        className="login-btn"
                        onClick={() => {
                            if (loggedUser) {
                                navigate("/profile");
                            } else {
                                navigate("/login");
                            }
                        }}
                    >
                        {loggedUser ? loggedUser.username : "LOG IN / SIGN IN"}
                    </button>
                    {loggedUser && loggedUser.role === "client" && (
                        <div>
                            <button
                                className="checkout-btn"
                                onClick={() => navigate("/checkout", {state: {cartItems}})}
                            >
                                <img src={cart} className="checkout-photo"/>
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="center-it">
                <div className="about-us-container">
                    <h1 className="title">About P&ACrust</h1>
                    <p className="description">
                        Welcome to <strong>P&ACrust</strong> — a modern pizza ordering and
                        management platform designed to make your pizza experience simple,
                        smart, and delicious! From custom pizza creations to real-time order
                        tracking, we connect clients, employees, and administrators in one
                        seamless system.
                    </p>

                    <div className="statistics-section">
                        <h2>Platform Statistics</h2>

                        <div className="charts-container">

                            <div className="chart-card">
                                <h3>Most Ordered Pizzas</h3>
                                <Pie
                                    data={{
                                        labels: pizzaStats.map(p => p.name),
                                        datasets: [
                                            {
                                                data: pizzaStats.map(p => p.count),
                                                backgroundColor: ["#ff6b6b", "#ff9f43", "#1dd1a1", "#54a0ff"]
                                            }
                                        ]
                                    }}
                                />
                            </div>

                            <div className="chart-card">
                                <h3>User Overview</h3>
                                <Doughnut
                                    data={{
                                        labels: ["Clients", "Employees", "Admins"],
                                        datasets: [
                                            {
                                                data: userStats ? [userStats.clients, userStats.employees, userStats.admins] : [],
                                                backgroundColor: ["#1dd1a1", "#ff9f43", "#ee5253"]
                                            }
                                        ]
                                    }}
                                />

                            </div>

                            <div className="chart-card chart-card-2">
                                <h3>Monthly Orders</h3>
                                <Bar
                                    data={{
                                        labels: monthlyStats.map(m => monthNames[m.month - 1]), 
                                        datasets: [
                                            {
                                                label: "Orders",
                                                data: monthlyStats.map(m => m.count),
                                                backgroundColor: "#ff9f43"
                                            }
                                        ]
                                    }}
                                />

                            </div>

                        </div>
                    </div>

                    <div className="power-features">
                        <div className="feature-box">
                            <div className="icon">🍕</div>
                            <h3>Dynamic Menu</h3>
                            <p>Explore every pizza, drink & combo with live updates and rich previews.</p>
                        </div>

                        <div className="feature-box">
                            <div className="icon">🔐</div>
                            <h3>Smart Authentication</h3>
                            <p>Secure login with saved preferences and personalized user experience.</p>
                        </div>

                        <div className="feature-box">
                            <div className="icon">📅</div>
                            <h3>Instant Reservations</h3>
                            <p>Reserve tables in seconds using our real-time seat availability system.</p>
                        </div>

                        <div className="feature-box">
                            <div className="icon">❌</div>
                            <h3>1-Click Cancellation</h3>
                            <p>Plans changed? Modify or cancel instantly — no hassle.</p>
                        </div>

                        <div className="feature-box">
                            <div className="icon">💳</div>
                            <h3>Seamless Payments</h3>
                            <p>Fast, encrypted checkout with multiple payment methods.</p>
                        </div>

                        <div className="feature-box">
                            <div className="icon">🧪</div>
                            <h3>Build-Your-Own Pizza</h3>
                            <p>Create custom pizzas with unlimited ingredient combinations.</p>
                        </div>

                        <div className="feature-box">
                            <div className="icon">📦</div>
                            <h3>Quick Menu Ordering</h3>
                            <p>Pick a chef-crafted favorite and order in moments.</p>
                        </div>

                        <div className="feature-box">
                            <div className="icon">🏷️</div>
                            <h3>Promotions Hub</h3>
                            <p>Exclusive deals, daily discounts & special customer rewards.</p>
                        </div>
                    </div>

                    <div className="mission-section">
                        <h2>Our Mission ️</h2>
                        <p>
                            At <strong>P&ACrust</strong>, we believe pizza should be more than
                            food — it’s an experience. Our goal is to merge tradition with
                            technology, offering a system where every customer, admin, and
                            employee can interact smoothly and enjoyably.
                        </p>
                    </div>

                    <div className="team-section">
                        <h2>Meet the P&ACrust Team</h2>
                        <div className="team-cards">
                            <div className="team-card">
                                <div className="emoji">👨‍💻</div>
                                <h2 className="name">Petar</h2>
                                <p className="role">System Developer</p>
                            </div>
                            <div className="team-card">
                                <div className="emoji">👨‍💻</div>
                                <h2 className="name">Aleksandar</h2>
                                <p className="role">Designer</p>
                            </div>
                        </div>
                    </div>

                    <div className="fun-section">
                        <h2>Fun Facts</h2>
                        <ul>
                            <li>We’ve served over <strong>10,000</strong> slices in one month!</li>
                            <li>Our delivery scooter “Speedy” has covered <strong>5000 km</strong>.</li>
                            <li>
                                Our most loved pizza? <strong>Build-Your-Own Margarita</strong>
                            </li>
                        </ul>
                    </div>


                </div>
            </div>

        </div>
    );
}
