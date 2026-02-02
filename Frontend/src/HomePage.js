import React, {useState, useEffect} from 'react';
import "./HomePage.css";
import pizzaImage from "./images/pizza-image.png";
import PACrustLogo from "./images/pacrustlogo.png"
import restoraunt1 from "./images/restoraunt-1.png";
import restoraunt2 from "./images/restoraunt-2.png";
import restoraunt3 from "./images/restoraunt-3.png";
import restoraunt4 from "./images/restoraunt-4.png";
import restoraunt5 from "./images/restoraunt-5.png";
import cart from "./images/shopping-cart.png";
import basil from "./images/basil.png";
import pizza_secondlayer from "./images/pizza-second-layer.png";
import mozzarella from "./images/mozzarella.png";
import oil from "./images/oil.png";
import tomato from "./images/tomato-sauce.png";
import margaritta from "./images/margaritta.png";
import peperoni from "./images/peperoni.png";
import vegetarian from "./images/vegetarian.png";
import './HomePage.css';
import {FaFacebookF, FaInstagram, FaTwitter, FaWhatsapp} from 'react-icons/fa';
import {useNavigate} from 'react-router-dom';


export default function HomePage({loggedUser, logout}) {
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

    const [pendingOrders, setPendingOrders] = useState([]);
    const [finishedOrders, setFinishedOrders] = useState([]);

    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");

    useEffect(() => {
        if (!loggedUser) return;

        async function loadOrders() {
            try {
                const res = await fetch("http://127.0.0.1:8000/api/get-orders");
                const orders = await res.json();

                const myOrders = orders.filter(o => o.employee_name === loggedUser.username);

                const pending = myOrders.filter(o => o.status === "pending");
                const finished = myOrders.filter(o => o.status === "finished");

                setPendingOrders(pending);
                setFinishedOrders(finished);

            } catch (err) {
                console.error("Error loading orders:", err);
            }
        }

        loadOrders();
    }, [loggedUser]);

    const sendFeedback = async () => {
        if (!feedbackMessage.trim()) {
            alert("Message cannot be empty!");
            return;
        }

        try {
            const res = await fetch("http://127.0.0.1:8000/api/send-message/", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    sender: loggedUser?.username || "Guest",
                    content: feedbackMessage
                })
            });
            alert("Message sent to administrator");
            setFeedbackMessage("");
            setShowFeedback(false);
        } catch (err) {
            console.error("Error sending message:", err);
            alert("Failed to send message.");
        }
    };

    const [promo, setPromo] = useState(null);
    const [showPromo, setShowPromo] = useState(false);

    useEffect(() => {
        const promoClosed = sessionStorage.getItem("promoClosed");
        if (promoClosed) return;

        async function fetchPromo() {
            try {
                const res = await fetch("http://127.0.0.1:8000/api/get-daily-code/");
                if (!res.ok) throw new Error("Failed to fetch promo");

                const data = await res.json();
                if (data.code) {
                    setPromo(data);
                    setTimeLeft(Math.floor(data.time_left));
                    setShowPromo(true);
                }
            } catch (err) {
                console.error("Promo error:", err);
            }
        }

        fetchPromo();
    }, []);

    const [timeLeft, setTimeLeft] = useState(300);
    useEffect(() => {
        if (!showPromo) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setShowPromo(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [showPromo]);


    const closePromo = () => {
        sessionStorage.setItem("promoClosed", "true");
        setShowPromo(false);
    };


    return (

        <div>
            <div className="background">
                <div className="original-navigation-menu">
                    <div className="navigation-bar">
                        {loggedUser?.role === "administrator" && (
                            <button className="admin-btn" onClick={() => navigate("/admin_panel")}>
                                Admin Panel
                            </button>
                        )}
                        {loggedUser?.role === "employee" && (
                            <button className="admin-btn" onClick={() => navigate("/employee_panel")}>
                                Employee Panel
                            </button>
                        )}
                        <div className="logodiv">
                            <img className="logo" src={PACrustLogo} alt={PACrustLogo} onClick={() => navigate("/")}/>
                        </div>
                    </div>
                    <div className="nav-right-part">
                        <div className="phone">📞 075-142-589</div>
                        {loggedUser && (
                            <button className="logout-btn" onClick={logout}>LOG OUT</button>
                        )}
                        <button
                            className="login-btn2"
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
                                <button className="checkout-btn" onClick={goToCheckout}>
                                    <img src={cart} className="checkout-photo"/>
                                    {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="pizza-container">
                    <aside className="sidebar-home">
                        <nav className="nav-links">
                            <div>
                                <a className="fontHome" onClick={() => navigate("/menu")}>MENU
                                </a>
                            </div>
                            <div>
                                <a className="fontHome" onClick={() => navigate("/reserve")}>RESERVE TABLE</a>
                            </div>
                            <div>
                                <a className="fontHome" onClick={(e) => {
                                    e.preventDefault();
                                    const section = document.getElementById("promotions");
                                    if (section) {
                                        section.scrollIntoView({behavior: "smooth"});
                                    }
                                }}
                                >
                                    PROMOTIONS
                                </a>
                            </div>
                            <div>
                                <a className="fontHome" onClick={() => navigate("/about_us")}>ABOUT US</a>
                            </div>
                        </nav>
                    </aside>

                    <main className="main-content">
                        <div className="content-wrapper">
                            <div className="text-section">
                                <div className="h1-part">
                                    <p>Hot, Fresh, and<br/>Delivered Fast!</p>
                                </div>
                                <div className="p-part">
                                    <p>
                                        WHETHER YOU'RE INTO CLASSIC PEPPERONI,<br/>
                                        CHEESY MARGHERITA, OR BOLD NEW FLAVORS,<br/>
                                        WE'VE GOT THE PERFECT PIZZA FOR YOU. MADE<br/>
                                        WITH THE FRESHEST INGREDIENTS AND<br/>
                                        DELIVERED STRAIGHT TO YOUR DOOR—FAST, HOT,<br/>
                                        AND SATISFYING EVERY TIME.
                                    </p>
                                </div>
                                <div className="button-part">
                                    <button
                                        className="order-btn"
                                        onClick={() => {
                                            if (loggedUser) {
                                                navigate("/menu");
                                            } else {
                                                navigate("/login");
                                            }
                                        }}
                                    >
                                        ORDER NOW
                                    </button>
                                </div>

                            </div>

                            <div className="image-section">
                                <img src={pizzaImage} alt="Pizza"/>
                            </div>
                        </div>
                    </main>

                </div>
            </div>

            {loggedUser && (
                <div className="order-bar">
                    <div className="order-section">
                        <div className="order-label-2">Pending</div>
                        <div className="order-list">
                            {pendingOrders.length === 0 ? (
                                <p>No pending orders</p>
                            ) : (
                                pendingOrders.map(order => (
                                    <div
                                        key={order.id}
                                        className="order-item-2"
                                        style={{
                                            backgroundColor: order.order_type === "Dine In" ? "#f1f1f1" : "#d62828",
                                            color: order.order_type === "Dine In" ? "black" : "white",
                                            padding: "10px",
                                            borderRadius: "8px",
                                            marginBottom: "8px"
                                        }}
                                    >
                                        Order #{order.id} – {order.subtotal} € –
                                        {order.order_type === "Dine In" ? order.table_name : "Take Away"}
                                    </div>

                                ))
                            )}
                        </div>
                    </div>

                    <div className="order-section">
                        <div className="order-label-2">Finished</div>
                        <div className="order-list">
                            {finishedOrders.length === 0 ? (
                                <p>No finished orders</p>
                            ) : (
                                finishedOrders.map(order => (
                                    <div
                                        key={order.id}
                                        className="order-item-2"
                                        style={{
                                            backgroundColor: order.order_type === "Dine In" ? "#f1f1f1" : "#d62828",
                                            color: order.order_type === "Dine In" ? "black" : "white",
                                            padding: "10px",
                                            borderRadius: "8px",
                                            marginBottom: "8px"
                                        }}
                                    >
                                        Order #{order.id} – {order.subtotal} € –
                                        {order.order_type === "Dine In" ? order.table_name : "Take Away"}
                                    </div>

                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}


            <div className="dine-section">
                <div className="text-content">
                    <p className="dine-text">DINE IN WITH US!</p>
                    <p>
                        WANT TO ENJOY YOUR FAVORITE PIZZA IN A COZY, FRIENDLY ATMOSPHERE?
                        RESERVE A TABLE IN JUST A FEW CLICKS. WHETHER IT’S A CASUAL LUNCH,
                        FAMILY DINNER, OR SPECIAL OCCASION, WE’LL HAVE YOUR SPOT READY—FRESH
                        PIZZA, GREAT SERVICE, AND GOOD VIBES GUARANTEED.
                    </p>
                    <button
                        className="reserve-the-table"
                        onClick={() => {
                            if (loggedUser) {
                                navigate("/reserve");
                            } else {
                                navigate("/login");
                            }
                        }}
                    >
                        RESERVE NOW
                    </button>

                </div>

                <div className="gallery">
                    <img src={restoraunt1} alt="Restaurant Interior" className="main-image"/>
                    <div className="gallery-small">
                        <img src={restoraunt2} alt="Seating Area"/>
                        <img src={restoraunt3} alt="Outside View"/>
                        <img src={restoraunt4} alt="Bathroom Decor"/>
                        <img src={restoraunt5} alt="Dining Table"/>
                    </div>
                </div>
            </div>

            <div className="promo-section">
                <div className="promo-text">
                    <div className="promo-text-heading">
                        <div className="bel-text">PASSION.<br/>DOUGH.</div>
                        PERFECTION.
                    </div>
                    <p>
                        At P&A Crust, every pizza starts with hand-kneaded dough made fresh
                        daily and is topped with the finest local ingredients. From classic
                        favorites to bold new flavors, we’re committed to delivering pizza
                        that’s hot, hearty, and unforgettable. Whether you dine in, take out,
                        or order delivery, you’ll always get quality you can taste – and love
                        at first bite.
                    </p>
                    <div>
                        <button className="order-btn"
                                onClick={() => {
                                    if (loggedUser) {
                                        navigate("/menu");
                                    } else {
                                        navigate("/login");
                                    }
                                }}
                        >
                            ORDER NOW
                        </button>
                    </div>


                </div>


                <div className="promo-images">
                    <img src={pizza_secondlayer} alt="Pizza" className="main-promo-image"/>
                    <div className="promo-ingredients">
                        <div>
                            <img src={mozzarella} alt="Cheese"/>
                            <img src={oil} alt="Olive Oil"/>
                        </div>
                        <div>
                            <img src={tomato} alt="Tomato Sauce"/>
                            <img src={basil} alt="Basil Leaves"/>
                        </div>
                    </div>
                </div>
            </div>
            <div className="promotions" id="promotions">
                <div className="promotions-title">PROMOTIONS</div>
                <div className="promotion-cards">
                    <div className="promotion-card">
                        <img src={vegetarian} alt="Vegetarian Pizza"/>
                        <p>VEGETARIAN</p>
                        <button
                            className="order-btn"
                            onClick={() => {
                                if (loggedUser) {
                                    navigate("/menu");
                                } else {
                                    navigate("/login");
                                }
                            }}
                        >
                            ORDER NOW
                        </button>
                    </div>
                    <div className="promotion-card">
                        <img src={peperoni} alt="Pepperoni Pizza"/>
                        <p>PEPERONI SPECIAL</p>
                        <button
                            className="order-btn"
                            onClick={() => {
                                if (loggedUser) {
                                    navigate("/menu");
                                } else {
                                    navigate("/login");
                                }
                            }}
                        >
                            ORDER NOW
                        </button>
                    </div>
                    <div className="promotion-card">
                        <img src={margaritta} alt="Margarita Pizza"/>
                        <p>MARGARITTA</p>
                        <button
                            className="order-btn"
                            onClick={() => {
                                if (loggedUser) {
                                    navigate("/menu");
                                } else {
                                    navigate("/login");
                                }
                            }}
                        >
                            ORDER NOW
                        </button>
                    </div>
                </div>
            </div>

            <footer className="footer">
                <div className="footer-left">
                    <FaFacebookF className="social-icon"/>
                    <FaInstagram className="social-icon"/>
                    <FaTwitter className="social-icon"/>
                    <FaWhatsapp className="social-icon"/>
                </div>

                <div className="footer-center">
                    <p>Working Hours:</p>
                    <p>Mon. – Fri. 10:00 – 23:00</p>
                    <p>Sat. – Sun. 10:00 – 02:00</p>
                </div>

                <div className="footer-right">
                    <p>Email to: p&acrust@gmail.com</p>
                    <p>© 2025 P&A Crust</p>
                </div>
            </footer>

            <button
                className="feedback-btn"
                onClick={() => setShowFeedback(true)}
            >
                Send a Message
            </button>

            {showFeedback && (
                <div className="feedback-overlay">
                    <div className="feedback-popup">
                        <h3>Send us a message</h3>
                        <p className="feedback-subtitle">
                            Have a question or idea? We’d love to hear from you.
                        </p>

                        <textarea
                            className="feedback-textarea"
                            placeholder="Type your message here..."
                            value={feedbackMessage}
                            onChange={e => setFeedbackMessage(e.target.value)}
                        />

                        <div className="feedback-actions">
                            <button
                                className="feedback-send"
                                onClick={sendFeedback}
                            >
                                Send
                            </button>

                            <button
                                className="feedback-cancel"
                                onClick={() => setShowFeedback(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    )
        ;
}