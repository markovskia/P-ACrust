import React, {useState, useEffect, useRef} from "react";
import "./EmployeePanel.css";
import PACrustLogo from "./images/pacrustlogo2.png"
import PACrustLogo4 from "./images/pacrustlogo4.png"
import message from './images/messages.png'
import pizzaimage from './images/margaritta.png'
import axios from "axios";
import {useNavigate} from "react-router-dom";

export default function EmployeePanel({loggedUser, setLoggedUser, logout}) {

    const [selected, setSelected] = useState("Order Entry");

    useEffect(() => {
        setSelected("Order Entry");
    }, []);

    const [expandedRow, setExpandedRow] = useState(null);

    const [orders, setOrders] = useState([]);

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    useEffect(() => {
        if (selected === "Order Review") {
            fetch("http://127.0.0.1:8000/api/get-orders")
                .then(res => res.json())
                .then(data => {
                    setOrders(data);
                })
                .catch(err => console.error("Error fetching orders:", err));
        }
    }, [selected]);

    const handlePrintReceipt = async () => {
        if (!selectedOrder) return;

        try {
            window.print();

            await axios.delete(`http://127.0.0.1:8000/api/orders/${selectedOrder.id}/`);

            const res = await fetch("http://127.0.0.1:8000/api/get-orders");
            const data = await res.json();

            const withOrders = new Set(data.map(order => order.table_name));
            setTablesWithOrders(withOrders);

            const takeAwayOnly = data.filter(order => order.order_type === "Take Away");
            setTakeAwayOrders(takeAwayOnly);

            setSelectedOrder(null);
            setSelectedTable(null);

        } catch (err) {
            console.error("Error printing/deleting order:", err);
            alert("Failed to delete order.");
        }
    };

    const handlePrintReservations = async () => {
        try {
            window.print();

        } catch (err) {
            console.error("Error printing.", err);
            alert("Failed to delete order.");
        }
    };

    const [receptionView, setReceptionView] = useState("Pending");

    const [pendingOrders, setPendingOrders] = useState([]);

    useEffect(() => {
        if (selected === "Order Reception") {
            fetch("http://127.0.0.1:8000/api/get-orders")
                .then(res => res.json())
                .then(data => {
                    if (receptionView === "Pending") {
                        setPendingOrders(data.filter(o => o.status === "pending"));
                    } else if (receptionView === "Finished") {
                        setFinishedOrders(data.filter(o => o.status === "finished"));
                    }
                })
                .catch(err => console.error("Error fetching orders:", err));
        }
    }, [selected, receptionView]);


    const [takeAwayOrders, setTakeAwayOrders] = useState([]);

    const [orderType, setOrderType] = useState("Dine In");

    const navigate = useNavigate();

    const [selectedTable, setSelectedTable] = useState(null);

    const [selectedReservationTable, setSelectedReservationTable] = useState(false);

    const [selectedDate, setSelectedDate] = useState(null);

    const [selectedOrder, setSelectedOrder] = useState(null);

    const [receiptTime] = useState(new Date());

    const [showOrderExistsModal, setShowOrderExistsModal] = useState(false);
    const [orderExistsTable, setOrderExistsTable] = useState(null);

    const handleTableClick = async (id) => {
        setSelectedTable(id);
        setOrderType("Dine In");

        try {
            const res = await fetch("http://127.0.0.1:8000/api/get-orders");
            const data = await res.json();

            const tableLabel = getTableLabel(id);
            const existingOrder = data.find(o => o.table_name === tableLabel);

            if (selected === "Print Receipt") {
                if (existingOrder) {
                    setSelectedOrder(existingOrder);
                } else {
                    setSelectedOrder(null);
                    alert(`No order found for table ${tableLabel}`);
                }
                return;
            }


            if (existingOrder) {

                setOrderExistsTable({tableLabel, existingOrder});
                setShowOrderExistsModal(true);
            } else {
                setSelected("Order Entry");
                setSelectedOrder(null);
            }
        } catch (err) {
            console.error("Error fetching order for table:", err);
        }
    };

    const getTableLabel = (id) => {
        if (id === "oval-table") return "Шанк";
        if (id === "rect-table-1") return "Maca 1";
        if (id === "rect-table-2") return "Maca 2";
        if (id === "rect-table-3") return "Maca 3";
        if (id === "vert-table") return "Maca 4";

        if (id.startsWith("left-table-")) {
            const index = parseInt(id.split("-")[2]);
            return "Maca " + (4 + index);
        }

        if (id.startsWith("right-table-")) {
            const index = parseInt(id.split("-")[2]);
            return "Maca " + (index + 4);
        }

        return "";
    };

    const rightTablePositions = [
        {top: 360, left: 520},
        {top: 410, left: 630},
        {top: 360, left: 740},
        {top: 410, left: 850},
        {top: 520, left: 550},
        {top: 520, left: 690},
        {top: 520, left: 830},
    ];
    const leftTablePositions = [
        {top: 50, left: 0},
        {top: 50, left: 165},
        {top: 50, left: 330},
        {top: 180, left: 0},
        {top: 180, left: 165},
        {top: 180, left: 330},
        {top: 310, left: 0},
        {top: 310, left: 165},
        {top: 310, left: 330},
    ];

    const [tableStatus, setTableStatus] = useState({});

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

    const [selectedSize, setSelectedSize] = useState("medium");

    const [quantity, setQuantity] = useState(1);

    const increment = () => setQuantity(q => q + 1);
    const decrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));


    const [ingredients, setIngredients] = useState([]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/ingredients/")
            .then(res => res.json())
            .then(data => setIngredients(data))
            .catch(err => console.error("Error fetching ingredients:", err));
    }, []);

    const [selectedIngredients, setSelectedIngredients] = useState([]);

    const toggleIngredient = (id) => {
        setSelectedIngredients(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const [orderComment, setOrderComment] = useState("");

    const [tableComment, setTableComment] = useState("");

    const [pizzas, setPizzas] = useState([]);
    const [salads, setSalads] = useState([]);
    const [drinks, setDrinks] = useState([]);
    const [desserts, setDesserts] = useState([]);
    const [sauses, setSauses] = useState([]);
    const [specialoffers, setSpecialoffers] = useState([]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/pizzas/")
            .then(res => res.json())
            .then(data => setPizzas(data))
            .catch(err => console.error("Error fetching pizzas:", err));
    }, []);
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/salads/")
            .then(res => res.json())
            .then(data => setSalads(data))
            .catch(err => console.error("Error fetching salads:", err));
    }, []);
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/drinks/")
            .then(res => res.json())
            .then(data => setDrinks(data))
            .catch(err => console.error("Error fetching drinks:", err));
    }, []);
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/desserts/")
            .then(res => res.json())
            .then(data => setDesserts(data))
            .catch(err => console.error("Error fetching desserts:", err));
    }, []);
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/sauces/")
            .then(res => res.json())
            .then(data => setSauses(data))
            .catch(err => console.error("Error fetching sauces:", err));
    }, []);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/special-offers/")
            .then(res => res.json())
            .then(data => setSpecialoffers(data))
            .catch(err => console.error("Error fetching special offers:", err));
    }, []);


    useEffect(() => {
        if (selected === "Print Receipt") {
            fetch("http://127.0.0.1:8000/api/get-orders")
                .then(res => res.json())
                .then(data => {
                    const takeAwayOnly = data.filter(order => order.order_type === "Take Away");
                    setTakeAwayOrders(takeAwayOnly);
                })
                .catch(err => console.error("Error fetching orders:", err));
        }
    }, [selected]);

    const [selectedPizza, setSelectedPizza] = useState(null);

    const [cartItems, setCartItems] = useState([]);

    const handleAddToTable = () => {
        if (!selectedPizza) return;

        let basePrice = Number(selectedPizza.price);

        if (selectedSize === "small") basePrice -= 3;
        if (selectedSize === "big") basePrice += 5;

        const extraIngredients = ingredients.filter(ing => selectedIngredients.includes(ing.id));
        const ingredientsCost = extraIngredients.reduce((sum, ing) => sum + Number(ing.price), 0);

        const newItem = {
            id: Date.now(),
            name: selectedPizza.name,
            size: selectedSize,
            type: activeMenu === "Pizzas" ? "Pizzas" : activeMenu,
            quantity,
            ingredients: extraIngredients.map(ing => ing.name),
            comment: orderComment,
            price: basePrice + ingredientsCost,
            category: activeMenu,
        };

        setCartItems([...cartItems, newItem]);

        setSelectedPizza(null);
        setQuantity(1);
        setSelectedIngredients([]);
        setOrderComment("");
    };

    const subtotal = cartItems.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
    );

    const [activeMenu, setActiveMenu] = useState("Pizzas");

    const increaseItem = (id) => {
        setCartItems(cartItems.map(item =>
            item.id === id ? {...item, quantity: item.quantity + 1} : item
        ));
    };

    const decreaseItem = (id) => {
        setCartItems(cartItems.map(item =>
            item.id === id
                ? {...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1}
                : item
        ));
    };

    const orderEndRef = useRef(null);

    useEffect(() => {
        if (orderEndRef.current) {
            orderEndRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [cartItems]);

    const handleSendToKitchen = async () => {
        if (cartItems.length === 0) return;

        const orderData = {
            table_name: getTableLabel(selectedTable),
            order_type: orderType,
            items: cartItems,
            subtotal: subtotal,
            comment: tableComment,
            employee_name: loggedUser?.username || "Unknown",
        };

        try {
            const res = await axios.post("http://127.0.0.1:8000/api/orders", orderData);
            console.log("Order saved:", res.data);
            setTablesWithOrders(prev => new Set([...prev, orderData.table_name]));
            setCartItems([]);
            setTableComment("");
            alert("Order is sent to kitchen!");
        } catch (err) {
            alert("Failed to send order.");
        }
    };

    const [tablesWithOrders, setTablesWithOrders] = useState(new Set());

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/get-orders")
            .then(res => res.json())
            .then(data => {
                const withOrders = new Set(data.map(order => order.table_name));
                setTablesWithOrders(withOrders);
            })
            .catch(err => console.error("Error fetching orders:", err));
    }, []);

    const [finishedOrders, setFinishedOrders] = useState([]);

    const handleFinishOrder = async (order) => {
        try {
            await axios.patch(`http://127.0.0.1:8000/api/orders/${order.id}/update/`, {
                status: "finished"
            });

            const res = await fetch("http://127.0.0.1:8000/api/get-orders");
            const data = await res.json();

            const finishedWithTime = data
                .filter(o => o.status === "finished")
                .map(o => ({
                    ...o,
                    finished_at: new Date().toLocaleTimeString("mk-MK", {hour12: false})
                }));

            setPendingOrders(data.filter(o => o.status === "pending"));
            setFinishedOrders(finishedWithTime);

        } catch (err) {
            console.error("Error finishing order:", err);
            alert("Failed to finish order.");
        }
    };

    const [sortConfig, setSortConfig] = useState({key: null, direction: "asc"});

    const sortedOrders = React.useMemo(() => {
        let sortableOrders = [...orders];
        if (sortConfig.key !== null) {
            sortableOrders.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                switch (sortConfig.key) {
                    case "id":
                        aValue = Number(aValue);
                        bValue = Number(bValue);
                        break;
                    case "table_name":
                        aValue = aValue || "zzzz";
                        bValue = bValue || "zzzz";
                        break;
                    case "order_type":
                        aValue = aValue === "Dine In" ? 0 : 1;
                        bValue = bValue === "Dine In" ? 0 : 1;
                        break;
                    case "items":
                        aValue = a.items?.[0]?.name || "";
                        bValue = b.items?.[0]?.name || "";
                        break;
                    case "subtotal":
                        aValue = Number(aValue);
                        bValue = Number(bValue);
                        break;
                    case "created_at":
                        aValue = new Date(aValue).getTime();
                        bValue = new Date(bValue).getTime();
                        break;
                    case "date":
                        aValue = a.created_at ? new Date(a.created_at).toISOString().split("T")[0] : "";
                        bValue = b.created_at ? new Date(b.created_at).toISOString().split("T")[0] : "";
                        break;
                    case "employee_name":
                        aValue = aValue || "";
                        bValue = bValue || "";
                        break;
                    default:
                        break;
                }

                if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }
        return sortableOrders;
    }, [orders, sortConfig]);

    const requestSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({key, direction});
    };


    const [reservations, setReservations] = useState([]);

    const [reservedTables, setReservedTables] = useState(new Set());


    const fetchReservations = async () => {
        try {
            const res = await fetch("http://127.0.0.1:8000/api/reservations/");
            const data = await res.json();

            const normalizeDate = (dateStr) =>
                new Date(dateStr).toISOString().split("T")[0];

            const filtered = data.filter((r) => normalizeDate(r.date) === selectedDate);

            setReservations(filtered);

            const reserved = new Set(filtered.map((r) => r.table_id));
            setReservedTables(reserved);

        } catch (err) {
            console.error("Error fetching reservations:", err);
        }
    };

    const getReservationTime = (tableId) => {
        const resForTable = reservations.filter(r => r.table_id === tableId);
        if (resForTable.length === 0) return "";
        return resForTable.map(r => `${r.from_time} - ${r.to_time}`).join(", ");
    };


    const fetchReservationsForDate = async (date) => {
        try {
            const res = await fetch("http://127.0.0.1:8000/api/reservations/");
            const data = await res.json();

            const normalizeDate = (dateStr) =>
                new Date(dateStr).toISOString().split("T")[0];

            const filtered = data.filter((r) => normalizeDate(r.date) === date);
            setReservations(filtered);

            const mappedTables = filtered.map((r) => {
                const normalized = normalizeTableId(r.table_id);
                console.log(`Backend ID: ${r.table_id} → Normalized: ${normalized}`);
                return normalized;
            });
            setReservedTables(new Set(mappedTables));

            setNoReservations(filtered.length === 0);

        } catch (err) {
            console.error("Error fetching reservations:", err);
        }
    };

    useEffect(() => {
        if (selectedDate) {
            fetchReservationsForDate(selectedDate);
        }
    }, [selectedDate]);
    const normalizeTableId = (backendId) => {
        if (!backendId) return "";

        const lower = backendId.toLowerCase();

        // Handle names like "maca 1", "masa 1", etc.
        const matchNum = backendId.match(/\d+/);
        if (matchNum) {
            const num = parseInt(matchNum[0]);
            // Match Maca 1–4 to rectangular/vertical tables
            if (num === 1) return "rect-table-1";
            if (num === 2) return "rect-table-2";
            if (num === 3) return "rect-table-3";
            if (num === 4) return "vert-table";
            // Map Maca 5–13 to left-table series
            if (num >= 5 && num <= 13) return `left-table-${num - 4}`;
            // Map Maca 14–20 to right-table series
            if (num >= 14 && num <= 20) return `right-table-${num - 4}`;
        }

        // Handle special table names like "Шанк"
        if (lower.includes("шанк") || lower.includes("oval")) return "oval-table";
        if (lower.includes("rect1")) return "rect-table-1";
        if (lower.includes("rect2")) return "rect-table-2";
        if (lower.includes("rect3")) return "rect-table-3";
        if (lower.includes("vert")) return "vert-table";

        return backendId;
    };

    const [resetting, setResetting] = useState(false);

    const refreshReservationView = () => {
        setResetting(true);
        setSelectedDate(null);
        setTimeout(() => {
            setSelectedDate(new Date());
            setResetting(false);
        }, 0);
    };

    useEffect(() => {
        if (selected === "Reservation Review" && !selectedReservationTable) {
            // If a date is already selected, just fetch reservations for it
            if (selectedDate) {
                fetchReservationsForDate(selectedDate);
            } else {
                refreshReservationView(); // fallback (first open)
            }
        }
    }, [selected, selectedReservationTable, selectedDate]);

    const [hoveredTable, setHoveredTable] = useState(null);

    const [mousePos, setMousePos] = useState({x: 0, y: 0});

    const hoverHideTimeout = useRef(null);

// update mouse position while hovering table
    const handleMouseMove = (e) => {
        setMousePos({x: e.clientX, y: e.clientY});
    };

// when cursor enters a table
    const handleTableMouseEnter = (tableId) => {
        if (hoverHideTimeout.current) {
            clearTimeout(hoverHideTimeout.current);
            hoverHideTimeout.current = null;
        }
        setHoveredTable(tableId);
    };

// when cursor leaves a table element
    const handleTableMouseLeave = (e) => {
        // if moving into the hover box, do nothing
        const related = e.relatedTarget;
        if (related && related.closest && related.closest(".reservation-hover-box")) {
            return;
        }
        // short delay so user can move pointer into the hover box
        hoverHideTimeout.current = setTimeout(() => setHoveredTable(null), 120);
    };

// when pointer enters the hover box (keep it open)
    const handleHoverBoxMouseEnter = () => {
        if (hoverHideTimeout.current) {
            clearTimeout(hoverHideTimeout.current);
            hoverHideTimeout.current = null;
        }
    };

// when pointer leaves the hover box, hide it (unless moving to a table)
    const handleHoverBoxMouseLeave = (e) => {
        const related = e.relatedTarget;
        if (related && related.closest && related.closest(".table-element")) {
            return;
        }
        setHoveredTable(null);
    };

    const [noReservations, setNoReservations] = useState(false);

    // const [positions, setPositions] = useState(initialTablePositions);
    const [tablePositions, setTablePositions] = useState(() => {
        const saved = localStorage.getItem("tableLayout");
        if (saved) {
            try {
                return JSON.parse(saved).tablePositions || {};
            } catch {
                return {};
            }
        }
        return {};
    });

    return (
        <div className="background-checkout-employee">

            <div className="logodiv-checkout-employee">

                <img className="logo" src={PACrustLogo} alt={PACrustLogo} onClick={() => {
                    navigate("/admin_panel");
                    setSelected(null)
                }}/>

            </div>

            <div
                className={`${selected === "Order Review" ? "line-flex-2" : selected === "Reservation Review" ? "reservation-line" : "line-flex"} `}>
                <div
                    className={`${selected === "Order Review"
                        ? "review-css" : selected === "Reservation Review"
                            ? "reservation-css" : "employees-navigation"}  ${selected === "Order Entry" && selectedTable ? "hidden" : ""}`}>
                    {[
                        "Order Entry",
                        "Order Reception",
                        "Print Receipt",
                        "Order Review",
                        "Reservation Review",
                    ].map((label) => (
                        <div
                            key={label}
                            className={`emp-btn ${selected === label ? "active replay" : ""}`}
                            onClick={() => {
                                setSelected(label);
                                const nav = document.querySelector(".employees-navigation");
                                if (nav) {
                                    nav.classList.remove("replay");
                                    void nav.offsetWidth;
                                    nav.classList.add("replay");
                                }
                            }}

                        >
                            {label}
                        </div>
                    ))}
                </div>

                <div className={`order-entry-container ${selected === "Print Receipt" ? "print-receipt-gap" : ""}`}>
                    {selected === "Order Entry" && !selectedTable && (
                        <>
                            <div className="order-entry-wrapper">
                                <div className="bar-employee">
                                    <div>
                                        <button
                                            className={`employee-btns ${orderType === "Dine In" ? "active" : ""}`}
                                            onClick={() => setOrderType("Dine In")}
                                        >
                                            Dine In
                                        </button>
                                    </div>
                                    <div>
                                        <button
                                            className={`employee-btns ${orderType === "Take Away" ? "active" : ""}`}
                                            onClick={() => {
                                                setOrderType("Take Away");
                                                setSelectedTable("take-away");
                                            }}
                                        >
                                            Take Away
                                        </button>
                                    </div>
                                </div>
                                <div className="tables-map">
                                    {/* Large oval table with inner space and 12 chairs */}
                                    <div
                                        className={`table-group oval-table ${tableStatus["oval-table"] || ""} ${selectedTable === "oval-table" ? 'selected' : ''}`}
                                        onClick={() => handleTableClick("oval-table")}
                                        style={tablePositions["oval-table"]}

                                    >
                                        <div className="table-label-sank"
                                             style={{color: getLabelColor("oval-table")}}>{getTableLabel("oval-table")}</div>

                                        {[...Array(12)].map((_, i) => (
                                            <div className={`chair oval-chair chair-${i}`} key={i}></div>
                                        ))}
                                        <div className="table oval"></div>
                                        <div className="table oval-inner"></div>

                                    </div>

                                    {/* Three horizontal rectangle tables with 6 chairs */}
                                    <div
                                        className={`table-group rect-table-1 ${tableStatus["rect-table-1"] || ""} ${selectedTable === "rect-table-1" ? 'selected' : ''}`}
                                        onClick={() => handleTableClick("rect-table-1")}
                                        style={tablePositions["rect-table-1"]}

                                    >
                                        <div className="table-label"
                                             style={{color: getLabelColor("rect-table-1")}}>{getTableLabel("rect-table-1")}</div>

                                        {[...Array(6)].map((_, i) => (
                                            <div className={`chair small-rect-chair chair-${i}`} key={i}></div>
                                        ))}
                                        <div className="table small-rect"></div>
                                    </div>
                                    <div
                                        className={`table-group rect-table-2 ${tableStatus["rect-table-2"] || ""} ${selectedTable === "rect-table-2" ? 'selected' : ''}`}
                                        onClick={() => handleTableClick("rect-table-2")}
                                        style={tablePositions["rect-table-2"]}

                                    >
                                        <div className="table-label"
                                             style={{color: getLabelColor("rect-table-2")}}>{getTableLabel("rect-table-2")}</div>

                                        {[...Array(6)].map((_, i) => (
                                            <div className={`chair small-rect-chair chair-${i}`} key={i}></div>
                                        ))}
                                        <div className="table small-rect"></div>
                                    </div>
                                    <div
                                        className={`table-group rect-table-3 ${tableStatus["rect-table-3"] || ""} ${selectedTable === "rect-table-3" ? 'selected' : ''}`}
                                        onClick={() => handleTableClick("rect-table-3")}
                                        style={tablePositions["rect-table-3"]}

                                    >
                                        <div className="table-label"
                                             style={{color: getLabelColor("rect-table-3")}}>{getTableLabel("rect-table-3")}</div>

                                        {[...Array(6)].map((_, i) => (
                                            <div className={`chair small-rect-chair chair-${i}`} key={i}></div>
                                        ))}
                                        <div className="table small-rect"></div>
                                    </div>

                                    {/* Vertical rectangle table */}
                                    <div
                                        className={`table-group vert-table ${tableStatus["vert-table"] || ""} ${selectedTable === "vert-table" ? 'selected' : ''}`}
                                        onClick={() => handleTableClick("vert-table")}
                                        style={tablePositions["vert-table"]}

                                    >

                                        <div className="table-label-8"
                                             style={{color: getLabelColor("vert-table")}}>{getTableLabel("vert-table")}</div>

                                        {[...Array(8)].map((_, i) => (
                                            <div className={`chair vert-rect-chair chair-${i}`} key={i}></div>
                                        ))}
                                        <div className="table vert-rect"></div>
                                    </div>

                                    {/* Grid of small round tables bottom left */}
                                    <div className="left-table">
                                        {[...Array(9)].map((_, i) => (
                                            <div
                                                className={`table-group left-table-${i + 1} ${tableStatus[`left-table-${i + 1}`]} ${selectedTable === `left-table-${i + 1}` ? 'selected' : ''}`}
                                                key={`left-${i + 1}`}
                                                onClick={() => handleTableClick(`left-table-${i + 1}`)}
                                                style={leftTablePositions[i]}
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

                                    {/* Right side grid of small round tables */}
                                    <div className="right-table">
                                        {[...Array(7)].map((_, i) => (
                                            <div
                                                className={`table-group right-table-${i + 10} ${tableStatus[`right-table-${i + 10}`]} ${selectedTable === `right-table-${i + 10}` ? 'selected' : ''}`}
                                                key={`right-${i + 10}`}
                                                onClick={() => handleTableClick(`right-table-${i + 10}`)}
                                                style={rightTablePositions[i]}
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
                            </div>
                        </>
                    )}

                    {selected === "Print Receipt" && (
                        <>

                            <div className="receipt-line">
                                <div className="order-entry-wrapper">
                                    <div className="tables-map">
                                        {/* Oval table */}
                                        <div
                                            className={`table-group oval-table ${!tablesWithOrders.has(getTableLabel("oval-table")) ? "disabled" : ""} ${selectedTable === "oval-table" ? "selected" : ""}`}
                                            onClick={() => {
                                                if (!tablesWithOrders.has(getTableLabel("oval-table"))) return;
                                                handleTableClick("oval-table");
                                            }}
                                            style={tablePositions["oval-table"]}
                                        >
                                            <div className="table-label-sank"
                                                 style={{color: getLabelColor("oval-table")}}>
                                                {getTableLabel("oval-table")}
                                            </div>

                                            {[...Array(12)].map((_, i) => (
                                                <div className={`chair oval-chair chair-${i}`} key={i}></div>
                                            ))}
                                            <div className="table oval"></div>
                                            <div className="table oval-inner"></div>
                                        </div>

                                        {/* Three horizontal rectangle tables with 6 chairs */}
                                        <div
                                            className={`table-group rect-table-1 ${!tablesWithOrders.has(getTableLabel("rect-table-1")) ? "disabled" : ""} ${selectedTable === "rect-table-1" ? "selected" : ""}`}
                                            onClick={() => {
                                                if (!tablesWithOrders.has(getTableLabel("rect-table-1"))) return;
                                                handleTableClick("rect-table-1");
                                            }}
                                            style={tablePositions["rect-table-1"]}
                                        >
                                            <div className="table-label" style={{color: getLabelColor("rect-table-1")}}>
                                                {getTableLabel("rect-table-1")}
                                            </div>

                                            {[...Array(6)].map((_, i) => (
                                                <div className={`chair small-rect-chair chair-${i}`} key={i}></div>
                                            ))}
                                            <div className="table small-rect"></div>
                                        </div>

                                        <div
                                            className={`table-group rect-table-2 ${!tablesWithOrders.has(getTableLabel("rect-table-2")) ? "disabled" : ""} ${selectedTable === "rect-table-2" ? "selected" : ""}`}
                                            onClick={() => {
                                                if (!tablesWithOrders.has(getTableLabel("rect-table-2"))) return;
                                                handleTableClick("rect-table-2");
                                            }}
                                            style={tablePositions["rect-table-2"]}
                                        >
                                            <div className="table-label" style={{color: getLabelColor("rect-table-2")}}>
                                                {getTableLabel("rect-table-2")}
                                            </div>

                                            {[...Array(6)].map((_, i) => (
                                                <div className={`chair small-rect-chair chair-${i}`} key={i}></div>
                                            ))}
                                            <div className="table small-rect"></div>
                                        </div>

                                        <div
                                            className={`table-group rect-table-3 ${!tablesWithOrders.has(getTableLabel("rect-table-3")) ? "disabled" : ""} ${selectedTable === "rect-table-3" ? "selected" : ""}`}
                                            onClick={() => {
                                                if (!tablesWithOrders.has(getTableLabel("rect-table-3"))) return;
                                                handleTableClick("rect-table-3");
                                            }}
                                            style={tablePositions["rect-table-3"]}
                                        >
                                            <div className="table-label" style={{color: getLabelColor("rect-table-3")}}>
                                                {getTableLabel("rect-table-3")}
                                            </div>

                                            {[...Array(6)].map((_, i) => (
                                                <div className={`chair small-rect-chair chair-${i}`} key={i}></div>
                                            ))}
                                            <div className="table small-rect"></div>
                                        </div>

                                        {/* Vertical rectangle table */}
                                        <div
                                            className={`table-group vert-table ${!tablesWithOrders.has(getTableLabel("vert-table")) ? "disabled" : ""} ${selectedTable === "vert-table" ? "selected" : ""}`}
                                            onClick={() => {
                                                if (!tablesWithOrders.has(getTableLabel("vert-table"))) return;
                                                handleTableClick("vert-table");
                                            }}
                                            style={tablePositions["vert-table"]}
                                        >
                                            <div className="table-label-8" style={{color: getLabelColor("vert-table")}}>
                                                {getTableLabel("vert-table")}
                                            </div>

                                            {[...Array(8)].map((_, i) => (
                                                <div className={`chair vert-rect-chair chair-${i}`} key={i}></div>
                                            ))}
                                            <div className="table vert-rect"></div>
                                        </div>


                                        {/* Grid of small round tables bottom left */}
                                        <div className="left-table">
                                            {[...Array(9)].map((_, i) => {
                                                const tableId = `left-table-${i + 1}`;
                                                return (
                                                    <div
                                                        className={`table-group ${tableId} ${!tablesWithOrders.has(getTableLabel(tableId)) ? "disabled" : ""} ${selectedTable === tableId ? "selected" : ""}`}
                                                        key={`left-${i + 1}`}
                                                        onClick={() => {
                                                            if (!tablesWithOrders.has(getTableLabel(tableId))) return;
                                                            handleTableClick(tableId);
                                                        }}
                                                        style={leftTablePositions[i]}
                                                    >
                                                        <div className="chair top"></div>
                                                        <div className="chair bottom"></div>
                                                        <div className="chair left"></div>
                                                        <div className="chair right"></div>
                                                        <div className="table round"></div>

                                                        <div className="table-label-4"
                                                             style={{color: getLabelColor(tableId)}}>
                                                            {getTableLabel(tableId)}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Right side grid of small round tables */}
                                        <div className="right-table">
                                            {[...Array(7)].map((_, i) => {
                                                const tableId = `right-table-${i + 10}`;
                                                return (
                                                    <div
                                                        className={`table-group ${tableId} ${!tablesWithOrders.has(getTableLabel(tableId)) ? "disabled" : ""} ${selectedTable === tableId ? "selected" : ""}`}
                                                        key={`right-${i + 10}`}
                                                        onClick={() => {
                                                            if (!tablesWithOrders.has(getTableLabel(tableId))) return;
                                                            handleTableClick(tableId);
                                                        }}
                                                        style={rightTablePositions[i]}
                                                    >
                                                        <div className="chair top"></div>
                                                        <div className="chair bottom"></div>
                                                        <div className="chair left"></div>
                                                        <div className="chair right"></div>
                                                        <div className="table round"></div>

                                                        <div className="table-label-4"
                                                             style={{color: getLabelColor(tableId)}}>
                                                            {getTableLabel(tableId)}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="lines"></div>
                                        <div className="lines2"></div>
                                    </div>
                                </div>

                                <div className={`take-away-list ${selected === "Print Receipt" ? "replay" : ""}`}>
                                    <div className="take-away-name">Take Away</div>
                                    <div className="take-away-orders">
                                        {takeAwayOrders.length > 0 ? (
                                            takeAwayOrders.map(order => (
                                                <div
                                                    key={order.id}
                                                    className="take-away-order"
                                                    onClick={() => setSelectedOrder(order)}
                                                >
                                                    Order #{order.id}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="no-orders">No take away orders</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {selectedOrder && (
                                <div>
                                    <div className="receipt-overlay">
                                        <div className="receipt-preview">
                                            <div className="receipt-header">
                                                <img src={PACrustLogo4} alt="logo" className="logo"/>
                                                <h3>P&A CRUST PIZZA</h3>
                                                <p>UL. DIMITAR ILEVSKI MURATO<br/>BITOLA 7000, MACEDONIA</p>
                                            </div>

                                            <h2>{selectedOrder.table_name || "Take Away"}</h2>

                                            {selectedOrder.items?.length > 0 ? (
                                                selectedOrder.items.map((item, i) => (
                                                    <div key={i} className="receipt-item">
                                                        <div className="line-rece">
                                                            <div>{item.name.toUpperCase()}</div>
                                                            <span>{item.quantity} x {item.price.toFixed(2)}€</span>
                                                        </div>
                                                        <div>size {item.size}</div>
                                                        {item.ingredients?.map((ing, j) => (
                                                            <div key={j}>+ {ing}</div>
                                                        ))}
                                                    </div>
                                                ))
                                            ) : (
                                                <div>No items in order</div>
                                            )}

                                            <div className="receipt-footer">
                                                <p>Tax: {(Number(selectedOrder.subtotal) * 0.05).toFixed(2)}€</p>
                                                <p>Subtotal: {Number(selectedOrder.subtotal).toFixed(2)}€</p>
                                                <div className="receipt-foot">
                                                    <p>Employee: {loggedUser?.username}</p>
                                                    <button onClick={handlePrintReceipt} className="print-btn no-print">
                                                        PRINT
                                                    </button>
                                                    {receiptTime.toLocaleDateString()} {receiptTime.toLocaleTimeString()}
                                                </div>
                                            </div>

                                            <p className="receipt-thanks">🍕 Thank you & come hungry again! 🍕</p>

                                        </div>

                                        <button
                                            className="back-btn-receipt no-print"
                                            onClick={() => {
                                                setSelectedOrder(null);
                                                setSelectedTable(null);
                                                setSelected("Print Receipt");
                                            }}
                                        >
                                            ⬅ Back
                                        </button>
                                    </div>
                                </div>
                            )}

                        </>
                    )
                    }
                </div>

                {selected === "Order Entry" && selectedTable && (
                    <div className="menu-and-cart">
                        <div className={`left-menu ${selectedTable ? "replay" : ""}`}>
                            <div className="nav-menu">
                                {["Pizzas", "Salads", "Drinks", "Desserts", "Sauses", "Special Offers"].map((menu) => (
                                    <button
                                        key={menu}
                                        className={`menubtns ${activeMenu === menu ? "active" : ""}`}
                                        onClick={() => setActiveMenu(menu)}
                                    >
                                        {menu}
                                    </button>
                                ))}
                            </div>

                            {activeMenu === "Pizzas" && (
                                <div className="menupart">
                                    <div className="left-part">
                                        {pizzas.map(pizza => (
                                            <div
                                                key={pizza.id}
                                                className={`pizza-card ${selectedPizza?.id === pizza.id ? "selected" : ""}`}
                                                onClick={() =>
                                                    setSelectedPizza(
                                                        selectedPizza?.id === pizza.id ? null : pizza
                                                    )
                                                }
                                            >
                                                <img
                                                    src={pizza.image || "/default-pizza.png"}
                                                    alt={pizza.name}
                                                    className="pizza-img-2"
                                                />
                                                <div className="pizza-info">
                                                    <h4>{pizza.name}</h4>
                                                    <span>{pizza.price} €</span>
                                                </div>
                                            </div>

                                        ))}
                                    </div>

                                    <div className="right-part">
                                        <div className="sizes">
                                            <div
                                                className={`size ${selectedSize === "small" ? "active" : ""}`}
                                                onClick={() => setSelectedSize("small")}
                                            >
                                                <img className="pizza-small" src={pizzaimage} alt="small pizza"/>
                                                <div className="pizza-size">small</div>
                                                <div className="pizza-price">- 3.00 €</div>

                                            </div>

                                            <div
                                                className={`size ${selectedSize === "medium" ? "active" : ""}`}
                                                onClick={() => setSelectedSize("medium")}
                                            >
                                                <img className="pizza-medium" src={pizzaimage} alt="medium pizza"/>
                                                <div className="pizza-size">medium</div>
                                            </div>

                                            <div
                                                className={`size ${selectedSize === "big" ? "active" : ""}`}
                                                onClick={() => setSelectedSize("big")}
                                            >
                                                <img className="pizza-big" src={pizzaimage} alt="big pizza"/>
                                                <div className="pizza-size">big</div>
                                                <div className="pizza-price">+ 5.00 €</div>
                                            </div>
                                        </div>

                                        <div className="quantity-container">
                                            <span className="quantity-label">Quantity:</span>
                                            <span className="quantity-value">{quantity}</span>
                                            <div className="quantity-buttons">
                                                <button onClick={increment}>▲</button>
                                                <button onClick={decrement}>▼</button>
                                            </div>
                                        </div>

                                        <div className="ingredients-container">
                                            <div className="ingredients-list">
                                                {ingredients.map(ing => (
                                                    <div
                                                        key={ing.id}
                                                        className={`ingredient-item ${selectedIngredients.includes(ing.id) ? "selected" : ""}`}
                                                        onClick={() => toggleIngredient(ing.id)}
                                                    >
                                                        <div className="ingredient-name">{ing.name}</div>
                                                        <div className="ingredient-price">{ing.price}€</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="comment-box-delivery">
                                            <input
                                                type="text"
                                                className="comment-input-special"
                                                placeholder="Leave a special instruction..."
                                                value={orderComment}
                                                onChange={(e) => setOrderComment(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                </div>
                            )}

                            {activeMenu === "Salads" && (
                                <div className="menupart-2">
                                    <div className="left-part">
                                        {salads.map(salad => (
                                            <div
                                                key={salad.id}
                                                className={`pizza-card ${selectedPizza?.id === salad.id ? "selected" : ""}`}
                                                onClick={() =>
                                                    setSelectedPizza(selectedPizza?.id === salad.id ? null : salad)
                                                }
                                            >
                                                <img
                                                    src={salad.image || "/default-salad.png"}
                                                    alt={salad.name}
                                                    className="pizza-img-3"
                                                />
                                                <div className="pizza-info">
                                                    <h4>{salad.name}</h4>
                                                    <span>{salad.price} €</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="right-part">
                                        <div className="quantity-container">
                                            <span className="quantity-label">Quantity:</span>
                                            <span className="quantity-value">{quantity}</span>
                                            <div className="quantity-buttons">
                                                <button onClick={increment}>▲</button>
                                                <button onClick={decrement}>▼</button>
                                            </div>
                                        </div>

                                        <div className="comment-box-delivery">
                                            <input
                                                type="text"
                                                className="comment-input-special"
                                                placeholder="Leave a special instruction..."
                                                value={orderComment}
                                                onChange={(e) => setOrderComment(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeMenu === "Drinks" && (
                                <div className="menupart-2">
                                    <div className="left-part">
                                        {drinks.map(drink => (
                                            <div
                                                key={drink.id}
                                                className={`pizza-card ${selectedPizza?.id === drink.id ? "selected" : ""}`}
                                                onClick={() =>
                                                    setSelectedPizza(selectedPizza?.id === drink.id ? null : drink)
                                                }
                                            >
                                                <img
                                                    src={drink.image || "/default-drink.png"}
                                                    alt={drink.name}
                                                    className="pizza-img-2"
                                                />
                                                <div className="pizza-info">
                                                    <h4>{drink.name}</h4>
                                                    <span>{drink.price} €</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="right-part">
                                        <div className="quantity-container">
                                            <span className="quantity-label">Quantity:</span>
                                            <span className="quantity-value">{quantity}</span>
                                            <div className="quantity-buttons">
                                                <button onClick={increment}>▲</button>
                                                <button onClick={decrement}>▼</button>
                                            </div>
                                        </div>

                                        <div className="comment-box-delivery">
                                            <input
                                                type="text"
                                                className="comment-input-special"
                                                placeholder="Leave a special instruction..."
                                                value={orderComment}
                                                onChange={(e) => setOrderComment(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeMenu === "Desserts" && (
                                <div className="menupart-2">
                                    <div className="left-part">
                                        {desserts.map(dessert => (
                                            <div
                                                key={dessert.id}
                                                className={`pizza-card ${selectedPizza?.id === dessert.id ? "selected" : ""}`}
                                                onClick={() =>
                                                    setSelectedPizza(selectedPizza?.id === dessert.id ? null : dessert)
                                                }
                                            >
                                                <img
                                                    src={dessert.image || "/default-dessert.png"}
                                                    alt={dessert.name}
                                                    className="pizza-img-3"
                                                />
                                                <div className="pizza-info">
                                                    <h4>{dessert.name}</h4>
                                                    <span>{dessert.price} €</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="right-part">
                                        <div className="quantity-container">
                                            <span className="quantity-label">Quantity:</span>
                                            <span className="quantity-value">{quantity}</span>
                                            <div className="quantity-buttons">
                                                <button onClick={increment}>▲</button>
                                                <button onClick={decrement}>▼</button>
                                            </div>
                                        </div>

                                        <div className="comment-box-delivery">
                                            <input
                                                type="text"
                                                className="comment-input-special"
                                                placeholder="Leave a special instruction..."
                                                value={orderComment}
                                                onChange={(e) => setOrderComment(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeMenu === "Sauses" && (
                                <div className="menupart-2">
                                    <div className="left-part">
                                        {sauses.map(sause => (
                                            <div
                                                key={sause.id}
                                                className={`pizza-card ${selectedPizza?.id === sause.id ? "selected" : ""}`}
                                                onClick={() =>
                                                    setSelectedPizza(selectedPizza?.id === sause.id ? null : sause)
                                                }
                                            >
                                                <img
                                                    src={sause.image || "/default-sause.png"}
                                                    alt={sause.name}
                                                    className="pizza-img-2"
                                                />
                                                <div className="pizza-info">
                                                    <h4>{sause.name}</h4>
                                                    <span>{sause.price} €</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="right-part">
                                        <div className="quantity-container">
                                            <span className="quantity-label">Quantity:</span>
                                            <span className="quantity-value">{quantity}</span>
                                            <div className="quantity-buttons">
                                                <button onClick={increment}>▲</button>
                                                <button onClick={decrement}>▼</button>
                                            </div>
                                        </div>

                                        <div className="comment-box-delivery">
                                            <input
                                                type="text"
                                                className="comment-input-special"
                                                placeholder="Leave a special instruction..."
                                                value={orderComment}
                                                onChange={(e) => setOrderComment(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeMenu === "Special Offers" && (
                                <div className="menupart-2">
                                    <div className="left-part">
                                        {specialoffers.map(offer => (
                                            <div
                                                key={offer.id}
                                                className={`pizza-card ${selectedPizza?.id === offer.id ? "selected" : ""}`}
                                                onClick={() =>
                                                    setSelectedPizza(selectedPizza?.id === offer.id ? null : offer)
                                                }
                                            >
                                                <img
                                                    src={offer.image || "/default-offer.png"}
                                                    alt={offer.name}
                                                    className="pizza-img-3"
                                                />
                                                <div className="pizza-info">
                                                    <h4>{offer.name}</h4>
                                                    <span>{offer.price} €</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="right-part">
                                        <div className="quantity-container">
                                            <span className="quantity-label">Quantity:</span>
                                            <span className="quantity-value">{quantity}</span>
                                            <div className="quantity-buttons">
                                                <button onClick={increment}>▲</button>
                                                <button onClick={decrement}>▼</button>
                                            </div>
                                        </div>

                                        <div className="comment-box-delivery">
                                            <input
                                                type="text"
                                                className="comment-input-special"
                                                placeholder="Leave a special instruction..."
                                                value={orderComment}
                                                onChange={(e) => setOrderComment(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}


                            <div className="orders-btns">
                                <div>
                                    <button className="back-order-btn" onClick={() => setSelectedTable(null)}>Back
                                    </button>
                                </div>
                                <div>
                                    <button
                                        className="add-to-table"
                                        onClick={handleAddToTable}
                                    >
                                        {orderType === "Take Away" ? "Add for Take Away" : "Add to table"}
                                    </button>

                                </div>
                            </div>
                        </div>


                        {cartItems.length > 0 && (
                            <div className="right-cart">
                                <div className="cart-name">
                                    {orderType === "Take Away" ? "Take Away" : getTableLabel(selectedTable)}
                                </div>

                                <div className="pizza-order">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="cart-item">
                                            <h4>{item.name}</h4>
                                            <ul>
                                                {item.type === "Pizzas" && item.size && (
                                                    <li>{item.size}</li>
                                                )}
                                                <li>
                                                    <div className="cart-quantity-control">
                                                        <button onClick={() => decreaseItem(item.id)}>-</button>
                                                        <span>{item.quantity}</span>
                                                        <button onClick={() => increaseItem(item.id)}>+</button>
                                                    </div>
                                                </li>
                                                {item.ingredients.length > 0 && (
                                                    <li>Extras: {item.ingredients.join(", ")}</li>
                                                )}
                                                {item.comment && <li>Note: {item.comment}</li>}
                                            </ul>

                                            <div className="line-items">
                                                <div className="price-items">
                                                    Price: {(item.price * item.quantity).toFixed(2)} €
                                                </div>
                                                <div>
                                                    <button
                                                        className="remove-items"
                                                        onClick={() =>
                                                            setCartItems(cartItems.filter(p => p.id !== item.id))
                                                        }
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <div ref={orderEndRef}/>
                                </div>

                                <button className="clear-order-btn" onClick={() => setCartItems([])}>
                                    Clear order
                                </button>

                                <div className="comment-box-1">
                                <textarea
                                    className="table-comment"
                                    placeholder="Leave a special instruction..."
                                    value={tableComment}
                                    onChange={(e) => setTableComment(e.target.value)}
                                />
                                </div>

                                <div className="subtotal-line">
                                    <div className="subtotal-name">Subtotal</div>
                                    <div className="subtotal-price">{subtotal.toFixed(2)} €</div>
                                </div>

                                <button className="send-kitchen-btn" onClick={handleSendToKitchen}>
                                    Send to kitchen
                                </button>
                            </div>
                        )}
                    </div>
                )
                }

                {selected === "Order Reception" && (
                    <div className="width-changer">
                        <div className="bar-employee">
                            <div>
                                <button
                                    className={`employee-btns ${receptionView === "Pending" ? "active" : ""}`}
                                    onClick={() => setReceptionView("Pending")}
                                >
                                    Pending Orders
                                </button>
                            </div>
                            <div>
                                <button
                                    className={`employee-btns ${receptionView === "Finished" ? "active" : ""}`}
                                    onClick={() => setReceptionView("Finished")}
                                >
                                    Finished
                                </button>
                            </div>
                        </div>
                        {receptionView === "Pending" && (
                            <div className="orders-grid-reception">
                                {pendingOrders.length > 0 ? (
                                    pendingOrders.map(order => (
                                        <div
                                            key={order.id}
                                            className={`order-card-reception ${order.table_name ? "dine-in" : "take-away"}`}
                                        >
                                            {order.items && order.items.length > 0 ? (() => {
                                                // ✅ Detect item type by category (clean and reliable)
                                                const pizzas = order.items.filter(i =>
                                                    i.category?.toLowerCase().includes("pizza")
                                                );

                                                const saladsDesserts = order.items.filter(i =>
                                                    i.category?.toLowerCase().includes("salad") ||
                                                    i.category?.toLowerCase().includes("dessert")
                                                );

                                                const drinksSauces = order.items.filter(i =>
                                                    i.category?.toLowerCase().includes("drink") ||
                                                    i.category?.toLowerCase().includes("sauses")
                                                );

                                                const unmatched = order.items.filter(i =>
                                                    ![...pizzas, ...saladsDesserts, ...drinksSauces].includes(i)
                                                );
                                                pizzas.push(...unmatched);


                                                return (
                                                    <>
                                                        {/* 🍕 PIZZAS — normal white */}
                                                        {pizzas.map((item, index) => (
                                                            <div key={`pizza-${index}`}
                                                                 className="order-item-block pizza-block">
                                                                <h3>{item.name}</h3>

                                                                {item.size && (
                                                                    <div><span
                                                                        className="order-label-title">Size:</span> {item.size}
                                                                    </div>
                                                                )}

                                                                {item.ingredients?.length > 0 && (
                                                                    <ul>
                                                                        {item.ingredients.map((ing, i) => (
                                                                            <li key={i}>- {ing}</li>
                                                                        ))}
                                                                    </ul>
                                                                )}

                                                                <div className="pizza-comment">
                                                                    <span
                                                                        className="order-label-title">Comment:</span> {item.comment || "/"}
                                                                </div>

                                                                <div><span
                                                                    className="order-label-title">Quantity:</span> {item.quantity}
                                                                </div>
                                                                <div><span
                                                                    className="order-label-title">Price:</span> €{item.price}
                                                                </div>
                                                                <hr/>
                                                            </div>
                                                        ))}

                                                        {saladsDesserts.length > 0 && (
                                                            <div className="order-item-group salads-desserts-block">
                                                                {saladsDesserts.map((item, index) => (
                                                                    <div key={`salad-dessert-${index}`}
                                                                         className="order-item-mini">
                                                                        <h4>{item.name}</h4>
                                                                        <div>Comment: <span
                                                                            className="white-col">{item.comment || "/"}</span>
                                                                        </div>
                                                                        <div>Quantity: <span
                                                                            className="white-col">{item.quantity}</span>
                                                                        </div>
                                                                        <div>Price: <span
                                                                            className="white-col">€{item.price}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {drinksSauces.length > 0 && (
                                                            <div className="order-item-group drinks-sauces-block">
                                                                {drinksSauces.map((item, index) => (
                                                                    <div key={`drink-sauce-${index}`}
                                                                         className="order-item-mini">
                                                                        <h4>{item.name}</h4>
                                                                        <div>Comment: <span
                                                                            className="white-col">{item.comment || "/"}</span>
                                                                        </div>
                                                                        <div>Quantity: <span
                                                                            className="white-col">{item.quantity}</span>
                                                                        </div>
                                                                        <div>Price: <span
                                                                            className="white-col">€{item.price}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            })() : (
                                                <p>No items</p>
                                            )}

                                            <button className="finished-btn"
                                                    onClick={() => handleFinishOrder(order)}> Finished
                                            </button>

                                        </div>
                                    ))
                                ) : (
                                    <div className="center-divs">
                                        <div className="no-orders">No pending orders</div>
                                        <div
                                            className="refresh-btn"
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch("http://127.0.0.1:8000/api/get-orders");
                                                    const data = await res.json();
                                                    setFinishedOrders(data.filter(o => o.status === "finished"));
                                                    setSelected("Order Reception");
                                                } catch (err) {
                                                    console.error("Failed to refresh orders:", err);
                                                }
                                            }}
                                        >
                                            Refresh
                                        </div>

                                    </div>)}
                            </div>
                        )}


                        {receptionView === "Finished" && (
                            <div className="orders-grid-reception">
                                {finishedOrders.length > 0 ? (
                                    finishedOrders.map(order => (
                                        <div
                                            key={order.id}
                                            className={`order-card-reception ${order.table_name ? "dine-in" : "take-away"}`}
                                        >
                                            {order.items && order.items.length > 0 ? (() => {
                                                const pizzas = order.items.filter(i =>
                                                    i.category?.toLowerCase().includes("pizza")
                                                );

                                                const saladsDesserts = order.items.filter(i =>
                                                    i.category?.toLowerCase().includes("salad") ||
                                                    i.category?.toLowerCase().includes("dessert")
                                                );

                                                const drinksSauces = order.items.filter(i =>
                                                    i.category?.toLowerCase().includes("drink") ||
                                                    i.category?.toLowerCase().includes("sauses")
                                                );

                                                const unmatched = order.items.filter(i =>
                                                    ![...pizzas, ...saladsDesserts, ...drinksSauces].includes(i)
                                                );
                                                pizzas.push(...unmatched);

                                                return (
                                                    <>
                                                        {/* 🍕 PIZZAS — same look */}
                                                        {pizzas.map((item, index) => (
                                                            <div key={`pizza-${index}`}
                                                                 className="order-item-block pizza-block">
                                                                <h3>{item.name}</h3>

                                                                {item.size && (
                                                                    <div><span
                                                                        className="order-label-title">Size:</span> {item.size}
                                                                    </div>
                                                                )}

                                                                {item.ingredients?.length > 0 && (
                                                                    <ul>
                                                                        {item.ingredients.map((ing, i) => (
                                                                            <li key={i}>- {ing}</li>
                                                                        ))}
                                                                    </ul>
                                                                )}

                                                                <div className="pizza-comment">
                                                                    <span
                                                                        className="order-label-title">Comment:</span> {item.comment || "/"}
                                                                </div>

                                                                <div><span
                                                                    className="order-label-title">Quantity:</span> {item.quantity}
                                                                </div>
                                                                <div><span
                                                                    className="order-label-title">Price:</span> €{item.price}
                                                                </div>
                                                                <hr/>
                                                            </div>
                                                        ))}

                                                        {/* 🥗 SALADS & DESSERTS */}
                                                        {saladsDesserts.length > 0 && (
                                                            <div className="order-item-group salads-desserts-block">
                                                                {saladsDesserts.map((item, index) => (
                                                                    <div key={`salad-dessert-${index}`}
                                                                         className="order-item-mini">
                                                                        <h4>{item.name}</h4>
                                                                        <div>Comment: <span
                                                                            className="white-col">{item.comment || "/"}</span>
                                                                        </div>
                                                                        <div>Quantity: <span
                                                                            className="white-col">{item.quantity}</span>
                                                                        </div>
                                                                        <div>Price: <span
                                                                            className="white-col">€{item.price}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* 🥤 DRINKS & SAUCES */}
                                                        {drinksSauces.length > 0 && (
                                                            <div className="order-item-group drinks-sauces-block">
                                                                {drinksSauces.map((item, index) => (
                                                                    <div key={`drink-sauce-${index}`}
                                                                         className="order-item-mini">
                                                                        <h4>{item.name}</h4>
                                                                        <div>Comment: <span
                                                                            className="white-col">{item.comment || "/"}</span>
                                                                        </div>
                                                                        <div>Quantity: <span
                                                                            className="white-col">{item.quantity}</span>
                                                                        </div>
                                                                        <div>Price: <span
                                                                            className="white-col">€{item.price}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            })() : (
                                                <p>No items</p>
                                            )}

                                            {/* 💡 No Finished button here */}

                                            <div className="order-label">
                                                {order.table_name ? `${order.table_name}` : "Take Away"}
                                                {order.finished_at ? ` - ${order.finished_at}` : ""}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="center-divs">
                                        <div className="no-orders">No finished orders</div>
                                        <div
                                            className="refresh-btn"
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch("http://127.0.0.1:8000/api/get-orders");
                                                    const data = await res.json();
                                                    setFinishedOrders(data.filter(o => o.status === "finished"));
                                                    setSelected("Order Reception");
                                                } catch (err) {
                                                    console.error("Failed to refresh orders:", err);
                                                }
                                            }}
                                        >
                                            Refresh
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}


                    </div>
                )}

                {selected === "Order Review" && (
                    <div className="right-data">

                        <div className="nav-data">
                            <div className="header-item" onClick={() => requestSort("id")}>
                                ID <span
                                className="sort-arrow">{sortConfig.key === "id" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "-"}</span>
                            </div>
                            <div className="header-item" onClick={() => requestSort("table_name")}>
                                Table <span
                                className="sort-arrow">{sortConfig.key === "table_name" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "-"}</span>
                            </div>
                            <div className="header-item" onClick={() => requestSort("order_type")}>
                                Type <span
                                className="sort-arrow">{sortConfig.key === "order_type" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "-"}</span>
                            </div>
                            <div className="header-item" onClick={() => requestSort("items")}>
                                Items <span
                                className="sort-arrow">{sortConfig.key === "items" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "-"}</span>
                            </div>
                            <div className="header-item" onClick={() => requestSort("subtotal")}>
                                Subtotal <span
                                className="sort-arrow">{sortConfig.key === "subtotal" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "-"}</span>
                            </div>
                            <div className="header-item" onClick={() => requestSort("created_at")}>
                                Created <span
                                className="sort-arrow">{sortConfig.key === "created_at" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "-"}</span>
                            </div>
                            <div className="header-item" onClick={() => requestSort("date")}>
                                Date <span
                                className="sort-arrow">{sortConfig.key === "date" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "-"}</span>
                            </div>
                            <div className="header-item" onClick={() => requestSort("employee_name")}>
                                Employee <span
                                className="sort-arrow">{sortConfig.key === "employee_name" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "-"}</span>
                            </div>

                        </div>

                        <div className="data-table">
                            <div className="data-table-2">
                                {sortedOrders.map((order, i) => {
                                        let time = "—";
                                        let date = "—";
                                        if (order.created_at) {
                                            const createdDate = new Date(order.created_at);
                                            time = createdDate.toLocaleTimeString("mk-MK", {hour12: false});
                                            date = createdDate.toISOString().split("T")[0];
                                        }
                                        return (
                                            <div className="data-row" key={order.id || i}>
                                                <div className="data-cell">{order.id}</div>
                                                <div
                                                    className="data-cell">{order.order_type === "Take Away" ? "/" : order.table_name}
                                                </div>
                                                <div className="data-cell">
                                                    {order.order_type === "Take Away" ? "Take Away" : "Dine In"}
                                                </div>
                                                <div
                                                    className="data-cell items-cell"
                                                    onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                                                >
                                                    {expandedRow === i ? (
                                                        <div className="items-popup">
                                                            {order.items.map((item, idx) => (
                                                                <div key={idx} className="order-box">
                                                                    <div className="box-name">{item.name}</div>
                                                                    <div className="box-in-box">
                                                                        <div>Size: {item.size}</div>
                                                                        <div>Quantity: {item.quantity}</div>
                                                                        <div>Ingridients: {item.ingredients.length > 0 && `${item.ingredients.join(", ")}`}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="truncated">
      {order.items.map(item => item.name).join(", ")}
    </span>
                                                    )}
                                                </div>
                                                <div className="data-cell">{order.subtotal} €</div>
                                                <div className="data-cell">{time}</div>
                                                <div className="data-cell">{date}</div>
                                                <div className="data-cell">{order.employee_name || "—"}</div>
                                            </div>
                                        )
                                    }
                                )
                                }
                            </div>
                        </div>

                        <div className="nav-data-2">
                            <div className="header-item-2">Total Orders: {orders.length}</div>
                            <div className="header-item-2">
                                Revenue: {orders.reduce((sum, o) => sum + Number(o.subtotal), 0).toFixed(2)} €
                            </div>
                            <div className="header-item-2">
                                Average Order Value: {orders.length > 0
                                ? (orders.reduce((sum, o) => sum + Number(o.subtotal), 0) / orders.length).toFixed(2)
                                : 0} €
                            </div>
                        </div>

                    </div>
                )}

                {selected === "Reservation Review" && (
                    <div className="right-reservation">

                        <div className="tables-map">
                            <div
                                id="oval-table"
                                className={`table-element ${noReservations ? "greyed" : ""} table-group oval-table ${!resetting && reservedTables.size > 0 &&
                                selectedDate && !reservedTables.has("oval-table") ? "disabled" : ""
                                }`}
                                onMouseEnter={() => {
                                    if (selectedDate && reservedTables.has("oval-table")) {
                                        setHoveredTable("oval-table");
                                    }
                                }}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleTableMouseLeave}
                                title={getReservationTime("oval-table")}
                                style={tablePositions["oval-table"]}
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
                                className={`table-element ${noReservations ? "greyed" : ""}
 table-group rect-table-1 ${selectedTable === "rect-table-1" ? "selected" : ""} 
    ${!resetting && reservedTables.size > 0 && selectedDate && !reservedTables.has("rect-table-1") ? "disabled" : ""}`}
                                onMouseEnter={() => {
                                    if (selectedDate && reservedTables.has("rect-table-1")) {
                                        setHoveredTable("rect-table-1");
                                    }
                                }}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleTableMouseLeave}
                                title={getReservationTime("rect-table-1")}
                                style={tablePositions["rect-table-1"]}
                            >
                                <div className="table-label"
                                     style={{color: getLabelColor("rect-table-1")}}>{getTableLabel("rect-table-1")}</div>

                                {[...Array(6)].map((_, i) => (
                                    <div className={`chair small-rect-chair chair-${i}`} key={i}></div>
                                ))}
                                <div className="table small-rect"></div>
                            </div>
                            <div
                                className={`table-element ${noReservations ? "greyed" : ""}
 table-group rect-table-2 ${selectedTable === "rect-table-2" ? "selected" : ""} 
    ${!resetting && reservedTables.size > 0 && selectedDate && !reservedTables.has("rect-table-2") ? "disabled" : ""}`}
                                onMouseEnter={() => {
                                    if (selectedDate && reservedTables.has("rect-table-2")) {
                                        setHoveredTable("rect-table-2");
                                    }
                                }}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleTableMouseLeave}
                                title={getReservationTime("rect-table-2")}
                                style={tablePositions["rect-table-2"]}
                            >
                                <div className="table-label"
                                     style={{color: getLabelColor("rect-table-2")}}>{getTableLabel("rect-table-2")}</div>

                                {[...Array(6)].map((_, i) => (
                                    <div className={`chair small-rect-chair chair-${i}`} key={i}></div>
                                ))}
                                <div className="table small-rect"></div>
                            </div>
                            <div
                                className={`table-element ${noReservations ? "greyed" : ""}
 table-group rect-table-3 ${selectedTable === "rect-table-3" ? "selected" : ""} 
    ${!resetting && reservedTables.size > 0 && selectedDate && !reservedTables.has("rect-table-3") ? "disabled" : ""}`}
                                onMouseEnter={() => {
                                    if (selectedDate && reservedTables.has("rect-table-3")) {
                                        setHoveredTable("rect-table-3");
                                    }
                                }}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleTableMouseLeave}
                                title={getReservationTime("rect-table-3")}
                                style={tablePositions["rect-table-3"]}
                            >
                                <div className="table-label"
                                     style={{color: getLabelColor("rect-table-3")}}>{getTableLabel("rect-table-3")}</div>

                                {[...Array(6)].map((_, i) => (
                                    <div className={`chair small-rect-chair chair-${i}`} key={i}></div>
                                ))}
                                <div className="table small-rect"></div>
                            </div>
                            <div
                                className={`table-element ${noReservations ? "greyed" : ""}
 table-group vert-table  ${selectedTable === "vert-table " ? "selected" : ""} 
    ${!resetting && reservedTables.size > 0 && selectedDate && !reservedTables.has("vert-table") ? "disabled" : ""}`}
                                onMouseEnter={() => {
                                    if (selectedDate && reservedTables.has("vert-table")) {
                                        setHoveredTable("vert-table");
                                    }
                                }}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleTableMouseLeave}
                                title={getReservationTime("vert-table")}
                                style={tablePositions["vert-table"]}

                            >
                                <div className="table-label-8"
                                     style={{color: getLabelColor("vert-table")}}>{getTableLabel("vert-table")}</div>

                                {[...Array(8)].map((_, i) => (
                                    <div className={`chair vert-rect-chair chair-${i}`} key={i}></div>
                                ))}
                                <div className="table vert-rect"></div>
                            </div>

                            {/* Grid of small round tables bottom left */}
                            <div className="left-table">
                                {[...Array(9)].map((_, i) => {
                                    const id = `left-table-${i + 1}`;
                                    return (
                                        <div
                                            key={id}
                                            className={`table-element ${noReservations ? "greyed" : ""}
 table-group ${id} 
        ${selectedTable === id ? "selected" : ""} 
        ${!resetting && reservedTables.size > 0 && selectedDate && !reservedTables.has(id) ? "disabled" : ""}`}
                                            onMouseEnter={() => {
                                                if (selectedDate && reservedTables.has(id)) {
                                                    setHoveredTable(id);
                                                }
                                            }}
                                            onMouseMove={handleMouseMove}
                                            onMouseLeave={handleTableMouseLeave}
                                            style={leftTablePositions[i]}
                                            title={getReservationTime(id)}
                                        >
                                            <div className="chair top"></div>
                                            <div className="chair bottom"></div>
                                            <div className="chair left"></div>
                                            <div className="chair right"></div>
                                            <div className="table round"></div>
                                            <div className="table-label-4" style={{color: getLabelColor(id)}}>
                                                {getTableLabel(id)}
                                            </div>
                                        </div>
                                    );
                                })}

                            </div>

                            {/* Right side grid of small round tables */}
                            <div className="right-table">
                                {[...Array(7)].map((_, i) => {
                                    const id = `right-table-${i + 10}`;
                                    return (
                                        <div
                                            key={id}
                                            className={`table-element ${noReservations ? "greyed" : ""}
 table-group ${id} 
        ${selectedTable === id ? "selected" : ""} 
        ${!resetting && reservedTables.size > 0 && selectedDate && !reservedTables.has(id) ? "disabled" : ""}`}
                                            onMouseEnter={() => {
                                                if (selectedDate && reservedTables.has(id)) {
                                                    setHoveredTable(id);
                                                }
                                            }}
                                            onMouseMove={handleMouseMove}
                                            onMouseLeave={handleTableMouseLeave}
                                            style={rightTablePositions[i]}
                                            title={getReservationTime(id)}
                                        >
                                            <div className="chair top"></div>
                                            <div className="chair bottom"></div>
                                            <div className="chair left"></div>
                                            <div className="chair right"></div>
                                            <div className="table round"></div>
                                            <div className="table-label-4" style={{color: getLabelColor(id)}}>
                                                {getTableLabel(id)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="lines"></div>
                            <div className="lines2"></div>
                        </div>

                        {selectedReservationTable && (
                            <div className="reservation-details-box">
                                {reservations
                                    .filter(r => normalizeTableId(r.table_id) === selectedReservationTable)
                                    .map(r => (
                                        <div key={r.id}>
                                            <p><b>Name:</b> {r.name}</p>
                                            <p><b>From:</b> {r.from_time}</p>
                                            <p><b>To:</b> {r.to_time}</p>
                                            <p><b>People:</b> {r.people_count}</p>
                                            <p><b>Comment:</b> {r.comment}</p>
                                        </div>
                                    ))}
                            </div>
                        )}

                        {hoveredTable && (
                            <div
                                className="reservation-hover-box"
                                style={{
                                    top: Math.min(mousePos.y + 4, window.innerHeight - 320), // was +10 → +4
                                    left: Math.min(mousePos.x + 6, window.innerWidth - 240), // was +10 → +6
                                    position: "fixed",
                                }}
                                onMouseEnter={handleHoverBoxMouseEnter}
                                onMouseLeave={handleHoverBoxMouseLeave}
                            >
                                {reservations
                                    .filter((r) => normalizeTableId(r.table_id) === hoveredTable)
                                    .map((r, i, arr) => (
                                        <div key={i} className="hover-reservation-item">
                                            <div className="in-line">
                                                <div className="color-diff">Name:</div>
                                                <div>{r.name}</div>
                                            </div>
                                            <div className="in-line">
                                                <div className="color-diff">From:</div>
                                                <div>{r.from_time}</div>
                                            </div>
                                            <div className="in-line">
                                                <div className="color-diff">To:</div>
                                                <div>{r.to_time}</div>
                                            </div>
                                            <div className="in-line">
                                                <div className="color-diff">People:</div>
                                                <div>{r.people_count}</div>
                                            </div>
                                            {i !== arr.length - 1 && <hr className="hover-divider"/>}
                                        </div>
                                    ))}
                            </div>
                        )}


                        <div className="date-selector">

                            <div className="reservation-box">

                                <div className="date-select">Select date</div>

                                <input
                                    type="date"
                                    className="date-picker-2"
                                    onChange={(e) => {
                                        const selected = e.target.value;
                                        setSelectedDate(selected);
                                        fetchReservationsForDate(selected);
                                    }}
                                />
                            </div>

                            <div className="color-change">----------- or -----------</div>

                            <button
                                className="table-btn"
                                onClick={() => {
                                    if (selectedDate) {
                                        setSelectedReservationTable(true);
                                        fetchReservations();
                                    } else {
                                        alert("Please select a date first!");
                                    }
                                }}
                            >
                                Show reservation
                            </button>
                        </div>

                        {selectedReservationTable && selectedDate && (
                            <div className="site-overlay">
                                <div className="orange-back">

                                    <div className="date-heading">{formatDate(selectedDate)}</div>

                                    <div className="blue-back">
                                        {reservations.length > 0 ? (
                                            <>
                                                <div className="heading-table">
                                                    <div className="heading-item">Table</div>
                                                    <div className="heading-item">Date</div>
                                                    <div className="heading-item">From Time</div>
                                                    <div className="heading-item">To Time</div>
                                                    <div className="heading-item">Reservation Name</div>
                                                    <div className="heading-item">People</div>
                                                    <div className="heading-item">Comment</div>
                                                </div>

                                                {reservations.map((res, i) => (
                                                    <div className="reservation-row" key={i}>
                                                        <div className="reservation-item">{res.table_id}</div>
                                                        <div className="reservation-item">{formatDate(res.date)}</div>
                                                        <div className="reservation-item">{res.from_time}</div>
                                                        <div className="reservation-item">{res.to_time}</div>
                                                        <div className="reservation-item">{res.name}</div>
                                                        <div className="reservation-item">{res.people_count}</div>
                                                        <div className="reservation-item">{res.comment || "/"}</div>
                                                    </div>
                                                ))}
                                            </>
                                        ) : (
                                            <div className="reservation-row-alert">No reservations for this date</div>
                                        )}
                                    </div>

                                    <div className="btns-gap">
                                        <button
                                            className="back-reserve-btn"
                                            onClick={() => {
                                                // refreshReservationView();
                                                setSelectedReservationTable(false);
                                            }}
                                        >
                                            Back
                                        </button>
                                        <button className="print-reserve-btn" onClick={handlePrintReservations}>Print
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {showOrderExistsModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>Table {orderExistsTable.tableLabel} already has an order</h3>
                            <p>Do you want to add more items to it, or choose another table?</p>
                            <div className="modal-actions">
                                <button
                                    className="modal-btn add"
                                    onClick={() => {
                                        setSelected("Order Entry");
                                        setSelectedOrder(orderExistsTable.existingOrder);
                                        setShowOrderExistsModal(false);
                                    }}
                                >
                                    Add More
                                </button>
                                <button
                                    className="modal-btn cancel"
                                    onClick={() => {
                                        setSelectedTable(null);
                                        setSelectedOrder(null);
                                        setShowOrderExistsModal(false);
                                    }}
                                >
                                    Choose Another
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
