import React, {useState, useEffect, useRef} from 'react';
import './ReserveTable.css';
import PACrustLogo from "./images/pacrustlogo.png"
import {useNavigate} from "react-router-dom";

export default function ReserveTable({loggedUser, logout}) {
    const navigate = useNavigate();
    const [peopleCount, setPeopleCount] = useState(1);
    const [reservationDate, setReservationDate] = useState('');
    const [fadeOut, setFadeOut] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [fromTime, setFromTime] = useState("12:00");
    const [toTime, setToTime] = useState("13:00");
    const [selectedTable, setSelectedTable] = useState(null);
    const [selectedTimes, setSelectedTimes] = useState([]);
    const [tableStatus, setTableStatus] = useState({});

    const mapRef = useRef(null);


    const checkTablesAvailability = async () => {
        const tableIds = [
            "oval-table", "rect-table-1", "rect-table-2", "rect-table-3", "vert-table",
            "left-table-1", "left-table-2", "left-table-3", "left-table-4", "left-table-5", "left-table-6", "left-table-7", "left-table-8",
            "left-table-9", "right-table-10", "right-table-11", "right-table-12", "right-table-13",
            "right-table-14", "right-table-15", "right-table-16"
        ];
        const newStatus = {};
        let freeChairs = 0;
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

            if (tableCapacities[id] >= peopleCount && data.available) {
                newStatus[id] = "available";
            } else {
                newStatus[id] = "unavailable";
            }
            if (id === "oval-table" && data.available) {
                freeChairs = data.freeChairs;
            }
        }
        setTableStatus(newStatus);
        setFreeChairsCount(freeChairs);
    };

    const rightTablePositions = [
        {top: 360, left: 520}, // right-table-11
        {top: 410, left: 630}, // right-table-12
        {top: 360, left: 740}, // right-table-13
        {top: 410, left: 850}, // right-table-14
        {top: 520, left: 550}, // right-table-15
        {top: 520, left: 690}, // right-table-16
        {top: 520, left: 830}, // right-table-17
    ];
    const leftTablePositions = [
        {top: 50, left: 0},   // left-table-5
        {top: 50, left: 165}, // left-table-6
        {top: 50, left: 330}, // left-table-7
        {top: 180, left: 0},   // left-table-8
        {top: 180, left: 165}, // left-table-9
        {top: 180, left: 330}, // left-table-10
        {top: 310, left: 0},  // left-table-11
        {top: 310, left: 165},
        {top: 310, left: 330},
    ];
    const handleTableClick = (id) => {
        if (savedTables.length > 0) {
            alert("Веќе имаш селектирано маса. Кликни 'Clear' за да избришеш и пробај повторно.");
            return;
        }

        if (tableStatus[id] === "available") {
            setSelectedTable(id);
        }
    };
    const [comment, setComment] = useState("");
    const defaultStatus = {
        "oval-table": "default",
        "rect-table-1": "default",
        "rect-table-2": "default",
        "rect-table-3": "default",
        "vert-table": "default",
        "left-table-1": "default",
        "left-table-2": "default",
        "left-table-3": "default",
        "left-table-4": "default",
        "left-table-5": "default",
        "left-table-6": "default",
        "left-table-7": "default",
        "left-table-8": "default",
        "left-table-9": "default",
        "right-table-10": "default",
        "right-table-11": "default",
        "right-table-12": "default",
        "right-table-13": "default",
        "right-table-14": "default",
        "right-table-15": "default",
        "right-table-16": "default"
    };
    const [savedTimes, setSavedTimes] = useState([]);
    const getTableLabel = (id) => {
        if (id === "oval-table") return "Шанк";
        if (id === "rect-table-1") return "Maca 1";
        if (id === "rect-table-2") return "Maca 2";
        if (id === "rect-table-3") return "Maca 3";
        if (id === "vert-table") return "Maca 4";
        if (id.startsWith("left-table-")) {
            const num = parseInt(id.split("-")[2]) + 4; // 1 -> 5, 2 -> 6, ...
            return "Maca " + num.toString();
        }
        if (id.startsWith("right-table-")) {
            const num = parseInt(id.split("-")[2]) - 10 + 14; // 10 -> 14, 11 -> 15, ...
            return "Maca " + num.toString();
        }
        return "";
    };
    const getLabelColor = (id) => {
        const status = tableStatus[id];
        switch (status) {
            case "available":
                return "#4caf50";   
            case "unavailable":
                return "red";     
            case "default":
                return "#FF7F50";    
            default:
                return "#FF7F50";   
        }
    };
    const handleReservationSubmit = async () => {
        if (!selectedTable && savedTables.length === 0) {
            alert("Избери маса!");
            return;
        }

        if (savedTimes.length === 0) {
            alert("Избери време!");
            return;
        }

        const reservations = [];

        for (let time of savedTimes) {
            const startTime = time;
            const [hour, minute] = time.split(":").map(Number);
            let endHour = hour;
            let endMinute = minute + 30;

            if (endMinute >= 60) {
                endMinute -= 60;
                endHour += 1;
            }

            const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

            const res = await fetch("http://localhost:8000/api/reserve", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    tableId: selectedTable || savedTables[0],
                    date: reservationDate,
                    fromTime: startTime,
                    toTime: endTime,
                    username: loggedUser.username,
                    name: loggedUser.name,
                    email: loggedUser.email,
                    peopleCount,
                    comment
                })
            });

            const data = await res.json();
            if (!res.ok) {
                alert("Грешка кај " + startTime + ": " + data.message);
                return;
            } else {
                reservations.push(startTime + " - " + endTime);
            }
        }

        alert("Успешно резервирани термини, очекувајте потврда на мејл.");
        setFadeOut(true);
        setTimeout(() => {
            setSavedTables([]);
            setSavedTimes([]);
            setSelectedTable(null);
            setComment("");
            setShowDetails(false);
            setFadeOut(false);
        }, 400);
        checkTablesAvailability(); 
    };

    useEffect(() => {
        setSelectedTimes([]);
        setSavedTimes([]);
    }, [reservationDate]);

    useEffect(() => {
        setSelectedTimes([]);
    }, [selectedTable]);

    const tableCapacities = {
        "oval-table": 12,
        "rect-table-1": 6,
        "rect-table-2": 6,
        "rect-table-3": 6,
        "vert-table": 8,
        "left-table-1": 4,
        "left-table-2": 4,
        "left-table-3": 4,
        "left-table-4": 4,
        "left-table-5": 4,
        "left-table-6": 4,
        "left-table-7": 4,
        "left-table-8": 4,
        "left-table-9": 4,
        "right-table-10": 4,
        "right-table-11": 4,
        "right-table-12": 4,
        "right-table-13": 4,
        "right-table-14": 4,
        "right-table-15": 4,
        "right-table-16": 4
    };
    const [savedTables, setSavedTables] = useState([]);
    
    const generateTimeIntervals = () => {
        const intervals = [];
        for (let hour = 10; hour < 23; hour++) {
            for (let min = 0; min < 60; min += 30) {
                const startH = hour.toString().padStart(2, '0');
                const startM = min.toString().padStart(2, '0');
                let endHour = hour;
                let endMin = min + 30;

                if (endMin >= 60) {
                    endMin = 0;
                    endHour += 1;
                }

                const endH = endHour.toString().padStart(2, '0');
                const endM = endMin.toString().padStart(2, '0');

                intervals.push({
                    label: `${startH}:${startM} - ${endH}:${endM}`,
                    value: `${startH}:${startM}`,
                });
            }
        }
        return intervals;
    };

    const [freeChairsCount, setFreeChairsCount] = useState(0);

    const isAdmin = loggedUser?.role === "administrator";

    const [tablePositions, setTablePositions] = useState({
        "oval-table": {top: 200, left: 350},
        "rect-table-1": {top: 150, left: 250},
        "rect-table-2": {top: 150, left: 400},
        "rect-table-3": {top: 150, left: 550},
        "vert-table": {top: 260, left: 700},
    });

    const handleDragEnd = (e, tableId) => {
        if (!isAdmin) return;

        const mapRect = mapRef.current.getBoundingClientRect();

        setTablePositions(prev => ({
            ...prev,
            [tableId]: {
                left: e.clientX - mapRect.left - 40,
                top: e.clientY - mapRect.top - 40,
            }
        }));
    };
    
    const [leftPositions, setLeftPositions] = useState(leftTablePositions);
    const [rightPositions, setRightPositions] = useState(rightTablePositions);
    
    useEffect(() => {
        const savedLayout = localStorage.getItem("tableLayout");

        if (savedLayout) {
            try {
                const parsed = JSON.parse(savedLayout);

                if (parsed.tablePositions) {
                    setTablePositions(parsed.tablePositions);
                }
                if (parsed.leftPositions) {
                    setLeftPositions(parsed.leftPositions);
                }
                if (parsed.rightPositions) {
                    setRightPositions(parsed.rightPositions);
                }
            } catch (e) {
                console.error("Invalid saved layout", e);
            }
        }
    }, []);


    return (
        <div className="local-background-2">
            <div className="original-navigation-reservation">
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
                </div>
            </div>

            <div className="reservation-layout">
                <div className="tables-map" ref={mapRef}>
                    <div
                        className={`table-group oval-table" ${tableStatus["oval-table"] || ""}`}
                        draggable={isAdmin}
                        onDragEnd={(e) => handleDragEnd(e, "oval-table")}
                        style={{
                            position: "absolute",
                            top: tablePositions["oval-table"]?.top,
                            left: tablePositions["oval-table"]?.left,
                            cursor: isAdmin ? "move" : "pointer"
                        }}
                        onClick={() => !isAdmin && handleTableClick("oval-table")}
                    >
                        <div className="table-label-sank"
                             style={{color: getLabelColor("oval-table")}}>{getTableLabel("oval-table")}</div>

                        {[...Array(12)].map((_, i) => (
                            <div className={`chair oval-chair chair-${i}`} key={i}></div>
                        ))}
                        <div className="table oval"></div>
                        <div className="table oval-inner"></div>


                    </div>

                    <div
                        
                        className={`table-group rect-table-1 ${tableStatus["rect-table-1"] || ""}`}
                        draggable={isAdmin}
                        onDragEnd={(e) => handleDragEnd(e, "rect-table-1")}
                        style={{
                            position: "absolute",
                            top: tablePositions["rect-table-1"]?.top,
                            left: tablePositions["rect-table-1"]?.left,
                            cursor: isAdmin ? "move" : "pointer"
                        }}
                        onClick={() => !isAdmin && handleTableClick("rect-table-1")}
                    >
                        <div className="table-label"
                             style={{color: getLabelColor("rect-table-1")}}>{getTableLabel("rect-table-1")}</div>

                        {[...Array(6)].map((_, i) => (
                            <div className={`chair small-rect-chair chair-${i}`} key={i}></div>
                        ))}
                        <div className="table small-rect"></div>
                    </div>
                    <div
                       
                        className={`table-group rect-table-2 ${tableStatus["rect-table-2"] || ""}`}
                        draggable={isAdmin}
                        onDragEnd={(e) => handleDragEnd(e, "rect-table-2")}
                        style={{
                            position: "absolute",
                            top: tablePositions["rect-table-2"]?.top,
                            left: tablePositions["rect-table-2"]?.left,
                            cursor: isAdmin ? "move" : "pointer"
                        }}
                        onClick={() => !isAdmin && handleTableClick("rect-table-2")}
                    >
                        <div className="table-label"
                             style={{color: getLabelColor("rect-table-2")}}>{getTableLabel("rect-table-2")}</div>

                        {[...Array(6)].map((_, i) => (
                            <div className={`chair small-rect-chair chair-${i}`} key={i}></div>
                        ))}
                        <div className="table small-rect"></div>
                    </div>
                    <div
                        className={`table-group rect-table-3 ${tableStatus["rect-table-3"] || ""}`}
                        draggable={isAdmin}
                        onDragEnd={(e) => handleDragEnd(e, "rect-table-3")}
                        style={{
                            position: "absolute",
                            top: tablePositions["rect-table-3"]?.top,
                            left: tablePositions["rect-table-3"]?.left,
                            cursor: isAdmin ? "move" : "pointer"
                        }}
                        onClick={() => !isAdmin && handleTableClick("rect-table-3")}
                    >
                        <div className="table-label"
                             style={{color: getLabelColor("rect-table-3")}}>{getTableLabel("rect-table-3")}</div>

                        {[...Array(6)].map((_, i) => (
                            <div className={`chair small-rect-chair chair-${i}`} key={i}></div>
                        ))}
                        <div className="table small-rect"></div>
                    </div>

                    <div
                        className={`table-group vert-table ${tableStatus["vert-table"] || ""}`}
                        draggable={isAdmin}
                        onDragEnd={(e) => handleDragEnd(e, "vert-table")}
                        style={{
                            position: "absolute",
                            top: tablePositions["vert-table"]?.top,
                            left: tablePositions["vert-table"]?.left,
                            cursor: isAdmin ? "move" : "pointer"
                        }}
                        onClick={() => !isAdmin && handleTableClick("vert-table")}
                    >

                        <div className="table-label-8"
                             style={{color: getLabelColor("vert-table")}}>{getTableLabel("vert-table")}</div>

                        {[...Array(8)].map((_, i) => (
                            <div className={`chair vert-rect-chair chair-${i}`} key={i}></div>
                        ))}
                        <div className="table vert-rect"></div>
                    </div>

                    <div className="left-table">
                        {[...Array(9)].map((_, i) => (
                            <div
                                className={`table-group left-table-${i + 1} ${tableStatus[`left-table-${i + 1}`]} ${selectedTable === `left-table-${i + 1}` ? 'selected' : ''}`}
                                key={`left-${i + 1}`}
                                onClick={() => handleTableClick(`left-table-${i + 1}`)}
                                draggable={isAdmin}
                                onDragEnd={(e) => {
                                    if (!isAdmin) return;
                                    const parent = e.currentTarget.parentElement.getBoundingClientRect();
                                    const newPos = [...leftPositions];
                                    newPos[i] = {
                                        top: e.clientY - parent.top - 30,
                                        left: e.clientX - parent.left - 30,
                                    };
                                    setLeftPositions(newPos);
                                }}
                                style={leftPositions[i]}
                            >
                                <div className="chair top"></div>
                                <div className="chair bottom"></div>
                                <div className="chair left"></div>
                                <div className="chair right"></div>
                                <div className="table round"></div>

                                <div className="table-label-4"
                                     style={{color: getLabelColor(`left-table-${i + 1}`)}}>
                                    {getTableLabel(`left-table-${i + 1}`)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="right-table">
                        {[...Array(7)].map((_, i) => (
                            <div
                                className={`table-group right-table-${i + 10} ${tableStatus[`right-table-${i + 10}`]} ${selectedTable === `right-table-${i + 10}` ? 'selected' : ''}`}
                                key={`right-${i + 10}`}
                                onClick={() => handleTableClick(`right-table-${i + 10}`)}
                                style={rightPositions[i]}
                                draggable={isAdmin}
                                onDragEnd={(e) => {
                                    if (!isAdmin) return;

                                    const mapRect = mapRef.current.getBoundingClientRect();

                                    const newPos = [...rightPositions];
                                    newPos[i] = {
                                        top: e.clientY - mapRect.top - 30,
                                        left: e.clientX - mapRect.left - 30,
                                    };
                                    setRightPositions(newPos);
                                }}
                            >
                                <div className="chair top"></div>
                                <div className="chair bottom"></div>
                                <div className="chair left"></div>
                                <div className="chair right"></div>
                                <div className="table round"></div>

                                <div
                                    className="table-label-4"
                                    style={{color: getLabelColor(`right-table-${i + 10}`)}}
                                >
                                    {getTableLabel(`right-table-${i + 10}`)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="lines"></div>
                    <div className="lines2"></div>
                </div>

                {selectedTable && (
                    <div className="overlay">
                        <div className="time-modal">
                            <h3 className="select_text">Select Time: </h3>
                            <div className="time-inputs">
                                <div className="time-group">
                                    <div className="checkbox-time-list">
                                        {generateTimeIntervals().map((time) => (
                                            <label key={time.value} className="checkbox-time-option">
                                                <input
                                                    type="checkbox"
                                                    value={time.value}
                                                    checked={selectedTimes.includes(time.value)}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setSelectedTimes((prev) =>
                                                            e.target.checked
                                                                ? [...prev, value].sort()
                                                                : prev.filter((t) => t !== value)
                                                        );
                                                    }}
                                                />
                                                <p className="hour-text">{time.label}</p>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    className="submit-button-time"
                                    onClick={() => {
                                        if (selectedTimes.length === 0) {
                                            alert("Избери време!");
                                            return;
                                        }
                                        setShowDetails(true); 
                                        setFadeOut(true);
                                        setTimeout(() => {
                                            checkTablesAvailability();
                                            setSavedTimes(selectedTimes);
                                            setSavedTables((prev) => [...new Set([...prev, getTableLabel(selectedTable)])]); 
                                            setSelectedTable(null);
                                            setFadeOut(false);
                                        }, 200);
                                    }}
                                    disabled={!reservationDate}
                                >
                                    Save
                                </button>

                                <button className="close-button" onClick={() => setSelectedTable(null)}>Close</button>
                            </div>
                        </div>
                    </div>
                )}


                <div className="right-side">
                    <div className="after-submit-dropdown">
                        <h2 className="reserve-question-2">Reservation Details</h2>

                        <div className="reservation-controls">
                            <input
                                type="date"
                                value={reservationDate}
                                onChange={(e) => setReservationDate(e.target.value)}
                                className="date-picker"
                                min={new Date().toISOString().split("T")[0]}
                            />


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

                        <button
                            className="submit-button-time"
                            onClick={checkTablesAvailability}
                            disabled={!reservationDate}
                        >
                            Check Availability
                        </button>

                        {showDetails && (
                            <div className={`selected-times-wrapper fade-wrapper ${fadeOut ? 'hidden' : ''}`}>
                                <h4 className="selected-times-title">You Selected</h4>
                                <div className="selected-table-container">
                                    {savedTables.map((table, index) => (
                                        <div key={index} className="time-chip-table">
                                            {table}
                                        </div>
                                    ))}
                                </div>
                                <div className="selected-times-container">
                                    {savedTimes.map((time, index) => {
                                        const label = generateTimeIntervals().find(t => t.value === time)?.label || time;
                                        return (
                                            <div key={index} className="time-chip">
                                                {label}
                                            </div>
                                        );
                                    })}
                                </div>
                                <button
                                    className="clear-button"
                                    onClick={() => {
                                        setFadeOut(true); 
                                        setTimeout(() => {
                                            setSavedTables([]);
                                            setSavedTimes([]);
                                            setSelectedTable(null);

                                            setTableStatus(defaultStatus)
                                            setShowDetails(false);
                                            setFadeOut(false); 
                                        }, 400); 


                                    }}
                                >
                                    Clear
                                </button>
                                <textarea
                                    className="comment-box"
                                    placeholder="Leave a comment"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                ></textarea>

                                <button
                                    onClick={handleReservationSubmit}
                                    className="submit-button-time"
                                    disabled={!reservationDate}
                                >
                                    Submit Reservation
                                </button>
                            </div>
                        )}


                    </div>

                    {isAdmin && (
                        <button className="layoutBtn" onClick={() => {
                            const layout = {
                                tablePositions,
                                leftPositions,
                                rightPositions
                            };
                            localStorage.setItem("tableLayout", JSON.stringify(layout));
                            alert("Layout saved");
                        }
                        }>
                            Save layout
                        </button>
                    )}
                </div>


            </div>
        </div>
    )
        ;
};