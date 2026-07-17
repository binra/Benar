import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// ======================
// Elements
// ======================

const productsContainer = document.getElementById("products");
const featuredContainer = document.getElementById("featuredProducts");
const bestDealsContainer = document.getElementById("bestDeals");
const newArrivalsContainer = document.getElementById("newArrivals");

const searchInput = document.getElementById("searchInput");

// ======================
// Product Card
// ======================

function productCard(id, data) {

    return `

    <div class="product" data-category="${data.category}" data-id="${id}">

        <div class="badge">
            🔥 HOT DEAL
        </div>

        <div class="discount">
            -30%
        </div>

        <div class="wishlist">
            ❤️
        </div>

        <div class="favorite" data-id="${id}">♡</div>

        <a href="product.html?id=${id}">

            <img src="${data.image}" alt="${data.title}">

        </a>

        <h2>${data.title}</h2>

        <div class="rating">

            ⭐ ${data.rating || 0}

            <span>

                (${data.reviews || 0} Reviews)

            </span>

        </div>

        ${data.description ? `
        <p class="product-desc">
            ${data.description}
        </p>
        ` : ""}

        <p class="price">

            $${data.price}

        </p>

        <p class="shipping">

            🚚 Free Shipping

        </p>

        <a
            href="${data.link}"
            target="_blank"
            class="buy-btn">

            🔥 Get Best Price

        </a>

    </div>

    `;


    
}

// ======================
// Clear Sections
// ======================

function clearSections() {

    if (productsContainer)
        productsContainer.innerHTML = "";

    if (featuredContainer)
        featuredContainer.innerHTML = "";

    if (bestDealsContainer)
        bestDealsContainer.innerHTML = "";

    if (newArrivalsContainer)
        newArrivalsContainer.innerHTML = "";

}

// ======================
// Load All Products
// ======================

async function loadAllProducts() {

    clearSections();

    const snapshot = await getDocs(collection(db, "products"));

    snapshot.forEach((product) => {

        const data = product.data();

        const card = productCard(product.id, data);

        // Featured Products
        if (data.featured) {

            if (featuredContainer) {

                featuredContainer.innerHTML += card;

            }

        }


        // Best Deals
        if (data.bestDeal) {

            if (bestDealsContainer) {

                bestDealsContainer.innerHTML += card;

            }

        }

        // New Arrivals
        if (data.newArrival) {

            if (newArrivalsContainer) {

                newArrivalsContainer.innerHTML += card;

            }

        }

        // Main Products
        if (productsContainer) {

            productsContainer.innerHTML += card;

        }

    });

    activateCategoryFilter();


}

// ======================
// Search
// ======================

if (searchInput) {

    searchInput.addEventListener("keyup", () => {

        const value = searchInput.value.toLowerCase().trim();

        document.querySelectorAll(".product").forEach((product) => {

            const title = product.querySelector("h2").textContent.toLowerCase();

            if (title.includes(value)) {

                product.style.display = "block";

            } else {

                product.style.display = "none";

            }

        });

    });

    
}

// ======================
// Category Filter
// ======================

function activateCategoryFilter() {

    const filters = document.querySelectorAll(".menu a");

    filters.forEach((filter) => {

        filter.onclick = (e) => {

            e.preventDefault();

            const category = filter.dataset.filter;

            document.querySelectorAll("#products .product").forEach((product) => {

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

// ======================
// Hero Slider
// ======================

const slides = document.querySelectorAll(".slide");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");

let currentSlide = 0;

function showSlide(index) {

    slides.forEach(slide => slide.classList.remove("active"));

    slides[index].classList.add("active");

}

function nextSlide() {

    currentSlide++;

    if (currentSlide >= slides.length) {

        currentSlide = 0;

    }

    showSlide(currentSlide);

}

function prevSlide() {

    currentSlide--;

    if (currentSlide < 0) {

        currentSlide = slides.length - 1;

    }

    showSlide(currentSlide);

}

if (nextBtn && prevBtn && slides.length > 0) {

    nextBtn.onclick = nextSlide;

    prevBtn.onclick = prevSlide;

    setInterval(nextSlide, 4000);

}
function initWishlist() {

    const favorites = document.querySelectorAll(".favorite");

    favorites.forEach(btn => {

        const id = btn.dataset.id;

        let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

        if (wishlist.includes(id)) {
            btn.textContent = "❤️";
        }

        btn.addEventListener("click", () => {

            wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
            
            if (wishlist.includes(id)) {

                wishlist = wishlist.filter(item => item !== id);
                btn.textContent = "♡";

            } else {

                wishlist.push(id);
                btn.textContent = "❤️";

            }

            localStorage.setItem("wishlist", JSON.stringify(wishlist));

            updateWishlistCount();

        });

    });

}

function updateWishlistCount() {

    const count = document.getElementById("wishlistCount");

    if (!count) return;

    const wishlist =
        JSON.parse(localStorage.getItem("wishlist")) || [];

    count.textContent = wishlist.length;

}

// ======================
// Init
// ======================

loadAllProducts().then(initWishlist);
updateWishlistCount();