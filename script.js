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

        const container =
            data.featured
                ? document.getElementById("featuredProducts")
                : document.getElementById("products");

        if (!container) return;

        container.innerHTML += `
            <div class="product" data-category="${data.category}">

                <div class="badge">
                    🔥 HOT DEAL
                </div>
                
                <div class="discount">
                    -30%
                </div>
                <div class="wishlist">
                    ❤️
                </div>
                <div class="favorite">♡</div>

                <a href="product.html?id=${product.id}">
                    <img src="${data.image}" alt="${data.title}">
                </a>

                <h2>${data.title}</h2>

                <div class="rating">

                    ⭐ ${data.rating || 0}

                    <span>
                        (${data.reviews || 0} Reviews)
                    </span>

                </div>
                
                <p class="price">$${data.price}</p>

                <p class="shipping">

                🚚 Free Shipping

                </p>

                <a href="${data.link}" target="_blank" class="buy-btn">

                🔥 Get Best Price

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

// ======================
// Featured Products
// ======================

async function loadFeaturedProducts() {

    const featuredContainer = document.getElementById("featuredProducts");

    if (!featuredContainer) return;

    featuredContainer.innerHTML = "";

    const snapshot = await getDocs(collection(db, "products"));

    snapshot.forEach((product) => {

        const data = product.data();

        if (!data.featured) return;

        featuredContainer.innerHTML += `

        <div class="product">

            <span class="favorite">⭐</span>

            <img src="${data.image}" alt="${data.title}">

            <h2>${data.title}</h2>

            <p>$${data.price}</p>

            <a href="${data.link}" target="_blank" class="buy-btn">
                Buy Now
            </a>

        </div>

        `;

    });

}

// ======================
// Best Deals
// ======================

async function loadBestDeals() {

    const bestDeals = document.getElementById("bestDeals");

    if (!bestDeals) return;

    bestDeals.innerHTML = "";

    const snapshot = await getDocs(collection(db, "products"));

    snapshot.forEach((product) => {

        const data = product.data();

        if (!data.bestDeal) return;

        bestDeals.innerHTML += `

        <div class="product">

            <img src="${data.image}" alt="${data.title}">

            <h2>${data.title}</h2>

            <p>$${data.price}</p>

            <a href="${data.link}" target="_blank" class="buy-btn">

                🔥 Get Best Price

            </a>

        </div>

        `;

    });

}

// ======================
// New Arrivals
// ======================

async function loadNewArrivals() {

    const newArrivals = document.getElementById("newArrivals");

    if (!newArrivals) return;

    newArrivals.innerHTML = "";

    const snapshot = await getDocs(collection(db, "products"));

    snapshot.forEach((product) => {

        const data = product.data();


        if (!data.newArrival) return;

        newArrivals.innerHTML += `

        <div class="product">

            <img src="${data.image}" alt="${data.title}">

            <h2>${data.title}</h2>

            <p>$${data.price}</p>

            <a href="${data.link}" target="_blank" class="buy-btn">

                🛒 Shop Now

            </a>

        </div>

        `;

    });

}

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


loadFeaturedProducts();

loadBestDeals();

loadNewArrivals();