import React, {useState} from "react";
import "./SigninPage.css";
import PACrustLogo from "./images/pacrustlogo.png"
import pizzaImage from "./images/pizza-image.png"
import secondPizza from "./images/secondPizza.png"
import axios from "axios";
import {useNavigate} from "react-router-dom";


export default function SigninPage({setLoggedUser, logout}) {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setFirstPassword] = useState("");
    const [mail, setMail] = useState("");
    const [correct_password, setPassword] = useState("");
    const [address, setAddress] = useState("han");
    const [number, setNumber] = useState("");
    const [promotions, setPromotions] = useState("");
    const [terms, setTerms] = useState("");
    const [selected, setSelected] = useState(null);

    const [acceptPromotions, setAcceptPromotions] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);


    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== correct_password) {
            alert("Потврдата на лозинката не се совпаѓа.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:8000/api/register/", {
                username,
                password,
                email: mail,
                address,
                phone: number,
                acceptPromotions,
                acceptTerms
            });

            if (response.status >= 200 && response.status < 300) {
                alert("Регистрацијата е успешна!");
                setLoggedUser(response.data.user)
                navigate("/")
            }
        } catch (err) {
            if (err.response && err.response.status === 400) {
                alert(err.response.data.message);
            } else {
                alert("Регистрацијата не успеа.");
            }
        }
    };

    return (
        <div className="login-container">
            <aside className="sidebar">
                <div className="logodiv">
                    <img className="logo2" src={PACrustLogo} alt={PACrustLogo} onClick={() => navigate("/")}/>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <div className="top-bar">
                    <div className="phone">📞 075-142-589</div>
                    <button className="login-btn">LOG IN / SIGN IN</button>
                </div>

                <div className="wrap">
                    <div className="text-part">
                        <h1 className="no-margin">Looking for the best pizza in town?</h1>
                        <h2 className="no-margin">Log in and order NOW!</h2>
                    </div>
                    <div className="login-part">
                        <div className="form-container">
                            <form className="login-form" onSubmit={handleRegister}>

                                <div className="input-group">
                                    <input type="text" placeholder="Mail" value={mail}
                                           onChange={(e) => setMail(e.target.value)}/>
                                </div>
                                <div className="input-group">
                                    <input type="text" placeholder="Username" value={username}
                                           onChange={(e) => setUsername(e.target.value)}/>
                                </div>

                                <div className="input-group">
                                    <input type="password" placeholder="Password" value={password}
                                           onChange={(e) => setFirstPassword(e.target.value)}/>
                                </div>

                                <div className="input-group">
                                    <input type="password" placeholder="Confirm Password" value={correct_password}
                                           onChange={(e) => setPassword(e.target.value)}/>
                                </div>

                                <div className="input-group">
                                    <input type="text" placeholder="Address" value={address}
                                           onChange={(e) => setAddress(e.target.value)}/>
                                </div>

                                <div className="input-group">
                                    <input type="text" placeholder="Phone number" value={number}
                                           onChange={(e) => setNumber(e.target.value)} required/>
                                </div>

                                <div className="radio-button-group">
                                    <div className="radio-button-group">
                                        <label className={selected === "promotions" ? "selected" : ""}>
                                            <input
                                                type="checkbox" // using checkbox for UI, but acting like radio
                                                checked={acceptPromotions}
                                                onChange={() => setAcceptPromotions(!acceptPromotions)}
                                            />
                                            <span
                                                className="radio">I accept to receive any kind of promotions on mail.</span>
                                        </label>

                                        <label className={selected === "terms" ? "selected" : ""}>
                                            <input
                                                type="checkbox"
                                                checked={acceptTerms}
                                                onChange={() => setAcceptTerms(!acceptTerms)}
                                            />
                                            <span className="radio">I agree with the Terms and that you have read the Data Policy, including Cookies.</span>
                                        </label>
                                    </div>
                                </div>

                                <button className="login-button" type="submit">Sign in</button>

                            </form>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    )
}
