import React, {useState, useEffect, useRef} from "react";
import "./AdminPanel.css";
import PACrustLogo from "./images/pacrustlogo1.png"
import message from './images/messages.png'
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {Line} from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);


export default function AdminPanel({loggedUser, setLoggedUser, logout}) {

    const emptyPromo = {
        name: "",
        discountType: "%",
        discountValue: 0,
        startDate: "",
        endDate: "",
        usageLimit: "",
        noLimit: false,
        active: true,
    };

    const [newPromo, setNewPromo] = useState(null);
    const [promos, setPromos] = useState([]);


    async function saveNewPromo() {
        const token = localStorage.getItem("access");
        if (!token) return alert("You must be logged in!");

        try {
            const payload = {
                name: newPromo.name,
                discountType: newPromo.discountType,
                discountValue: parseFloat(newPromo.discountValue) || 0,
                usageLimit: newPromo.noLimit ? null : parseInt(newPromo.usageLimit) || null,
                noLimit: newPromo.noLimit,
                startDate: newPromo.startDate || null,
                endDate: newPromo.endDate || null,
                active: newPromo.active
            };

            console.log("Sending payload:", payload);

            const res = await fetch("http://127.0.0.1:8000/api/promos/add/", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Backend error:", errorData);
                alert("❌ " + JSON.stringify(errorData));
                throw new Error("Failed to save promo");
            }

            const savedPromo = await res.json();
            setPromos(prev => [...prev, savedPromo]);
            setNewPromo(null);
        } catch (err) {
            console.error("Error saving promo:", err);
        }
    }


    async function deletePromo(id) {
        const token = localStorage.getItem("access");
        if (!token) return alert("You must be logged in!");

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/promos/${id}/delete/`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Backend error deleting promo:", errorData);
                throw new Error("Failed to delete promo");
            }

            setPromos(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error("Error deleting promo:", err);
        }
    }


    const [editingPromoId, setEditingPromoId] = useState(null);
    const [selectedPromo, setSelectedPromo] = useState(null);
    const updatePromo = (id, updatedData) => {
        setPromos(prev => prev.map(p => p.id === id ? {...p, ...updatedData} : p));
        setEditingPromoId(null);
    };


    const [newIngredient, setNewIngredient] = useState(null);

    const [selectedIngredient, setSelectedIngredient] = useState(null);

    const [selectedPizza, setselectedPizza] = useState(null);


    async function saveNewIngredient() {
        const token = localStorage.getItem("access");
        if (!token) return alert("You must be logged in!");

        const formData = new FormData();
        formData.append("name", newIngredient.name);
        formData.append("price", newIngredient.price);
        formData.append("description", newIngredient.description);
        formData.append("availability", newIngredient.availability ? "true" : "false");

        if (newIngredient.imageFile) formData.append("image", newIngredient.imageFile);

        try {
            const res = await fetch("http://127.0.0.1:8000/api/ingredients/add/", {
                method: "POST",
                headers: {Authorization: `Bearer ${token}`},
                body: formData
            });

            const data = await res.json();
            setIngredients(prev => [...prev, data]);
            setNewIngredient(null);
        } catch (err) {
            console.error("Error saving ingredient:", err);
        }
    }

    async function saveEditingIngredient(id, editingData) {
        const token = localStorage.getItem("access");
        if (!token) return alert("You must be logged in!");

        const formData = new FormData();
        formData.append("name", editingData.name);
        formData.append("price", editingData.price);
        formData.append("description", editingData.description);
        if (editingData.imageFile) formData.append("image", editingData.imageFile);

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/ingredients/${id}/update/`, {
                method: "PUT",
                headers: {Authorization: `Bearer ${token}`},
                body: formData
            });

            const updated = await res.json();
            setIngredients(prev => prev.map(ing => ing.id === id ? updated : ing));
            setEditingRowId(null);
        } catch (err) {
            console.error("Error updating ingredient:", err);
        }
    }

    async function deleteIngredient(id) {
        const token = localStorage.getItem("access");
        if (!token) return alert("You must be logged in!");

        try {
            await fetch(`http://127.0.0.1:8000/api/ingredients/${id}/delete/`, {
                method: "DELETE",
                headers: {Authorization: `Bearer ${token}`}
            });

            setIngredients(prev => prev.filter(ing => ing.id !== id));
        } catch (err) {
            console.error("Error deleting ingredient:", err);
        }
    }

    const [editingIngredientData, setEditingIngredientData] = useState({});

    const startEditingIngredient = (item) => {
        setEditingRowId(item.id);
        setEditingIngredientData({...item});
    };

    const updateIngredient = async (ingredient) => {
        const token = localStorage.getItem("access");
        if (!token) return alert("You must be logged in!");

        const formData = new FormData();
        formData.append("name", ingredient.name);
        formData.append("price", ingredient.price);
        formData.append("description", ingredient.description);
        formData.append("availability", ingredient.availability ? "true" : "false");

        if (ingredient.imageFile) formData.append("image", ingredient.imageFile);

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/ingredients/${ingredient.id}/update/`, {
                method: "PUT",
                headers: {Authorization: `Bearer ${token}`},
                body: formData,
            });
            const updated = await res.json();
            setIngredients(prev => prev.map(ing => ing.id === ingredient.id ? updated : ing));
            setEditingRowId(null);
        } catch (err) {
            console.error("Error updating ingredient:", err);
        }
    };

    const [newPizza, setNewPizza] = useState(null);
    const [editingPizzaId, setEditingPizzaId] = useState(null);
    const emptyPizza = {
        name: "",
        price: 0,
        heading: "",
        description: "",
        imageFile: null,
        imagePreview: null,
        stickersFiles: [],
        stickersPreview: [],
        stickers: [],
    };

    const [editingPizzaData, setEditingPizzaData] = useState({...emptyPizza});

    function handleAddClick() {
        setNewPizza({...emptyPizza, id: "new"});
    }

    const saveNewPizza = async () => {
        const formData = new FormData();
        formData.append("name", newPizza.name);
        formData.append("price", newPizza.price);
        formData.append("heading", newPizza.heading);
        formData.append("description", newPizza.description);
        if (newPizza.imageFile) formData.append("image", newPizza.imageFile);
        if (newPizza.stickersFiles) {
            newPizza.stickersFiles.forEach(file => formData.append("stickers", file));
        }

        try {
            const res = await fetch("http://127.0.0.1:8000/api/pizzas/", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            setPizzas([...pizzas, data]);
            setNewPizza(null);
        } catch (err) {
            console.error(err);
        }
    };

    const [ingredients, setIngredients] = useState([
        {
            id: 1,
            name: "Pepperoni",
            price: "2€",
            description: "Spicy, smoky, and crispy slices that bring bold flavor.",
            image: "./images/pizza55.png",
        },
        {
            id: 2,
            name: "Cheese",
            price: "2.50€",
            description: "Rich and creamy cheese that melts perfectly.",
            image: "./images/pizza55.png",
        },
    ]);

    const [editingRowId, setEditingRowId] = useState(null);
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const navigate = useNavigate();

    const [users, setUsers] = useState([]);

    const [selected, setSelected] = useState(null);

    useEffect(() => {
        if (selected === 2) {
            fetch("http://127.0.0.1:8000/api/ingredients/")
                .then(res => res.json())
                .then(data => setIngredients(data))
                .catch(err => console.error("Error fetching ingredients:", err));
        }
    }, [selected]);

    const [selectedUser, setSelectedUser] = useState(null);

    // Get pizzas
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/pizzas/")
            .then(res => res.json())
            .then(data => setPizzas(data));
    }, []);


    const [pizzas, setPizzas] = useState([]);

    async function fetchPizzas() {
        try {
            const res = await fetch("http://127.0.0.1:8000/api/pizzas/");
            const data = await res.json();
            setPizzas(data);
        } catch (err) {
            console.error("Error fetching pizzas:", err);
        }
    }

    useEffect(() => {
        if (selected === 1) {
            fetch("http://localhost:8000/api/users/")
                .then((res) => res.json())
                .then((data) => setUsers(data))
                .catch((err) => console.error("Error fetching users:", err));
        }
    }, [selected]);


    const salesData = {
        labels: ["Spicy Pepperoni Blaze", "Capricciosa", "Garden Delight", "Marharitta", "Mediterranean Greek Feast", "Custom made"],
        datasets: [
            {
                label: 'Sales',
                data: [100, 80, 70, 40, 60, 110],
                borderColor: '#FF7F50',
                backgroundColor: 'rgba(255, 127, 80, 0.2)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#FF7F50',
                pointBorderColor: '#FF7F50',
                pointRadius: 5,
                pointHoverRadius: 7,
                pointHoverBorderWidth: 2,
            }
        ]

    };

    const handleRemove = async (id) => {
        const token = localStorage.getItem("access");
        if (!token) return alert("No access token!");

        try {
            const response = await axios.delete(`http://localhost:8000/api/users/${id}/`, {
                headers: {Authorization: `Bearer ${token}`},
            });
            setUsers(prev => prev.filter(user => user.id !== id));
            alert("User removed successfully!");
        } catch (err) {
            console.error("Full error:", err.response || err);
            alert("Error removing user. Check console for details.");
        }
    };

    const [editingUserId, setEditingUserId] = useState(null);
    const [editingUserData, setEditingUserData] = useState({});

    const startEditing = (user) => {
        setEditingUserId(user.id);
        setEditingUserData({
            name: user.name || "",
            username: user.username || "",
            email: user.email || "",
            address: user.address || "",
            phone: user.phone || "",
            city: user.city || "",
            role: user.role || ""
        });
    };

    const cancelEditing = () => {
        setEditingUserId(null);
        setEditingUserData({});
    };

    const saveEditing = async () => {
        const token = localStorage.getItem("access");
        try {
            const res = await axios.put(
                `http://localhost:8000/api/users/${editingUserId}/`,
                editingUserData,
                {headers: {Authorization: `Bearer ${token}`}}
            );

            setUsers(users.map(u => u.id === editingUserId ? res.data : u));
            setEditingUserId(null);
            setEditingUserData({});
        } catch (err) {
            console.error("Update error:", err.response?.data || err);
            alert("Error updating user.");
        }
    };

    function startEditingPizza(pizza) {
        setEditingPizzaId(pizza.id);
        setEditingPizzaData({
            name: pizza.name,
            price: pizza.price,
            heading: pizza.heading,
            description: pizza.description,
            image: pizza.image,
            imageFile: null,
            imagePreview: null,
            stickersFiles: [],
            stickers: pizza.stickers || [],
            stickersPreview: (pizza.stickers || []).map(s =>
                s.image.startsWith("http") ? s.image : `http://127.0.0.1:8000${s.image}`
            ),
        });
    }

    function handleStickerChange(e) {
        const files = Array.from(e.target.files);
        const previews = files.map(file => URL.createObjectURL(file));

        setEditingPizzaData(prev => ({
            ...prev,
            stickersFiles: [...(prev.stickersFiles || []), ...files],
            stickersPreview: [...(prev.stickersPreview || []), ...previews],
        }));
    }

    const cancelEditingPizza = () => {
        setEditingPizzaId(null);
        setEditingPizzaData({});
    };

    async function saveEditingPizza() {
        const token = localStorage.getItem("access");

        const newStickerIds = [];
        for (const file of editingPizzaData.stickersFiles || []) {
            const stickerForm = new FormData();
            stickerForm.append("stickers", file); // not "image"

            const res = await fetch(
                `http://127.0.0.1:8000/pizzas/${editingPizzaId}/upload-stickers/`,
                {
                    method: "POST",
                    headers: {Authorization: `Bearer ${token}`},
                    body: stickerForm,
                }
            );

            if (res.ok) {
                const data = await res.json();
                data.forEach(sticker => newStickerIds.push(sticker.id));
            } else {
                console.error("❌ Failed to upload sticker:", await res.text());
            }
        }

        const formData = new FormData();
        formData.append("name", editingPizzaData.name);
        formData.append("price", editingPizzaData.price);
        formData.append("heading", editingPizzaData.heading);
        formData.append("description", editingPizzaData.description);

        if (editingPizzaData.imageFile) {
            formData.append("image", editingPizzaData.imageFile);
        }

        // 🧩 3️⃣ Combine sticker IDs safely
        // ✅ Gather sticker IDs
        const existingStickerIds = (editingPizzaData.stickers || [])
            .filter(s => s && s.id)
            .map(s => Number(s.id));

        const validNewStickerIds = newStickerIds.filter(id => !isNaN(id)).map(Number);

        const allStickerIds = [...existingStickerIds, ...validNewStickerIds];

        console.log("🧾 allStickerIds before update:", allStickerIds);

        for (const id of allStickerIds) {
            formData.append("sticker_ids", id);
        }

        // 🧩 4️⃣ Send update request
        const res = await fetch(
            `http://127.0.0.1:8000/api/pizzas/${editingPizzaId}/update/`,
            {
                method: "PATCH",
                headers: {Authorization: `Bearer ${token}`},
                body: formData,
            }
        );

        if (res.ok) {
            console.log("✅ Pizza updated successfully!");
            // Refresh pizza list so stickers show immediately
            await fetchPizzas();
            setEditingPizzaId(null);
            setEditingPizzaData({...emptyPizza});
        } else {
            console.error("❌ Pizza update failed:", await res.text());
        }
    }

    async function uploadStickers(pizzaId, stickerFiles) {
        const token = localStorage.getItem("access");
        if (!token) return alert("You must be logged in!");

        const formData = new FormData();
        stickerFiles.forEach(file => formData.append("stickers", file));

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/pizzas/${pizzaId}/upload-stickers/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) {
                const text = await res.text(); // avoids JSON parse crash
                console.error("Sticker upload error:", text);
                throw new Error(`Failed to upload stickers (status ${res.status})`);
            }

            const data = await res.json();
            console.log("✅ Stickers uploaded:", data.stickers);
            return data.stickers;
        } catch (err) {
            console.error("Error uploading stickers:", err);
            alert("❌ Error uploading stickers");
        }
    }

    const removePizza = async (id) => {
        const token = localStorage.getItem("access");
        if (!token) return alert("You must be logged in!");

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/pizzas/${id}/delete/`, {
                method: "DELETE",
                headers: {Authorization: `Bearer ${token}`},
            });

            setPizzas(prev => prev.filter(p => Number(p.id) !== Number(id)));
        } catch (err) {
            console.error("Error deleting pizza:", err);
        }
    };

    const [promo, setPromo] = useState({
        name: "",
        discountType: "%",
        discountValue: 0,
        startDate: "",
        endDate: "",
        usageLimit: "",
        active: true
    });

    useEffect(() => {
        if (selected === 3) {
            fetch("http://127.0.0.1:8000/api/promos/")
                .then(res => {
                    if (!res.ok) throw new Error("Failed to fetch promos");
                    return res.json();
                })
                .then(data => setPromos(data))
                .catch(err => console.error("Error fetching promos:", err));
        }
    }, [selected]);

    const [salads, setSalads] = useState([]);
    const [newSalad, setNewSalad] = useState(null);

    const [drinks, setDrinks] = useState([]);
    const [newDrink, setNewDrink] = useState(null);

    const [desserts, setDesserts] = useState([]);
    const [newDessert, setNewDessert] = useState(null);

    const [sauces, setSauces] = useState([]);
    const [newSauce, setNewSauce] = useState(null);

    const [specialOffers, setSpecialOffers] = useState([]);
    const [newSpecialOffer, setNewSpecialOffer] = useState(null);

    const [selectedSection, setSelectedSection] = useState("salads");

    useEffect(() => {
        const token = localStorage.getItem("access");
        if (selectedSection === "salads") {
            fetch("http://127.0.0.1:8000/api/salads/")
                .then(res => res.json())
                .then(data => setSalads(data))
                .catch(console.error);
        } else if (selectedSection === "drinks") {
            fetch("http://127.0.0.1:8000/api/drinks/")
                .then(res => res.json())
                .then(data => setDrinks(data))
                .catch(console.error);
        } else if (selectedSection === "desserts") {
            fetch("http://127.0.0.1:8000/api/desserts/")
                .then(res => res.json())
                .then(data => setDesserts(data))
                .catch(console.error);
        } else if (selectedSection === "sauces") {
            fetch("http://127.0.0.1:8000/api/sauces/")
                .then(res => res.json())
                .then(data => setSauces(data))
                .catch(console.error);

        } else if (selectedSection === "specialOffers") {
            fetch("http://127.0.0.1:8000/api/special-offers/")
                .then(res => res.json())
                .then(data => setSpecialOffers(data))
                .catch(console.error);
        }
    }, [selectedSection]);

    async function saveNewSalad() {
        const token = localStorage.getItem("access");
        if (!token) return alert("You must be logged in!");

        const formData = new FormData();
        formData.append("name", newSalad.name);
        formData.append("price", newSalad.price);
        formData.append("description", newSalad.description);
        formData.append("availability", newSalad.availability ? "true" : "false");

        if (newSalad.imageFile) formData.append("image", newSalad.imageFile);

        try {
            const res = await fetch("http://127.0.0.1:8000/api/salads/add/", {
                method: "POST",
                headers: {Authorization: `Bearer ${token}`},
                body: formData,
            });

            if (!res.ok) throw new Error("Failed to save salad");
            const data = await res.json();
            setSalads(prev => [...prev, data]);
            setNewSalad(null);
        } catch (err) {
            console.error("Error saving salad:", err);
        }
    }

    async function updateSalad(salad) {
        const token = localStorage.getItem("access");
        if (!token) return alert("You must be logged in!");

        const formData = new FormData();
        formData.append("name", salad.name);
        formData.append("price", salad.price);
        formData.append("description", salad.description);
        formData.append("availability", salad.availability ? "true" : "false");

        if (salad.imageFile) formData.append("image", salad.imageFile);

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/salads/${salad.id}/update/`, {
                method: "PUT",
                headers: {Authorization: `Bearer ${token}`},
                body: formData,
            });

            if (!res.ok) throw new Error("Failed to update salad");
            const updated = await res.json();
            setSalads(prev => prev.map(s => s.id === salad.id ? updated : s));
            setEditingRowId(null);
        } catch (err) {
            console.error("Error updating salad:", err);
        }
    }

    async function deleteSalad(id) {
        const token = localStorage.getItem("access");
        if (!token) return alert("You must be logged in!");

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/salads/${id}/delete/`, {
                method: "DELETE",
                headers: {Authorization: `Bearer ${token}`},
            });

            if (!res.ok) throw new Error("Failed to delete salad");
            setSalads(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error("Error deleting salad:", err);
        }
    }

    async function saveNewDrink() {
        const token = localStorage.getItem("access");
        if (!token) return alert("You must be logged in!");

        const formData = new FormData();
        formData.append("name", newDrink.name);
        formData.append("price", newDrink.price);
        formData.append("availability", newDrink.availability ? "true" : "false");
        formData.append("size", newDrink.size || "");
        if (newDrink.imageFile) formData.append("image", newDrink.imageFile);

        try {
            const res = await fetch("http://127.0.0.1:8000/api/drinks/add/", {
                method: "POST",
                headers: {Authorization: `Bearer ${token}`},
                body: formData,
            });
            if (!res.ok) throw new Error("Failed to save drink");
            const data = await res.json();
            setDrinks(prev => [...prev, data]);
            setNewDrink(null);
        } catch (err) {
            console.error(err);
        }
    }

    async function updateDrink(drink) {
        const token = localStorage.getItem("access");
        if (!token) return alert("You must be logged in!");

        const formData = new FormData();
        formData.append("name", drink.name);
        formData.append("price", drink.price);
        formData.append("description", drink.description);
        formData.append("availability", drink.availability ? "true" : "false");
        if (drink.imageFile) formData.append("image", drink.imageFile);

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/drinks/${drink.id}/update/`, {
                method: "PUT",
                headers: {Authorization: `Bearer ${token}`},
                body: formData,
            });
            if (!res.ok) throw new Error("Failed to update drink");
            const updated = await res.json();
            setDrinks(prev => prev.map(d => d.id === drink.id ? updated : d));
            setEditingRowId(null);
        } catch (err) {
            console.error(err);
        }
    }

    async function deleteDrink(id) {
        const token = localStorage.getItem("access");
        if (!token) return alert("You must be logged in!");

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/drinks/${id}/delete/`, {
                method: "DELETE",
                headers: {Authorization: `Bearer ${token}`},
            });
            if (!res.ok) throw new Error("Failed to delete drink");
            setDrinks(prev => prev.filter(d => d.id !== id));
        } catch (err) {
            console.error(err);
        }
    }

    async function saveNewDessert() {
        const token = localStorage.getItem("access");
        if (!token) return alert("You must be logged in!");

        const formData = new FormData();
        formData.append("name", newDessert.name);
        formData.append("price", newDessert.price);
        formData.append("availability", newDessert.availability ? "true" : "false");
        if (newDessert.imageFile) formData.append("image", newDessert.imageFile);

        try {
            const res = await fetch("http://127.0.0.1:8000/api/desserts/add/", {
                method: "POST",
                headers: {Authorization: `Bearer ${token}`},
                body: formData,
            });
            if (!res.ok) throw new Error("Failed to save dessert");
            const data = await res.json();
            setDesserts(prev => [...prev, data]);
            setNewDessert(null);
        } catch (err) {
            console.error(err);
        }
    }

    async function updateDessert(dessert) {
        const token = localStorage.getItem("access");
        if (!token) return alert("You must be logged in!");

        const formData = new FormData();
        formData.append("name", dessert.name);
        formData.append("price", dessert.price);
        formData.append("description", dessert.description);
        formData.append("availability", dessert.availability ? "true" : "false");
        if (dessert.imageFile) formData.append("image", dessert.imageFile);

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/desserts/${dessert.id}/update/`, {
                method: "PUT",
                headers: {Authorization: `Bearer ${token}`},
                body: formData,
            });
            if (!res.ok) throw new Error("Failed to update dessert");
            const updated = await res.json();
            setDesserts(prev => prev.map(d => d.id === dessert.id ? updated : d));
            setEditingRowId(null);
        } catch (err) {
            console.error(err);
        }
    }

    async function deleteDessert(id) {
        const token = localStorage.getItem("access");
        if (!token) return alert("You must be logged in!");

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/desserts/${id}/delete/`, {
                method: "DELETE",
                headers: {Authorization: `Bearer ${token}`},
            });
            if (!res.ok) throw new Error("Failed to delete dessert");
            setDesserts(prev => prev.filter(d => d.id !== id));
        } catch (err) {
            console.error(err);
        }
    }

    async function saveNewSauce() {
        const token = localStorage.getItem("access");
        if (!token) return alert("You must be logged in!");

        const formData = new FormData();
        formData.append("name", newSauce.name);
        formData.append("price", newSauce.price);
        formData.append("description", newSauce.description);
        formData.append("availability", newSauce.availability ? "true" : "false");
        if (newSauce.imageFile) formData.append("image", newSauce.imageFile);

        try {
            const res = await fetch("http://127.0.0.1:8000/api/sauces/add/", {
                method: "POST",
                headers: {Authorization: `Bearer ${token}`},
                body: formData,
            });
            if (!res.ok) throw new Error("Failed to save sauce");
            const data = await res.json();
            setSauces(prev => [...prev, data]);
            setNewSauce(null);
        } catch (err) {
            console.error(err);
        }
    }

    async function updateSauce(sauce) {
        const token = localStorage.getItem("access");
        if (!token) return alert("You must be logged in!");

        const formData = new FormData();
        formData.append("name", sauce.name);
        formData.append("price", sauce.price);
        formData.append("description", sauce.description);
        formData.append("availability", sauce.availability ? "true" : "false");
        if (sauce.imageFile) formData.append("image", sauce.imageFile);

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/sauces/${sauce.id}/update/`, {
                method: "PUT",
                headers: {Authorization: `Bearer ${token}`},
                body: formData,
            });
            if (!res.ok) throw new Error("Failed to update sauce");
            const updated = await res.json();
            setSauces(prev => prev.map(s => s.id === sauce.id ? updated : s));
            setEditingRowId(null);
        } catch (err) {
            console.error(err);
        }
    }

    async function deleteSauce(id) {
        const token = localStorage.getItem("access");
        if (!token) return alert("You must be logged in!");

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/sauces/${id}/delete/`, {
                method: "DELETE",
                headers: {Authorization: `Bearer ${token}`},
            });
            if (!res.ok) throw new Error("Failed to delete sauce");
            setSauces(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error(err);
        }
    }

    async function saveNewSpecialOffer() {
        const token = localStorage.getItem("access");
        if (!token) return alert("You must be logged in!");

        const formData = new FormData();
        formData.append("name", newSpecialOffer.name);
        formData.append("price", newSpecialOffer.price);
        formData.append("description", newSpecialOffer.description);
        formData.append("availability", newSpecialOffer.availability ? "true" : "false");
        if (newSpecialOffer.imageFile) formData.append("image", newSpecialOffer.imageFile);

        try {
            const res = await fetch("http://127.0.0.1:8000/api/special-offers/add/", {
                method: "POST",
                headers: {Authorization: `Bearer ${token}`},
                body: formData,
            });
            if (!res.ok) throw new Error("Failed to save special offer");
            const data = await res.json();
            setSpecialOffers(prev => [...prev, data]);
            setNewSpecialOffer(null);
        } catch (err) {
            console.error(err);
        }
    }

    async function updateSpecialOffer(offer) {
        const token = localStorage.getItem("access");
        if (!token) return alert("You must be logged in!");

        const formData = new FormData();
        formData.append("name", offer.name);
        formData.append("price", offer.price);
        formData.append("description", offer.description);
        formData.append("availability", offer.availability ? "true" : "false");
        if (offer.imageFile) formData.append("image", offer.imageFile);

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/special-offers/${offer.id}/update/`, {
                method: "PUT",
                headers: {Authorization: `Bearer ${token}`},
                body: formData,
            });
            if (!res.ok) throw new Error("Failed to update special offer");
            const updated = await res.json();
            setSpecialOffers(prev => prev.map(s => s.id === offer.id ? updated : s));
            setEditingRowId(null);
        } catch (err) {
            console.error(err);
        }
    }

    async function deleteSpecialOffer(id) {
        const token = localStorage.getItem("access");
        if (!token) return alert("You must be logged in!");

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/special-offers/${id}/delete/`, {
                method: "DELETE",
                headers: {Authorization: `Bearer ${token}`},
            });
            if (!res.ok) throw new Error("Failed to delete special offer");
            setSpecialOffers(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error(err);
        }
    }

    const [chartData, setChartData] = useState(null);
    const [earningsData, setEarningsData] = useState([]);
    const [stats, setStats] = useState({totalRevenue: 0, totalOrders: 0, avgOrder: 0});

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch("http://127.0.0.1:8000/api/get-orders");
                const orders = await res.json();

                const itemStats = {};
                orders.forEach(order => {
                    order.items.forEach(item => {
                        const name = item.name || "Unknown";
                        const price = parseFloat(item.price) || 0;
                        const qty = parseInt(item.quantity) || 0;
                        const revenue = price * qty;
                        if (!itemStats[name]) itemStats[name] = {price, qty: 0, revenue: 0};
                        itemStats[name].qty += qty;
                        itemStats[name].revenue += revenue;
                    });
                });

                const totalRevenue = Object.values(itemStats).reduce((sum, i) => sum + i.revenue, 0);
                const tableData = Object.entries(itemStats).map(([name, data]) => ({
                    name,
                    price: data.price.toFixed(2),
                    qty: data.qty,
                    revenue: data.revenue.toFixed(2),
                    sales: ((data.revenue / totalRevenue) * 100).toFixed(1) + "%",
                }));
                setEarningsData(tableData);

                // ==== DAILY STATS ====
                const salesByDate = {};
                const ordersCountByDate = {};

                orders.forEach(order => {
                    const date = order.created_at ? order.created_at.slice(0, 10) : "Unknown";
                    const total = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
                    salesByDate[date] = (salesByDate[date] || 0) + total;
                    ordersCountByDate[date] = (ordersCountByDate[date] || 0) + 1;
                });

                const sortedDates = Object.keys(salesByDate).sort();

                const dailySales = sortedDates.map(d => salesByDate[d]);
                const dailyOrders = sortedDates.map(d => ordersCountByDate[d]);
                const avgOrderValue = sortedDates.map(d => salesByDate[d] / ordersCountByDate[d]);

                setStats({
                    totalRevenue: totalRevenue.toFixed(2),
                    totalOrders: orders.length,
                    avgOrder: (totalRevenue / orders.length).toFixed(2)
                });

                setChartData({
                    labels: sortedDates,
                    datasets: [
                        {
                            label: "Daily Sales (€)",
                            data: dailySales,
                            borderColor: "#FF7F50",
                            backgroundColor: "rgba(255,127,80,0.25)",
                            pointBackgroundColor: "#FF7F50",
                            pointBorderColor: "#fff",
                            borderWidth: 5,
                            tension: 0.4,
                            fill: true,
                        },
                        {
                            label: "Orders per Day",
                            data: dailyOrders,
                            borderColor: "#00C9FF",
                            backgroundColor: "rgba(0,201,255,0.25)",
                            pointBackgroundColor: "#00C9FF",
                            pointBorderColor: "#fff",
                            borderWidth: 5,
                            tension: 0.4,
                            fill: true,
                        },
                        {
                            label: "Avg Order (€)",
                            data: avgOrderValue,
                            borderColor: "#FFD700",
                            backgroundColor: "rgba(255,215,0,0.25)",
                            pointBackgroundColor: "#FFD700",
                            pointBorderColor: "#fff",
                            borderWidth: 5,
                            tension: 0.4,
                            fill: true,
                        },
                    ]

                });
            } catch (err) {
                console.error("Error fetching orders:", err);
            }
        };

        fetchOrders();
    }, []);

    const [messages, setMessages] = useState([]);
    const [showMessagesHover, setShowMessagesHover] = useState(false);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem("access");
                const res = await fetch("http://127.0.0.1:8000/api/get-messages/", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error("Failed to fetch messages");
                const data = await res.json();
                setMessages(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchMessages();
    }, []);

    const [reservations, setReservations] = useState([]);
    const [loadingReservations, setLoadingReservations] = useState(true);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const token = localStorage.getItem("access");
                const res = await fetch("http://127.0.0.1:8000/api/user-reservations/", {
                    method: "GET",
                    headers: {"Authorization": `Bearer ${token}`},
                    credentials: "include"
                });

                console.log("STATUS:", res.status);

                const text = await res.text();
                console.log("RAW RESPONSE:", text);

                const data = JSON.parse(text);
                console.log("RESERVATIONS:", data);

                setReservations(data);
            } catch (err) {
                console.error("Error fetching reservations:", err);
            } finally {
                setLoadingReservations(false);
            }
        };

        fetchReservations();
    }, []);

    const toggleReservationApproval = async (id) => {
        try {
            const token = localStorage.getItem("access");

            const res = await fetch(
                `http://127.0.0.1:8000/api/reservations/${id}/approve/`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!res.ok) {
                throw new Error("Failed to update status");
            }

            const data = await res.json();

            setReservations(prev =>
                prev.map(r =>
                    r.id === id ? {...r, approved: data.approved} : r
                )
            );


        } catch (err) {
            console.error("Approve toggle error:", err);
        }
    };


    const sendMail = async (reservation) => {
        try {
            const token = localStorage.getItem("access");

            const res = await fetch(
                "http://127.0.0.1:8000/api/send-reservation-mail/",
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        reservation_id: reservation.id,
                        status: reservation.approved,
                    }),
                }
            );

            if (!res.ok) {
                throw new Error("Failed to send mail");
            }

            console.log("Mail sent successfully");
        } catch (err) {
            console.error("Send mail error:", err);
        }
    };


    return (
        <div className="background-checkout">
            <div className="logodiv-checkout-admin">
                <div>
                    <p className="to-home" onClick={() => navigate("/")}>HOME</p>
                </div>

                <img className="logo" src={PACrustLogo} alt={PACrustLogo} onClick={() => {
                    navigate("/admin_panel");
                    setSelected(null)
                }}/>

                <div
                    className="messages-wrapper"
                    onMouseEnter={() => setShowMessagesHover(true)}
                    onMouseLeave={() => setShowMessagesHover(false)}
                >
                    <div className="oval-white">
                        <img className="message-photo" src={message} alt="Messages"/>
                    </div>

                    {showMessagesHover && messages.length > 0 && (
                        <div className="hover-messages-popup">
                            {messages.map((msg, index) => {
                                const date = new Date(msg.created_at);
                                const formattedDate = date.toLocaleDateString() + " " + date.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                });

                                return (
                                    <div key={index} className="hover-message-item">
                                        <p>
                                            <strong>{msg.sender}:</strong> {msg.content}
                                        </p>
                                        <small>{formattedDate}</small>
                                        <button
                                            className="delete-message-btn"
                                            onClick={async () => {
                                                try {
                                                    const token = localStorage.getItem("access"); // ако користиш JWT
                                                    const res = await fetch(`http://127.0.0.1:8000/api/messages/${msg.id}/delete/`, {
                                                        method: "DELETE",
                                                        headers: {
                                                            "Authorization": `Bearer ${token}`
                                                        }
                                                    });
                                                    if (!res.ok) throw new Error("Failed to delete message");
                                                    setMessages(prev => prev.filter(m => m.id !== msg.id));
                                                } catch (err) {
                                                    console.error(err);
                                                    alert("Failed to delete message");
                                                }
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>


            </div>

            <div className="navigation-bar-admin">
                <div
                    className={`admin-item ${selected === 0 ? "selected" : ""}`}
                    onClick={() => {
                        if (selected === 0) {
                            setSelected(null);
                            navigate("/admin_panel");
                        } else {
                            setSelected(0);
                        }
                    }}
                >
                    Change information and price of the products
                </div>

                <div
                    className={`admin-item ${selected === 1 ? "selected" : ""}`}
                    onClick={() => {
                        if (selected === 1) {
                            setSelected(null);
                            navigate("/admin_panel");
                        } else {
                            setSelected(1);
                        }
                    }}
                >
                    Manage the user profiles
                </div>

                <div
                    className={`admin-item ${selected === 2 ? "selected" : ""}`}
                    onClick={() => {
                        if (selected === 2) {
                            setSelected(null);
                            navigate("/admin_panel");
                        } else {
                            setSelected(2);
                        }
                    }}
                >
                    Add more new products
                </div>

                <div
                    className={`admin-item ${selected === 3 ? "selected" : ""}`}
                    onClick={() => {
                        if (selected === 3) {
                            setSelected(null);
                            navigate("/admin_panel");
                        } else {
                            setSelected(3);
                        }
                    }}
                >
                    Promo codes
                </div>
            </div>

            {selected === null && (
                <div className="dashboard fade-in">
                    <div className="chart-container">
                        <div className="chart-header">
                            <h2 className="chart-titles">Line Chart for Sales Trend</h2>
                        </div>

                        {chartData ? (
                            <Line
                                data={chartData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {position: "top"},
                                    },
                                }}
                            />
                        ) : (
                            <p>Loading chart...</p>
                        )}
                    </div>

                    <div className="table-container">
                        <h2 className="chart-titles">Earnings by Items</h2>

                        <div className="data-items">
                            {earningsData.length > 0 ? (
                                <table className="earnings-table">
                                    <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Price (€)</th>
                                        <th>Qty</th>
                                        <th>Revenue (€)</th>
                                        <th>% of Sales</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {earningsData.map((item, i) => (
                                        <tr key={i} className={i === 0 ? "top-item" : ""}>
                                            <td>{item.name}</td>
                                            <td className="num">{item.price}</td>
                                            <td className="num">{item.qty}</td>
                                            <td className="num">{item.revenue}</td>
                                            <td className="num">{item.sales}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="loading-text">Loading earnings data...</p>
                            )}
                        </div>


                    </div>

                    <div className="table-container-2">
                        <h2 className="chart-titles">Reservations</h2>

                        {loadingReservations ? (
                            <p className="loading-text">Loading reservations...</p>
                        ) : (
                            <div className="data-items">
                                <table className="earnings-table">
                                    <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>From</th>
                                        <th>To</th>
                                        <th>Name</th>
                                        <th>People</th>
                                        <th>Comment</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {reservations
                                        .map(r => (
                                            <tr key={r.id}>
                                                <td>{r.date}</td>
                                                <td>{r.from_time}</td>
                                                <td>{r.to_time}</td>
                                                <td>{r.name}</td>
                                                <td className="num">{r.people_count}</td>
                                                <td>{r.comment || "-"}</td>
                                                <td style={{color: r.approved === "Approved" ? "green" : "red"}}>
                                                    {r.approved}
                                                </td>


                                                <td className="two-btns">
                                                    <button
                                                        className="remove-btn"
                                                        onClick={() => toggleReservationApproval(r.id)}
                                                    >
                                                        {r.approved === "Approved" ? "Unapprove" : "Approve"}
                                                    </button>


                                                    <button
                                                        className="edit-btn"
                                                        onClick={() => sendMail(r)}
                                                        style={{marginLeft: "8px"}}
                                                    >
                                                        Send Mail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {selected === 0 && (
                <div className="change-products-container fade-in">

                    <div className="change-box">
                        <h2 className="chart-titles">Change pizza information</h2>
                        <div className="table-wrapper">
                            <table className="admin-table">
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Heading</th>
                                    <th>Description</th>
                                    <th>Stickers</th>
                                    <th>Image</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {pizzas.map((pizza) => (
                                    <tr key={pizza.id}>
                                        <td>
                                            {editingPizzaId === pizza.id ? (
                                                <input
                                                    type="text"
                                                    value={editingPizzaData.name}
                                                    onChange={e => setEditingPizzaData({
                                                        ...editingPizzaData,
                                                        name: e.target.value
                                                    })}
                                                />
                                            ) : pizza.name}
                                        </td>

                                        <td>
                                            {editingPizzaId === pizza.id ? (
                                                <input
                                                    type="number"
                                                    value={editingPizzaData.price}
                                                    onChange={e => setEditingPizzaData({
                                                        ...editingPizzaData,
                                                        price: e.target.value
                                                    })}
                                                />
                                            ) : pizza.price}
                                        </td>

                                        <td>
                                            {editingPizzaId === pizza.id ? (
                                                <input
                                                    type="text"
                                                    value={editingPizzaData.heading}
                                                    onChange={e =>
                                                        setEditingPizzaData({
                                                            ...editingPizzaData,
                                                            heading: e.target.value
                                                        })
                                                    }
                                                />
                                            ) : pizza.heading}
                                        </td>

                                        <td className="descri-css">
                                            {editingPizzaId === pizza.id ? (
                                                <input
                                                    type="text"
                                                    value={editingPizzaData.description}
                                                    onChange={e =>
                                                        setEditingPizzaData({
                                                            ...editingPizzaData,
                                                            description: e.target.value
                                                        })
                                                    }
                                                />
                                            ) : pizza.description}
                                        </td>

                                        <td>
                                            <div style={{display: "flex", flexWrap: "wrap", gap: "5px"}}>
                                                {pizza.stickers?.map((sticker, i) => (
                                                    <img
                                                        key={i}
                                                        src={
                                                            sticker.image
                                                                ? (sticker.image.startsWith("http")
                                                                    ? sticker.image
                                                                    : `http://127.0.0.1:8000${sticker.image}`)
                                                                : "/fallback-image.png"
                                                        }
                                                        alt="sticker"
                                                        width="40"
                                                        height="40"
                                                        style={{borderRadius: "5px", background: "white"}}
                                                    />
                                                ))}
                                            </div>

                                            {editingPizzaId === pizza.id && (
                                                <div style={{marginTop: "5px"}}>
                                                    <input type="file" accept="image/*" multiple
                                                           onChange={handleStickerChange}/>
                                                    <div className="sticker-preview-grid">
                                                        {editingPizzaData.stickersPreview?.map((src, i) => (
                                                            <img key={i} src={src} alt="Sticker preview" width="60"
                                                                 height="60"/>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                        </td>


                                        <td>
                                            {editingPizzaId === pizza.id ? (
                                                <>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                setEditingPizzaData({
                                                                    ...editingPizzaData,
                                                                    imagePreview: URL.createObjectURL(file), // preview
                                                                    imageFile: file                   // file to send
                                                                });
                                                            }
                                                        }}
                                                    />

                                                    {editingPizzaData.imagePreview && (
                                                        <img
                                                            src={editingPizzaData.imagePreview}
                                                            alt="preview"
                                                            width="60"
                                                            height="60"
                                                            style={{marginTop: "5px", borderRadius: "5px"}}
                                                        />
                                                    )}
                                                </>
                                            ) : (
                                                <img
                                                    src={
                                                        pizza.image && typeof pizza.image === "string"
                                                            ? (pizza.image.startsWith("http")
                                                                ? pizza.image
                                                                : `http://127.0.0.1:8000${pizza.image}`)
                                                            : "/fallback-image.png" // optional placeholder
                                                    }
                                                    alt={pizza.name}
                                                    style={{width: "100%", height: "80px", objectFit: "cover"}}
                                                />


                                            )}
                                        </td>


                                        <td>
                                            {editingPizzaId === pizza.id ? (
                                                <>
                                                    <div className="actions">
                                                        <button className="save-btn-2" onClick={saveEditingPizza}>Save
                                                        </button>
                                                        <button className="cancel-btn"
                                                                onClick={cancelEditingPizza}>Cancel
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="actions">
                                                        {/*<button className="remove-btn"*/}
                                                        {/*        onClick={() => removePizza(pizza.id)}>Remove*/}
                                                        {/*</button>*/}
                                                        <button className="remove-btn"
                                                                onClick={() => setselectedPizza(pizza)}>Remove
                                                        </button>
                                                        <button className="edit-btn"
                                                                onClick={() => startEditingPizza(pizza)}>Edit
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {newPizza && (
                                    <tr key="new">
                                        <td><input type="text" value={newPizza.name}
                                                   onChange={e => setNewPizza({...newPizza, name: e.target.value})}/>
                                        </td>
                                        <td><input type="number" value={newPizza.price}
                                                   onChange={e => setNewPizza({...newPizza, price: e.target.value})}/>
                                        </td>
                                        <td><input type="text" value={newPizza.heading}
                                                   onChange={e => setNewPizza({...newPizza, heading: e.target.value})}/>
                                        </td>
                                        <td><input type="text" value={newPizza.description}
                                                   onChange={e => setNewPizza({
                                                       ...newPizza,
                                                       description: e.target.value
                                                   })}/>
                                        </td>
                                        <td>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files);
                                                    const previews = files.map(file => URL.createObjectURL(file));
                                                    setNewPizza({
                                                        ...newPizza,
                                                        stickersFiles: files,
                                                        stickersPreview: previews
                                                    });
                                                }}
                                            />
                                            {newPizza.stickersPreview?.length > 0 && (
                                                <div style={{
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: "5px",
                                                    marginTop: "5px"
                                                }}>
                                                    {newPizza.stickersPreview.map((src, i) => (
                                                        <img key={i} src={src} alt="sticker preview" width="40"
                                                             height="40"/>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setNewPizza({
                                                                ...newPizza,
                                                                imageFile: file,
                                                                imagePreview: URL.createObjectURL(file)
                                                            });
                                                        }
                                                    }}
                                                />
                                                {newPizza.imagePreview && (
                                                    <img src={newPizza.imagePreview} alt="preview" width="60"
                                                         height="60"/>
                                                )}
                                                {newPizza.image && (
                                                    <img
                                                        src={newPizza.image}
                                                        alt="preview"
                                                        width="60"
                                                        height="60"
                                                        style={{marginTop: "5px", borderRadius: "5px"}}
                                                    />
                                                )}
                                            </>
                                        </td>

                                        <td>
                                            <button className="save-btn-2" onClick={saveNewPizza}>Save</button>
                                            <button className="cancel-btn" onClick={() => setNewPizza(null)}>Cancel
                                            </button>
                                        </td>
                                    </tr>
                                )}
                                </tbody>

                            </table>

                        </div>
                        <div className="add-btn-class">
                            {!newPizza && <button className="add-btn" onClick={handleAddClick}>Add</button>}
                        </div>

                    </div>
                </div>
            )}

            {selectedPizza && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Delete Pizza</h2>
                        <p>Are you sure you want to delete {selectedPizza.name}?</p>
                        <div className="gap-it">
                            <button
                                className="remove-btn"
                                onClick={() => {
                                    removePizza(selectedPizza.id);
                                    setselectedPizza(null);
                                }}
                            >
                                Yes, delete
                            </button>

                            <button
                                className="edit-btn"
                                onClick={() => setselectedPizza(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selected === 1 && (
                <div className="user-profiles-container fade-in">

                    <div className="change-box">
                        <h2 className="chart-titles">User Profiles</h2>
                        <div className="table-wrapper">
                            <table className="profiles-table">
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Full Name</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Address</th>
                                    <th>Phone</th>
                                    <th>City</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {users.map((user, i) => (
                                    <tr key={user.id}>
                                        <td>{i + 1}</td>
                                        <td>
                                            {editingUserId === user.id ? (
                                                <input className="change-width"
                                                       value={editingUserData.name}
                                                       onChange={(e) =>
                                                           setEditingUserData({
                                                               ...editingUserData,
                                                               name: e.target.value
                                                           })
                                                       }
                                                />
                                            ) : (
                                                user.name || "/"
                                            )}
                                        </td>
                                        <td>
                                            {editingUserId === user.id ? (
                                                <input className="change-width"
                                                       value={editingUserData.username}
                                                       onChange={(e) =>
                                                           setEditingUserData({
                                                               ...editingUserData,
                                                               username: e.target.value
                                                           })
                                                       }
                                                />
                                            ) : (
                                                user.username || "/"
                                            )}
                                        </td>
                                        <td>
                                            {editingUserId === user.id ? (
                                                <input className="change-width"
                                                       value={editingUserData.email}
                                                       onChange={(e) =>
                                                           setEditingUserData({
                                                               ...editingUserData,
                                                               email: e.target.value
                                                           })
                                                       }
                                                />
                                            ) : (
                                                user.email || "/"
                                            )}
                                        </td>
                                        <td>
                                            {editingUserId === user.id ? (
                                                <input className="change-width"
                                                       value={editingUserData.address}
                                                       onChange={(e) =>
                                                           setEditingUserData({
                                                               ...editingUserData,
                                                               address: e.target.value
                                                           })
                                                       }
                                                />
                                            ) : (
                                                user.address || "/"
                                            )}
                                        </td>
                                        <td>
                                            {editingUserId === user.id ? (
                                                <input className="change-width"
                                                       value={editingUserData.phone}
                                                       onChange={(e) =>
                                                           setEditingUserData({
                                                               ...editingUserData,
                                                               phone: e.target.value
                                                           })
                                                       }
                                                />
                                            ) : (
                                                user.phone || "/"
                                            )}
                                        </td>
                                        <td>
                                            {editingUserId === user.id ? (
                                                <input className="change-width"
                                                       value={editingUserData.city}
                                                       onChange={(e) =>
                                                           setEditingUserData({
                                                               ...editingUserData,
                                                               city: e.target.value
                                                           })
                                                       }
                                                />
                                            ) : (
                                                user.city || "/"
                                            )}
                                        </td>
                                        <td>
                                            {editingUserId === user.id ? (
                                                <select
                                                    className="change-width"
                                                    value={editingUserData.role}
                                                    onChange={(e) =>
                                                        setEditingUserData({
                                                            ...editingUserData,
                                                            role: e.target.value
                                                        })
                                                    }
                                                >
                                                    <option value="administrator">administrator</option>
                                                    <option value="client">client</option>
                                                    <option value="employee">employee</option>
                                                </select>

                                            ) : (
                                                user.role || "/"
                                            )}
                                        </td>
                                        <td>
                                            <div className="actions">
                                                {editingUserId === user.id ? (
                                                    <>
                                                        <button className="save-btn-2" onClick={saveEditing}>Save
                                                        </button>
                                                        <button className="cancel-btn" onClick={cancelEditing}>Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className="remove-btn"
                                                                onClick={() => setSelectedUser(user)}>Remove
                                                        </button>
                                                        <button className="edit-btn"
                                                                onClick={() => startEditing(user)}>Edit
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                        </div>
                    </div>
                </div>
            )
            }

            {selectedUser && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Delete User</h2>
                        <p>Are you sure you want to delete {selectedUser.name}?</p>
                        <div className="gap-it">
                            <button className="remove-btn"
                                    onClick={() => {
                                        handleRemove(selectedUser.id);
                                        setSelectedUser(null);
                                    }}
                            >
                                Yes, delete
                            </button>
                            <button className="edit-btn" onClick={() => setSelectedUser(null)}>Cancel
                            </button>
                        </div>

                    </div>
                </div>
            )
            }

            {selected === 2 && (
                <div className="change-products-container fade-in">
                    <div className="change-box">
                        <h2 className="chart-titles">Add Ingredients for pizza</h2>
                        <div className="table-wrapper">
                            <table className="admin-table">
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Description</th>
                                    <th>Image</th>
                                    <th>Availability</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {ingredients.map((item) => (
                                    <tr key={item.id}>
                                        {editingRowId === item.id ? (
                                            <>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={item.name}
                                                        onChange={(e) =>
                                                            setIngredients(prev =>
                                                                prev.map(ing =>
                                                                    ing.id === item.id ? {
                                                                        ...ing,
                                                                        name: e.target.value
                                                                    } : ing
                                                                )
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={item.price}
                                                        onChange={(e) =>
                                                            setIngredients(prev =>
                                                                prev.map(ing =>
                                                                    ing.id === item.id ? {
                                                                        ...ing,
                                                                        price: e.target.value
                                                                    } : ing
                                                                )
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={item.description}
                                                        onChange={(e) =>
                                                            setIngredients(prev =>
                                                                prev.map(ing =>
                                                                    ing.id === item.id ? {
                                                                        ...ing,
                                                                        description: e.target.value
                                                                    } : ing
                                                                )
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                setIngredients(prev =>
                                                                    prev.map(ing =>
                                                                        ing.id === item.id
                                                                            ? {
                                                                                ...ing,
                                                                                imagePreview: URL.createObjectURL(file),
                                                                                imageFile: file
                                                                            }
                                                                            : ing
                                                                    )
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <img
                                                        src={item.imagePreview || item.image}
                                                        alt="preview"
                                                        width="60"
                                                        height="60"
                                                        style={{marginTop: "5px", borderRadius: "5px"}}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={item.availability || false}
                                                        onChange={e =>
                                                            setIngredients(prev =>
                                                                prev.map(ing =>
                                                                    ing.id === item.id
                                                                        ? {...ing, availability: e.target.checked}
                                                                        : ing
                                                                )
                                                            )
                                                        }
                                                    />

                                                </td>

                                                <td>
                                                    <div className="actions">
                                                        <button
                                                            className="save-btn-2"
                                                            onClick={() => updateIngredient(item)}
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            className="cancel-btn"
                                                            onClick={() => setEditingRowId(null)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{item.name}</td>
                                                <td>{item.price}</td>
                                                <td>{item.description}</td>
                                                <td>
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        width="60"
                                                        height="60"
                                                        style={{borderRadius: "5px"}}
                                                    />
                                                </td>

                                                <td>{item.availability ? "✅ Yes" : "❌ No"}</td>

                                                <td>
                                                    <div className="actions">
                                                        <button
                                                            className="remove-btn"
                                                            onClick={() => setSelectedIngredient(item)}
                                                        >
                                                            Remove
                                                        </button>
                                                        <button
                                                            className="edit-btn"
                                                            onClick={() => setEditingRowId(item.id)}
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}

                                {newIngredient && (
                                    <tr key="new-ingredient">
                                        <td><input type="text" value={newIngredient.name}
                                                   onChange={e => setNewIngredient({
                                                       ...newIngredient,
                                                       name: e.target.value
                                                   })}/></td>
                                        <td><input type="text" value={newIngredient.price}
                                                   onChange={e => setNewIngredient({
                                                       ...newIngredient,
                                                       price: e.target.value
                                                   })}/></td>
                                        <td><input type="text" value={newIngredient.description}
                                                   onChange={e => setNewIngredient({
                                                       ...newIngredient,
                                                       description: e.target.value
                                                   })}/></td>
                                        <td>
                                            <input type="file" accept="image/*" onChange={e => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setNewIngredient({
                                                        ...newIngredient,
                                                        imagePreview: URL.createObjectURL(file),
                                                        imageFile: file
                                                    });
                                                }
                                            }}/>
                                            {newIngredient.imagePreview &&
                                                <img src={newIngredient.imagePreview} width="60" height="60"/>}
                                        </td>

                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={newIngredient.availability || false}
                                                onChange={e => setNewIngredient({
                                                    ...newIngredient,
                                                    availability: e.target.checked
                                                })}
                                            />

                                        </td>


                                        <td>
                                            <button className="save-btn-2" onClick={saveNewIngredient}>Save</button>
                                            <button className="cancel-btn" onClick={() => setNewIngredient(null)}>Cancel
                                            </button>
                                        </td>
                                    </tr>
                                )}

                                </tbody>
                            </table>
                        </div>


                        <div className="add-btn-class">
                            {!newPizza && (
                                <button
                                    className="add-btn"
                                    onClick={() =>
                                        setNewIngredient({
                                            id: "new",
                                            name: "",
                                            price: "",
                                            description: "",
                                            availability: true,
                                            imageFile: null,
                                            imagePreview: null,
                                        })
                                    }
                                >
                                    Add
                                </button>
                            )}
                        </div>
                    </div>

                    {selectedSection === "salads" && (
                        <div className="change-box">
                            <div className="section-tabs">
                                <button
                                    className={selectedSection === "specialOffers" ? "tab active" : "tab"}
                                    onClick={() => setSelectedSection("specialOffers")}
                                >
                                    Special Offers
                                </button>
                                <h2 className="chart-titles-2">Add Salads</h2>
                                <button
                                    className={selectedSection === "drinks" ? "tab active" : "tab"}
                                    onClick={() => setSelectedSection("drinks")}
                                >
                                    Drinks
                                </button>
                            </div>
                            <div className="table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Price</th>
                                        <th>Description</th>
                                        <th>Image</th>
                                        <th>Availability</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {salads.map((item) => (
                                        <tr key={item.id}>
                                            {editingRowId === item.id ? (
                                                <>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={item.name}
                                                            onChange={(e) =>
                                                                setSalads(prev =>
                                                                    prev.map(s =>
                                                                        s.id === item.id
                                                                            ? {...s, name: e.target.value}
                                                                            : s
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={item.price}
                                                            onChange={(e) =>
                                                                setSalads(prev =>
                                                                    prev.map(s =>
                                                                        s.id === item.id
                                                                            ? {...s, price: e.target.value}
                                                                            : s
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={item.description}
                                                            onChange={(e) =>
                                                                setSalads(prev =>
                                                                    prev.map(s =>
                                                                        s.id === item.id
                                                                            ? {...s, description: e.target.value}
                                                                            : s
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    setSalads(prev =>
                                                                        prev.map(s =>
                                                                            s.id === item.id
                                                                                ? {
                                                                                    ...s,
                                                                                    imagePreview: URL.createObjectURL(file),
                                                                                    imageFile: file
                                                                                }
                                                                                : s
                                                                        )
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <img
                                                            src={item.imagePreview || item.image}
                                                            alt="preview"
                                                            width="60"
                                                            height="60"
                                                            style={{marginTop: "5px", borderRadius: "5px"}}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={item.availability || false}
                                                            onChange={e =>
                                                                setSalads(prev =>
                                                                    prev.map(s =>
                                                                        s.id === item.id
                                                                            ? {...s, availability: e.target.checked}
                                                                            : s
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <div className="actions">
                                                            <button className="save-btn-2"
                                                                    onClick={() => updateSalad(item)}>Save
                                                            </button>
                                                            <button className="cancel-btn"
                                                                    onClick={() => setEditingRowId(null)}>Cancel
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>{item.name}</td>
                                                    <td>{item.price}</td>
                                                    <td>{item.description}</td>
                                                    <td>
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            width="60"
                                                            height="60"
                                                            style={{borderRadius: "5px"}}
                                                        />
                                                    </td>
                                                    <td>{item.availability ? "✅ Yes" : "❌ No"}</td>
                                                    <td>
                                                        <div className="actions">
                                                            <button className="remove-btn"
                                                                    onClick={() => deleteSalad(item.id)}>Remove
                                                            </button>
                                                            <button className="edit-btn"
                                                                    onClick={() => setEditingRowId(item.id)}>Edit
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}

                                    {newSalad && (
                                        <tr key="new-salad">
                                            <td><input type="text" value={newSalad.name}
                                                       onChange={e => setNewSalad({
                                                           ...newSalad,
                                                           name: e.target.value
                                                       })}/>
                                            </td>
                                            <td><input type="text" value={newSalad.price}
                                                       onChange={e => setNewSalad({
                                                           ...newSalad,
                                                           price: e.target.value
                                                       })}/>
                                            </td>
                                            <td><input type="text" value={newSalad.description}
                                                       onChange={e => setNewSalad({
                                                           ...newSalad,
                                                           description: e.target.value
                                                       })}/></td>
                                            <td>
                                                <input type="file" accept="image/*" onChange={e => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setNewSalad({
                                                            ...newSalad,
                                                            imagePreview: URL.createObjectURL(file),
                                                            imageFile: file
                                                        });
                                                    }
                                                }}/>
                                                {newSalad.imagePreview &&
                                                    <img src={newSalad.imagePreview} width="60" height="60"/>}
                                            </td>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={newSalad.availability || false}
                                                    onChange={e => setNewSalad({
                                                        ...newSalad,
                                                        availability: e.target.checked
                                                    })}
                                                />
                                            </td>
                                            <td>
                                                <button className="save-btn-2" onClick={saveNewSalad}>Save</button>
                                                <button className="cancel-btn" onClick={() => setNewSalad(null)}>Cancel
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="add-btn-class">
                                {!newSalad && (
                                    <button
                                        className="add-btn"
                                        onClick={() =>
                                            setNewSalad({
                                                id: "new",
                                                name: "",
                                                price: "",
                                                description: "",
                                                availability: true,
                                                imageFile: null,
                                                imagePreview: null,
                                            })
                                        }
                                    >
                                        Add
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {selectedSection === "drinks" && (
                        <div className="change-box">
                            <div className="section-tabs">
                                <button
                                    className={selectedSection === "salads" ? "tab active" : "tab"}
                                    onClick={() => setSelectedSection("salads")}
                                >
                                    Salads
                                </button>
                                <h2 className="chart-titles-2">Add Drinks</h2>
                                <button
                                    className={selectedSection === "desserts" ? "tab active" : "tab"}
                                    onClick={() => setSelectedSection("desserts")}
                                >
                                    Desserts
                                </button>
                            </div>

                            <div className="table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Price</th>
                                        <th>Image</th>
                                        <th>Availability</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {drinks.map((item) => (
                                        <tr key={item.id}>
                                            {editingRowId === item.id ? (
                                                <>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={item.name}
                                                            onChange={(e) =>
                                                                setDrinks(prev =>
                                                                    prev.map(d =>
                                                                        d.id === item.id ? {
                                                                            ...d,
                                                                            name: e.target.value
                                                                        } : d
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={item.price}
                                                            onChange={(e) =>
                                                                setDrinks(prev =>
                                                                    prev.map(d =>
                                                                        d.id === item.id ? {
                                                                            ...d,
                                                                            price: e.target.value
                                                                        } : d
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    setDrinks(prev =>
                                                                        prev.map(d =>
                                                                            d.id === item.id
                                                                                ? {
                                                                                    ...d,
                                                                                    imagePreview: URL.createObjectURL(file),
                                                                                    imageFile: file
                                                                                }
                                                                                : d
                                                                        )
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <img
                                                            src={item.imagePreview || item.image}
                                                            alt="preview"
                                                            width="60"
                                                            height="60"
                                                            style={{marginTop: "5px", borderRadius: "5px"}}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={item.availability || false}
                                                            onChange={e =>
                                                                setDrinks(prev =>
                                                                    prev.map(d =>
                                                                        d.id === item.id
                                                                            ? {...d, availability: e.target.checked}
                                                                            : d
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <div className="actions">
                                                            <button className="save-btn-2"
                                                                    onClick={() => updateDrink(item)}>Save
                                                            </button>
                                                            <button className="cancel-btn"
                                                                    onClick={() => setEditingRowId(null)}>Cancel
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>{item.name}</td>
                                                    <td>{item.price}</td>
                                                    <td>
                                                        <img src={item.image} alt={item.name} width="60" height="60"
                                                             style={{borderRadius: "5px"}}/>
                                                    </td>
                                                    <td>{item.availability ? "✅ Yes" : "❌ No"}</td>
                                                    <td>
                                                        <div className="actions">
                                                            <button className="remove-btn"
                                                                    onClick={() => deleteDrink(item.id)}>Remove
                                                            </button>
                                                            <button className="edit-btn"
                                                                    onClick={() => setEditingRowId(item.id)}>Edit
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}

                                    {newDrink && (
                                        <tr key="new-drink">
                                            <td><input type="text" value={newDrink.name} onChange={e => setNewDrink({
                                                ...newDrink,
                                                name: e.target.value
                                            })}/></td>
                                            <td><input type="text" value={newDrink.price} onChange={e => setNewDrink({
                                                ...newDrink,
                                                price: e.target.value
                                            })}/></td>
                                            <td>
                                                <input type="file" accept="image/*" onChange={e => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setNewDrink({
                                                            ...newDrink,
                                                            imagePreview: URL.createObjectURL(file),
                                                            imageFile: file
                                                        });
                                                    }
                                                }}/>
                                                {newDrink.imagePreview &&
                                                    <img src={newDrink.imagePreview} width="60" height="60"/>}
                                            </td>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={newDrink.availability || false}
                                                    onChange={e => setNewDrink({
                                                        ...newDrink,
                                                        availability: e.target.checked
                                                    })}
                                                />
                                            </td>
                                            <td>
                                                <button className="save-btn-2" onClick={saveNewDrink}>Save</button>
                                                <button className="cancel-btn"
                                                        onClick={() => setNewDrink(null)}>Cancel
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="add-btn-class">
                                {!newDrink && (
                                    <button
                                        className="add-btn"
                                        onClick={() =>
                                            setNewDrink({
                                                id: "new",
                                                name: "",
                                                price: "",
                                                availability: true,
                                                imageFile: null,
                                                imagePreview: null,
                                            })
                                        }
                                    >
                                        Add
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {selectedSection === "desserts" && (
                        <div className="change-box">
                            <div className="section-tabs">
                                <button
                                    className={selectedSection === "drinks" ? "tab active" : "tab"}
                                    onClick={() => setSelectedSection("drinks")}
                                >
                                    Drinks
                                </button>
                                <h2 className="chart-titles-2">Add Desserts</h2>
                                <button
                                    className={selectedSection === "sauces" ? "tab active" : "tab"}
                                    onClick={() => setSelectedSection("sauces")}
                                >
                                    Sauces
                                </button>
                            </div>

                            <div className="table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Price</th>
                                        <th>Image</th>
                                        <th>Availability</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {desserts.map((item) => (
                                        <tr key={item.id}>
                                            {editingRowId === item.id ? (
                                                <>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={item.name}
                                                            onChange={(e) =>
                                                                setDesserts(prev =>
                                                                    prev.map(d =>
                                                                        d.id === item.id ? {
                                                                            ...d,
                                                                            name: e.target.value
                                                                        } : d
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={item.price}
                                                            onChange={(e) =>
                                                                setDesserts(prev =>
                                                                    prev.map(d =>
                                                                        d.id === item.id ? {
                                                                            ...d,
                                                                            price: e.target.value
                                                                        } : d
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    setDesserts(prev =>
                                                                        prev.map(d =>
                                                                            d.id === item.id
                                                                                ? {
                                                                                    ...d,
                                                                                    imagePreview: URL.createObjectURL(file),
                                                                                    imageFile: file
                                                                                }
                                                                                : d
                                                                        )
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <img
                                                            src={item.imagePreview || item.image}
                                                            alt="preview"
                                                            width="60"
                                                            height="60"
                                                            style={{marginTop: "5px", borderRadius: "5px"}}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={item.availability || false}
                                                            onChange={e =>
                                                                setDesserts(prev =>
                                                                    prev.map(d =>
                                                                        d.id === item.id
                                                                            ? {...d, availability: e.target.checked}
                                                                            : d
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <div className="actions">
                                                            <button className="save-btn-2"
                                                                    onClick={() => updateDessert(item)}>Save
                                                            </button>
                                                            <button className="cancel-btn"
                                                                    onClick={() => setEditingRowId(null)}>Cancel
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>{item.name}</td>
                                                    <td>{item.price}</td>
                                                    <td>
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            width="60"
                                                            height="60"
                                                            style={{borderRadius: "5px"}}
                                                        />
                                                    </td>
                                                    <td>{item.availability ? "✅ Yes" : "❌ No"}</td>
                                                    <td>
                                                        <div className="actions">
                                                            <button className="remove-btn"
                                                                    onClick={() => deleteDessert(item.id)}>Remove
                                                            </button>
                                                            <button className="edit-btn"
                                                                    onClick={() => setEditingRowId(item.id)}>Edit
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}

                                    {newDessert && (
                                        <tr key="new-dessert">
                                            <td>
                                                <input
                                                    type="text"
                                                    value={newDessert.name}
                                                    onChange={e => setNewDessert({...newDessert, name: e.target.value})}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={newDessert.price}
                                                    onChange={e => setNewDessert({
                                                        ...newDessert,
                                                        price: e.target.value
                                                    })}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={e => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setNewDessert({
                                                                ...newDessert,
                                                                imagePreview: URL.createObjectURL(file),
                                                                imageFile: file
                                                            });
                                                        }
                                                    }}
                                                />
                                                {newDessert.imagePreview && (
                                                    <img src={newDessert.imagePreview} width="60" height="60"/>
                                                )}
                                            </td>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={newDessert.availability || false}
                                                    onChange={e => setNewDessert({
                                                        ...newDessert,
                                                        availability: e.target.checked
                                                    })}
                                                />
                                            </td>
                                            <td>
                                                <button className="save-btn-2" onClick={saveNewDessert}>Save</button>
                                                <button className="cancel-btn"
                                                        onClick={() => setNewDessert(null)}>Cancel
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>

                                </table>
                            </div>

                            <div className="add-btn-class">
                                {!newDessert && (
                                    <button
                                        className="add-btn"
                                        onClick={() =>
                                            setNewDessert({
                                                id: "new",
                                                name: "",
                                                price: "",
                                                availability: true,
                                                imageFile: null,
                                                imagePreview: null,
                                            })
                                        }
                                    >
                                        Add
                                    </button>
                                )}
                            </div>
                        </div>
                    )}


                    {selectedSection === "sauces" && (
                        <div className="change-box">
                            <div className="section-tabs">
                                <button
                                    className={selectedSection === "desserts" ? "tab active" : "tab"}
                                    onClick={() => setSelectedSection("desserts")}
                                >
                                    Desserts
                                </button>
                                <h2 className="chart-titles-2">Add Sauces</h2>
                                <button
                                    className={selectedSection === "specialOffers" ? "tab active" : "tab"}
                                    onClick={() => setSelectedSection("specialOffers")}
                                >
                                    Special Offers
                                </button>
                            </div>

                            <div className="table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Price</th>
                                        <th>Image</th>
                                        <th>Availability</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {sauces.map((item) => (
                                        <tr key={item.id}>
                                            {editingRowId === item.id ? (
                                                <>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={item.name}
                                                            onChange={(e) =>
                                                                setSauces((prev) =>
                                                                    prev.map((s) =>
                                                                        s.id === item.id ? {
                                                                            ...s,
                                                                            name: e.target.value
                                                                        } : s
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={item.price}
                                                            onChange={(e) =>
                                                                setSauces((prev) =>
                                                                    prev.map((s) =>
                                                                        s.id === item.id ? {
                                                                            ...s,
                                                                            price: e.target.value
                                                                        } : s
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    setSauces((prev) =>
                                                                        prev.map((s) =>
                                                                            s.id === item.id
                                                                                ? {
                                                                                    ...s,
                                                                                    imagePreview: URL.createObjectURL(file),
                                                                                    imageFile: file,
                                                                                }
                                                                                : s
                                                                        )
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <img
                                                            src={item.imagePreview || item.image}
                                                            alt="preview"
                                                            width="60"
                                                            height="60"
                                                            style={{marginTop: "5px", borderRadius: "5px"}}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={item.availability || false}
                                                            onChange={(e) =>
                                                                setSauces((prev) =>
                                                                    prev.map((s) =>
                                                                        s.id === item.id
                                                                            ? {...s, availability: e.target.checked}
                                                                            : s
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <div className="actions">
                                                            <button className="save-btn-2"
                                                                    onClick={() => updateSauce(item)}>
                                                                Save
                                                            </button>
                                                            <button
                                                                className="cancel-btn"
                                                                onClick={() => setEditingRowId(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>{item.name}</td>
                                                    <td>{item.price}</td>
                                                    <td>
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            width="60"
                                                            height="60"
                                                            style={{borderRadius: "5px"}}
                                                        />
                                                    </td>
                                                    <td>{item.availability ? "✅ Yes" : "❌ No"}</td>
                                                    <td>
                                                        <div className="actions">
                                                            <button
                                                                className="remove-btn"
                                                                onClick={() => deleteSauce(item.id)}
                                                            >
                                                                Remove
                                                            </button>
                                                            <button
                                                                className="edit-btn"
                                                                onClick={() => setEditingRowId(item.id)}
                                                            >
                                                                Edit
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}

                                    {newSauce && (
                                        <tr key="new-sause">
                                            <td>
                                                <input
                                                    type="text"
                                                    value={newSauce.name}
                                                    onChange={(e) => setNewSauce({...newSauce, name: e.target.value})}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={newSauce.price}
                                                    onChange={(e) =>
                                                        setNewSauce({...newSauce, price: e.target.value})
                                                    }
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setNewSauce({
                                                                ...newSauce,
                                                                imagePreview: URL.createObjectURL(file),
                                                                imageFile: file,
                                                            });
                                                        }
                                                    }}
                                                />
                                                {newSauce.imagePreview && (
                                                    <img src={newSauce.imagePreview} width="60" height="60"/>
                                                )}
                                            </td>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={newSauce.availability || false}
                                                    onChange={(e) =>
                                                        setNewSauce({...newSauce, availability: e.target.checked})
                                                    }
                                                />
                                            </td>
                                            <td>
                                                <button className="save-btn-2" onClick={saveNewSauce}>
                                                    Save
                                                </button>
                                                <button className="cancel-btn" onClick={() => setNewSauce(null)}>
                                                    Cancel
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="add-btn-class">
                                {!newSauce && (
                                    <button
                                        className="add-btn"
                                        onClick={() =>
                                            setNewSauce({
                                                id: "new",
                                                name: "",
                                                price: "",
                                                availability: true,
                                                imageFile: null,
                                                imagePreview: null,
                                            })
                                        }
                                    >
                                        Add
                                    </button>
                                )}
                            </div>
                        </div>
                    )}


                    {selectedSection === "specialOffers" && (
                        <div className="change-box">
                            <div className="section-tabs">
                                <button
                                    className={selectedSection === "sauces" ? "tab active" : "tab"}
                                    onClick={() => setSelectedSection("sauces")}
                                >
                                    Sauces
                                </button>
                                <h2 className="chart-titles-2">Add Special Offers</h2>
                                <button
                                    className={selectedSection === "salads" ? "tab active" : "tab"}
                                    onClick={() => setSelectedSection("salads")}
                                >
                                    Salads
                                </button>
                            </div>

                            <div className="table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Price</th>
                                        <th>Description</th>
                                        <th>Image</th>
                                        <th>Availability</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {specialOffers.map((item) => (
                                        <tr key={item.id}>
                                            {editingRowId === item.id ? (
                                                <>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={item.name}
                                                            onChange={(e) =>
                                                                setSpecialOffers(prev =>
                                                                    prev.map(o =>
                                                                        o.id === item.id ? {
                                                                            ...o,
                                                                            name: e.target.value
                                                                        } : o
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={item.price}
                                                            onChange={(e) =>
                                                                setSpecialOffers(prev =>
                                                                    prev.map(o =>
                                                                        o.id === item.id ? {
                                                                            ...o,
                                                                            price: e.target.value
                                                                        } : o
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={item.description || ""}
                                                            placeholder="Combo details, e.g., 2 Pizzas + 1 Drink"
                                                            onChange={(e) =>
                                                                setSpecialOffers(prev =>
                                                                    prev.map(o =>
                                                                        o.id === item.id ? {
                                                                            ...o,
                                                                            description: e.target.value
                                                                        } : o
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    setSpecialOffers(prev =>
                                                                        prev.map(o =>
                                                                            o.id === item.id
                                                                                ? {
                                                                                    ...o,
                                                                                    imagePreview: URL.createObjectURL(file),
                                                                                    imageFile: file
                                                                                }
                                                                                : o
                                                                        )
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <img
                                                            src={item.imagePreview || item.image}
                                                            alt="preview"
                                                            width="60"
                                                            height="60"
                                                            style={{marginTop: "5px", borderRadius: "5px"}}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={item.availability || false}
                                                            onChange={(e) =>
                                                                setSpecialOffers(prev =>
                                                                    prev.map(o =>
                                                                        o.id === item.id ? {
                                                                            ...o,
                                                                            availability: e.target.checked
                                                                        } : o
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <div className="actions">
                                                            <button className="save-btn-2"
                                                                    onClick={() => updateSpecialOffer(item)}>Save
                                                            </button>
                                                            <button className="cancel-btn"
                                                                    onClick={() => setEditingRowId(null)}>Cancel
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>{item.name}</td>
                                                    <td>{item.price}</td>
                                                    <td>{item.description}</td>
                                                    <td>
                                                        <img src={item.image} alt={item.name} width="60" height="60"
                                                             style={{borderRadius: "5px"}}/>
                                                    </td>
                                                    <td>{item.availability ? "✅ Yes" : "❌ No"}</td>
                                                    <td>
                                                        <div className="actions">
                                                            <button className="remove-btn"
                                                                    onClick={() => deleteSpecialOffer(item.id)}>Remove
                                                            </button>
                                                            <button className="edit-btn"
                                                                    onClick={() => setEditingRowId(item.id)}>Edit
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}

                                    {newSpecialOffer && (
                                        <tr key="new-special-offer">
                                            <td>
                                                <input
                                                    type="text"
                                                    value={newSpecialOffer.name}
                                                    onChange={(e) => setNewSpecialOffer({
                                                        ...newSpecialOffer,
                                                        name: e.target.value
                                                    })}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={newSpecialOffer.price}
                                                    onChange={(e) => setNewSpecialOffer({
                                                        ...newSpecialOffer,
                                                        price: e.target.value
                                                    })}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={newSpecialOffer.description || ""}
                                                    placeholder="Combo details, e.g., 2 Pizzas + 1 Drink"
                                                    onChange={(e) => setNewSpecialOffer({
                                                        ...newSpecialOffer,
                                                        description: e.target.value
                                                    })}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setNewSpecialOffer({
                                                                ...newSpecialOffer,
                                                                imagePreview: URL.createObjectURL(file),
                                                                imageFile: file
                                                            });
                                                        }
                                                    }}
                                                />
                                                {newSpecialOffer.imagePreview &&
                                                    <img src={newSpecialOffer.imagePreview} width="60" height="60"
                                                         style={{borderRadius: "5px"}}/>}
                                            </td>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={newSpecialOffer.availability || false}
                                                    onChange={(e) => setNewSpecialOffer({
                                                        ...newSpecialOffer,
                                                        availability: e.target.checked
                                                    })}
                                                />
                                            </td>
                                            <td>
                                                <button className="save-btn-2" onClick={saveNewSpecialOffer}>Save
                                                </button>
                                                <button className="cancel-btn"
                                                        onClick={() => setNewSpecialOffer(null)}>Cancel
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="add-btn-class">
                                {!newSpecialOffer && (
                                    <button className="add-btn" onClick={() =>
                                        setNewSpecialOffer({
                                            id: "new",
                                            name: "",
                                            price: "",
                                            description: "",
                                            availability: true,
                                            imageFile: null,
                                            imagePreview: null,
                                        })
                                    }>
                                        Add
                                    </button>
                                )}
                            </div>
                        </div>
                    )}


                </div>
            )}

            {selectedIngredient && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Delete Ingredient</h2>
                        <p>Are you sure you want to delete {selectedIngredient.name}?</p>
                        <div className="gap-it">
                            <button
                                className="remove-btn"
                                onClick={() => {
                                    deleteIngredient(selectedIngredient.id);
                                    setSelectedIngredient(null);
                                }}
                            >
                                Yes, delete
                            </button>
                            <button
                                className="edit-btn"
                                onClick={() => setSelectedIngredient(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selected === 3 && (
                <div className="change-products-container fade-in">
                    <div className="change-box">
                        <h2 className="chart-titles">Table of Promo Codes</h2>
                        <div className="table-wrapper">
                            <table className="admin-table admin-table-2">
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Discount Type</th>
                                    <th>Discount Value</th>
                                    <th>Usage Limit</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Active Toggle</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>

                                <tbody>
                                {promos.map((p) => (
                                    <tr key={`promo-${p.id}`}>
                                        <td>{p.name}</td>

                                        <td className="toggle-cell-disc">
                                            {editingPromoId === p.id ? (
                                                <>
                                                    <button
                                                        className={`toggle-btn ${p.discountType === "%" ? "active" : ""}`}
                                                        onClick={() =>
                                                            setPromos(prev =>
                                                                prev.map(x =>
                                                                    x.id === p.id ? {...x, discountType: "%"} : x
                                                                )
                                                            )
                                                        }
                                                    >
                                                        %
                                                    </button>
                                                    <span className="separator2">/</span>
                                                    <button
                                                        className={`toggle-btn ${p.discountType === "€" ? "active" : ""}`}
                                                        onClick={() =>
                                                            setPromos(prev =>
                                                                prev.map(x =>
                                                                    x.id === p.id ? {...x, discountType: "€"} : x
                                                                )
                                                            )
                                                        }
                                                    >
                                                        €
                                                    </button>
                                                </>
                                            ) : (
                                                <>{p.discountType}</>
                                            )}
                                        </td>

                                        <td>
                                            {editingPromoId === p.id ? (
                                                <input
                                                    type="number"
                                                    value={p.discountValue}
                                                    onChange={(e) =>
                                                        setPromos(prev =>
                                                            prev.map(x =>
                                                                x.id === p.id ? {
                                                                    ...x,
                                                                    discountValue: e.target.value
                                                                } : x
                                                            )
                                                        )
                                                    }
                                                    className="promo-input"
                                                />
                                            ) : (
                                                <>{p.discountValue}</>
                                            )}
                                        </td>

                                        <td>
                                            {editingPromoId === p.id ? (
                                                <div className="toggle-cell-usage">
                                                    <div className="tooltip-wrapper">
                                                        <input
                                                            type="number"
                                                            value={p.noLimit ? "" : p.usageLimit}
                                                            onChange={(e) =>
                                                                setPromos(prev =>
                                                                    prev.map(x =>
                                                                        x.id === p.id
                                                                            ? {
                                                                                ...x,
                                                                                usageLimit: e.target.value,
                                                                                noLimit: false
                                                                            }
                                                                            : x
                                                                    )
                                                                )
                                                            }
                                                            disabled={p.noLimit}
                                                            placeholder="Enter limit"
                                                            className="promo-input usage"
                                                        />
                                                        {p.noLimit && (
                                                            <span className="tooltip-text">
            Deselect "No limit" to enter a value
          </span>
                                                        )}
                                                    </div>
                                                    <span className="separator">/</span>
                                                    <button
                                                        type="button"
                                                        className={`toggle-btn ${p.noLimit ? "active" : ""}`}
                                                        onClick={() =>
                                                            setPromos(prev =>
                                                                prev.map(x =>
                                                                    x.id === p.id
                                                                        ? {...x, noLimit: !x.noLimit, usageLimit: ""}
                                                                        : x
                                                                )
                                                            )
                                                        }
                                                    >
                                                        No limit
                                                    </button>
                                                </div>
                                            ) : (
                                                <>{p.noLimit ? "♾️ No limit" : p.usageLimit}</>
                                            )}
                                        </td>

                                        <td>
                                            {editingPromoId === p.id ? (
                                                <input
                                                    type="date"
                                                    value={p.startDate}
                                                    onChange={(e) =>
                                                        setPromos(prev =>
                                                            prev.map(x =>
                                                                x.id === p.id ? {...x, startDate: e.target.value} : x
                                                            )
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <>{p.startDate || "-"}</>
                                            )}
                                        </td>

                                        <td>
                                            {editingPromoId === p.id ? (
                                                <input
                                                    type="date"
                                                    value={p.endDate}
                                                    onChange={(e) =>
                                                        setPromos(prev =>
                                                            prev.map(x =>
                                                                x.id === p.id ? {...x, endDate: e.target.value} : x
                                                            )
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <>{p.endDate || "-"}</>
                                            )}
                                        </td>

                                        <td>
                                            {editingPromoId === p.id ? (
                                                <label className="switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={p.active}
                                                        onChange={() =>
                                                            setPromos(prev =>
                                                                prev.map(x =>
                                                                    x.id === p.id ? {...x, active: !x.active} : x
                                                                )
                                                            )
                                                        }
                                                    />
                                                    <span className="slider"/>
                                                </label>
                                            ) : (
                                                <>{p.active ? "✅ Active" : "❌ Inactive"}</>
                                            )}
                                        </td>

                                        <td>
                                            <div className="actions">
                                                {editingPromoId === p.id ? (
                                                    <>
                                                        <button
                                                            className="save-btn-2"
                                                            onClick={() => updatePromo(p.id, p)}
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            className="cancel-btn"
                                                            onClick={() => setEditingPromoId(null)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            className="remove-btn"
                                                            onClick={() => setSelectedPromo(p)}
                                                        >
                                                            Remove
                                                        </button>
                                                        <button
                                                            className="edit-btn"
                                                            onClick={() => setEditingPromoId(p.id)}
                                                        >
                                                            Edit
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {newPromo && (
                                    <tr key="new-promo">
                                        <td>
                                            <input
                                                type="text"
                                                value={newPromo.name}
                                                onChange={e => setNewPromo({...newPromo, name: e.target.value})}
                                                className="promo-input"
                                            />
                                        </td>

                                        <td className="toggle-cell-disc">
                                            <button
                                                className={`toggle-btn ${newPromo.discountType === "%" ? "active" : ""}`}
                                                onClick={() => setNewPromo({...newPromo, discountType: "%"})}
                                            >
                                                %
                                            </button>
                                            <span className="separator2">/</span>
                                            <button
                                                className={`toggle-btn ${newPromo.discountType === "€" ? "active" : ""}`}
                                                onClick={() => setNewPromo({...newPromo, discountType: "€"})}
                                            >
                                                €
                                            </button>
                                        </td>

                                        <td>
                                            <input
                                                type="number"
                                                value={newPromo.discountValue}
                                                onChange={e => setNewPromo({
                                                    ...newPromo,
                                                    discountValue: e.target.value
                                                })}
                                                className="promo-input"
                                            />
                                        </td>

                                        <td>
                                            <div className="toggle-cell-usage">
                                                <div className="tooltip-wrapper">
                                                    <input
                                                        type="number"
                                                        value={newPromo.noLimit ? "" : newPromo.usageLimit}
                                                        onChange={e =>
                                                            setNewPromo({
                                                                ...newPromo,
                                                                usageLimit: e.target.value,
                                                                noLimit: false
                                                            })
                                                        }
                                                        disabled={newPromo.noLimit}
                                                        placeholder="Enter limit"
                                                        className="promo-input usage"
                                                    />
                                                    {newPromo.noLimit && (
                                                        <span className="tooltip-text">
                            Deselect "No limit" to enter a value
                        </span>
                                                    )}
                                                </div>
                                                <span className="separator">/</span>
                                                <button
                                                    type="button"
                                                    className={`toggle-btn ${newPromo.noLimit ? "active" : ""}`}
                                                    onClick={() =>
                                                        setNewPromo({
                                                            ...newPromo,
                                                            noLimit: !newPromo.noLimit,
                                                            usageLimit: ""
                                                        })
                                                    }
                                                >
                                                    No limit
                                                </button>
                                            </div>
                                        </td>

                                        <td>
                                            <input
                                                type="date"
                                                value={newPromo.startDate}
                                                onChange={e => setNewPromo({...newPromo, startDate: e.target.value})}
                                            />
                                        </td>

                                        <td>
                                            <input
                                                type="date"
                                                value={newPromo.endDate}
                                                onChange={e => setNewPromo({...newPromo, endDate: e.target.value})}
                                            />
                                        </td>

                                        <td>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={newPromo.active}
                                                    onChange={() => setNewPromo({
                                                        ...newPromo,
                                                        active: !newPromo.active
                                                    })}
                                                />
                                                <span className="slider"/>
                                            </label>
                                        </td>

                                        <td>
                                            <div className="actions">
                                                <button className="save-btn-2" onClick={saveNewPromo}>Save</button>
                                                <button className="cancel-btn" onClick={() => setNewPromo(null)}>Cancel
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}


                                </tbody>


                            </table>
                        </div>
                        <div className="add-btn-class">
                            <button
                                className="add-btn"
                                disabled={!!newPromo}
                                onClick={() => setNewPromo({...emptyPromo})}
                            >
                                Add
                            </button>

                        </div>


                    </div>
                </div>
            )}

            {selectedPromo && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Delete Promo</h2>
                        <p>Are you sure you want to delete {selectedPromo.name}?</p>
                        <div className="gap-it">
                            <button
                                className="remove-btn"
                                onClick={() => {
                                    deletePromo(selectedPromo.id);
                                    setSelectedPromo(null);
                                }}

                            >
                                Yes, delete
                            </button>
                            <button
                                className="edit-btn"
                                onClick={() => setSelectedPromo(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )
            }


        </div>
    )
}