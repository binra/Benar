import { db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);

const id = params.get("id");

const container = document.getElementById("productDetails");
async function loadProduct() {

    if (!id) {

        container.innerHTML = "<h2>Product not found.</h2>";
        return;

    }

    const productRef = doc(db, "products", id);

    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {

        container.innerHTML = "<h2>Product not found.</h2>";
        return;

    }

    const data = productSnap.data();

    console.log(data);
    
    container.innerHTML = `
        <div class="product-details">

            <img src="${data.image}" alt="${data.title}" class="main-image">

            <div class="details">

                <h1>${data.title}</h1>

                <h2>$${data.price}</h2>

                <p style="color:red;font-size:20px;">
                    ${data.description}
                </p>

                <button class="add-cart">
                    Add To Cart
                </button>

                <br><br>

                <a href="index.html">
                    ← Back to Home
                </a>

            </div>

        </div>
    `;

}

loadProduct();