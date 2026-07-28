import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


const params = new URLSearchParams(window.location.search);

const id = params.get("id");

const container = document.getElementById("productDetails");
const relatedLimit = 4;

async function loadProduct() {

    if (!id) {
        container.innerHTML = "<h2>Product not found.</h2>";
        return;
    }

    let data = null;
    let isFromFirestore = false;

    // 1) Try Firestore first (my own products)
    const productRef = doc(db, "products", id);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {

        data = { ...productSnap.data() };
        isFromFirestore = true;

    } else {

        // 2) Not in Firestore — check the AliExpress cache saved in localStorage
        const aliCache = JSON.parse(localStorage.getItem("aliProductsCache")) || {};

        if (aliCache[id]) {
            data = aliCache[id];
        }

    }

    if (!data) {
        container.innerHTML = "<h2>Product not found.</h2>";
        return;
    }

    // ======================
    // SEO: set page title + meta tags dynamically per product
    // ======================
    document.title = `${data.title} | BenarStore`;

    function setMetaTag(selector, attr, value) {

        let tag = document.querySelector(selector);

        if (!tag) {

            tag = document.createElement("meta");

            if (selector.includes("property=")) {
                tag.setAttribute("property", attr);
            } else {
                tag.setAttribute("name", attr);
            }

            document.head.appendChild(tag);

        }

        tag.setAttribute("content", value);

    }

    const shortDescription =
        (data.description || data.title || "").slice(0, 155);

    setMetaTag('meta[name="description"]', "description", shortDescription);
    setMetaTag('meta[property="og:title"]', "og:title", `${data.title} | BenarStore`);
    setMetaTag('meta[property="og:description"]', "og:description", shortDescription);
    setMetaTag('meta[property="og:image"]', "og:image", data.image || "");
    setMetaTag('meta[property="og:type"]', "og:type", "product");

    let viewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];


    // Remove if already exists
    viewed = viewed.filter(item => item.id !== id);

    // Add current product to beginning
    viewed.unshift({
        id,
        ...data
    });

    // Keep only last 8 products
    viewed = viewed.slice(0, 8);

    localStorage.setItem(
        "recentlyViewed",
        JSON.stringify(viewed)
    );


    // Related products — only from Firestore (my own products in the same category)
    let relatedProducts = [];

    if (isFromFirestore) {

        const snapshot = await getDocs(collection(db, "products"));

        snapshot.forEach((item) => {

            if (
                item.id !== id &&
                item.data().category === data.category
            ) {

                relatedProducts.push({
                    id: item.id,
                    ...item.data()
                });

            }

        });

        relatedProducts = relatedProducts.slice(0, relatedLimit);

    }

    container.innerHTML = `
        <div class="product-details">

        <div class="image-box">

        ${data.bestSeller ? `

        <div class="badge">

        🏆 Best Seller

        </div>

        ` : ""}
            <img src="${data.image}" alt="${data.title}" class="main-image">

            <div class="details">


                <h1>${data.title}</h1>

                <div class="rating">

                    ⭐ ${data.rating || 0}

                    <span>
                        (${data.reviews || 0} Reviews)
                    </span>

                </div>
                <h2>$${data.price}</h2>

                <p style="color:red;font-size:20px;">
                    ${data.description || ""}
                </p>

                <a href="${data.link}" target="_blank" class="buy-btn">
                    ${isFromFirestore ? "Buy on Amazon" : "Get Best Price"}
                </a>

                <br><br>

                <a href="index.html">
                    ← Back to Home
                </a>

            </div>

        </div>

        ${relatedProducts.length > 0 ? `

        <div class="related-section">

            <h2>You may also like</h2>

            <div class="products">

                ${relatedProducts.map(product => `

                    <div class="product">

                        <a href="product.html?id=${product.id}">

                            <img src="${product.image}" alt="${product.title}">

                            <h3>${product.title}</h3>

                        </a>

                        <p>$${product.price}</p>

                        <a href="${product.link}" target="_blank" class="buy-btn">

                            Get Best Price

                        </a>

                    </div>

                `).join("")}

            </div>

        </div>

        ` : ""}
    `;

    // ======================
    // SEO: Product structured data (JSON-LD)
    // ======================
    const existingLd = document.getElementById("productLdJson");

    if (existingLd) existingLd.remove();

    const ldScript = document.createElement("script");

    ldScript.type = "application/ld+json";
    ldScript.id = "productLdJson";

    ldScript.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": data.title,
        "image": data.image ? [data.image] : [],
        "description": (data.description || data.title || "").slice(0, 300),
        "offers": {
            "@type": "Offer",
            "price": data.price || 0,
            "priceCurrency": "USD",
            "url": window.location.href,
            "availability": "https://schema.org/InStock"
        }
    });

    document.head.appendChild(ldScript);

}

loadProduct();
