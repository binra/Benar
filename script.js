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

                <button class="add-cart">
                    Add To Cart
                </button>

            </div>
        `;

    });

    activateCart();
    activateCategoryFilter();
    renderCart();

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
// Shopping Cart

// ======================
// Shopping Cart
// ======================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartCount = document.getElementById("cart-count");
const cartItems = document.getElementById("cart-items");
const totalPrice = document.getElementById("total-price");

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function renderCart() {

    cartItems.innerHTML = "";

    let total = 0;

    cart.forEach((item, index) => {

        total += item.price;

        const li = document.createElement("li");

        li.innerHTML = `
            ${item.name} - $${item.price}
            <button class="delete-item">Delete</button>
        `;

        li.querySelector(".delete-item").onclick = () => {

            cart.splice(index, 1);

            saveCart();

            renderCart();

        };

        cartItems.appendChild(li);

    });

    cartCount.textContent = cart.length;
    totalPrice.textContent = total;

}

function activateCart() {

    document.querySelectorAll(".add-cart").forEach(button => {

        button.onclick = () => {

            const product = button.parentElement;

            const name = product.querySelector("h2").textContent;

            const price = parseInt(
                product.querySelector("p").textContent.replace("$", "")
            );

      cart.push({
    name,
    price
});

saveCart();
renderCart();

        };

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
const checkoutBtn = document.getElementById("checkout-btn");

checkoutBtn.onclick = async () => {

    if (cart.length === 0) {

        alert("سەبەتی کڕین بەتاڵە");

        return;

    }

    const customerName =
    document.getElementById("customer-name").value;

const customerPhone =
    document.getElementById("customer-phone").value;

const customerAddress =
    document.getElementById("customer-address").value;

if (!customerName || !customerPhone || !customerAddress) {

    alert("تکایە هەموو زانیارییەکان پڕ بکەرەوە.");

    return;

}
    await addDoc(collection(db, "orders"), {

        customerName,
        customerPhone,
        customerAddress,

        items: cart,

        total: cart.reduce((sum, item) => sum + item.price, 0),

        createdAt: new Date().toISOString()

    });

    alert("داواکارییەکەت بە سەرکەوتوویی نێردرا ✅");

    cart = [];

    saveCart();

    renderCart();

};