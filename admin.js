import { db, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

// ========================
// Login Logic
// ========================

const loginContainer = document.getElementById("loginContainer");
const adminPanel = document.getElementById("adminPanel");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginMessage = document.getElementById("loginMessage");

async function handleLogin() {

    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    if (!email || !password) {
        loginMessage.innerHTML = '<div class="login-error">Please enter email and password</div>';
        return;
    }

    loginMessage.innerHTML = '<div class="login-loading">Logging in...</div>';

    try {
        await signInWithEmailAndPassword(auth, email, password);
        loginMessage.innerHTML = '';
        showAdminPanel();
    } catch (error) {

        loginMessage.innerHTML = `<div class="login-error">Login failed: ${error.message}</div>`;

        // Log failed login attempt
        try {
            await addDoc(collection(db, "failed_login_attempts"), {
                email: email,
                timestamp: serverTimestamp(),
                errorCode: error.code,
                ipAddress: "Unknown" // Note: IP address detection requires backend
            });
        } catch (logError) {
            console.error("Error logging failed attempt:", logError);
        }

    }

}

function handleLogout() {

    if (confirm("Are you sure you want to logout?")) {

        signOut(auth)
            .then(() => {
                loginEmail.value = "";
                loginPassword.value = "";
                showLoginForm();
            })
            .catch(error => {
                alert("Logout failed: " + error.message);
            });

    }

}

function showLoginForm() {
    loginContainer.style.display = "flex";
    adminPanel.style.display = "none";
}

function showAdminPanel() {
    loginContainer.style.display = "none";
    adminPanel.style.display = "block";
    initializeAdminPanel();
}

// Check authentication on page load
onAuthStateChanged(auth, (user) => {
    if (user) {
        showAdminPanel();
    } else {
        showLoginForm();
    }
});

// ========================
// Admin Panel Logic
// ========================

const form = document.getElementById("productForm");
const title = document.getElementById("title");
const price = document.getElementById("price");
const originalPrice = document.getElementById("originalPrice");
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



let editingId = null;
let editingCategoryId = null;

function initializeAdminPanel() {

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const product = {
            title: title.value.trim(),
            price: Number(price.value),
            originalPrice: originalPrice.value ? Number(originalPrice.value) : null,
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

        try {

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

        } catch (error) {

            alert("Error saving product: " + error.message);

        }

    });

    categoryForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        try {

            if (editingCategoryId) {

                await updateDoc(
                    doc(db, "categories", editingCategoryId),
                    {
                        name: categoryName.value.trim(),
                        icon: categoryIcon.value.trim()
                    }
                );

                editingCategoryId = null;
                categoryForm.querySelector("button").textContent = "Add Category";
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
            loadCategoryManager();

        } catch (error) {

            alert("Error saving category: " + error.message);

        }

    });

    loadProducts();
    loadCategoryManager();

}

async function loadProducts() {

    adminProducts.innerHTML = "";

    try {

        const snapshot = await getDocs(collection(db, "products"));

        snapshot.forEach((productDoc) => {

            const data = productDoc.data();

            adminProducts.innerHTML += `
            <div class="product">
            ${data.bestSeller ? `<div class="badge">🏆 Best Seller</div>` : ""}
                <img src="${data.image}" alt="">
                <h3>${data.title}</h3>
                <p>$${data.price}</p>

                <button type="button" class="edit-btn" data-id="${productDoc.id}">
                    Edit
                </button>

                <button type="button" class="delete-btn" data-id="${productDoc.id}">
                    Delete
                </button>
            </div>
            `;

        });

        // Delete & Edit handlers
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.onclick = async () => {
                if (!confirm("Delete Product?")) return;
                try {
                    await deleteDoc(doc(db, "products", btn.dataset.id));
                    loadProducts();
                } catch (error) {
                    alert("Error deleting product: " + error.message);
                }
            };
        });

        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.onclick = async () => {
                editingId = btn.dataset.id;
                try {
                    const snap = await getDoc(doc(db, "products", editingId));
                    const data = snap.data();
                    title.value = data.title || "";
                    price.value = data.price || "";
                    originalPrice.value = data.originalPrice || "";
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
                    window.scrollTo({ top: 0, behavior: "smooth" });
                } catch (error) {
                    alert("Error loading product: " + error.message);
                }
            };
        });

    } catch (error) {

        adminProducts.innerHTML = `<p>Error loading products: ${error.message}</p>`;

    }

}

async function loadCategoryManager() {

    categoryList.innerHTML = "";

    try {

        const snapshot = await getDocs(collection(db, "categories"));

        snapshot.forEach((categoryDoc) => {

            const data = categoryDoc.data();

            categoryList.innerHTML += `
            <div class="product">
                <h3>${data.icon} ${data.name}</h3>

                <button type="button" class="edit-category" data-id="${categoryDoc.id}">
                    Edit
                </button>

                <button type="button" class="delete-category" data-id="${categoryDoc.id}">
                    Delete
                </button>
            </div>
            `;

        });

        document.querySelectorAll(".edit-category").forEach(btn => {
            btn.onclick = async () => {
                editingCategoryId = btn.dataset.id;
                try {
                    const snap = await getDoc(doc(db, "categories", editingCategoryId));
                    const data = snap.data();
                    categoryName.value = data.name;
                    categoryIcon.value = data.icon;
                    categoryForm.querySelector("button").textContent = "Update Category";
                    categoryForm.scrollIntoView({ behavior: "smooth" });
                } catch (error) {
                    alert("Error loading category: " + error.message);
                }
            };
        });

        document.querySelectorAll(".delete-category").forEach(btn => {
            btn.onclick = async () => {
                if (!confirm("Delete Category?")) return;
                try {
                    await deleteDoc(doc(db, "categories", btn.dataset.id));
                    loadCategoryManager();
                } catch (error) {
                    alert("Error deleting category: " + error.message);
                }
            };
        });

    } catch (error) {

        categoryList.innerHTML = `<p>Error loading categories: ${error.message}</p>`;

    }

}

loadProducts();
loadCategories();
loadCategoryManager();
loadBannerManager();
