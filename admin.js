import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,

} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
    signInWithEmailAndPassword,
    
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const email = prompt("Admin Email");
const password = prompt("Admin Password");

async function login() {
    try {
        await signInWithEmailAndPassword(auth, email, password);

        loadProducts();

        loadDashboard();

    } catch (e) {
        alert("Wrong email or password");
        window.location.href = "index.html";
    }
}

login();
const form = document.getElementById("productForm");
const adminProducts = document.getElementById("adminProducts");

let editingId = null;
// ======================
// Add product
// ======================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const title = document.getElementById("title").value;

    const price = Number(
        document.getElementById("price").value
    );

    const image = document.getElementById("image").value;

    const category = document.getElementById("category").value;

    const link = document.getElementById("link").value;
    if (!link) {
    alert("Affiliate Link is required.");
    return;
}
    const description =
        document.getElementById("description").value;

    if (editingId) {

    await updateDoc(doc(db, "products", editingId), {

        title,
        price,
        image,
        category,
        link,
        description

    });

    editingId = null;

    alert("Product Updated Successfully â");

} else {

    await addDoc(collection(db, "products"), {

        title,
        price,
        image,
        category,
        link,
        description

    });

alert("Product Added Successfully ✅");

loadProducts();
loadDashboard();
}

    form.reset();

    loadProducts();

});

// ======================
// Load Products
// ======================

async function loadProducts() {

    adminProducts.innerHTML = "";

    const snapshot = await getDocs(
        collection(db, "products")
    );

    snapshot.forEach((product) => {

        const data = product.data();

        adminProducts.innerHTML += `

            <div class="product">

    <img
        src="${data.image}"
        alt="${data.title}"
    >

    <h3>${data.title}</h3>

    <p>$${data.price}</p>

    <a href="${data.link}" target="_blank">
        Amazon Link
    </a>
    <small>${data.category}</small>

    <br><br>

    <button class="delete-btn" data-id="${product.id}">
        Delete
    </button>

    <button class="edit-btn" data-id="${product.id}">
        Edit
    </button>

</div>

        `;

    });

console.log("Delete buttons activated");
document.querySelectorAll(".delete-btn").forEach(button => {

    button.onclick = async () => {

        if (!confirm("Delete this product?")) return;

        await deleteDoc(
            doc(db, "products", button.dataset.id)
        );

        loadProducts();

    };

});
document.querySelectorAll(".edit-btn").forEach(button => {

    button.onclick = async () => {

        editingId = button.dataset.id;

        const snapshot = await getDocs(collection(db, "products"));

        snapshot.forEach((product) => {

            if (product.id === editingId) {

                const data = product.data();

                document.getElementById("title").value = data.title;
                document.getElementById("price").value = data.price;
                document.getElementById("image").value = data.image;
                document.getElementById("category").value = data.category;
                document.getElementById("link").value = data.link;
                document.getElementById("description").value = data.description;

            }

        });

    };

});

}




document.querySelectorAll(".cancel-btn").forEach(button => {

    button.onclick = async () => {

    try {

        await updateDoc(
            doc(db, "orders", button.dataset.id),
            {
                status: "Cancelled"
            }
        );

        alert("Cancelled â");

    
        loadDashboard();
    } catch (e) {

        alert(e.message);

    }

};

});


async function loadDashboard() {

    const productsSnapshot = await getDocs(collection(db, "products"));
    totalProducts.textContent = productsSnapshot.size;

    const ordersSnapshot = await getDocs(collection(db, "orders"));

    totalOrders.textContent = ordersSnapshot.size;

    let pending = 0;
    let completed = 0;
    let cancelled = 0;

    ordersSnapshot.forEach(order => {

        const status = order.data().status || "Pending";

        if (status === "Pending") pending++;
        if (status === "Completed") completed++;
        if (status === "Cancelled") cancelled++;

    });

    pendingOrders.textContent = pending;
    completedOrders.textContent = completed;
    cancelledOrders.textContent = cancelled;

}
