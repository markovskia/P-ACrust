import React, {useState} from "react";
import "./LoginPage.css";
import PACrustLogo from "./images/pacrustlogo.png"
import pizzaImage from "./images/pizza-image.png"
import secondPizza from "./images/secondPizza.png"
import axios from "axios";
import {useNavigate} from "react-router-dom";

import {GoogleLogin} from "@react-oauth/google";

export default function LoginPage({setLoggedUser}) {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [alertMessage, setAlertMessage] = useState("");

    const [showAlert, setShowAlert] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:8000/api/token/", {
                username,
                password
            });

            if (response.status === 200) {
                localStorage.setItem('access', response.data.access);
                localStorage.setItem('refresh', response.data.refresh);
                setLoggedUser(response.data.user)
                const userResponse = await axios.get("http://localhost:8000/api/user/", {
                    headers: {Authorization: `Bearer ${response.data.access}`}
                });
                setLoggedUser(userResponse.data);

                if (userResponse.data.role === 'administrator') {
                    navigate("/admin_panel")
                } else {
                    navigate("/")
                }
            }
        } catch (err) {
            setAlertMessage("Login failed. Please check your details.");
            setShowAlert(true);
        }
    }

    const handleGoogleLogin = async (googleToken) => {
        try {
            const response = await axios.post(
                "http://localhost:8000/api/google-login/",
                {token: googleToken}
            );

            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);
            setLoggedUser(response.data.user);
            navigate("/");
        } catch (err) {
            setAlertMessage("Google login failed");
            setShowAlert(true);
        }
    };


    return (
        <div className="local-background">
            <div className="original-navigation-login">
                <div className="navigation-bar">
                    <div className="logodiv">
                        <img className="logo" src={PACrustLogo} alt={PACrustLogo} onClick={() => navigate("/")}/>
                    </div>
                    <div className="divpart-menu" onClick={() => navigate("/")}>
                        <p className="divpartP">HOME</p>
                    </div>
                    <div className="divpart-menu" onClick={() => navigate("/menu")}>
                        <p className="divpartP">MENU</p>
                    </div>
                    <div className="divpart-menu">
                        <p className="divpartP">ABOUT US</p>
                    </div>
                </div>
                <div className="nav-right-part">
                    <div className="phone">📞 075-142-589</div>
                    <button className="login-btn"> LOG IN / SIGN IN</button>
                </div>
            </div>
            <div className="login-container-login">
                {/* Main Content */}
                <main className="main-content-login">
                    <div className="wrap-login">
                        <div className="text-part">
                            <h1 className="no-margin">Looking for the best pizza in town?</h1>
                            <h2 className="no-margin">Log in and order NOW!</h2>
                        </div>
                        <div className="login-part">
                            <div className="form-container">
                                <form className="login-form" onSubmit={handleLogin}>

                                    <div className="input-group">
                                        <input type="text" placeholder="Username" value={username}
                                               onChange={(e) => setUsername(e.target.value)}/>
                                    </div>

                                    <div className="input-group">
                                        <input type="password" placeholder="Password" value={password}
                                               onChange={(e) => setPassword(e.target.value)}/>
                                    </div>

                                    <button className="login-button" type="submit">Log in</button>

                                    <div className="separator">
                                        <hr/>
                                        <span>Or</span>
                                        <hr/>
                                    </div>

                                    <div className="social-buttons">
                                        <GoogleLogin
                                            onSuccess={credentialResponse => {
                                                console.log("Google credential:", credentialResponse);
                                                handleGoogleLogin(credentialResponse.credential);
                                            }}
                                            onError={() => {
                                                console.log("Login Failed");
                                            }}
                                        />
                                    </div>

                                    <div className="separator">
                                        <hr/>
                                        <span>Not signed in yet? <span className="sign-in"
                                                                       onClick={() => navigate("/signin")}>Sign in now</span></span>
                                        <hr/>
                                    </div>

                                </form>
                            </div>
                        </div>
                    </div>

                </main>
            </div>
            {showAlert && (
                <div className="custom-alert">
                    <div className="custom-alert-content">
                        <p>{alertMessage}</p>
                        <button onClick={() => setShowAlert(false)}>OK</button>
                    </div>
                </div>
            )}
        </div>
    )
}
