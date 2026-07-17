import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const container = document.getElementById("wishlistProducts");

async function loadWishlist() {

    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    container.innerHTML = "";

    if (wishlist.length === 0) {

        container.innerHTML = `
            <h2 style="text-align:center;width:100%;">
                ❤️ Your wishlist is empty
            </h2>
        `;

        return;
    }

    const snapshot = await getDocs(collection(db, "products"));

    snapshot.forEach((doc) => {

        if (!wishlist.includes(doc.id)) return;

        const data = doc.data();

        container.innerHTML += `
        <div class="product">

            <img src="${data.image}" alt="${data.title}">

            <h2>${data.title}</h2>

            <p class="price">$${data.price}</p>

            <a href="product.html?id=${doc.id}" class="buy-btn">

                View Product

            </a>

            <button class="remove-btn" data-id="${doc.id}">
                ❌ Remove
            </button>

        </div>
        `;

    });

}

loadWishlist();

document.addEventListener("click", (e) => {

    if (!e.target.classList.contains("remove-btn")) return;

    const id = e.target.dataset.id;

    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    wishlist = wishlist.filter(item => item !== id);

    localStorage.setItem("wishlist", JSON.stringify(wishlist));

    loadWishlist();

});