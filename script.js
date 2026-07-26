// ======================
// Imports
// ======================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    increment,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";



// ======================
// DOM Elements
// ======================

const productsContainer = document.getElementById("products");
const featuredContainer = document.getElementById("featuredProducts");
const bestDealsContainer = document.getElementById("bestDeals");
const newArrivalsContainer = document.getElementById("newArrivals");
const trendingContainer = document.getElementById("trendingProducts");
const popularContainer = document.getElementById("popularProducts");
const recentlyViewedContainer = document.getElementById("recentlyViewedProducts");

const dynamicCategories = document.getElementById("dynamicCategories");
const dynamicMoreCategories = document.getElementById("dynamicMoreCategories");
const dynamicBanners = document.getElementById("dynamicBanners");

const searchInput = document.getElementById("searchInput");

const sortProducts = document.getElementById("sortProducts");

const pageNumber = document.getElementById("pageNumber");
const nextPageBtn = document.getElementById("nextPage");
const prevPageBtn = document.getElementById("prevPage");

const wishlistCount = document.getElementById("wishlistCount");

// ======================
// Global Variables
// ======================

let currentPage = 1;
const productsPerPage = 20;

let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

let recentlyViewed =
    JSON.parse(localStorage.getItem("recentlyViewed")) || [];

let banners = [];

let categories = [];

let allProducts = [];

// ======================
// AliExpress Worker URL
// ======================

const API_URL =
    "https://quiet-haze-9edd.benarkalarey.workers.dev/";

// ======================
// API Helper
// ======================

async function fetchAliExpressProducts(keyword = "phone") {

    const response = await fetch(
        `${API_URL}?keywords=${encodeURIComponent(keyword)}`
    );

    if (!response.ok) {

        const errorText = await response.text();
        throw new Error(errorText);

    }

    return await response.json();

}

// ======================
// Helpers
// ======================

function clearSections() {

    if (productsContainer) productsContainer.innerHTML = "";

    if (featuredContainer) featuredContainer.innerHTML = "";

    if (bestDealsContainer) bestDealsContainer.innerHTML = "";

    if (newArrivalsContainer) newArrivalsContainer.innerHTML = "";

    if (trendingContainer) trendingContainer.innerHTML = "";

    if (popularContainer) popularContainer.innerHTML = "";

}

function updateWishlistCount() {

    if (wishlistCount) {

        wishlistCount.textContent = wishlist.length;

    }

}

function saveWishlist() {

    localStorage.setItem(
        "wishlist",
        JSON.stringify(wishlist)
    );

    updateWishlistCount();

}

function initWishlist() {

    document.querySelectorAll(".favorite").forEach(btn => {

        const id = btn.dataset.id;

        const isSaved = wishlist.some(item =>
            (typeof item === "object" ? item.id : item) === id
        );

        if (isSaved) {

            btn.classList.add("active");
            btn.textContent = "♥";

        } else {

            btn.classList.remove("active");
            btn.textContent = "♡";

        }

        // Remove any previously attached listener before adding a new one
        btn.replaceWith(btn.cloneNode(true));

    });

    // Re-select after cloning, then attach fresh listeners
    document.querySelectorAll(".favorite").forEach(btn => {

        const id = btn.dataset.id;

        btn.addEventListener("click", () => {

            const alreadySaved = wishlist.some(item =>
                (typeof item === "object" ? item.id : item) === id
            );

            if (alreadySaved) {

                wishlist = wishlist.filter(item =>
                    (typeof item === "object" ? item.id : item) !== id
                );

                btn.classList.remove("active");
                btn.textContent = "♡";

            } else {

                const product = allProducts.find(p => String(p.id) === String(id));

                if (product) {

                    wishlist.push({
                        id: String(id),
                        title: product.title,
                        image: product.image,
                        price: product.price
                    });

                    btn.classList.add("active");
                    btn.textContent = "♥";

                }

            }

            saveWishlist();

        });

    });

}



// ======================
// Recently Viewed
// ======================

function saveRecentlyViewed(product) {

    recentlyViewed = recentlyViewed.filter(

        item => item.id !== product.id

    );

    recentlyViewed.unshift(product);

    recentlyViewed = recentlyViewed.slice(0, 10);

    localStorage.setItem(

        "recentlyViewed",

        JSON.stringify(recentlyViewed)

    );

}

function loadRecentlyViewed() {

    if (!recentlyViewedContainer) return;

    recentlyViewedContainer.innerHTML = "";

    recentlyViewed.forEach(product => {

        recentlyViewedContainer.innerHTML += productCard(

            product.id,

            product

        );

    });

}
// ======================
// Categories
// ======================

async function loadCategoriesMenu() {

    if (!dynamicCategories) return;

    dynamicCategories.innerHTML = "";

    try {

        const snapshot = await getDocs(collection(db, "categories"));

        categories = [];

        snapshot.forEach(doc => {

            categories.push(doc.data());

        });

        categories.slice(0, 6).forEach(category => {

            dynamicCategories.innerHTML += `
                <a href="index.html?category=${encodeURIComponent(category.name)}">
                   ${category.icon || "📦"} ${category.name}
                </a>
            `;

        });

        

    } catch (err) {

        console.error(err);

    }

}

// ======================
// More Categories
// ======================

async function loadMoreCategoriesMenu() {

    if (!dynamicMoreCategories) return;

    dynamicMoreCategories.innerHTML = "";

    try {

        if (categories.length === 0) {

            const snapshot = await getDocs(
                collection(db, "categories")
            );

            categories = [];

            snapshot.forEach(doc => {

                categories.push(doc.data());

            });

        }

                categories.slice(6).forEach(category => {

            dynamicMoreCategories.innerHTML += `
                <a href="index.html?category=${encodeURIComponent(category.name)}">
                   ${category.icon || "📦"} ${category.name}
                </a>
            `;

        });


    } catch (err) {

        console.error(err);

    }

}

// ======================
// Category Filter
// ======================

function activateCategoryFilter() {

    document.querySelectorAll("[data-filter]")

    .forEach(btn => {

        btn.onclick = e => {

            e.preventDefault();

            const filter = btn.dataset.filter;

            filterProducts(filter);

        };

    });

}

function filterProducts(category) {

    if (!productsContainer) return;

    const cards = productsContainer.querySelectorAll(".product");

    cards.forEach(card => {

        if (

            category === "all" ||

            card.dataset.category === category

        ) {

            card.style.display = "block";

        } else {

            card.style.display = "none";

        }

    });

}

// ======================
// Banners
// ======================

async function loadBanners() {

    if (!dynamicBanners) return;

    dynamicBanners.innerHTML = "";

    try {

        const snapshot = await getDocs(collection(db, "banners"));

        banners = [];

        snapshot.forEach(doc => {

            banners.push(doc.data());

        });

        banners.forEach((banner, index) => {

            dynamicBanners.innerHTML += `

            <div class="slide ${index === 0 ? "active" : ""}">

                <img src="${banner.image}" alt="${banner.title}">

                <div class="hero-content">

                    <h1>${banner.title}</h1>

                    <p>${banner.subtitle || ""}</p>

                    <a href="#products" class="hero-btn">

                        ${banner.button || "Shop Now"}

                    </a>

                </div>

            </div>

            `;

        });

        initSlider();

    } catch (err) {

        console.error(err);

    }

}

// ======================
// Hero Slider
// ======================

function initSlider() {

    const slides = document.querySelectorAll(".slide");

    const next = document.querySelector(".next");

    const prev = document.querySelector(".prev");

    if (!slides.length) return;

    let current = 0;

    function showSlide(index) {

        slides.forEach(slide =>

            slide.classList.remove("active")

        );

        slides[index].classList.add("active");

    }

    next?.addEventListener("click", () => {

        current++;

        if (current >= slides.length) current = 0;

        showSlide(current);

    });

    prev?.addEventListener("click", () => {

        current--;

        if (current < 0) current = slides.length - 1;

        showSlide(current);

    });

    setInterval(() => {

        current++;

        if (current >= slides.length) current = 0;

        showSlide(current);

    }, 5000);

}

// ======================
// Product Card
// ======================

function productCard(id, data) {

    return `

    <div class="product"
         data-id="${id}"
         data-category="${data.category || "All"}">

        <div class="badge">

            🛍️ AliExpress

        </div>

        ${data.discount ? `

        <div class="discount">

            ${data.discount}

        </div>

        ` : ""}

        <div class="favorite"

             data-id="${id}">

            ♡

        </div>

        <a href="product.html?id=${id}">

            <img
                src="${data.image}"
                referrerpolicy="no-referrer"
                onerror="this.style.opacity='0.3';"
                alt="${data.title}"
                loading="lazy" decoding="async">


        </a>


        <h2>

            ${data.title}

        </h2>

        <div class="rating">

            ⭐ ${data.rating || "0"}

            <span>

                (${data.reviews || 0})

            </span>

        </div>

        <p class="price">

            <span class="new-price">

                $${data.price}

            </span>

            ${data.originalPrice ? `

            <span class="old-price">

                $${data.originalPrice}

            </span>

            ` : ""}

        </p>

        <p class="shipping">

            🚚 Free Shipping

        </p>

        <a
            href="${data.link}"
            target="_blank"
            rel="noopener"
            class="buy-btn">

            🔥 Get Best Price

        </a>

    </div>

    `;

}

// ======================
// Load All Products
// ======================


// ======================
// Category name -> AliExpress search keyword
// ======================
const categoryKeywordMap = {
    "Bags": "bags",
    "Books": "books",
    "Toys": "toys",
    "Audio": "headphones speaker",
    "Accessories": "accessories",
    "Shoes": "shoes",
    "PC": "desktop computer",
    "Baby": "baby products",
    "Automotive": "car accessories",
    "Home & Kitchen": "home kitchen",
    "Pet Supplies": "pet supplies",
    "Fashion": "fashion clothes",
    "TVs": "television",
    "Phones": "phone",
    "Gaming": "gaming",
    "Furniture": "furniture",
    "Sport": "sport equipment",
    "Beauty": "beauty makeup",
    "Laptops": "laptop",
    "Cameras": "camera",
    "Smart Watches": "smart watch"
};

async function loadAllProducts() {

    clearSections();

    const keyword = searchInput?.value?.trim() || "";

    const urlParams = new URLSearchParams(window.location.search);
    const categoryFilter = urlParams.get("category");


    try {

        // 1) Get my own products from Firestore
        const snapshot = await getDocs(collection(db, "products"));

        const myProducts = [];

        snapshot.forEach(docItem => {

            const data = docItem.data();

            myProducts.push({
                id: docItem.id,
                ...data
            });

        });

        // Filter my products by search keyword or category
                let filteredMyProducts = myProducts;

                if (categoryFilter) {
                    filteredMyProducts = myProducts.filter(item =>
                        item.category === categoryFilter
                    );
                } else if (keyword) {
                    filteredMyProducts = myProducts.filter(item =>
                        item.title?.toLowerCase().includes(keyword.toLowerCase())
                    );
                }


        allProducts = [...filteredMyProducts];

        // 2) Get manually picked AliExpress products (chosen by you in admin panel)
        //    These are the ONLY AliExpress products allowed into Featured / Best Deal / New Arrival
        try {

            const manualSnapshot = await getDocs(collection(db, "aliManualProducts"));

            const manualProducts = [];

            manualSnapshot.forEach(docItem => {

                manualProducts.push({
                    id: docItem.id,
                    ...docItem.data()
                });

            });

            let filteredManual = manualProducts;

            if (keyword) {
                filteredManual = manualProducts.filter(item =>
                    item.title?.toLowerCase().includes(keyword.toLowerCase())
                );
            }

            allProducts = [...allProducts, ...filteredManual];

        } catch (err) {

            console.error("Manual AliExpress Products Error:", err);

        }

        renderProducts();

        // 3) Build the list of AliExpress category searches (for the main Products list only —
                //    these NEVER appear in Featured / Best Deal / New Arrival)
                let aliCategoryList = [];

                if (categoryFilter) {

                    // A specific category was clicked — load ONLY that category, fast
                    aliCategoryList = [
                        {
                            name: categoryFilter,
                            keyword: categoryKeywordMap[categoryFilter] || categoryFilter
                        }
                    ];

                } else if (keyword) {

                    aliCategoryList = [
                        { name: "All", keyword: keyword }
                    ];

                } else {


            if (categories.length === 0) {

                const catSnapshot = await getDocs(collection(db, "categories"));

                categories = [];

                catSnapshot.forEach(doc => {
                    categories.push(doc.data());
                });

            }

            aliCategoryList = categories
                .filter(cat => cat.name)
                .map(cat => ({
                    name: cat.name,
                    keyword: categoryKeywordMap[cat.name] || cat.name
                }));

            if (aliCategoryList.length === 0) {
                aliCategoryList = [{ name: "All", keyword: "phone" }];
            }

        }

        // 4) Get AliExpress products for each category (one at a time, to avoid rate limits / aborts)
        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        for (const cat of aliCategoryList) {

            let data = null;

            try {

                data = await fetchAliExpressProducts(cat.keyword);

            } catch (err) {

                console.error("AliExpress Error for", cat.name, "- retrying...", err);

                await delay(800);

                try {

                    data = await fetchAliExpressProducts(cat.keyword);

                } catch (err2) {

                    console.error("AliExpress Error for", cat.name, "- skipped", err2);

                }

            }

            if (data) {

                const rawProducts =
                    data
                    ?.aliexpress_affiliate_product_query_response
                    ?.resp_result
                    ?.result
                    ?.products
                    ?.product || [];

                const mapped = rawProducts.map(item => ({

                    id: item.product_id,
                    title: item.product_title || item.title || "No Title",
                    image: item.product_main_image_url,
                    price: Number(item.target_sale_price || 0),
                    originalPrice: Number(item.target_original_price || 0),
                    discount: item.discount || "",
                    link: item.product_detail_url,
                    rating: item.evaluate_rate || "0",
                    reviews: item.lastest_volume || 0,
                    category: cat.name,
                    featured: false,
                    bestDeal: false,
                    newArrival: false,
                    clicks: 0

                }));

                // Save these locally so product.html can find them later
                let aliCache = JSON.parse(localStorage.getItem("aliProductsCache")) || {};

                mapped.forEach(item => {
                    aliCache[String(item.id)] = item;
                });

                localStorage.setItem("aliProductsCache", JSON.stringify(aliCache));

                allProducts = [...allProducts, ...mapped];

                renderProducts();

            }

            await delay(500);

        }

    } catch (error) {

        console.error("AliExpress Error:", error);

        if (productsContainer) {

            productsContainer.innerHTML = `

                <div style="padding:40px;text-align:center">

                    <h2>❌ Failed to load products</h2>

                    <p>${error.message}</p>

                </div>

            `;

        }

    }

}


// ======================
// Render Products (no re-fetching — just displays allProducts)
// ======================
function renderProducts() {

    clearSections();

    if (sortProducts) {

        switch (sortProducts.value) {

            case "price-low":
                allProducts.sort((a, b) => a.price - b.price);
                break;

            case "price-high":
                allProducts.sort((a, b) => b.price - a.price);
                break;

            case "name-asc":
                allProducts.sort((a, b) =>
                    a.title.localeCompare(b.title)
                );
                break;

            case "name-desc":
                allProducts.sort((a, b) =>
                    b.title.localeCompare(a.title)
                );
                break;

        }

    }

    const start = (currentPage - 1) * productsPerPage;

    const end = start + productsPerPage;

    const pageProducts = allProducts.slice(start, end);

    const popularProducts = allProducts.slice(0, 8);

    popularProducts.forEach(item => {

        if (popularContainer) {

            popularContainer.innerHTML += productCard(item.id, item);

        }

    });

        pageProducts.forEach(item => {

        const card = productCard(item.id, item);

        if (productsContainer) {

            productsContainer.innerHTML += card;

        }

        if (featuredContainer && item.featured) {

            featuredContainer.innerHTML += card;

        }

        if (bestDealsContainer && item.bestDeal) {

            bestDealsContainer.innerHTML += card;

        }

        if (newArrivalsContainer && item.newArrival) {

            newArrivalsContainer.innerHTML += card;

        }

    });


    activateCategoryFilter();

    loadRecentlyViewed();

    initWishlist();

    updateWishlistCount();

}



// ======================
// Search
// ======================

if (searchInput) {

    searchInput.addEventListener("keyup", () => {

        currentPage = 1;

        loadAllProducts();

    });

}

// ======================
// Sort
// ======================

if (sortProducts) {

    sortProducts.addEventListener("change", () => {

        currentPage = 1;

        renderProducts();

    });

}






// ======================
// Pagination
// ======================

if (nextPageBtn) {

    nextPageBtn.addEventListener("click", () => {

        currentPage++;

        if (pageNumber) {

            pageNumber.textContent = currentPage;

            
        }

        renderProducts();

    });

}

if (prevPageBtn) {

    prevPageBtn.addEventListener("click", () => {

        if (currentPage > 1) {

            currentPage--;

            if (pageNumber) {

                pageNumber.textContent = currentPage;

            }

            renderProducts();

        }

    });

}


// ======================
// More Menu
// ======================

const moreBtn = document.getElementById("moreBtn");

const dropdown = document.querySelector(".dropdown-content");

if (moreBtn && dropdown) {

    moreBtn.addEventListener("click", e => {

        e.stopPropagation();

        dropdown.classList.toggle("show");

    });

    document.addEventListener("click", e => {

        if (

            !dropdown.contains(e.target) &&

            e.target !== moreBtn

        ) {

            dropdown.classList.remove("show");

        }

    });

}

// ======================
// Init
// ======================

loadCategoriesMenu();

loadMoreCategoriesMenu();

loadBanners();

loadAllProducts();