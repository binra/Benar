import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const container = document.getElementById("wishlistProducts");

function loadWishlist() {

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

    wishlist.forEach((item) => {

        // Support both old format (just an id string) and new format (full object)
        const id = typeof item === "object" ? item.id : item;
        const title = typeof item === "object" ? item.title : "Product";
        const image = typeof item === "object" ? item.image : "";
        const price = typeof item === "object" ? item.price : 0;

        container.innerHTML += `
        <div class="product">

            <img
                src="${data.image}"
                referrerpolicy="no-referrer"
                onerror="this.style.opacity='0.3';"
                alt="${data.title}"
                loading="lazy" decoding="async">


            <h2>${title}</h2>

            <p class="price">$${price}</p>

            <a href="product.html?id=${id}" class="buy-btn">
                View Product
                
            </a>

            <button class="remove-btn" data-id="${id}">
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

    wishlist = wishlist.filter(item => {
        const itemId = typeof item === "object" ? item.id : item;
        return itemId !== id;
    });

    localStorage.setItem("wishlist", JSON.stringify(wishlist));

    loadWishlist();

});
