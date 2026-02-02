import {BrowserRouter, Routes, Route} from 'react-router-dom';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import SigninPage from "./SigninPage";
import UserProfile from './UserProfile';
import ReserveTable from "./ReserveTable";
import MenuPage from './MenuPage';
import {useState} from "react";
import {Navigate} from "react-router-dom";
import {useEffect} from "react";
import AboutUsPage from './AboutUsPage';
import CheckOut from './CheckOut';
import AdminPanel from "./AdminPanel";
import EmployeePanel from "./EmployeePanel";
import axios from 'axios';


function ProtectedRoute({loggedUser, children}) {
    if (!loggedUser) {
        return <Navigate to="/login"/>;
    }
    return children;
}

function App() {
    const [loggedUser, setLoggedUser] = useState(() => {
        const savedUser = localStorage.getItem('loggedUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const isTokenExpired = (token) => {
        try {
            const [, payloadBase64] = token.split('.');
            const payload = JSON.parse(atob(payloadBase64));
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp < currentTime;
        } catch (e) {
            return true;
        }
    };

    const logout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('loggedUser');
        setLoggedUser(null);
    };


    useEffect(() => {
        const token = localStorage.getItem('access');

        if (token && !isTokenExpired(token)) {
            axios.get('http://localhost:8000/api/user/', {
                headers: {Authorization: `Bearer ${token}`},
            })
                .then(res => {
                    console.log('Logged user:', res.data);
                    setLoggedUser(res.data);
                })
                .catch(() => {
                    localStorage.removeItem('access');
                    localStorage.removeItem('refresh');
                    setLoggedUser(null);
                });
        } else {
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            localStorage.removeItem('loggedUser');
            setLoggedUser(null);
        }
    }, []);

    useEffect(() => {
        if (loggedUser) {
            localStorage.setItem('loggedUser', JSON.stringify(loggedUser));
        } else {
            localStorage.removeItem('loggedUser');
        }
    }, [loggedUser]);

    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem("cart");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cartItems));
    }, [cartItems]);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage loggedUser={loggedUser} logout={logout}/>}/>
                <Route path="/login" element={<LoginPage setLoggedUser={setLoggedUser} logout={logout}/>}/>
                <Route path="/signin"
                       element={<SigninPage loggedUser={loggedUser} setLoggedUser={setLoggedUser} logout={logout}/>}/>
                <Route path="/about_us"
                       element={<AboutUsPage loggedUser={loggedUser} setLoggedUser={setLoggedUser} logout={logout}/>}/>

                <Route path="/admin_panel" element={loggedUser?.role === "administrator" ?
                    <AdminPanel loggedUser={loggedUser} logout={logout}/>
                    : <Navigate to="/"/>
                }/>

                <Route path="/employee_panel" element={loggedUser?.role === "employee" ?
                    <EmployeePanel loggedUser={loggedUser} logout={logout}/>
                    : <Navigate to="/"/>
                }/>


                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute loggedUser={loggedUser}>
                            <UserProfile loggedUser={loggedUser} setLoggedUser={setLoggedUser} logout={logout}/>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/checkout"
                    element={
                        <ProtectedRoute loggedUser={loggedUser}>
                            <CheckOut
                                loggedUser={loggedUser}
                                setLoggedUser={setLoggedUser}
                                logout={logout}
                                cartItems={cartItems}
                                setCartItems={setCartItems}
                            />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/menu"
                    element={
                        <MenuPage
                            loggedUser={loggedUser}
                            setLoggedUser={setLoggedUser}
                            logout={logout}
                            cartItems={cartItems}
                            setCartItems={setCartItems}
                        />
                    }
                />
                <Route
                    path="/reserve"
                    element={
                        <ProtectedRoute loggedUser={loggedUser}>
                            <ReserveTable loggedUser={loggedUser} logout={logout}/>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;