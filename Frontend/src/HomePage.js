import React from "react";
import "./HomePage.css";
import pizzaImage from "./images/pizza-image.png";
import PACrustLogo from "./images/pacrustlogo.png"
import restoraunt1 from "./images/restoraunt-1.png";
import restoraunt2 from "./images/restoraunt-2.png";
import restoraunt3 from "./images/restoraunt-3.png";
import restoraunt4 from "./images/restoraunt-4.png";
import restoraunt5 from "./images/restoraunt-5.png";
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


export default function HomePage({loggedUser}) {
    const navigate = useNavigate();

    return (
        <div>
            <div className="pizza-container">
                {/* Sidebar Navigation */}
                <aside className="sidebar">
                    <div className="logodiv">
                        <img className="logo" src={PACrustLogo} alt={PACrustLogo} onClick={() => navigate("/")}/>
                    </div>
                    <nav className="nav-links">
                        <div>
                            <a className="fontHome" href="#">MENU</a>
                        </div>
                        <div>
                            <a className="fontHome" href="#">RESERVE TABLE</a>
                        </div>
                        <div>
                            <a className="fontHome" href="#">PROMOTIONS</a>
                        </div>
                        <div>
                            <a className="fontHome" href="#">ABOUT US</a>
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="main-content">
                    <div className="top-bar">
                        <div className="phone">📞 075-142-589</div>
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
                    </div>

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
                    <div className="promo-button">
                        <button
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
            <div className="promotions">
                <div className="promotions-title">PROMOTIONS</div>
                <div className="promotion-cards">
                    <div className="promotion-card">
                        <img src={vegetarian} alt="Vegetarian Pizza"/>
                        <p>VEGETARIAN</p>
                        <button
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
        </div>

    );
}