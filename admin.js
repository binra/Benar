import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const email = prompt("Admin Email");
const password = prompt("Admin Password");

await signInWithEmailAndPassword(auth, email, password);


const form = document.getElementById("productForm");
const adminProducts = document.getElementById("adminProducts");
const featured = document.getElementById("featured");
const bestDeal = document.getElementById("bestDeal");
const newArrival = document.getElementById("newArrival");
const description = document.getElementById("description");
const title = document.getElementById("title");
const price = document.getElementById("price");
const image = document.getElementById("image");
const category = document.getElementById("category");
const link = document.getElementById("link");
let editingId = null;



form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const product = {

        title: title.value,

        price: Number(price.value),

        image: image.value,

        category: category.value,

        link: link.value,

        description: description.value,
       
        featured: featured.checked,

        bestDeal: bestDeal.checked,

        newArrival: newArrival.checked,
    };


    if (!product.link) {

        alert("Affiliate Link Required");

        return;

    }

    if (editingId) {

        await updateDoc(
            doc(db, "products", editingId),
            product
        );

        editingId = null;

        alert("Updated ✅");

    } else {

        await addDoc(
            collection(db, "products"),
            product
        );

        alert("Added ✅");

    }

    form.reset();

    loadProducts();

});



async function loadProducts() {

    adminProducts.innerHTML = "";

    const snapshot = await getDocs(
        collection(db, "products")
    );

    snapshot.forEach(product => {

        const data = product.data();

        adminProducts.innerHTML += `

<div class="product">

<img src="${data.image}">

<h3>${data.title}</h3>

<p>$${data.price}</p>

<a href="${data.link}" target="_blank">
🛒 Buy Now
</a>

<br><br>

<button class="edit-btn"
data-id="${product.id}">
Edit
</button>

<button class="delete-btn"
data-id="${product.id}">
Delete
</button>
</div>

`;

    });

    document.querySelectorAll(".delete-btn").forEach(btn => {

        btn.onclick = async () => {

            if (!confirm("Delete Product?")) return;

            await deleteDoc(
                doc(db, "products", btn.dataset.id)
            );

            loadProducts();

        };

    });

    document.querySelectorAll(".edit-btn").forEach(btn => {

        btn.onclick = async () => {

            editingId = btn.dataset.id;

            const snap = await getDoc(
                doc(db, "products", editingId)
            );

            const data = snap.data();

            title.value = data.title;
            price.value = data.price;
            image.value = data.image;
            category.value = data.category;
            link.value = data.link;
            description.value = data.description;
            featured.checked = data.featured || false;
            bestDeal.checked = data.bestDeal || false;
            newArrival.checked = data.newArrival || false;

        };

    });

}

loadProducts();
