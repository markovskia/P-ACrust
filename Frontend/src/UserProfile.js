import React, {useState, useEffect} from "react";
import "./UserProfile.css";
import PACrustLogo from "./images/pacrustlogo.png"
import pizzaImage from "./images/pizza-image.png"
import secondPizza from "./images/secondPizza.png"
import axios from "axios";
import {useNavigate} from "react-router-dom";
import cart from "./images/shopping-cart.png";
import reorderLogo from "./images/reorder.png";


export default function UserProfile({loggedUser, setLoggedUser, logout}) {
    const navigate = useNavigate();

    const [email, setEmail] = useState(loggedUser.email);
    const [name, setName] = useState(loggedUser.username);
    const [username, setUsername] = useState(loggedUser.username);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [address, setAddress] = useState(loggedUser.address || "");
    const [phone, setPhone] = useState(loggedUser.phone || "");
    const [city, setCity] = useState(loggedUser.city || "");

    const [showDetails, setShowDetails] = useState(false);
    const [showOrders, setshowOrders] = useState(false);
    const [showReservations, setshowReservations] = useState(false)
    const [reservations, setReservations] = useState([]);

    const [selectedReservation, setSelectedReservation] = useState(null);
    const handleReservationClick = (res) => {
        const today = new Date();
        const resDate = new Date(res.date);

        if (resDate >= today) {
            setSelectedReservation(res);
        }
    };

    const [cartCount, setCartCount] = useState(0);

    // Example function to add item to cart
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


    const cancelReservation = async (id) => {
        const token = localStorage.getItem("access");

        try {
            await axios.delete(`http://localhost:8000/api/reservations/${id}/cancel/`, {
                headers: {Authorization: `Bearer ${token}`}
            });

            setReservations((prev) => prev.filter((r) => r.id !== id));
            setSelectedReservation(null);
        } catch (err) {
            alert("Грешка при откажување.");
        }
    };

    useEffect(() => {
        const fetchReservations = async () => {
            const token = localStorage.getItem("access");

            try {
                const res = await axios.get("http://localhost:8000/api/user-reservations/", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setReservations(res.data);
            } catch (err) {
                console.error("Error fetching reservations:", err);
            }
        };

        if (loggedUser?.id) {
            fetchReservations();
        }
    }, [loggedUser]);

    const handleSave = async () => {
        if (!loggedUser?.id) {
            alert("Грешка: корисничкиот ID не е достапен.");
            return;
        }
        if (password && password !== confirmPassword) {
            alert("Лозинките не се совпаѓаат.");
            return;
        }
        const token = localStorage.getItem("access");
        try {
            await axios.put(`http://localhost:8000/api/users/${loggedUser.id}/`, {
                email,
                name,
                username,
                password: password || undefined,
                address,
                phone,
                city
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const updatedUser = await axios.get("http://localhost:8000/api/user/", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setLoggedUser(updatedUser.data);
            alert("Податоците се успешно зачувани!");
            navigate("/");
        } catch (err) {
            alert("Грешка при зачувување на податоците.");
        }
    };

    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem("access");
            if (!token) return;

            try {
                const res = await axios.get("http://127.0.0.1:8000/api/get-orders", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const filteredOrders = res.data.filter(
                    (order) => order.employee_name === loggedUser?.name
                );

                setOrders(filteredOrders);
            } catch (err) {
                console.error("Error fetching user orders:", err);
            }
        };

        if (loggedUser?.id) fetchOrders();
    }, [loggedUser]);

    const handleReOrder = (order) => {
        const items = order.items.map(item => ({
            id: item.id,            
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size || "Medium",
            image: reorderLogo
        }));

        localStorage.setItem("cartItems", JSON.stringify(items));
        setCartItems(items);
        setCartCount(items.length);

        navigate("/checkout", {state: {cartItems: items}});
    };

    const savedOrderId = localStorage.getItem("savedOrderId");

    useEffect(() => {
        if (!savedOrderId) return;

        async function loadOrderFromBackend() {
            try {
                const res = await fetch("http://127.0.0.1:8000/api/get-orders/");
                const orders = await res.json();

                const found = orders.find(o => String(o.id) === String(savedOrderId));

                if (!found) {
                    return;
                }

                const orderItems = found.items || [];

                const mapped = orderItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    size: item.size || "Medium",
                    price: item.price,
                    quantity: item.quantity || 1,
                    image: "reorder-logo"
                }));

                setCartItems(mapped);
                localStorage.setItem("cartItems", JSON.stringify(mapped));
                setCartCount(mapped.length);

                console.log("Loaded items into cart:", mapped);

            } catch (err) {
                console.error("Failed loading orders:", err);
            }
        }

        loadOrderFromBackend();
    }, []);


    return (
        <div className="local-background-profile">
            <div className="original-navigation">
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
                        <a className="divpartP" onClick={() => navigate("/about_us")}>ABOUT US</a>
                    </div>
                </div>
                <div className="nav-right-part">
                    <div className="phone">📞 075-142-589</div>
                    <button className="logout-btn" onClick={logout}>LOG OUT</button>

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
                            <button className="checkout-btn" onClick={goToCheckout}>
                                <img src={cart} className="checkout-photo"/>
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="backgroundBox">
                <div className="za_flex" onClick={() => setShowDetails(!showDetails)}>
                    <h1 className="theUser">Profile</h1>
                    <span className="arrow-icon">{showDetails ? "▲" : "▼"}</span>
                </div>

                <div className={`grid-transition ${showDetails ? "show" : ""}`}>
                    <div className="profile-grid">
                        <div className="profile-card">
                            <label>👤 Name</label>
                            <input value={name} onChange={(e) => setName(e.target.value)}/>
                        </div>

                        <div className="profile-card">
                            <label>👤 Username</label>
                            <input value={username} onChange={(e) => setUsername(e.target.value)}/>
                        </div>

                        <div className="profile-card">
                            <label>📧 Email</label>
                            <input value={email} onChange={(e) => setEmail(e.target.value)}/>
                        </div>

                        <div className="profile-card">
                            <label>📞 Phone</label>
                            <input value={phone} onChange={(e) => setPhone(e.target.value)}/>
                        </div>

                        <div className="profile-card">
                            <label>📍 Address</label>
                            <input value={address} onChange={(e) => setAddress(e.target.value)}/>
                        </div>

                        <div className="profile-card">
                            <label>📍 City</label>
                            <input value={city} onChange={(e) => setCity(e.target.value)}/>
                        </div>

                        <div className="profile-card">
                            <label>🔒 Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                        </div>

                        <div className="profile-card">
                            <label>🔒 Confirm Password</label>
                            <input type="password" value={confirmPassword}
                                   onChange={(e) => setConfirmPassword(e.target.value)}/>
                        </div>
                    </div>

                    <div className="divButton">
                        <button className="saveButton" onClick={handleSave}>Save</button>
                    </div>
                </div>


                <div className="za_flex" onClick={() => setshowOrders(!showOrders)}>
                    <h1 className="theUser2">Orders history</h1>
                    <span className="arrow-icon">{showOrders ? "▲" : "▼"}</span>
                </div>

                <div className={`grid-transition ${showOrders ? "show" : ""}`}>
                    <div className="orders-grid">
                        {orders.length === 0 ? (
                            <p className="no-orders">😕 You have no orders yet.</p>
                        ) : (
                            orders.map((order) => (
                                <div key={order.id} className="order-card">
                                    <p><strong>🧾 Order #{order.id}</strong></p>
                                    <p><strong>📅 Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                                    <p><strong>🍕 Products:</strong> {order.items.map(i => i.name).join(", ")}</p>
                                    <p><strong>💰 Sum:</strong> {order.subtotal}€</p>
                                    <p><strong>📍 Address:</strong> {order.comment || loggedUser.address}</p>
                                    <p className="divButton">
                                        <button className="reOrder" onClick={() => handleReOrder(order)}>
                                            Re-Order
                                        </button>
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>


                <div className="za_flex" onClick={() => setshowReservations(!showReservations)}>
                    <h1 className="theUser3">Reservations history</h1>
                    <span className="arrow-icon">{showReservations ? "▲" : "▼"}</span>
                </div>


                <div className={`grid-transition ${showReservations ? "show" : ""}`}>
                    <div className="reservation-grid">
                        {reservations.length === 0 ? (
                            <p className="no-reservations">😕 You have no active reservations.</p>
                        ) : (
                            reservations.map((res, index) => (
                                <div key={index} className="reservation-card">
                                    <p><strong>📅 Date:</strong> {res.date}</p>
                                    <p><strong>🕒 Time:</strong> {res.from_time} - {res.to_time}</p>
                                    <p><strong>🪑 Table:</strong> {res.table}</p>
                                    <p><strong>👥 People:</strong> {res.people_count}</p>
                                    {res.comment && (
                                        <p><strong>💬 Comment:</strong> {res.comment}</p>
                                    )}
                                    <button className="cancel-booking"
                                            onClick={() => handleReservationClick(res)}>Cancel booking
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>


                {selectedReservation && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h2>Cancel Reservation</h2>
                            <p>Are you sure you want to cancel this reservation?</p>
                            <p><strong>📅 Date:</strong> {selectedReservation.date}</p>
                            <p><strong>🕒 Time:</strong> {selectedReservation.from_time} - {selectedReservation.to_time}
                            </p>
                            <p><strong>🪑 Table:</strong> {selectedReservation.table}</p>

                            <div className="modal-buttons">
                                <button className="delete-reservation-1"
                                        onClick={() => cancelReservation(selectedReservation.id)}>Yes, cancel
                                </button>
                                <button className="delete-reservation-2" onClick={() => setSelectedReservation(null)}>No
                                </button>
                            </div>
                        </div>
                    </div>
                )}


            </div>
        </div>

    );
}