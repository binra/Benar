import { db } from "./firebase.js";
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
    orderBy,
    query
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const password = prompt("Enter Admin Password");

if (password !== "9NG5Y0FRQEG") {
    alert("Access Denied");
    window.location.href = "index.html";
}

const form = document.getElementById("productForm");
const adminProducts = document.getElementById("adminProducts");
const ordersList = document.getElementById("ordersList");
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

    alert("Product Updated Successfully ✅");

} else {

    await addDoc(collection(db, "products"), {

        title,
        price,
        image,
        category,
        link,
        description

    });


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

loadProducts();

async function loadOrders() {

    ordersList.innerHTML = "";

    const q = query(
        collection(db, "orders"),
        orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    snapshot.forEach((order) => {

        const data = order.data();

        let items = "";

        if (data.items) {

            data.items.forEach(item => {

                items += `<li>${item.name} - $${item.price}</li>`;

            });

        }

        ordersList.innerHTML += `

            <div class="product">
        <h3>🛒 New Order</h3>

                <p><strong>👤 Name:</strong> ${data.customerName}</p>

                <p><strong>📞 Phone:</strong> ${data.customerPhone}</p>

                <p><strong>📍 Address:</strong> ${data.customerAddress}</p>

                <hr>

                <ul>${items}</ul>

                <p><strong>💰 Total:</strong> $${data.total}</p>

                <small>🕒 ${data.createdAt}</small>

            </div>

        `;

    });

}

loadOrders();