import React, {useState, useEffect} from 'react';
import './MenuPage.css';
import PACrustLogo from "./images/pacrustlogo.png"
import {useNavigate} from "react-router-dom";
import mushroom from "./images/mushroom.png"
import sausage from "./images/sausage.png"
import extracheese from "./images/extracheese.png"
import olives from "./images/olives.png"
import bacon from "./images/Bacon.png"
import sourcream from "./images/sourcream.png"
import cart from "./images/shopping-cart.png";


export default function MenuPage({loggedUser, logout}) {

    const [selectedSection, setSelectedSection] = useState("pizzas");
    const [pizzas, setPizzas] = useState([]);
    const [salads, setSalads] = useState([]);
    const [drinks, setDrinks] = useState([]);
    const [desserts, setDesserts] = useState([]);
    const [sauces, setSauces] = useState([]);
    const [specialoffers, setSpecialOffers] = useState([]);

    useEffect(() => {
        const endpoints = [
            {
                url: "http://127.0.0.1:8000/api/pizzas/",
                setter: (data) => {
                    const images = require.context('./images', false, /\.(png|jpe?g|svg)$/);

                    const formatted = data.map(pizza => {
                        const filename = pizza.image?.split('/').pop() || '';
                        let imageSrc = null;

                        if (pizza.image?.startsWith('/media/') || pizza.image?.startsWith('http')) {
                            imageSrc = `http://127.0.0.1:8000${pizza.image.replace('http://127.0.0.1:8000', '')}`;
                        } else {
                            try {
                                imageSrc = images(`./${filename}`);
                            } catch {
                                console.warn(`Local pizza image not found: ${filename}`);
                                imageSrc = null;
                            }
                        }

                        const stickers = (pizza.stickers || []).map(s => {
                            const sFilename = s.image?.split('/').pop() || '';
                            if (s.image?.startsWith('/media/') || s.image?.startsWith('http')) {
                                return `http://127.0.0.1:8000${s.image.replace('http://127.0.0.1:8000', '')}`;
                            } else {
                                try {
                                    return images(`./${sFilename}`);
                                } catch {
                                    console.warn(`Local sticker not found: ${sFilename}`);
                                    return null;
                                }
                            }
                        }).filter(Boolean);

                        return {...pizza, image: imageSrc, stickers};
                    });

                    setPizzas(formatted);
                }
            },
            {url: "http://127.0.0.1:8000/api/salads/", setter: setSalads},
            {url: "http://127.0.0.1:8000/api/drinks/", setter: setDrinks},
            {url: "http://127.0.0.1:8000/api/desserts/", setter: setDesserts},
            {url: "http://127.0.0.1:8000/api/sauces/", setter: setSauces},
            {url: "http://127.0.0.1:8000/api/special-offers/", setter: setSpecialOffers},
        ];

        endpoints.forEach(({url, setter}) => {
            fetch(url)
                .then(res => res.json())
                .then(data => setter(data))
                .catch(err => console.error(`Error fetching from ${url}:`, err));
        });
    }, []);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [rotation, setRotation] = useState(0);
    const [nameCircleRotation, setNameCircleRotation] = useState(0);
    const [isFrontImage, setIsFrontImage] = useState(true);
    const [frontImageIndex, setFrontImageIndex] = useState(0);
    const [backImageIndex, setBackImageIndex] = useState(1);


    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem("cartItems");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
        setCartCount(cartItems.length);
    }, [cartItems]);

    const handleNext = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setRotation(prev => prev + 180);
        setNameCircleRotation(prev => prev - angleStep);
        const nextIndex = (currentIndex + 1) % pizzas.length;
        if (isFrontImage) {
            setBackImageIndex(nextIndex);
        } else {
            setFrontImageIndex(nextIndex);
        }
        setTimeout(() => {
            setCurrentIndex(nextIndex);
            setIsFrontImage(!isFrontImage);
            const newStickers = pizzas[nextIndex].stickers || [];
            setStickerPositions(generateRandomPositions(newStickers.length));
            setIsTransitioning(false);
        }, 700);
    };

    const handlePrev = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setRotation(prev => prev - 180);
        setNameCircleRotation(prev => prev + angleStep);
        const prevIndex = (currentIndex - 1 + pizzas.length) % pizzas.length;
        if (isFrontImage) {
            setBackImageIndex(prevIndex);
        } else {
            setFrontImageIndex(prevIndex);
        }
        setTimeout(() => {
            setCurrentIndex(prevIndex);
            setIsFrontImage(!isFrontImage);

            const newStickers = pizzas[prevIndex].stickers || [];
            setStickerPositions(generateRandomPositions(newStickers.length));

            setIsTransitioning(false);
        }, 700);
    };

    const [isTransitioning, setIsTransitioning] = useState(false);
    const [stickerPositions, setStickerPositions] = useState([]);
    const navigate = useNavigate();
    const CONTAINER_WIDTH = 800;
    const CONTAINER_HEIGHT = 600;
    const STICKER_SIZE = 100;
    const PADDING = 10;
    const generateRandomPositions = (num) => {
        const positions = [];
        const isOverlapping = (newPos) => {
            return positions.some(pos => {
                const x1 = (parseFloat(pos.left) / 100) * CONTAINER_WIDTH;
                const y1 = (parseFloat(pos.top) / 100) * CONTAINER_HEIGHT;
                const x2 = (parseFloat(newPos.left) / 100) * CONTAINER_WIDTH;
                const y2 = (parseFloat(newPos.top) / 100) * CONTAINER_HEIGHT;
                const dx = Math.abs(x1 - x2);
                const dy = Math.abs(y1 - y2);
                return dx < STICKER_SIZE + PADDING && dy < STICKER_SIZE + PADDING;
            });
        };
        for (let i = 0; i < 7; i++) {
            let tries = 0;
            let newPos;
            do {
                const top = Math.random() * 80 + '%';
                const left = (Math.random() < 0.5)
                    ? (Math.random() * 30) + '%'
                    : (60 + Math.random() * 30) + '%';
                newPos = {
                    top,
                    left,
                    rotation: Math.random() * 360,
                };
                tries++;
                if (tries > 100) break;
            } while (isOverlapping(newPos));
            positions.push(newPos);
        }
        return positions;
    };

    useEffect(() => {
        if (pizzas.length > 0) {
            const firstPizza = 0;
            setCurrentIndex(firstPizza);
            setFrontImageIndex(firstPizza);
            setBackImageIndex((firstPizza + 1) % pizzas.length);
            const newStickers = pizzas[firstPizza]?.stickers || [];
            setStickerPositions(generateRandomPositions(newStickers.length));
        }
    }, [pizzas]); // 🔁 run after pizzas are fetched

    const n = pizzas.length;
    const angleStep = 360 / n;

    const [isCustomizing, setIsCustomizing] = useState(false);
    const [showCustomizeModal, setShowCustomizeModal] = useState(false);
    const backImageRef = React.useRef(null);
    const carouselPizzaRef = React.useRef(null);
    const [pizzaStartRect, setPizzaStartRect] = React.useState({top: 0, left: 0, width: 0, height: 0});
    const [isClosing, setIsClosing] = React.useState(false);

    const items = [
        {name: "Mushrooms", price: 0.25, image: mushroom, spawnCount: 8, size: 5, maxSpawn: 3},
        {name: "Pepperoni", price: 0.5, image: sausage, spawnCount: 3, size: 8, maxSpawn: 3},
        {name: "Extra cheese", price: 0.5, image: extracheese, spawnCount: -1, size: 7, maxSpawn: 3},
        {name: "Olives", price: 0.3, image: olives, spawnCount: 3, size: 5, maxSpawn: 3},
        {name: "Bacon", price: 0.6, image: bacon, spawnCount: 2, size: 18, maxSpawn: 3},
        {name: "Sour cream", price: 0.4, image: sourcream, spawnCount: 1, size: 10, maxSpawn: 1},
    ];

    const [quantities, setQuantities] = useState(items.map(() => 0));
    useEffect(() => {
        if (showCustomizeModal) {
            setQuantities(items.map(() => 0));
        }
    }, [showCustomizeModal]);
    const increaseQuantity = (idx, item) => {
        if (quantities[idx] < items[idx].maxSpawn) {
            const newQuantities = [...quantities];
            newQuantities[idx] += 1;
            setQuantities(newQuantities);
            handleAddIngredient(item)
            setSpawnedIngredients([
                ...spawnedIngredients,
                {...items[idx], id: Date.now() + Math.random()},
            ]);
        }
    };

    const decreaseQuantity = (idx) => {
        if (quantities[idx] > 0) {
            const newQuantities = [...quantities];
            newQuantities[idx] -= 1;
            setQuantities(newQuantities);
            const reversed = [...spawnedIngredients].reverse();
            const indexToRemove = reversed.findIndex((ing) => ing.name === items[idx].name);
            if (indexToRemove !== -1) {
                reversed.splice(indexToRemove, 1);
                setSpawnedIngredients(reversed.reverse());
            }
        }
    };
    const [ingredientCounts, setIngredientCounts] = useState(
        items.map(() => 0)
    );
    const [selectedIngredients, setSelectedIngredients] = useState([]);

    const handleAddIngredient = (item) => {
        const ingredientName = item.name.toLowerCase().replace(/\s+/g, "");
        const count = item.spawnCount || 1;
        const size = item.size || 5;

        const newIngredients = spawnIngredient(ingredientName, count, {
            size,
            image: item.image
        });

        setSelectedIngredients((prev) => [...prev, ...newIngredients]);
    };

    const getRandomPosition = (topMin, topMax, leftMin, leftMax) => {
        const top = (Math.random() * (topMax - topMin) + topMin).toFixed(2) + "%";
        const left = (Math.random() * (leftMax - leftMin) + leftMin).toFixed(2) + "%";
        return {top, left};
    };

    const spawnIngredient = (name, count, options = {}) => {
        const ingredients = [];
        for (let i = 0; i < count; i++) {
            const rotation = Math.floor(Math.random() * 360);
            const pos = getRandomPosition(30, 73, 15, 37);
            if (name === "sourcream") {
                ingredients.push({
                    name,
                    top: "-20%",
                    left: "50%",
                    targetTop: "50%",
                    targetLeft: "25%",
                    size: options.size || 10,
                    rotation,
                    image: options.image,
                    animate: true,
                });
            } else {
                const pos = getRandomPosition(30, 73, 15, 37);
                ingredients.push({
                    name,
                    top: "-20%",
                    left: "50%",
                    targetTop: pos.top,
                    targetLeft: pos.left,
                    size: options.size || 5,
                    rotation,
                    image: options.image,
                    animate: true,
                });
            }
        }
        return ingredients;
    };
    useEffect(() => {
        const timeout = setTimeout(() => {
            setSelectedIngredients((prev) =>
                prev.map((ing) =>
                    ing.animate
                        ? {...ing, top: ing.targetTop, left: ing.targetLeft, animate: false}
                        : ing
                )
            );
        }, 50);
        return () => clearTimeout(timeout);
    }, [selectedIngredients]);
    const [spawnedIngredients, setSpawnedIngredients] = useState([]);

    const handleCloseModal = () => {
        setSelectedIngredients((prev) =>
            prev.map((ing) => ({
                ...ing,
                top: "-20%",
                left: "50%",
                isExiting: true,
            }))
        );

        setTimeout(() => {
            setSelectedIngredients([]);
            setIsClosing(true);
            setTimeout(() => {
                setShowCustomizeModal(false);
                setIsCustomizing(false);
                setIsClosing(false);
            }, 500);
        }, 800);
    };

    const handleAddToCart = (size) => {
        const pizza = selectedPizza || pizzas[currentIndex];
        if (!pizza) return;

        const basePrice = pizza.price || 0;

        const newItem = {
            id: pizza.id,
            name: pizza.name,
            size: size,
            price: basePrice,
            quantity: 1,
            image: pizza.image,
        };

        setCartItems((prev) => {
            const updated = [...prev, newItem];
            localStorage.setItem("cartItems", JSON.stringify(updated));
            return updated;
        });
        setCartCount((prev) => prev + 1);
        setShowSizeSelector(false);
        console.log(`Added "${pizza.name}" (${size}) to cart.`);
        setSelectedPizza(null); 
    };


    const [showSizeSelector, setShowSizeSelector] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const handleSizeSelect = (size) => {
        setSelectedSize(size);

        if (pendingAction === "customize") {
            const rect = carouselPizzaRef.current?.getBoundingClientRect();
            if (!rect) return;

            setPizzaStartRect({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            });

            setIsCustomizing(true);
            setSelectedIngredients([]);
            setQuantities(items.map(() => 0));
            setSpawnedIngredients([]);

            setTimeout(() => {
                setShowCustomizeModal(true);
            }, 300);

            setPendingAction(null);
        } else if (pendingAction === "add") {
            handleAddToCart(size);
            setPendingAction(null);
        }

        setShowSizeSelector(false);
    };

    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedPrice, setSelectedPrice] = useState(null);
    const calculateExtraCost = () => {
        const extrasCost = items.reduce((total, item, index) => {
            return total + (quantities[index] * (item.price || 0));
        }, 0);

        const backendCost = ingredients.reduce((total, ing) => {
            const qty = ingredientQuantities[ing.id] || 0;
            return total + (qty * Number(ing.price || 0));
        }, 0);

        return extrasCost + backendCost;
    };


    const [cartCount, setCartCount] = useState(0);

    const addToCart = () => {
        setCartCount(cartCount + 1);
    };

    const [ingredients, setIngredients] = useState([]);
    const [ingredientQuantities, setIngredientQuantities] = useState({});

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/ingredients/")
            .then(res => res.json())
            .then(data => {
                setIngredients(data);

                const initialQuantities = {};
                data.forEach(ing => {
                    initialQuantities[ing.id] = 0;
                });
                setIngredientQuantities(initialQuantities);
            })
            .catch(err => console.error("Error fetching ingredients:", err));
    }, []);

    const increaseIngredient = (ing) => {
        setIngredientQuantities(prev => {
            const newQty = (prev[ing.id] || 0) + 1;

            if (newQty > (prev[ing.id] || 0)) {
                const pos = getRandomPizzaPosition();
                setSelectedIngredients(prevSelected => [
                    ...prevSelected,
                    {
                        id: ing.id,
                        name: ing.name,
                        image: ing.image.startsWith("http")
                            ? ing.image
                            : `http://127.0.0.1:8000${ing.image}`,
                        ...pos,
                        size: 8,
                        rotation: Math.random() * 360,
                    },
                ]);
            }

            return {...prev, [ing.id]: newQty};
        });
    };


    const decreaseIngredient = (ing) => {
        setIngredientQuantities(prev => {
            const newQty = prev[ing.id] > 0 ? prev[ing.id] - 1 : 0;

            if (newQty < (prev[ing.id] || 0)) {
                setSelectedIngredients(prevSelected => {
                    const idx = prevSelected.findIndex(sel => sel.id === ing.id);
                    if (idx !== -1) {
                        const newArr = [...prevSelected];
                        newArr.splice(idx, 1);
                        return newArr;
                    }
                    return prevSelected;
                });
            }

            return {
                ...prev,
                [ing.id]: newQty
            };
        });
    };

    const getRandomPizzaPosition = () => {
        let x, y;
        do {
            x = Math.random() * 100;
            y = Math.random() * 100;
            const dx = x - 50;
            const dy = y - 50;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= 45) {
                return {top: `${y}%`, left: `${x}%`};
            }
        } while (true);
    };


    const currentPizza = pizzas[currentIndex] || {};

    const [currentSaladIndex, setCurrentSaladIndex] = useState(0);

    const handleNextSalad = () => {
        setTimeout(() => {
            setCurrentSaladIndex((prev) => (prev + 1) % salads.length);
        }, 400);
    };

    const handlePrevSalad = () => {
        setTimeout(() => {
            setCurrentSaladIndex((prev) => (prev - 1 + salads.length) % salads.length);
        }, 400);
    };

    const [currentDrinkIndex, setCurrentDrinkIndex] = useState(0);

    const handleNextDrink = () => {
        setCurrentDrinkIndex((prevIndex) =>
            prevIndex === drinks.length - 1 ? 0 : prevIndex + 1
        );
    };

    const handlePrevDrink = () => {
        setCurrentDrinkIndex((prevIndex) =>
            prevIndex === 0 ? drinks.length - 1 : prevIndex - 1
        );
    };

    const [currentDessertIndex, setCurrentDessertIndex] = useState(0);

    const handleNextDessert = () => {
        setCurrentDessertIndex((prev) => (prev + 1) % desserts.length);
    };

    const handlePrevDessert = () => {
        setCurrentDessertIndex(
            (prev) => (prev - 1 + desserts.length) % desserts.length
        );
    };

    const [currentSauceIndex, setCurrentSauceIndex] = useState(0);

    const handleNextSauce = () => {
        setCurrentSauceIndex((prev) => (prev + 1) % sauces.length);
    };

    const handlePrevSauce = () => {
        setCurrentSauceIndex(
            (prev) => (prev - 1 + sauces.length) % sauces.length
        );
    };

    const [currentOfferIndex, setCurrentOfferIndex] = useState(0);

    const handleNextOffer = () => {
        setCurrentOfferIndex((prev) => (prev + 1) % specialoffers.length);
    };

    const handlePrevOffer = () => {
        setCurrentOfferIndex((prev) =>
            prev === 0 ? specialoffers.length - 1 : prev - 1
        );
    };

    function parseOfferCounts(description) {
        if (!description) return {pizzaCount: 0, drinkCount: 0};

        const pizzaMatch = description.match(/(\d+)\s*pizzas?/i);
        const drinkMatch = description.match(/(\d+)\s*drinks?/i);

        return {
            pizzaCount: pizzaMatch ? parseInt(pizzaMatch[1], 10) : 0,
            drinkCount: drinkMatch ? parseInt(drinkMatch[1], 10) : 0,
        };
    }


    const [favoritePizzas, setFavoritePizzas] = useState([]);
    const [selectedPizza, setSelectedPizza] = useState(null);
    
    const fetchFavorites = () => {
        fetch("http://127.0.0.1:8000/api/favorites/", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
        })
            .then(res => res.json())
            .then(data => {
                setFavoritePizzas(data);
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        if (loggedUser) {
            fetchFavorites();
        }
    }, [loggedUser]);

    const toggleFavorite = (pizza) => {
        if (!pizza?.id) return;
        if (!loggedUser) {
            return;
        }
        fetch(`http://127.0.0.1:8000/api/favorites/toggle/${pizza.id}/`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem("access")}`,
                'Content-Type': 'application/json'
            },
        })
            .then(res => res.json())
            .then(data => {
                setFavoritePizzas((prev) => {
                    const exists = prev.some(p => p.id === pizza.id);
                    if (exists) {
                        return prev.filter(p => p.id !== pizza.id);
                    } else {
                        return [...prev, pizza];
                    }
                });
            })
            .then(() => {
                fetchFavorites();
            })
            .catch(err => console.error("Error toggling favorite:", err));
    };

    const isFavorite = (pizzaId) =>
        favoritePizzas.some(p => p?.id === pizzaId);


    return (
        <div className="menu-page">
            <div className="original-navigation-menu">
                <div className="navigation-bar">
                    <div className="logodiv">
                        <img className="logo" src={PACrustLogo} alt={PACrustLogo} onClick={() => navigate("/")}/>
                    </div>
                    <div className="divpart">
                        <p className="divpartP" onClick={() => navigate("/")}>HOME</p>
                    </div>
                    <div className="divpart">
                        <p className="divpartP" onClick={() => navigate("/menu")}>MENU</p>
                    </div>
                    <div className="divpart">
                        <p className="divpartP">ABOUT US</p>
                    </div>
                </div>
                <div className="nav-right-part">
                    <div className="phone">📞 075-142-589</div>
                    {loggedUser && (
                        <button className="logout-btn" onClick={() => {
                            localStorage.removeItem("cartItems");
                            logout();
                        }}>LOG OUT</button>
                    )}
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
                    {loggedUser && loggedUser.role === "client" && (
                        <div>
                            <button
                                className="checkout-btn"
                                onClick={() => navigate("/checkout", {state: {cartItems}})}
                            >
                                <img src={cart} className="checkout-photo"/>
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </button>
                            {/*<button onClick={() => setCartCount(cartCount + 1)} style={{marginLeft: "20px"}}>➕ Add*/}
                            {/*    Menu Item*/}
                            {/*</button>*/}
                        </div>
                    )}
                </div>
            </div>

            <main className="main-content-2">
                <div className="menu-tabs">
                    <button
                        className={selectedSection === "pizzas" ? "tab active" : "tab"}
                        onClick={() => setSelectedSection("pizzas")}
                    >
                        Pizzas
                    </button>
                    <button
                        className={selectedSection === "salads" ? "tab active" : "tab"}
                        onClick={() => setSelectedSection("salads")}
                    >
                        Salads
                    </button>
                    <button
                        className={selectedSection === "drinks" ? "tab active" : "tab"}
                        onClick={() => setSelectedSection("drinks")}
                    >
                        Drinks
                    </button>
                    <button
                        className={selectedSection === "desserts" ? "tab active" : "tab"}
                        onClick={() => setSelectedSection("desserts")}
                    >
                        Desserts
                    </button>
                    <button
                        className={selectedSection === "sauces" ? "tab active" : "tab"}
                        onClick={() => setSelectedSection("sauces")}
                    >
                        Sauces
                    </button>
                    <button
                        className={selectedSection === "specialoffers" ? "tab active" : "tab"}
                        onClick={() => setSelectedSection("specialoffers")}
                    >
                        Special Offers
                    </button>
                </div>


                <div className="menu-section-content">

                    {selectedSection === "pizzas" && (
                        <div className="menu-grid">

                            <div className="stickers-container"
                                 style={{position: 'relative', width: '100%', height: '100%'}}>

                                {pizzas.length > 0 && pizzas[currentIndex]?.stickers?.length > 0 && (
                                    Array.from({length: 7}).map((_, i) => {
                                        const stickers = pizzas[currentIndex].stickers;
                                        const src = stickers[i % stickers.length];
                                        return (
                                            <img
                                                key={`${currentIndex}-${i}`}
                                                src={src}
                                                alt={`sticker-${i}`}
                                                className={isTransitioning ? 'spin-fade-out' : 'spin-fade-in'}
                                                style={{
                                                    position: 'absolute',
                                                    top: stickerPositions[i]?.top || '50%',
                                                    left: stickerPositions[i]?.left || '50%',
                                                    width: '100px',
                                                    height: '100px',
                                                    pointerEvents: 'none',
                                                    userSelect: 'none',
                                                }}
                                            />
                                        );
                                    })
                                )}


                                <div className="carousel-container">
                                    <p className="pizza-title">{currentPizza.heading}</p>
                                    <p className="pizza-description">{currentPizza.description}</p>

                                    {loggedUser && loggedUser.role === "client" && (
                                        <div className="favorite-div">
                                            <button
                                                className="add-to-cart"
                                                onClick={() => {
                                                    if (currentPizza.name === "Make your own") {
                                                        setPendingAction("customize");
                                                    } else {
                                                        setPendingAction("add");
                                                    }
                                                    setShowSizeSelector(true);
                                                }}
                                            >
                                                {currentPizza.name === "Make your own" ? "CUSTOMIZE" : "ADD TO CART"}
                                            </button>
                                            {currentPizza && (
                                                <button
                                                    className={`favorite-btn ${isFavorite(currentPizza.id) ? "active" : ""}`}
                                                    onClick={() => toggleFavorite(currentPizza)}
                                                >
                                                    ★
                                                </button>
                                            )}


                                        </div>
                                    )}
                                    <div className="pizza-names-container">


                                    </div>
                                    <div className="pizza-image-wrapper">
                                        <button onClick={handlePrev} className="arrow-button">{'<'}</button>
                                        <div className="pizza-images"
                                             style={{
                                                 transform: `rotate(${rotation}deg)`,
                                                 transition: 'transform 0.7s ease'
                                             }}>
                                            {pizzas.length > 0 && pizzas[frontImageIndex]?.image && (
                                                <img
                                                    ref={carouselPizzaRef}
                                                    className="pizza-image"
                                                    src={pizzas[frontImageIndex].image}
                                                    alt={pizzas[frontImageIndex].name}
                                                />
                                            )}

                                            {pizzas.length > 0 && pizzas[backImageIndex]?.image && (
                                                <img
                                                    ref={backImageRef}
                                                    className="pizza-image2"
                                                    id="slikaprevvrtena"
                                                    src={pizzas[backImageIndex].image}
                                                    alt={pizzas[backImageIndex].name}
                                                    style={{visibility: isCustomizing ? 'hidden' : 'visible'}}
                                                />
                                            )}
                                        </div>
                                        <button onClick={handleNext} className="arrow-button">{'>'}</button>
                                    </div>
                                </div>

                                <div className="pizza-name-circle-wrapper">
                                    <svg
                                        className="pizza-name-circle"
                                        style={{
                                            transform: `rotate(${nameCircleRotation - 10}deg)`,
                                            transition: 'transform 0.7s ease'
                                        }}
                                    >
                                        <defs>
                                            <path
                                                id="full-circle"
                                                d="M380,50 a330,330 0 1,1 0,660 a330,330 0 1,1 0,-660"
                                            />
                                        </defs>
                                        {pizzas.map((pizza, index) => {
                                            const offset = (index / pizzas.length) * 100 + 5;
                                            return (
                                                <text textAnchor="middle" key={pizza.name}>

                                                    <textPath
                                                        href="#full-circle"
                                                        startOffset={`${offset}%`}
                                                        className={index === currentIndex ? 'active' : ''}
                                                    >
                                                        {pizza.name}
                                                    </textPath>
                                                </text>
                                            );
                                        })}
                                    </svg>
                                </div>

                            </div>
                        </div>
                    )}

                    {selectedSection === "salads" && (
                        <div className="salads-carousel">
                            <button className="arrow left" onClick={handlePrevSalad}>‹</button>

                            <div className="carousel-container-2">
                                {salads.length > 0 ? (
                                    salads
                                        .slice(currentSaladIndex, currentSaladIndex + 3)
                                        .concat(
                                            salads.slice(0, Math.max(0, currentSaladIndex + 3 - salads.length))
                                        )
                                        .map((item, index) => {
                                            const isActive = index === 1;

                                            const handleClick = () => {
                                                if (index === 0) handlePrevSalad();
                                                else if (index === 2) handleNextSalad(); 
                                            };
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={!isActive ? handleClick : undefined}
                                                    className={`salad-card ${index === 1 ? "active" : ""}`}
                                                    style={{cursor: !isActive ? "pointer" : "default"}}
                                                >
                                                    <h3>{item.name}</h3>
                                                    <p className="ingredients">{item.description}</p>
                                                    <p className="price">{Number(item.price).toFixed(2)} €</p>
                                                    <img
                                                        src={`http://127.0.0.1:8000${item.image}`}
                                                        alt={item.name}
                                                    />


                                                    {/* Show Add to Cart only for center card */}
                                                    {index === 1 && (
                                                        <div className="card-footer">
    <textarea
        className="salad-comment"
        placeholder="Leave a note (e.g. 'no onions', 'extra dressing')..."
    ></textarea>
                                                            {loggedUser && loggedUser.role === "client" && (
                                                                <button
                                                                    className="add-to-cart-2"
                                                                    onClick={() => {
                                                                        const newItem = {
                                                                            id: item.id,
                                                                            name: item.name,
                                                                            image: `http://127.0.0.1:8000${item.image}`,
                                                                            price: Number(item.price),
                                                                            totalPrice: Number(item.price),
                                                                            quantity: 1,
                                                                            description: item.description || "",
                                                                            category: "salads",
                                                                        };
                                                                        setCartItems(prev => [...prev, newItem]);
                                                                        setCartCount(prev => prev + 1);
                                                                    }}

                                                                >
                                                                    ADD TO CART
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })
                                ) : (
                                    <p className="no-items">No salads found.</p>
                                )}
                            </div>

                            <button className="arrow right" onClick={handleNextSalad}>›</button>
                        </div>
                    )}

                    {selectedSection === "drinks" && (
                        <div className="salads-carousel">
                            <button className="arrow left" onClick={handlePrevDrink}>‹</button>

                            <div className={`carousel-container-2`}>
                                {drinks.length > 0 ? (
                                    drinks
                                        .slice(currentDrinkIndex, currentDrinkIndex + 3)
                                        .concat(
                                            drinks.slice(0, Math.max(0, currentDrinkIndex + 3 - drinks.length))
                                        )
                                        .map((item, index) => {
                                            const isActive = index === 1;
                                            const handleClick = () => {
                                                if (index === 0) handlePrevDrink();
                                                else if (index === 2) handleNextDrink();
                                            };

                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={!isActive ? handleClick : undefined}
                                                    className={`salad-card ${isActive ? "active" : ""}`}
                                                    style={{cursor: !isActive ? "pointer" : "default"}}
                                                >
                                                    <h3>{item.name}</h3>
                                                    <p className="ingredients">{item.description}</p>
                                                    <p className="price">{Number(item.price).toFixed(2)} €</p>
                                                    <img
                                                        src={`http://127.0.0.1:8000${item.image}`}
                                                        alt={item.name}
                                                    />

                                                    {index === 1 && (
                                                        <div className="card-footer">
        <textarea
            className="salad-comment"
            placeholder="Leave a note (e.g. 'no ice', 'less sugar', 'extra lemon')..."
        ></textarea>

                                                            {loggedUser && loggedUser.role === "client" && (
                                                                <button
                                                                    className="add-to-cart-2"
                                                                    onClick={() => {
                                                                        const newItem = {
                                                                            id: item.id,
                                                                            name: item.name,
                                                                            image: `http://127.0.0.1:8000${item.image}`,
                                                                            price: Number(item.price),
                                                                            totalPrice: Number(item.price),
                                                                            quantity: 1,
                                                                            description: item.description || "",
                                                                            category: "drinks",
                                                                        };
                                                                        setCartItems(prev => [...prev, newItem]);
                                                                        setCartCount(prev => prev + 1);
                                                                    }}

                                                                >
                                                                    ADD TO CART
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}

                                                </div>
                                            );
                                        })
                                ) : (
                                    <p className="no-items">No drinks found.</p>
                                )}
                            </div>

                            <button className="arrow right" onClick={handleNextDrink}>›</button>
                        </div>
                    )}

                    {selectedSection === "desserts" && (
                        <div className="salads-carousel">
                            <button className="arrow left" onClick={handlePrevDessert}>‹</button>

                            <div className={`carousel-container-2`}>
                                {desserts.length > 0 ? (
                                    desserts
                                        .slice(currentDessertIndex, currentDessertIndex + 3)
                                        .concat(
                                            desserts.slice(0, Math.max(0, currentDessertIndex + 3 - desserts.length))
                                        )
                                        .map((item, index) => {
                                            const isActive = index === 1;
                                            const handleClick = () => {
                                                if (index === 0) handlePrevDessert();
                                                else if (index === 2) handleNextDessert();
                                            };

                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={!isActive ? handleClick : undefined}
                                                    className={`salad-card ${isActive ? "active" : ""}`}
                                                    style={{cursor: !isActive ? "pointer" : "default"}}
                                                >
                                                    <h3>{item.name}</h3>
                                                    <p className="ingredients">{item.description}</p>
                                                    <p className="price">{Number(item.price).toFixed(2)} €</p>
                                                    <img
                                                        src={`http://127.0.0.1:8000${item.image}`}
                                                        alt={item.name}
                                                    />

                                                    {index === 1 && (
                                                        <div className="card-footer">
                                        <textarea
                                            className="salad-comment"
                                            placeholder="Leave a note (e.g. 'extra chocolate', 'no cream')..."
                                        ></textarea>

                                                            {loggedUser && loggedUser.role === "client" && (
                                                                <button
                                                                    className="add-to-cart-2"
                                                                    onClick={() => {
                                                                        const newItem = {
                                                                            id: item.id,
                                                                            name: item.name,
                                                                            image: `http://127.0.0.1:8000${item.image}`,
                                                                            price: Number(item.price),
                                                                            totalPrice: Number(item.price),
                                                                            quantity: 1,
                                                                            description: item.description || "",
                                                                            category: "desserts",
                                                                        };
                                                                        setCartItems(prev => [...prev, newItem]);
                                                                        setCartCount(prev => prev + 1);
                                                                    }}
                                                                >
                                                                    ADD TO CART
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                ) : (
                                    <p className="no-items">No desserts found.</p>
                                )}
                            </div>

                            <button className="arrow right" onClick={handleNextDessert}>›</button>
                        </div>
                    )}

                    {selectedSection === "sauces" && (
                        <div className="salads-carousel">
                            <button className="arrow left" onClick={handlePrevSauce}>‹</button>

                            <div className={`carousel-container-2`}>
                                {sauces.length > 0 ? (
                                    sauces
                                        .slice(currentSauceIndex, currentSauceIndex + 3)
                                        .concat(
                                            sauces.slice(0, Math.max(0, currentSauceIndex + 3 - sauces.length))
                                        )
                                        .map((item, index) => {
                                            const isActive = index === 1; // middle card is active
                                            const handleClick = () => {
                                                if (index === 0) handlePrevSauce();
                                                else if (index === 2) handleNextSauce();
                                            };

                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={!isActive ? handleClick : undefined}
                                                    className={`salad-card ${isActive ? "active" : ""}`}
                                                    style={{cursor: !isActive ? "pointer" : "default"}}
                                                >
                                                    <h3>{item.name}</h3>
                                                    <p className="ingredients">{item.description}</p>
                                                    <p className="price">{Number(item.price).toFixed(2)} €</p>
                                                    <img
                                                        src={`http://127.0.0.1:8000${item.image}`}
                                                        alt={item.name}
                                                    />

                                                    {index === 1 && (
                                                        <div className="card-footer">

                                                            {loggedUser && loggedUser.role === "client" && (
                                                                <button
                                                                    className="add-to-cart-2"
                                                                    onClick={() => {
                                                                        const newItem = {
                                                                            id: item.id,
                                                                            name: item.name,
                                                                            image: `http://127.0.0.1:8000${item.image}`,
                                                                            price: Number(item.price),
                                                                            totalPrice: Number(item.price),
                                                                            quantity: 1,
                                                                            description: item.description || "",
                                                                            category: "sauces",
                                                                        };
                                                                        setCartItems(prev => [...prev, newItem]);
                                                                        setCartCount(prev => prev + 1);
                                                                    }}
                                                                >
                                                                    ADD TO CART
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                ) : (
                                    <p className="no-items">No sauces found.</p>
                                )}
                            </div>

                            <button className="arrow right" onClick={handleNextSauce}>›</button>
                        </div>
                    )}

                    {selectedSection === "specialoffers" && (
                        <div className="salads-carousel-special }">
                            <button className="arrow left" onClick={handlePrevOffer}>‹</button>

                            <div className="carousel-container-2">
                                {specialoffers.length > 0 ? (
                                    specialoffers
                                        .slice(currentOfferIndex, currentOfferIndex + 3)
                                        .concat(
                                            specialoffers.slice(0, Math.max(0, currentOfferIndex + 3 - specialoffers.length))
                                        )
                                        .map((offer, index) => {
                                            const {pizzaCount, drinkCount} = parseOfferCounts(offer.description);

                                            const isActive = index === 1;
                                            const handleClick = () => {
                                                if (index === 0) handlePrevOffer();
                                                else if (index === 2) handleNextOffer();
                                            };

                                            return (
                                                <div
                                                    key={offer.id}
                                                    onClick={!isActive ? handleClick : undefined}
                                                    className={`salad-card ${isActive ? "active" : ""}`}
                                                    style={{cursor: !isActive ? "pointer" : "default"}}
                                                >
                                                    <h3>{offer.name}</h3>
                                                    <p className="price">{Number(offer.price).toFixed(2)} €</p>
                                                    <img src={`http://127.0.0.1:8000${offer.image}`} alt={offer.name}/>

                                                    {isActive && (
                                                        <div className="card-footer special-offer-footer">
                                                            <div className="offer-selection">
                                                                <h4 className="h4-heading">Choose your pizzas:</h4>

                                                                <div className="scroll-div">
                                                                    {Array.from({length: pizzaCount || 0}).map((_, index) => (
                                                                        <select key={index} className="offer-dropdown">
                                                                            <option value="">Select
                                                                                Pizza {index + 1}</option>
                                                                            {pizzas.map((p) => (
                                                                                <option key={p.id}
                                                                                        value={p.id}>{p.name}</option>
                                                                            ))}
                                                                        </select>
                                                                    ))}
                                                                </div>
                                                                <h4 className="h4-heading">Choose your drinks:</h4>

                                                                <div className="scroll-div">
                                                                    {Array.from({length: drinkCount || 0}).map((_, index) => (
                                                                        <select key={index} className="offer-dropdown">
                                                                            <option value="">Select
                                                                                Drink {index + 1}</option>
                                                                            {drinks.map((d) => (
                                                                                <option key={d.id}
                                                                                        value={d.id}>{d.name}</option>
                                                                            ))}
                                                                        </select>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <textarea
                                                                className="salad-comment"
                                                                placeholder="Write any preferences or changes here..."
                                                            ></textarea>

                                                            {loggedUser && loggedUser.role === "client" && (
                                                                <button
                                                                    className="add-to-cart-2"
                                                                    onClick={() => {
                                                                        const newItem = {
                                                                            id: offer.id,
                                                                            name: offer.name,
                                                                            image: `http://127.0.0.1:8000${offer.image}`,
                                                                            price: Number(offer.price),
                                                                            totalPrice: Number(offer.price),
                                                                            quantity: 1,
                                                                            description: offer.description || "",
                                                                            category: "specialoffer",
                                                                        };
                                                                        setCartItems(prev => [...prev, newItem]);
                                                                        setCartCount(prev => prev + 1);
                                                                    }}

                                                                >
                                                                    ADD TO CART
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}

                                                </div>
                                            );
                                        })
                                ) : (
                                    <p className="no-items">No special offers found.</p>
                                )}
                            </div>

                            <button className="arrow right" onClick={handleNextOffer}>›</button>
                        </div>
                    )}


                </div>
            </main>


            {showSizeSelector && (
                <div
                    className="size-selector-overlay"
                    onClick={(e) => {
                        if (e.target.classList.contains("size-selector-overlay")) {
                            setShowSizeSelector(false);
                        }
                    }}
                >
                    <div className="size-selector-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Choose a size</h2>
                        <div className="size-options">
                            {(() => {
                                const basePrice = parseFloat(currentPizza.price || 0);
                                const prices = {
                                    mini: (basePrice - 3).toFixed(2),
                                    small: basePrice.toFixed(2),
                                    big: (basePrice + 5).toFixed(2)
                                };

                                return (
                                    <>
                                        <div className="size-option">
                                            <img
                                                src={require("./images/20cm.png")}
                                                alt="20cm"
                                                onClick={() => handleSizeSelect("mini")}
                                            />
                                            <p className="price">{prices.mini}€</p>
                                        </div>

                                        <div className="size-option2">
                                            <img
                                                src={require("./images/25cm.png")}
                                                alt="25cm"
                                                onClick={() => handleSizeSelect("small")}
                                            />
                                            <p className="price">{prices.small}€</p>
                                        </div>

                                        <div className="size-option3">
                                            <img
                                                src={require("./images/32cm.png")}
                                                alt="32cm"
                                                onClick={() => handleSizeSelect("big")}
                                            />
                                            <p className="price">{prices.big}€</p>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}


            {isCustomizing && (
                <div className="customize-overlay">
                    <div className="pizza-canvas">
                        <img
                            src={require("./images/pizza2.png")}
                            alt="Custom Pizza"
                            className={`customize-pizza ${isClosing ? 'reverse' : ''}`}
                            style={{
                                top: pizzaStartRect.top,
                                left: pizzaStartRect.left,
                                width: "400px",
                                height: "400px",
                            }}
                        />
                    </div>
                    <div className="ingredients-custom">
                        {selectedIngredients.map((ingredient, index) => {
                            if (ingredient.name === "Extra cheese") return null;
                            return (
                                <img
                                    key={index}
                                    src={ingredient.image}
                                    alt={ingredient.name}
                                    className="ingredient-on-pizza"
                                    style={{
                                        position: 'absolute',
                                        top: ingredient.top,
                                        left: ingredient.left,
                                        width: (ingredient.size + 10) + "%",
                                        transform: `translate(-50%, -50%) rotate(${ingredient.rotation || 0}deg)`,
                                        transformOrigin: '50% 50%',
                                        height: 'auto',
                                        zIndex: ingredient.name === "sourcream" ? 100000 : 10000,
                                    }}
                                />
                            );
                        })}
                    </div>

                    {showCustomizeModal && (
                        <div
                            className="modal-overlay"
                            onClick={(e) => {
                                if (e.target.classList.contains("modal-overlay")) {
                                    handleCloseModal();
                                }
                            }}
                        >
                            <div className={`customize-modal ${isClosing ? 'slide-out' : 'slide-in'}`}
                                 onClick={(e) => e.stopPropagation()}>

                                <div>
                                    <button
                                        className="close-modal-btn"
                                        onClick={() => {
                                            setSelectedIngredients((prev) =>
                                                prev.map((ing) => ({
                                                    ...ing,
                                                    top: "-20%",
                                                    left: "50%",
                                                    isExiting: true,
                                                }))
                                            );
                                            setTimeout(() => {
                                                setSelectedIngredients([]);
                                                setIsClosing(true);
                                                setTimeout(() => {
                                                    setShowCustomizeModal(false);
                                                    setIsCustomizing(false);
                                                    setIsClosing(false);
                                                }, 500);
                                            }, 800);
                                        }}
                                    >
                                        &times;
                                    </button>

                                    <h2>Customize Your Pizza</h2>

                                </div>


                                <div className="ingredients-container">
                                    <h3>Choose Ingredients</h3>
                                    <div className="ingredients-list-menu">
                                        {ingredients.map(ing => (
                                            <div key={ing.id} className="ingredient-item-menu">
                                                <div className="ingredient-img-menu">
                                                    {ing.image ? (
                                                        <img src={ing.image} alt={ing.name}/>
                                                    ) : (
                                                        <div className="placeholder"/>
                                                    )}
                                                </div>

                                                <div className="ingredient-name-menu">{ing.name}</div>
                                                <div className="ingredient-price-menu">{ing.price}€</div>

                                                <div className="quantity-controls">
                                                    <button onClick={() => decreaseIngredient(ing)}>-</button>
                                                    <span>{ingredientQuantities[ing.id] || 0}</span>
                                                    <button onClick={() => increaseIngredient(ing)}>+</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                </div>


                                {/* --- Footer --- */}
                                <div className="modal-footer">
                                    <div className="modal-price">
                                        {selectedPrice !== null && (
                                            <span>
                                                {selectedPrice}€
                                                {calculateExtraCost() > 0 && (
                                                    <span>(+{calculateExtraCost().toFixed(2)}€)</span>
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    <div className="modal-actions-menu">
                                        <button
                                            className="clear-ingredients"
                                            onClick={() => {
                                                setSelectedIngredients([]);
                                                setSpawnedIngredients([]);
                                                setQuantities(items.map(() => 0));

                                                const resetBackend = {};
                                                ingredients.forEach(ing => {
                                                    resetBackend[ing.id] = 0;
                                                });
                                                setIngredientQuantities(resetBackend);
                                            }}
                                        >
                                            Clear
                                        </button>

                                        <button
                                            className="submit-btn"
                                            onClick={() => {
                                                const extraCost = calculateExtraCost();
                                                const selectedBaseIngredients = ingredients.filter(
                                                    ing => (ingredientQuantities[ing.id] || 0) > 0
                                                );

                                                const newItem = {
                                                    name: "Custom Pizza",
                                                    size: selectedSize,
                                                    basePrice: selectedPrice,
                                                    baseIngredients: selectedBaseIngredients.map(
                                                        ing => `${ing.name} x${ingredientQuantities[ing.id]}`
                                                    ),
                                                    extras: items
                                                        .map((item, idx) =>
                                                            quantities[idx] > 0 ? `${item.name} x${quantities[idx]}` : null
                                                        )
                                                        .filter(Boolean),
                                                    extraCost: calculateExtraCost(),
                                                    totalPrice: selectedPrice + calculateExtraCost(),
                                                    quantity: 1,
                                                    image: "./images/pizza2.png",
                                                };

                                                setCartItems((prev) => [...prev, newItem]);
                                                setCartCount((prev) => prev + 1);

                                                handleCloseModal();
                                            }}
                                        >
                                            Add to order
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}


                </div>
            )}

            {loggedUser && (
                <div className="favorites-bar">
                    <div className="favorites-section">
                        <div className="favorites-label">
                            ⭐ Favorites
                        </div>

                        <div className="favorites-list">
                            {favoritePizzas.length === 0 ? (
                                <p className="empty-favorites">No favorite pizzas</p>
                            ) : (
                                favoritePizzas.map(pizza => (
                                    <div
                                        key={pizza.id}
                                        className="favorite-item"
                                    >
                                        <img
                                            src={`http://127.0.0.1:8000${pizza.image}`}
                                            alt={pizza.name}
                                        />
                                        <div className="favorite-info">
                                            <span className="favorite-name">{pizza.name}</span>
                                            <span className="favorite-price">{pizza.price} €</span>
                                        </div>

                                        <button
                                            className="fav-cart-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPizza(pizza);
                                                setPendingAction("add");
                                                setShowSizeSelector(true);
                                            }}
                                        >
                                            🛒
                                        </button>

                                        <button
                                            className="remove-fav"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(pizza);
                                            }}
                                        >
                                            ✖
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
