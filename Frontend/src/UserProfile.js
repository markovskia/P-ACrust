import React, {useState} from "react";
import "./UserProfile.css";
import PACrustLogo from "./images/pacrustlogo.png"
import pizzaImage from "./images/pizza-image.png"
import secondPizza from "./images/secondPizza.png"
import axios from "axios";
import {useNavigate} from "react-router-dom";

export default function UserProfile({loggedUser, setLoggedUser, logout}) {
    const navigate = useNavigate();

    const [email, setEmail] = useState(loggedUser.email);
    const [username, setUsername] = useState(loggedUser.username);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [address, setAddress] = useState(loggedUser.address || "");
    const [phone, setPhone] = useState(loggedUser.phone || "");


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
                username,
                password: password || undefined,
                address,
                phone
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
            console.error(err);
            alert("Грешка при зачувување на податоците.");
        }
    };
    return (
        <div className="local-background">
            <div className="navigation-bar">
                <div className="logodiv">
                    <img className="logo" src={PACrustLogo} alt={PACrustLogo} onClick={() => navigate("/")}/>
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
                </div>
                <div className="divpart" onClick={() => navigate("/")}>
                    <p className="divpartP">HOME</p>
                </div>
                <div className="divpart" onClick={() => navigate("/menu")}>
                    <p className="divpartP">MENU</p>
                </div>
                <div className="divpart">
                    <p className="divpartP">ABOUT US</p>
                </div>
            </div>
            <div className="flexot">
                <div className="backgroundBox">
                    <div className="theUserDiv"><h1
                        className="theUser">{loggedUser?.username || "No user logged in"}</h1></div>
                    <div className="allSeparated">
                        <div>
                            <div><p className="separatedText">Mail</p></div>
                            <div><input className="separatedInput" value={email}
                                        onChange={(e) => setEmail(e.target.value)}/>
                            </div>
                        </div>
                        <div className="separated">
                            <div>
                                <div><p className="separatedText">Username</p></div>
                                <div><input className="separatedInput2" value={username}
                                            onChange={(e) => setUsername(e.target.value)}/></div>
                            </div>
                            <div>
                                <div><p className="separatedText">Phone number</p></div>
                                <div><input className="separatedInput2" value={phone}
                                            onChange={(e) => setPhone(e.target.value)}/>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div><p className="separatedText">Address</p></div>
                            <div><input className="separatedInput" value={address}
                                        onChange={(e) => setAddress(e.target.value)}/></div>
                        </div>
                        <div>
                            <div><p className="separatedText">Password</p></div>
                            <div><input className="separatedInput" type="password" value={password}
                                        onChange={(e) => setPassword(e.target.value)}/></div>
                        </div>
                        <div>
                            <div><p className="separatedText">Confirm password</p></div>
                            <div><input className="separatedInput" type="password" value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}/></div>
                        </div>
                    </div>
                    <div className="divButton">
                        <button className="saveButton" onClick={handleSave}>Save</button>
                    </div>
                </div>
            </div>
        </div>

    );
}