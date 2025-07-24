import React, {useState, useEffect} from 'react';
import './MenuPage.css';
import pizzaData from './PizzaData';
import PACrustLogo from "./images/pacrustlogo.png"
import {useNavigate} from "react-router-dom";

export default function MenuPage({loggedUser, logout}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [rotation, setRotation] = useState(0);

    const [targetIndex, setTargetIndex] = useState(1);
    const [isFrontImage, setIsFrontImage] = useState(true);
    const [frontImageIndex, setFrontImageIndex] = useState(0);
    const [backImageIndex, setBackImageIndex] = useState(1 % pizzaData.length);

    const handleNext = () => {
        if (isTransitioning) return;

        setIsTransitioning(true);
        setRotation(prev => prev + 180);

        const nextIndex = (currentIndex + 1) % pizzaData.length;

        if (isFrontImage) {
            setBackImageIndex(nextIndex);
        } else {
            setFrontImageIndex(nextIndex);
        }

        setTimeout(() => {
            setCurrentIndex(nextIndex);
            setIsFrontImage(!isFrontImage);

            const newStickers = pizzaData[nextIndex].stickers || [];
            setStickerPositions(generateRandomPositions(newStickers.length));

            setIsTransitioning(false);
        }, 700);
    };


    const handlePrev = () => {
        if (isTransitioning) return;

        setIsTransitioning(true);
        setRotation(prev => prev - 180);

        const prevIndex = (currentIndex - 1 + pizzaData.length) % pizzaData.length;

        if (isFrontImage) {
            setBackImageIndex(prevIndex);
        } else {
            setFrontImageIndex(prevIndex);
        }

        setTimeout(() => {
            setCurrentIndex(prevIndex);
            setIsFrontImage(!isFrontImage);

            const newStickers = pizzaData[prevIndex].stickers || [];
            setStickerPositions(generateRandomPositions(newStickers.length));

            setIsTransitioning(false);
        }, 700);
    };


    const [isTransitioning, setIsTransitioning] = useState(false);
    const [displayIndex, setDisplayIndex] = useState(currentIndex);
    const [stickerPositions, setStickerPositions] = useState([]);
    const currentPizza = pizzaData[currentIndex];
    const nextPizza = pizzaData[targetIndex];
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
        const firstPizza = 0;
        setCurrentIndex(firstPizza);
        setFrontImageIndex(firstPizza);
        setBackImageIndex((firstPizza + 1) % pizzaData.length);

        const newStickers = pizzaData[firstPizza].stickers || [];
        setStickerPositions(generateRandomPositions(newStickers.length));
    }, []);

    return (
        <div className="menu-page">
            <div className="original-navigation-menu">
                    <div className="navigation-bar">
                        <div className="logodiv">
                            <img className="logo" src={PACrustLogo} alt={PACrustLogo} onClick={() => navigate("/")}/>
                        </div>
                        <div className="divpart" >
                            <p className="divpartP" onClick={() => navigate("/")}>HOME</p>
                        </div>
                        <div className="divpart" >
                            <p className="divpartP" onClick={() => navigate("/menu")}>MENU</p>
                        </div>
                        <div className="divpart">
                            <p className="divpartP">ABOUT US</p>
                        </div>
                    </div>
                    <div className="nav-right-part">
                        <div className="phone">📞 075-142-589</div>
                        {loggedUser && (
                            <button className="logout-btn" onClick={logout}>LOG OUT</button>
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
                    </div>
                </div>

            <main className="main-content">
                <div className="stickers-container" style={{position: 'relative', width: '100%', height: '100%'}}>
                    {Array.from({length: 7}).map((_, i) => {
                        const stickers = pizzaData[displayIndex].stickers || [];
                        const src = stickers[i % stickers.length];

                        return (
                            <img
                                key={`${displayIndex}-${i}`}
                                src={require(`${src}`)}
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
                    })}

                    <div className="carousel-container">
                        <p className="pizza-title">{currentPizza.heading}</p>
                        <p className="pizza-description">{currentPizza.description}</p>
                        <button className="add-to-cart">ADD TO CART</button>

                        <div className="pizza-names-container">

                            <svg viewBox="0 0 400 200" className="pizza-name-arc">
                                <path id="text-curve" d="M -50 220 A 145 160 0 0 1 460 340" fill="transparent"/>
                                <path
                                    d="M -44 221 A 145 160 0 0 1 455 345"
                                    stroke="white"
                                    strokeWidth="1"
                                    fill="transparent"
                                />
                                {pizzaData.map((pizza, index) => (
                                    <text key={pizza.name}>
                                        <textPath
                                            href="#text-curve"
                                            startOffset={`${(index * 70.0) / (pizzaData.length - 1) + 5.0}%`}
                                            className={index === currentIndex ? 'active' : ''}
                                        >
                                            {pizza.name}
                                        </textPath>
                                    </text>
                                ))}
                            </svg>

                        </div>
                        <div className="pizza-image-wrapper">
                            <button onClick={handlePrev} className="arrow-button">{'<'}</button>
                            <div className="pizza-images"
                                 style={{transform: `rotate(${rotation}deg)`, transition: 'transform 0.7s ease'}}>
                                <img
                                    className="pizza-image"
                                    src={require(`${pizzaData[frontImageIndex].image}`)}
                                    alt={pizzaData[frontImageIndex].name}
                                />
                                <img
                                    className="pizza-image2"
                                    id="slikaprevvrtena"
                                    src={require(`${pizzaData[backImageIndex].image}`)}
                                    alt={pizzaData[backImageIndex].name}
                                />
                            </div>

                            <button onClick={handleNext} className="arrow-button">{'>'}</button>

                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

