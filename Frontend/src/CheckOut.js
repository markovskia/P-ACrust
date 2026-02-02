import React, {useState, useEffect} from "react";
import "./Checkout.css";
import PACrustLogo from "./images/pacrustlogo.png"
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {useLocation} from "react-router-dom";
import reorderLogo from "./images/reorder.png";


export default function CheckOut({loggedUser, setLoggedUser, logout}) {
    const navigate = useNavigate();


    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            alert("Your cart is empty!");
            return;
        }
        const orderData = {
            table_name: "Take Away",
            order_type: "Take Away",
            items: cartItems.map(item => ({
                id: Date.now() + Math.floor(Math.random() * 1000),
                name: item.name,
                size: item.size || "medium",
                price: item.totalPrice ?? item.price ?? 0,
                comment: "",
                category: item.category || "Others",
                quantity: item.quantity,
                ingredients: item.baseIngredients || [],
            })),
            subtotal: subtotal.toFixed(2),
            comment: shippingInfo.comment || "",
            employee_name: loggedUser?.username || "Online Customer",
        };
        try {
            const res = await axios.post("http://127.0.0.1:8000/api/orders", orderData);
            console.log("Take Away order saved:", res.data);

            setCartItems([]);
            localStorage.removeItem("cartItems");
            alert("Order sent! Thank you for ordering!");
            navigate("/");
        } catch (err) {
            alert("Failed to send order. Please try again.");
        }
    };


    const location = useLocation();
    const [cartItems, setCartItems] = useState(location.state?.cartItems || []);

    const handleIncrease = (index) => {
        setCartItems(prev =>
            prev.map((item, i) =>
                i === index ? {...item, quantity: item.quantity + 1} : item
            )
        );
    };

    const handleDecrease = (index) => {
        setCartItems(prev =>
            prev.map((item, i) =>
                i === index && item.quantity > 1
                    ? {...item, quantity: item.quantity - 1}
                    : item
            )
        );
    };

    const subtotal = cartItems.reduce((sum, item) => {
        const price = item.totalPrice ?? item.price ?? 0;
        return sum + price * item.quantity;
    }, 0);

    const [email, setEmail] = useState(loggedUser.email);
    const [name, setName] = useState(loggedUser.username);
    const [username, setUsername] = useState(loggedUser.username);
    const [address, setAddress] = useState(loggedUser.address || "");
    const [phone, setPhone] = useState(loggedUser.phone || "");
    const [city, setCity] = useState(loggedUser.city || "");

    const [step, setStep] = useState(0);

    const steps = ["Shopping bag", "Shipping", "Payment", "Checkout"];

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const handleContinue = () => {
        if (step === 2 && payment_selected === "Card") {
            const nameParts = paymentInfo.cardName.trim().split(" ");
            if (nameParts.length < 2) {
                alert("Please enter full name (first and last) from the card.");
                return;
            }
            if (!/^\d{14,16}$/.test(paymentInfo.cardNumber.replace(/\s+/g, ""))) {
                alert("Card number must be 14 to 16 digits.");
                return;
            }
            if (!paymentInfo.expMonth || !paymentInfo.expYear) {
                alert("Please select expiration month and year.");
                return;
            }
            if (!/^\d{3}$/.test(paymentInfo.cvv)) {
                alert("CVV must be 3 digits.");
                return;
            }
        }
        if (step === 1) {
            if (selected === "old") {
                setShippingInfo({
                    name: loggedUser.username,
                    email: loggedUser.email,
                    phone: loggedUser.phone,
                    address: loggedUser.address,
                    city: loggedUser.city,
                    comment: shippingInfo.comment
                });
            }
        }
        if (step < steps.length - 1) setStep(step + 1);
    };

    const [selected, setSelected] = useState(null);

    const [payment_selected, setpayment_selected] = useState("");

    const handleSelect = (method) => {
        setpayment_selected(method);
        setPaymentInfo((prev) => ({...prev, method}));
    };

    const [shippingInfo, setShippingInfo] = useState({
        name: loggedUser.username || "",
        email: loggedUser.email || "",
        phone: loggedUser.phone || "",
        address: loggedUser.address || "",
        city: loggedUser.city || "",
        comment: ""
    });

    const [paymentInfo, setPaymentInfo] = useState({
        method: "",
        cardName: "",
        cardNumber: "",
        expMonth: "",
        expYear: "",
        cvv: ""
    });

    const [promoCode, setPromoCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [tip, setTip] = useState(0);

    const taxes = subtotal * 0.05;
    const shippingCost = 3.0;

    const totalBeforeDiscount = subtotal + taxes + shippingCost + Number(tip);
    const total = totalBeforeDiscount - discount;

    const handleApplyPromo = () => {
        if (promoCode.toLowerCase() === "save10") {
            setDiscount(10);
        } else {
            setDiscount(0);
            alert("Invalid promo code");
        }
    };

    const [pizzas, setPizzas] = useState([]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/pizzas/")
            .then(res => res.json())
            .then(data => {
                setPizzas(data);
            })
            .catch(err => console.error("Error fetching pizzas:", err));
    }, []);

    useEffect(() => {
        if (pizzas.length === 0 || cartItems.length === 0) return;

        console.log("🔄 Updating cart pizza images...");

        const updatedCart = cartItems.map(item => {
            if (item.category === "pizza") {
                const matchedPizza = pizzas.find(
                    p => p.name.trim().toLowerCase() === item.name.trim().toLowerCase()
                );

                if (matchedPizza && matchedPizza.image) {
                    const fullImage = matchedPizza.image.startsWith("http")
                        ? matchedPizza.image
                        : `http://127.0.0.1:8000${matchedPizza.image}`;
                    console.log(`✅ Found image for ${item.name}:`, fullImage);

                    return {...item, image: fullImage};
                }
            }
            return item;
        });

        setCartItems(updatedCart);
    }, [pizzas]);


    return (
        <div className="background-checkout">
            <div className="logodiv-checkout">
                <img className="logo" src={PACrustLogo} alt={PACrustLogo} onClick={() => navigate("/")}/>
            </div>

            <div className="progress-container">
                <div className="steps">
                    {steps.map((s, index) => (
                        <span
                            key={index}
                            className={`step-label ${step === index ? "active" : ""}`}
                        >
                            {s}
                        </span>
                    ))}
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{width: `${(step + 1) / steps.length * 100}%`}}
                    />
                </div>
            </div>

            {step === 0 && (
                <div className="red-back shopping-bag">
                    <h2 className="shipping-title">Bag Overview</h2>

                    <div className="scroller">
                        {cartItems.map((item, index) => (
                            <div key={index} className="order-item">
                                <img
                                    src={item.image || reorderLogo}
                                    alt={item.name}
                                    className="pizza-img"
                                />


                                <div className="order-details">
                                    <p className="order-extra">name</p>
                                    <p className="order-name">
                                        {item.name}
                                        {item.category === "pizza" && item.size ? ` (${item.size})` : ""}
                                    </p>

                                    {/* Show backend ingredients */}
                                    {item.baseIngredients && item.baseIngredients.length > 0 && (
                                        <p className="order-extra">
                                            Ingredients: {item.baseIngredients.join(", ")}
                                        </p>
                                    )}

                                    {/* Show extras (hardcoded toppings) */}
                                    {item.extras && item.extras.length > 0 && (
                                        <p className="order-extra">
                                            Extras: {item.extras.join(", ")}
                                        </p>
                                    )}
                                </div>

                                <div className="order-price">
                                    <p className="order-extra">price</p>
                                    <span className="order-name">
{((item.totalPrice ?? item.price ?? 0) * item.quantity).toFixed(2)} €
  </span>
                                </div>
                                <div className="order-quantity">
                                    <p className="order-extra">quantity</p>
                                    <div className="order-quantity-2">
                                        <button onClick={() => handleDecrease(index)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => handleIncrease(index)}>+</button>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="clear-cart-div">{cartItems.length > 0 && (
                        <button
                            className="clear-cart-btn"
                            onClick={() => {
                                setCartItems([]);
                                localStorage.removeItem("cartItems");
                            }}
                        >
                            Clear Cart
                        </button>
                    )}</div>

                    <div className="order-buttons">
                        <button className="back-btn" onClick={() => navigate(-1)}>
                            Back
                        </button>
                        <button className="continue-btn" onClick={handleContinue}>
                            Continue
                        </button>
                    </div>
                </div>
            )}


            {step === 1 && (
                <div className="red-back shipping">
                    <h2 className="shipping-title">Click to select Information</h2>

                    <div className="info-container">
                        <div
                            className={`info-box old-info ${selected === "old" ? "selected" : "unselected"}`}
                            onClick={() => setSelected("old")}
                        >
                            <h3 className="info-heading">Old information</h3>
                            <div className="info-field">
                                <label>Name</label>
                                <input type="text" value={username} disabled/>
                            </div>
                            <div className="info-field">
                                <label>Email</label>
                                <input type="text" value={email} disabled/>
                            </div>
                            <div className="info-field">
                                <label>Phone</label>
                                <input type="text" value={phone} disabled/>
                            </div>
                            <div className="info-field">
                                <label>Address</label>
                                <input type="text" value={address} disabled/>
                            </div>
                            <div className="info-field">
                                <label>City</label>
                                <input type="text" value={city} disabled/>
                            </div>
                        </div>

                        <div
                            className={`info-box new-info ${selected === "new" ? "selected" : "unselected"}`}
                            onClick={() => setSelected("new")}
                        >
                            <h3 className="info-heading">New information</h3>
                            <div className="info-field">
                                <label>Name</label>
                                <input type="text" placeholder="Enter new name"
                                       onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})}
                                />

                            </div>
                            <div className="info-field">
                                <label>Email</label>
                                <input type="email" placeholder="Enter new email"
                                       onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                                />

                            </div>
                            <div className="info-field">
                                <label>Phone</label>
                                <input type="text" placeholder="Enter new phone"
                                       onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                                />

                            </div>
                            <div className="info-field">
                                <label>Address</label>
                                <input type="text" placeholder="Enter new address"
                                       onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                                />

                            </div>
                            <div className="info-field">
                                <label>City</label>
                                <input type="text" placeholder="Enter new city"
                                       onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="comment-box-delivery">
                        <p className="comment-label">Enter a comment for the delivery, if necessary</p>
                        <input
                            type="text"
                            className="comment-input"
                            placeholder="Write a comment here..."
                            value={shippingInfo.comment}
                            onChange={(e) => setShippingInfo({...shippingInfo, comment: e.target.value})}
                        />
                    </div>

                    <div className="order-buttons">
                        <button className="back-btn" onClick={handleBack}>
                            Back
                        </button>
                        <button className="continue-btn" onClick={handleContinue}>
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="red-back shipping">
                    <h2 className="shipping-title">Choose Payment Type</h2>

                    <div className="options">
                        <div className="first-row">
                            <button
                                className={`payment-button ${payment_selected === "Card" ? "selected" : ""}`}
                                onClick={() => handleSelect("Card")}
                            >
                                Credit/Debit Card (Visa, MasterCard, Amex)
                            </button>
                            <button
                                className={`payment-button ${payment_selected === "Paypal" ? "selected" : ""}`}
                                onClick={() => handleSelect("Paypal")}
                            >
                                PayPal
                            </button>
                        </div>
                        <div className="second-row">
                            <button
                                className={`payment-button ${payment_selected === "Cash" ? "selected" : ""}`}
                                onClick={() => handleSelect("Cash")}
                            >
                                Cash in Restaurant
                            </button>
                            <button
                                className={`payment-button ${payment_selected === "Apple" ? "selected" : ""}`}
                                onClick={() => handleSelect("Apple")}
                            >
                                Apple Pay / Google Pay
                            </button>
                        </div>
                    </div>

                    <div className="center-it">
                        <p className="comment-label-it">
                            If you selected card, please put your information
                        </p>
                    </div>


                    <div className="card-info">
                        <div className="card-row">
                            <div className="card-field">
                                <label>Cardholder’s name</label>
                                <input
                                    type="text"
                                    placeholder="Name on card"
                                    value={paymentInfo.cardName}
                                    onChange={(e) =>
                                        setPaymentInfo({...paymentInfo, cardName: e.target.value})
                                    }
                                /></div>
                            <div className="card-field">
                                <label>Card number</label>
                                <input
                                    type="text"
                                    placeholder="1234 5678 9012 3456"
                                    value={paymentInfo.cardNumber}
                                    onChange={(e) =>
                                        setPaymentInfo({...paymentInfo, cardNumber: e.target.value})
                                    }
                                /></div>
                        </div>

                        <div className="card-row">
                            <div className="card-field small">
                                <label>Valid thru</label>
                                <div className="valid-thru-selects">
                                    <select className="valid-select" value={paymentInfo.expMonth}
                                            onChange={(e) =>
                                                setPaymentInfo({...paymentInfo, expMonth: e.target.value})
                                            }>
                                        <option value="" disabled>MM</option>
                                        {Array.from({length: 12}, (_, i) => {
                                            const month = (i + 1).toString().padStart(2, "0");
                                            return <option key={month} value={month}>{month}</option>;
                                        })}
                                    </select>
                                    <span>/</span>
                                    <select className="valid-select" value={paymentInfo.expYear}
                                            onChange={(e) =>
                                                setPaymentInfo({...paymentInfo, expYear: e.target.value})
                                            }>
                                        <option value="" disabled>YY</option>
                                        {Array.from({length: 10}, (_, i) => {
                                            const year = new Date().getFullYear() + i;
                                            return <option key={year} value={year}>{year.toString().slice(-2)}</option>;
                                        })}
                                    </select>
                                </div>
                            </div>
                            <div className="card-field small">
                                <label>CVV / CVC</label>
                                <input type="password" placeholder="***" maxLength={3} value={paymentInfo.cvv}
                                       onChange={(e) =>
                                           setPaymentInfo({...paymentInfo, cvv: e.target.value})
                                       }/>
                            </div>
                            <div className="card-field small">
                                <small className="comment-label">
                                    Your CVV/CVC is a security feature. Do not show it to anyone, not even staff.
                                </small>
                            </div>
                        </div>
                    </div>

                    <div className="order-buttons-payment">
                        <button className="back-btn" onClick={handleBack}>
                            Back
                        </button>
                        <button className="continue-btn" onClick={handleContinue}>
                            Continue
                        </button>
                    </div>
                </div>
            )}


            {step === 3 && (
                <div className="red-back checkout">
                    <h2 className="shipping-title">Confirm Your Order</h2>

                    <div className="for-flex">
                        <div className="orders-last">
                            <h2 className="checkout-line">Shopping Bag</h2>

                            <div className="scroller2">
                                {cartItems.map((item, index) => (
                                    <div key={index} className="order-item-last">
                                        <img
                                            src={item.image || reorderLogo}
                                            alt={item.name}
                                            className="pizza-img"
                                        />


                                        <div className="order-details">
                                            <p className="order-extra">name</p>
                                            <p className="order-name">
                                                {item.name}
                                                {item.category === "pizza" && item.size ? ` (${item.size})` : ""}
                                            </p>

                                            {/* Show backend ingredients */}
                                            {item.baseIngredients && item.baseIngredients.length > 0 && (
                                                <p className="order-extra">
                                                    Ingredients: {item.baseIngredients.join(", ")}
                                                </p>
                                            )}

                                            {/* Show extras */}
                                            {item.extras && item.extras.length > 0 && (
                                                <p className="order-extra">
                                                    Extras: {item.extras.join(", ")}
                                                </p>
                                            )}
                                        </div>

                                        <div className="order-price">
                                            <p className="order-extra">price</p>
                                            <span className="order-name">
    {(item.totalPrice * item.quantity).toFixed(2)} €
  </span>
                                        </div>
                                        <div className="order-quantity">
                                            <p className="order-extra">quantity</p>
                                            <div className="order-quantity-2">
                                                <button onClick={() => handleDecrease(index)}>-</button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => handleIncrease(index)}>+</button>
                                            </div>

                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>

                        <div className="two-flex">
                            <div className="orders-last-shipping">
                                <h2 className="checkout-line">Shipping</h2>
                                <div>
                                    <div className={`new-info-last`}>
                                        <div className="info-field-last">
                                            <label>Name</label>
                                            <input type="text" value={shippingInfo.name} disabled/>
                                        </div>
                                        <div className="info-field-last">
                                            <label>Email</label>
                                            <input type="email" value={shippingInfo.email} disabled/>
                                        </div>
                                        <div className="info-field-last">
                                            <label>Phone</label>
                                            <input type="text" value={shippingInfo.phone} disabled/>
                                        </div>
                                        <div className="info-field-last">
                                            <label>Address</label>
                                            <input type="text" value={shippingInfo.address} disabled/>
                                        </div>
                                        <div className="info-field-last">
                                            <label>City</label>
                                            <input type="text" value={shippingInfo.city} disabled/>
                                        </div>
                                        <div className="info-field-last">
                                            <label>Comment</label>
                                            <input type="text" value={shippingInfo.comment} disabled/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="orders-last-shipping">
                                <h2 className="checkout-line">Payment</h2>
                                <div>
                                    <div className={`new-info-last`}>
                                        <div className="info-field-last">
                                            <label>Type</label>
                                            <input type="text" value={paymentInfo.method} disabled/>
                                        </div>
                                        <div className="info-field-last">
                                            <label>Name</label>
                                            <input type="text" value={paymentInfo.cardName} disabled/>
                                        </div>
                                        <div className="info-field-last">
                                            <label>Card Number</label>
                                            <input type="text"
                                                   value={paymentInfo.cardNumber.replace(/\d(?=\d{4})/g, "*")} // mask
                                                   disabled/>
                                        </div>
                                        <div className="info-field-last">
                                            <label>Valid thru</label>
                                            <input type="text" value={`${paymentInfo.expMonth}/${paymentInfo.expYear}`}
                                                   disabled/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="orders-last-summary">
                            <h2 className="checkout-line">Summary</h2>
                            <div>
                                <div className={`new-info-last`}>
                                    <div className="info-field-last">
                                        <label>Subtotal</label>
                                        <span>{subtotal.toFixed(2)}€</span>
                                    </div>
                                    <div className="info-field-last">
                                        <label>Taxes</label>
                                        <span>{taxes.toFixed(2)}€</span>
                                    </div>
                                    <div className="info-field-last">
                                        <label>Shipping</label>
                                        <span>{shippingCost.toFixed(2)}€</span>
                                    </div>
                                    <div className="info-field-last-promo promo-container">
                                        <label>Promo code</label>
                                        <div className="promo-input-wrapper">
                                            <input
                                                type="text"
                                                value={promoCode}
                                                onChange={(e) => setPromoCode(e.target.value)}
                                                placeholder="Promo"
                                            />
                                            <button type="button" className="apply-btn" onClick={handleApplyPromo}>
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                    <div className="info-field-last-promo">
                                        <label>Tip (€)</label>
                                        <input
                                            type="number"
                                            value={tip}
                                            onChange={(e) => setTip(Number(e.target.value))}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div className="line-summary"></div>
                                    <div className="info-field-last">
                                        <label>Discount</label>
                                        <span>-{discount.toFixed(2)}€</span>
                                    </div>
                                    <div className="info-field-last">
                                        <label>Total</label>
                                        <span>{total.toFixed(2)}€</span>
                                    </div>
                                </div>
                            </div>
                            <button className="continue-btn-confirm" onClick={handleCheckout}>
                                Checkout
                            </button>
                        </div>
                    </div>


                    <div className="order-buttons-confirm">
                        <button className="back-btn-confirm" onClick={handleBack}>
                            Back
                        </button>
                    </div>
                </div>
            )}


        </div>
    )
}