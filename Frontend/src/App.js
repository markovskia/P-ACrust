import {BrowserRouter, Routes, Route} from 'react-router-dom';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import SigninPage from "./SigninPage";
import UserProfile from './UserProfile';
import {useState} from "react";
import {Navigate} from "react-router-dom";
import {useEffect} from "react";
import axios from 'axios';


function ProtectedRoute({loggedUser, children}) {
    if (!loggedUser) {
        return <Navigate to="/login"/>;
    }
    return children;
}

function App() {
    // const [loggedUser, setLoggedUser] = useState(() => {
    //   localStorage.removeItem("loggedUser")
    //   const savedUser = localStorage.getItem('loggedUser');
    //   return savedUser ? JSON.parse(savedUser) : null;
    // });
    //
    // useEffect(() => {
    //   if (loggedUser) {
    //     localStorage.setItem('loggedUser', JSON.stringify(loggedUser));
    //   } else {
    //     localStorage.removeItem('loggedUser');
    //   }
    // }, [loggedUser]);
    //   return (
    //   <BrowserRouter>
    //     <Routes>
    //       <Route path="/" element={<HomePage loggedUser={loggedUser} />} />
    //       <Route path="/login" element={<LoginPage setLoggedUser={setLoggedUser} />} />
    //       <Route path="/signin" element={<SigninPage setLoggedUser={setLoggedUser}/>} />
    //       <Route path="/profile" element={<ProtectedRoute loggedUser={loggedUser}> <UserProfile loggedUser={loggedUser} /></ProtectedRoute>} />
    //
    //     </Routes>
    //   </BrowserRouter>
    // );
    const [loggedUser, setLoggedUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('access');
        if (token) {
            axios.get('http://localhost:8000/api/user/', {
                headers: {Authorization: `Bearer ${token}`}
            }).then(res => {
                console.log('Logged user:', res.data);
                setLoggedUser(res.data);
            }).catch(() => {
                localStorage.removeItem('access');
                setLoggedUser(null);
            });
        }
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage loggedUser={loggedUser}/>}/>
                <Route path="/login" element={<LoginPage setLoggedUser={setLoggedUser}/>}/>
                <Route path="/signin" element={<SigninPage setLoggedUser={setLoggedUser}/>}/>
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute loggedUser={loggedUser}>
                            <UserProfile loggedUser={loggedUser} setLoggedUser={setLoggedUser}/>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;