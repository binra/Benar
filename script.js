import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    increment
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// ======================
// Elements
// ======================

const productsContainer = document.getElementById("products");
const featuredContainer = document.getElementById("featuredProducts");
const bestDealsContainer = document.getElementById("bestDeals");
const newArrivalsContainer = document.getElementById("newArrivals");
const trendingContainer = document.getElementById("trendingProducts");
const popularContainer = document.getElementById("popularProducts");

const searchInput = document.getElementById("searchInput");
const sortProducts = document.getElementById("sortProducts");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageNumber = document.getElementById("pageNumber");

let currentPage = 1;
const productsPerPage = 12;

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

            <img
                src="${data.image}"
                alt="${data.title}"
                loading="lazy"
                decoding="async">

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
            class="buy-btn"
            data-id="${id}">

            🔥 Get Best Price

        </a>

    </div>

    `;


    
}

async function increaseClick(productId) {

    try {

        const productRef = doc(db, "products", productId);

        await updateDoc(productRef, {
            clicks: increment(1)
        });

    } catch (error) {

        console.error("Click counter error:", error);

    }

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

    if (trendingContainer)
    trendingContainer.innerHTML = "";

    const snapshot = await getDocs(collection(db, "products"));

    let products = [];

    snapshot.forEach((product) => {

        products.push({
            id: product.id,
            ...product.data()
        });

    });

    const popularProducts = [...products]
        .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
        .slice(0, 8);

    if (sortProducts) {

        switch (sortProducts.value) {

            case "price-low":
                products.sort((a, b) => a.price - b.price);
                break;

            case "price-high":
                products.sort((a, b) => b.price - a.price);
                break;

            case "name-asc":
                products.sort((a, b) => a.title.localeCompare(b.title));
                break;

            case "name-desc":
                products.sort((a, b) => b.title.localeCompare(a.title));
                break;

        }

    }
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;

    const pageProducts = products.slice(start, end);

    if (popularContainer) {

        popularContainer.innerHTML = "";

        popularProducts.forEach((item) => {

            popularContainer.innerHTML += productCard(item.id, item);

        });

    }

    pageProducts.forEach((data) => {

        const card = productCard(data.id, data);

        if ((data.clicks || 0) >= 10) {

            if (trendingContainer) {

                trendingContainer.innerHTML += card;

            }

        }

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

    loadRecentlyViewed();

    document.querySelectorAll(".buy-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            increaseClick(btn.dataset.id);

        });

    });

}

// ======================
// Search
// ======================

if (searchInput) {

    searchInput.addEventListener("input", () => {

        const value = searchInput.value.toLowerCase().trim();

        let visibleProducts = 0;

        document.querySelectorAll(".product").forEach((product) => {

            const title =
                product.querySelector("h2")?.textContent.toLowerCase() || "";

            const category =
                product.dataset.category?.toLowerCase() || "";

            if (
                title.includes(value) ||
                category.includes(value)
            ) {

                product.style.display = "block";

                visibleProducts++;

            } else {

                product.style.display = "none";

            }

        });
        const noResults = document.getElementById("noResults");

        if (noResults) {

            noResults.style.display =
                visibleProducts === 0 ? "block" : "none";

        }
         

    });

}

// ======================
// Category Filter
// ======================

const dynamicCategories =
    document.getElementById("dynamicCategories");

const dynamicMoreCategories =
    document.getElementById("dynamicMoreCategories");

async function loadCategoriesMenu() {

    if (!dynamicCategories) return;

    dynamicCategories.innerHTML = "";

    const snapshot = await getDocs(
        collection(db, "categories")
    );

    snapshot.forEach((categoryDoc) => {

        const data = categoryDoc.data();

        if (data.active !== false) {

            dynamicCategories.innerHTML += `

<a href="#"
   data-filter="${data.name}">
   ${data.icon} ${data.name}
</a>

`;

        }

    });

}

async function loadMoreCategoriesMenu() {

    if (!dynamicMoreCategories) return;

    dynamicMoreCategories.innerHTML = "";

    const snapshot = await getDocs(
        collection(db, "categories")
    );

    let count = 0;

    snapshot.forEach((categoryDoc) => {

        const data = categoryDoc.data();

        if (data.active !== false) {

            count++;

            if (count > 4) {

                dynamicMoreCategories.innerHTML += `

<a href="#"
   data-filter="${data.name}">
   ${data.icon} ${data.name}
</a>

`;

            }

        }

    });

}

function activateCategoryFilter() {

    const filters = document.querySelectorAll(".menu a, .dropdown-content a");

    filters.forEach((filter) => {

        filter.addEventListener("click", (e) => {

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

            const dropdown = document.querySelector(".dropdown-content");

            if (dropdown) {

                dropdown.classList.remove("show");

            }

        });

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
function loadRecentlyViewed() {

    const container = document.getElementById("recentlyViewedProducts");

    if (!container) return;

    const viewed =
        JSON.parse(localStorage.getItem("recentlyViewed")) || [];

    container.innerHTML = "";

    viewed.forEach(data => {

        container.innerHTML += productCard(data.id, data);

    });

}
// ======================
// Init
// ======================

loadCategoriesMenu();

loadMoreCategoriesMenu();

loadAllProducts().then(initWishlist);
updateWishlistCount();

if (sortProducts) {

    sortProducts.addEventListener("change", () => {

        loadAllProducts();

    });

}
if (nextPageBtn) {

    nextPageBtn.addEventListener("click", async () => {

        const snapshot = await getDocs(collection(db, "products"));

        const totalProducts = snapshot.size;
        const totalPages = Math.ceil(totalProducts / productsPerPage);

        if (currentPage < totalPages) {

            currentPage++;

            pageNumber.textContent = currentPage;

            loadAllProducts();

        }

    });

}

if (prevPageBtn) {

    prevPageBtn.addEventListener("click", () => {

        if (currentPage > 1) {

            currentPage--;

            pageNumber.textContent = currentPage;

            loadAllProducts();

        }

    });

}
const moreBtn = document.getElementById("moreBtn");
const dropdown = document.querySelector(".dropdown-content");

if (moreBtn && dropdown) {

    moreBtn.addEventListener("click", (e) => {

        e.stopPropagation();

        dropdown.classList.toggle("show");

    });

    document.addEventListener("click", (e) => {

        if (!dropdown.contains(e.target) && e.target !== moreBtn) {

            dropdown.classList.remove("show");

        }

    });

}