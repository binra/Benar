import { db, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  setDoc,
  doc,
  getDoc

} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

// ======================
// AliExpress Worker (used by the manual product picker below)
// ======================
const ALI_API_URL =
    "https://quiet-haze-9edd.benarkalarey.workers.dev/";

async function fetchAliExpressProductsAdmin(keyword = "phone") {

    const response = await fetch(
        `${ALI_API_URL}?keywords=${encodeURIComponent(keyword)}`
    );

    if (!response.ok) {

        const errorText = await response.text();
        throw new Error(errorText);

    }

    return await response.json();

}

const ADMIN_EMAIL = "benar4700@gmail.com";

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    if (user.email !== ADMIN_EMAIL) {

        auth.signOut();

        window.location.href = "login.html";
        return;

    }

});



// Elements
const form = document.getElementById("productForm");
const categorySelect = document.getElementById("category");

async function loadCategories() {

    categorySelect.innerHTML =
        `<option value="">Select Category</option>`;

    const snapshot = await getDocs(collection(db, "categories"));

    snapshot.forEach((doc) => {

        const data = doc.data();

        categorySelect.innerHTML += `
        <option value="${data.name}">
            ${data.icon} ${data.name}
        </option>
        `;

    });

}


const title = document.getElementById("title");

const price = document.getElementById("price");

const image = document.getElementById("image");

const category = document.getElementById("category");

const link = document.getElementById("link");

const description = document.getElementById("description");

const rating = document.getElementById("rating");
const reviews = document.getElementById("reviews");
const featured = document.getElementById("featured");
const bestDeal = document.getElementById("bestDeal");
const newArrival = document.getElementById("newArrival");
const bestSeller = document.getElementById("bestSeller");


const adminProducts = document.getElementById("adminProducts");

const categoryForm = document.getElementById("categoryForm");

const categoryName = document.getElementById("categoryName");

const categoryIcon = document.getElementById("categoryIcon");









const categoryList = document.getElementById("categoryList");

const bannerForm =
    document.getElementById("bannerForm");

const bannerTitle =
    document.getElementById("bannerTitle");

const bannerImage =
    document.getElementById("bannerImage");

const bannerLink =
    document.getElementById("bannerLink");

const bannerList =
    document.getElementById("bannerList");

const topProducts = document.getElementById("topProducts");

let editingId = null;
let editingCategoryId = null;
let editingBannerId = null;

// Save Product
form.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (
        !title.value.trim() ||
        !price.value ||
        !image.value.trim() ||
        !category.value ||
        !link.value.trim()
    ) {
        alert("Please fill in all required fields.");
        return;
    }

    if (Number(price.value) <= 0) {
        alert("Price must be greater than 0.");
        return;
    }

    try {
        new URL(link.value);
    } catch {
        alert("Please enter a valid product link.");
        return;
    }

    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    const product = {
        title: title.value.trim(),
        price: Number(price.value),
        image: image.value.trim(),
        category: category.value.trim(),
        link: link.value.trim(),
        description: description.value.trim(),
        rating: Number(rating.value) || 0,

        reviews: Number(reviews.value) || 0,

        clicks: 0,

        featured: featured.checked,

        bestDeal: bestDeal.checked,
        newArrival: newArrival.checked,
        bestSeller: bestSeller.checked
    };



    if (editingId) {

        await updateDoc(
            doc(db, "products", editingId),
            product
        );

    

        alert("Updated ✅");

        editingId = null;

    } else {

        await addDoc(
            collection(db, "products"),
            product
        );

        alert("Added ✅");

    }

    form.reset();

    submitBtn.disabled = false;
    submitBtn.textContent = "Save Product";

    loadProducts();

});

categoryForm.addEventListener("submit", async (e) => {

    e.preventDefault();



    if (editingCategoryId) {

        await updateDoc(
            doc(db, "categories", editingCategoryId),
            {
                name: categoryName.value.trim(),
                icon: categoryIcon.value.trim()
            }
        );

        editingCategoryId = null;

        categoryForm.querySelector("button").textContent =
            "Add Category";

        alert("Category Updated ✅");

    } else {

        await addDoc(collection(db, "categories"), {

            name: categoryName.value.trim(),

            icon: categoryIcon.value.trim(),

            active: true,

            order: Date.now()

        });

        alert("Category Added ✅");

    }

    categoryForm.reset();

    loadCategories();

    loadCategoryManager();

});

bannerForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (editingBannerId) {

    await updateDoc(

        doc(db, "banners", editingBannerId),

        {

            title: bannerTitle.value.trim(),

            image: bannerImage.value.trim(),

            link: bannerLink.value.trim()

        }

    );

    editingBannerId = null;

    bannerForm.querySelector("button").textContent =
        "Add Banner";

    alert("Banner Updated ✅");

} else {

    await addDoc(collection(db, "banners"), {

        title: bannerTitle.value.trim(),

        image: bannerImage.value.trim(),

        link: bannerLink.value.trim(),

        active: true,

        order: Date.now()

    });

    alert("Banner Added ✅");

}

    bannerForm.reset();

    editingBannerId = null;

    bannerForm.querySelector("button").textContent =
        "Add Banner";

    loadBannerManager();

});

// Load Products
async function loadProducts() {

    adminProducts.innerHTML = "";
    const snapshot = await getDocs(collection(db, "products"));

    let total = 0;
    let featuredCount = 0;
    let dealsCount = 0;
    let sellerCount = 0;
    let totalClicks = 0;

    snapshot.forEach((productDoc) => {

        const data = productDoc.data();

        const search = adminSearch.value.toLowerCase();

        const filter = adminFilter.value;

        if (
            !data.title.toLowerCase().includes(search)
        ) return;

        if (
            filter !== "all" &&
            !data[filter]
        ) return;

        total++;

        if(data.featured) featuredCount++;

        if(data.bestDeal) dealsCount++;

        if(data.bestSeller) sellerCount++;

        totalClicks += data.clicks || 0;

        adminProducts.innerHTML += `
        <div class="product">

        ${data.bestSeller ? `
        <div class="badge">
        🏆 Best Seller
        </div>
        ` : ""}
            <img src="${data.image}" alt="">

            <h3>${data.title}</h3>

            <p>💰 $${data.price}</p>

            <p>👆 Clicks: ${data.clicks || 0}</p>

            <p>⭐ Rating: ${data.rating}</p>

            <p>💬 Reviews: ${data.reviews}</p>

            <button type="button" class="edit-btn"
                data-id="${productDoc.id}">
                Edit
            </button>

            <button type="button" class="delete-btn"
                data-id="${productDoc.id}">
                Delete
            </button>

        </div>
        `;

    });

    document.getElementById("totalProducts").textContent = total;

    document.getElementById("featuredProducts").textContent = featuredCount;

    document.getElementById("bestDeals").textContent = dealsCount;

    document.getElementById("bestSellers").textContent = sellerCount;

    document.getElementById("totalClicks").textContent = totalClicks;

    // Delete
    document.querySelectorAll(".delete-btn").forEach(btn => {

        btn.onclick = async () => {

            if (!confirm("Delete Product?")) return;

            await deleteDoc(
                doc(db, "products", btn.dataset.id)
            );

            loadProducts();

        };

    });

    // Edit
    document.querySelectorAll(".edit-btn").forEach(btn => {

        btn.onclick = async () => {

            editingId = btn.dataset.id;

            const snap = await getDoc(
                doc(db, "products", editingId)
            );

            const data = snap.data();

            title.value = data.title || "";
            price.value = data.price || "";
            image.value = data.image || "";
            category.value = data.category || "";
            link.value = data.link || "";
            description.value = data.description || "";

            rating.value = data.rating || "";
            reviews.value = data.reviews || "";
            featured.checked = data.featured || false;
            bestDeal.checked = data.bestDeal || false;
            newArrival.checked = data.newArrival || false;
            bestSeller.checked = data.bestSeller || false;

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        };

    });

}

async function loadCategoryManager() {

    categoryList.innerHTML = "";
    const snapshot = await getDocs(collection(db, "categories"));

    snapshot.forEach((categoryDoc) => {

        const data = categoryDoc.data();

        categoryList.innerHTML += `

        <div class="product">

            <h3>${data.icon} ${data.name}</h3>

            <button
                type="button"
                class="edit-category"
                data-id="${categoryDoc.id}">
                Edit
            </button>

            <button
                type="button"
                class="delete-category"
                data-id="${categoryDoc.id}">
                Delete
            </button>

        </div>

        `;

    });   



    // Edit Category
    document.querySelectorAll(".edit-category").forEach(btn => {

        btn.onclick = async () => {

            editingCategoryId = btn.dataset.id;

            const snap = await getDoc(
                doc(db, "categories", editingCategoryId)
            );

            const data = snap.data();

            categoryName.value = data.name;

            categoryIcon.value = data.icon;
            
            categoryForm.querySelector("button").textContent =
                "Update Category";

            categoryForm.scrollIntoView({
                behavior: "smooth"
            });

        };

    });

    // Delete Category
    document.querySelectorAll(".delete-category").forEach(btn => {

        btn.onclick = async () => {

            if (!confirm("Delete Category?")) return;

            await deleteDoc(
                doc(db, "categories", btn.dataset.id)
            );

            loadCategories();

            loadCategoryManager();

        };

    });

}

async function loadBannerManager() {

    if (!bannerList) return;

    bannerList.innerHTML = "";

    const snapshot = await getDocs(collection(db, "banners"));

    snapshot.forEach((bannerDoc) => {

        const data = bannerDoc.data();

        bannerList.innerHTML += `

<div class="product">

    <img src="${data.image}" style="width:100%;max-width:250px;">

    <h3>${data.title}</h3>

    <p>${data.link}</p>

    <button
        type="button"
        class="edit-banner"
        data-id="${bannerDoc.id}">
        Edit
    </button>

    <button
        type="button"
        class="delete-banner"
        data-id="${bannerDoc.id}">
        Delete
    </button>

</div>

`;

    });

    document.querySelectorAll(".edit-banner").forEach(btn => {

        btn.onclick = async () => {

            editingBannerId = btn.dataset.id;

            const snap = await getDoc(
            doc(db, "banners", editingBannerId)
            );

            const data = snap.data();

            bannerTitle.value = data.title;
            bannerImage.value = data.image;
            bannerLink.value = data.link;

            bannerForm.querySelector("button").textContent =
                "Update Banner";

            bannerForm.scrollIntoView({
                behavior: "smooth"
            });

        };
    });    
    


    document.querySelectorAll(".delete-banner").forEach(btn => {

        btn.addEventListener("click", async () => {

            if (!confirm("Delete Banner?")) return;

            await deleteDoc(
                doc(db, "banners", btn.dataset.id)
            );

            alert("Banner Deleted ✅");

            loadBannerManager();

        });

    });

}

async function loadTopProducts() {

    if (!topProducts) return;

    topProducts.innerHTML = "";

    const snapshot = await getDocs(collection(db, "products"));

    const products = [];

    snapshot.forEach(doc => {

        products.push({
            id: doc.id,
            ...doc.data()
        });

    });

    products.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));

    products.slice(0, 10).forEach((product, index) => {

        topProducts.innerHTML += `

        <div class="product">

            <h3>
                ${index + 1}. ${product.title}
            </h3>

            <p>👆 Clicks: ${product.clicks || 0}</p>

            <p>💰 $${product.price}</p>

        </div>

        `;

    });

}

async function loadAliClicks() {

    const aliTopContainer = document.getElementById("aliTopProducts");

    if (!aliTopContainer) return;

    aliTopContainer.innerHTML = "";

    const snapshot = await getDocs(collection(db, "aliClicks"));

    const products = [];

    snapshot.forEach(docItem => {

        products.push({
            id: docItem.id,
            ...docItem.data()
        });

    });

    products.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));

    products.slice(0, 10).forEach((product, index) => {

        aliTopContainer.innerHTML += `

        <div class="product">

            <img src="${product.image || ""}" style="width:100%;max-width:150px;">

            <h3>${index + 1}. ${product.title || "Untitled"}</h3>

            <p>👆 Clicks: ${product.clicks || 0}</p>

            <p>💰 $${product.price || 0}</p>

            <p>📂 ${product.category || ""}</p>

        </div>

        `;

    });

}

// ======================
// Manual AliExpress Product Picker
// ======================

const aliSearchInput = document.getElementById("aliSearchInput");
const aliSearchBtn = document.getElementById("aliSearchBtn");
const aliSearchResults = document.getElementById("aliSearchResults");
const aliManualList = document.getElementById("aliManualList");

async function searchAliExpress() {

    if (!aliSearchInput || !aliSearchResults) return;

    const keyword = aliSearchInput.value.trim() || "phone";

    aliSearchResults.innerHTML = "<p>Searching...</p>";

    try {

        const data = await fetchAliExpressProductsAdmin(keyword);

        const rawProducts =
            data
            ?.aliexpress_affiliate_product_query_response
            ?.resp_result
            ?.result
            ?.products
            ?.product || [];

        if (rawProducts.length === 0) {

            aliSearchResults.innerHTML = "<p>No products found.</p>";
            return;

        }

        aliSearchResults.innerHTML = "";

        rawProducts.forEach(item => {

            const id = String(item.product_id);
            const title = item.product_title || "No Title";
            const image = item.product_main_image_url;
            const price = Number(item.target_sale_price || 0);
            const originalPrice = Number(item.target_original_price || 0);
            const discount = item.discount || "";
            const link = item.product_detail_url;
            const rating = item.evaluate_rate || "0";
            const reviews = item.lastest_volume || 0;
            const category = item.first_level_category_name || "All";

            const card = document.createElement("div");
            card.className = "product";

            card.innerHTML = `

                <img src="${image}" style="width:100%;max-width:150px;">

                <h3>${title}</h3>

                <p>💰 $${price}</p>

                <label>
                    <input type="checkbox" class="ali-featured">
                    Featured Products
                </label>

                <label>
                    <input type="checkbox" class="ali-bestdeal">
                    Best Deal
                </label>

                <label>
                    <input type="checkbox" class="ali-newarrival">
                    New Arrival
                </label>

                <button type="button" class="ali-save-btn">
                    ✅ Save to Sections
                </button>

            `;

            card.querySelector(".ali-save-btn").addEventListener("click", async () => {

                const featured = card.querySelector(".ali-featured").checked;
                const bestDeal = card.querySelector(".ali-bestdeal").checked;
                const newArrival = card.querySelector(".ali-newarrival").checked;

                if (!featured && !bestDeal && !newArrival) {
                    alert("Please select at least one section first.");
                    return;
                }

                await setDoc(doc(db, "aliManualProducts", id), {
                    title,
                    image,
                    price,
                    originalPrice,
                    discount,
                    link,
                    rating,
                    reviews,
                    category,
                    featured,
                    bestDeal,
                    newArrival,
                    clicks: 0
                });

                alert("Product Saved ✅");

                loadManualAliProducts();

            });

            aliSearchResults.appendChild(card);

        });

    } catch (err) {

        console.error("AliExpress Search Error:", err);
        aliSearchResults.innerHTML = "<p>❌ Search failed. Please try again.</p>";

    }

}

async function loadManualAliProducts() {

    if (!aliManualList) return;

    aliManualList.innerHTML = "";

    const snapshot = await getDocs(collection(db, "aliManualProducts"));

    snapshot.forEach(docItem => {

        const data = docItem.data();

        const sections = [
            data.featured ? "Featured" : null,
            data.bestDeal ? "Best Deal" : null,
            data.newArrival ? "New Arrival" : null
        ].filter(Boolean).join(", ") || "None";

        aliManualList.innerHTML += `

        <div class="product">

            <img src="${data.image || ""}" style="width:100%;max-width:150px;">

            <h3>${data.title || "Untitled"}</h3>

            <p>💰 $${data.price || 0}</p>

            <p>📌 Sections: ${sections}</p>

            <p>👆 Clicks: ${data.clicks || 0}</p>

            <button type="button" class="ali-remove-btn" data-id="${docItem.id}">
                ❌ Remove
            </button>

        </div>

        `;

    });

    document.querySelectorAll(".ali-remove-btn").forEach(btn => {

        btn.onclick = async () => {

            if (!confirm("Remove this product from all sections?")) return;

            await deleteDoc(doc(db, "aliManualProducts", btn.dataset.id));

            loadManualAliProducts();

        };

    });

}

if (aliSearchBtn) {
    aliSearchBtn.addEventListener("click", searchAliExpress);
}

loadProducts();
loadCategories();
loadCategoryManager();
loadBannerManager();
loadTopProducts();
loadAliClicks();
loadManualAliProducts();
adminSearch.addEventListener("input", loadProducts);

adminFilter.addEventListener("change", loadProducts);

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        await signOut(auth);

        window.location.href = "login.html";

    });

}
