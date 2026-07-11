import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const productsContainer = document.getElementById("products");

async function loadProducts() {

    productsContainer.innerHTML = "";

    const snapshot = await getDocs(collection(db, "products"));

    snapshot.forEach((product) => {

        const data = product.data();

        productsContainer.innerHTML += `
            <div class="product" data-category="${data.category}">

                <div class="favorite">♡</div>

                <a href="product.html?id=${product.id}">
                    <img src="${data.image}" alt="${data.title}">
                </a>

                <h2>${data.title}</h2>

                <p>$${data.price}</p>

                <a href="${data.link}" target="_blank" class="buy-btn">
                    Buy on Amazon
                </a>

            </div>
        `;

    });


    activateCategoryFilter();


}

loadProducts();
// Search

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("keyup", () => {

    const value = searchInput.value.toLowerCase();

    document.querySelectorAll(".product").forEach(product => {

        const title = product.querySelector("h2").textContent.toLowerCase();

        if (title.includes(value)) {
            product.style.display = "block";
        } else {
            product.style.display = "none";
        }

    });

});

// Category Filter

function activateCategoryFilter() {

    const filters = document.querySelectorAll(".menu a");

    filters.forEach(filter => {

        filter.onclick = (e) => {

            e.preventDefault();

            const category = filter.dataset.filter;

            document.querySelectorAll(".product").forEach(product => {

                if (
                    category === "all" ||
                    product.dataset.category === category
                ) {

                    product.style.display = "block";

                } else {

                    product.style.display = "none";

                }

            });

        };

    });

}