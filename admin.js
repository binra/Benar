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

// Login
const email = prompt("Admin Email");
const password = prompt("Admin Password");

await signInWithEmailAndPassword(auth, email, password);

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

let editingId = null;
let editingCategoryId = null;

// Save Product
form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const product = {
        title: title.value.trim(),
        price: Number(price.value),
        image: image.value.trim(),
        category: category.value.trim(),
        link: link.value.trim(),
        description: description.value.trim(),
        rating: Number(rating.value) || 0,

        reviews: Number(reviews.value) || 0,

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

    await addDoc(collection(db, "banners"), {

        title: bannerTitle.value.trim(),

        image: bannerImage.value.trim(),

        link: bannerLink.value.trim(),

        active: true,

        order: Date.now()

    });

    bannerForm.reset();

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

    snapshot.forEach((productDoc) => {

        const data = productDoc.data();

        total++;

        if(data.featured) featuredCount++;

        if(data.bestDeal) dealsCount++;

        if(data.bestSeller) sellerCount++;

        adminProducts.innerHTML += `
        <div class="product">

        ${data.bestSeller ? `
        <div class="badge">
        🏆 Best Seller
        </div>
        ` : ""}
            <img src="${data.image}" alt="">

            <h3>${data.title}</h3>

            <p>$${data.price}</p>

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

        </div>

        `;

    });

}

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

loadProducts();
loadCategories();
loadCategoryManager();
loadBannerManager();
