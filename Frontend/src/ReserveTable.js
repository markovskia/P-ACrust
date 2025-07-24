import React, {useState, useEffect} from 'react';
import './ReserveTable.css';
import PACrustLogo from "./images/pacrustlogo.png"
import {useNavigate} from "react-router-dom";
import pizzaData from "./PizzaData";

export default function ReserveTable({loggedUser, logout}) {
    const navigate = useNavigate();
    const [peopleCount, setPeopleCount] = useState(1);
    const [reservationDate, setReservationDate] = useState('');
    // const [showForm, setShowForm] = useState(true); // default to visible
    //
    // useEffect(() => {
    //     // Check if form was shown before
    //     const alreadyShown = localStorage.getItem('reservationFormShown');
    //     if (!alreadyShown) {
    //         setShowForm(true);
    //         localStorage.setItem('reservationFormShown', 'true'); // mark it as shown
    //     }
    // }, []);
    //
    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     console.log(`Reservation for: ${peopleCount} people`);
    //
    //     setShowForm(false); // hide form after submit
    //     // You can navigate or store the data here
    // };
    //
    // useEffect(() => {
    //     if (!showForm && reservationDate) {
    //         console.log(`The date is: ${reservationDate}`);
    //     }
    // }, [reservationDate, showForm]);

    const [fromTime, setFromTime] = useState("12:00");
    const [toTime, setToTime] = useState("13:00");
    const [tableStatus, setTableStatus] = useState({}); // e.g. { "left-table-1": "available" }
    const [selectedTable, setSelectedTable] = useState(null);

    const checkTablesAvailability = async () => {
        const tableIds = [
            "oval-table", "rect-table-1", "rect-table-2", "rect-table-3", "vert-table",
            "left-table-1", "left-table-2", "left-table-3", "left-table-4", "left-table-5", "left-table-6", "left-table-7",
            "right-table-10", "right-table-11", "right-table-12", "right-table-13", "right-table-14", "right-table-15", "right-table-16"
        ];

        const newStatus = {};

        for (let id of tableIds) {
            const res = await fetch("http://localhost:8000/api/check-table", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    tableId: id,
                    date: reservationDate,
                    fromTime,
                    toTime
                })
            });
            const data = await res.json();
            newStatus[id] = data.available ? "available" : "unavailable";
        }

        setTableStatus(newStatus);
    };

    const handleTableClick = (id) => {
        if (tableStatus[id] === "available") {
            setSelectedTable(id);
        }
    };

    const handleReservationSubmit = async () => {
        if (!selectedTable) {
            alert("Избери маса!");
            return;
        }

        const res = await fetch("http://localhost:8000/api/reserve", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                tableId: selectedTable,
                date: reservationDate,
                fromTime,
                toTime,
                username: loggedUser.username,
                peopleCount,
                comment: "" // или читај од поле ако го користиш
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Успешна резервација!");
            checkTablesAvailability(); // update again
        } else {
            alert("Грешка: " + data.message);
        }
    };


    return (
        <div className="local-background-2">
            <div className="original-navigation">
                <div className="navigation-bar">
                    <div className="logodiv">
                        <img className="logo" src={PACrustLogo} alt={PACrustLogo} onClick={() => navigate("/")}/>
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
            </div>
            <div className="header-reserve">
                <h1 className="h1-reserve">RESERVE TABLE</h1>
            </div>

            {/*ova e ona ako sakash na pocetok da te prasha na cela strana*/}
            {/*{showForm ? (*/}
            {/*    <div className="overlay">*/}
            {/*        <div className="reservation-form-box">*/}
            {/*            <div className="onDiv">*/}
            {/*                <h2 className="reserve-question">How many people is the reservation for and which date?</h2>*/}
            {/*                <form onSubmit={handleSubmit} className="form-table">*/}
            {/*                    <div className="separ">*/}
            {/*                        <input*/}
            {/*                            type="number"*/}
            {/*                            value={peopleCount}*/}
            {/*                            min="1"*/}
            {/*                            step="1"*/}
            {/*                            onChange={(e) => setPeopleCount(Math.floor(e.target.value))}*/}
            {/*                            required*/}
            {/*                            className="input-num"*/}
            {/*                            align="center"*/}
            {/*                            max="10"*/}
            {/*                        />*/}
            {/*                        <input*/}
            {/*                            type="date"*/}
            {/*                            value={reservationDate}*/}
            {/*                            onChange={(e) => setReservationDate(e.target.value)}*/}
            {/*                            required*/}
            {/*                            className="date-picker"*/}
            {/*                        />*/}
            {/*                    </div>*/}
            {/*                    <button className="submit-button" type="submit" style={{marginTop: '20px'}}>Submit*/}
            {/*                    </button>*/}
            {/*                </form>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*)}*/}
            <div className="reservation-layout">
                <div className="tables-map">
                    {/* Large oval table with inner space and 12 chairs */}
                    <div className="table-group oval-table">
                        {[...Array(12)].map((_, i) => (
                            <div className={`chair oval-chair chair-${i}`} key={i}></div>
                        ))}
                        <div className="table oval"></div>
                        <div className="table oval-inner"></div>
                    </div>

                    {/* Three horizontal rectangle tables with 6 chairs */}
                    <div className="table-group rect-table-1">
                        {[...Array(6)].map((_, i) => (
                            <div className={`chair small-rect-chair chair-${i}`} key={i}></div>
                        ))}
                        <div className="table small-rect"></div>
                    </div>
                    <div className="table-group rect-table-2">
                        {[...Array(6)].map((_, i) => (
                            <div className={`chair small-rect-chair chair-${i}`} key={i}></div>
                        ))}
                        <div className="table small-rect"></div>
                    </div>
                    <div className="table-group rect-table-3">
                        {[...Array(6)].map((_, i) => (
                            <div className={`chair small-rect-chair chair-${i}`} key={i}></div>
                        ))}
                        <div className="table small-rect"></div>
                    </div>

                    {/* Vertical rectangle table */}
                    <div className="table-group vert-table">
                        {[...Array(8)].map((_, i) => (
                            <div className={`chair vert-rect-chair chair-${i}`} key={i}></div>
                        ))}
                        <div className="table vert-rect"></div>
                    </div>

                    {/* Grid of small round tables bottom left */}
                    <div className="left-table">
                        {[...Array(7)].map((_, i) => {
                            const row = i < 3 ? 0 : 1;
                            const col = i < 3 ? i : i - 3;
                            return (
                                <div
                                    className={`table-group left-table-${i + 1} ${tableStatus[`left-table-${i + 1}`]} ${selectedTable === `left-table-${i + 1}` ? 'selected' : ''}`}
                                    key={`left-${i + 1}`}
                                    onClick={() => handleTableClick(`left-table-${i + 1}`)}
                                    style={{
                                        top: `${150 + row * 100}px`,
                                        left: `${20 + col * 80}px`
                                    }}
                                >
                                    <div className="chair top"></div>
                                    <div className="chair bottom"></div>
                                    <div className="chair left"></div>
                                    <div className="chair right"></div>
                                    <div className="table round"></div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right side grid of small round tables */}
                    <div className="right-table">
                        {[...Array(7)].map((_, i) => (
                            <div
                                className={`table-group right-table-${i + 10} ${tableStatus[`right-table-${i + 10}`]} ${selectedTable === `right-table-${i + 10}` ? 'selected' : ''}`}
                                key={`right-${i + 10}`}
                                onClick={() => handleTableClick(`right-table-${i + 10}`)}
                                style={{
                                    top: `${300 + Math.floor(i / 3) * 60}px`,
                                    left: `${550 + (i % 3) * 60}px`
                                }}
                            >
                                <div className="chair top"></div>
                                <div className="chair bottom"></div>
                                <div className="chair left"></div>
                                <div className="chair right"></div>
                                <div className="table round"></div>
                            </div>
                        ))}
                    </div>

                    <div className="lines"></div>
                    <div className="lines2"></div>
                    {/* Central round table highlighted */}
                    {/*<div className="table-group selected-table" style={{ top: '220px', left: '200px' }}>*/}
                    {/*    <div className="chair top"></div>*/}
                    {/*    <div className="chair bottom"></div>*/}
                    {/*    <div className="chair left"></div>*/}
                    {/*    <div className="chair right"></div>*/}
                    {/*    <div className="table round"></div>*/}
                    {/*</div>*/}

                </div>
                <div className="right-side">
                    <div className="after-submit-dropdown">
                        <h2 className="reserve-question-2">Reservation Details</h2>

                        <div className="reservation-controls">
                            {/* Датум */}
                            <input
                                type="date"
                                value={reservationDate}
                                onChange={(e) => setReservationDate(e.target.value)}
                                className="date-picker"
                            />

                            {/* Број на луѓе */}
                            <select
                                id="people-select"
                                value={peopleCount}
                                onChange={(e) => setPeopleCount(parseInt(e.target.value))}
                                className="dropdown-button"
                            >
                                {[...Array(10)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1} {i + 1 === 1 ? "person" : "people"}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button className="submit-button-time" onClick={checkTablesAvailability}>
                            Check Availability
                        </button>
                        <button onClick={handleReservationSubmit} className="submit-button-time">
                            Submit Reservation
                        </button>
                    </div>
                    <div className="time-gathering">
                        <h2 className="time-title">Time of gathering</h2>

                        <div className="time-inputs">
                            <div className="time-input-group">
                                <label>From:</label>
                                <input
                                    type="time"
                                    className="time-field"
                                    value={fromTime}
                                    onChange={(e) => setFromTime(e.target.value)}
                                />
                            </div>
                            <div className="time-input-group">
                                <label>To:</label>
                                <input
                                    type="time"
                                    className="time-field"
                                    value={toTime}
                                    onChange={(e) => setToTime(e.target.value)}
                                /></div>
                        </div>

                        <textarea className="comment-box" placeholder="Leave a comment"></textarea>

                        <button className="submit-button-time">submit</button>
                    </div>
                </div>

            </div>
        </div>
    )
        ;
};

