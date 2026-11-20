const message = document.querySelector("#message");
const list = document.querySelector("#productsList");
const categoriesContainer = document.getElementById("categoryFilter");
const filterDialog = document.querySelector("#filterDialog");
const openFilters = document.querySelector("#openFilters");
const closeDialog = document.querySelector("#closeDialog");
const filterForm = document.querySelector("#filterForm");
const searchInput = document.querySelector("#searchInput");
const stockFilter = document.querySelector("#stockFilter");
const maxPrice = document.querySelector("#maxPrice");
const filterError = document.querySelector("#filterError");
const resetButton = document.querySelector("#resetFilters");

//---------------------------------------------------

let allProducts = [];

async function displayProducts() {
    list.innerHTML = "";
    let categoryChecker = [];

    try {
        const response = await fetch("http://localhost:3000/api/products");

        if (!response.ok) {
            const problem = await response.json();
            message.textContent = problem.message;
            return;
        }

        const products = await response.json();
        allProducts = products;
        message.textContent = `Catalog : ${products.length} products`;

        for (const product of products) {
            const listElement = document.createElement("li");
            listElement.innerHTML = `<img src="http://localhost:3000${product.image}" class="rounded-2xl">
                <div class="flex flex-col justify-between px-2">
                    <div class="flex justify-between font-bold gap-2 text-l">
                        <p>${product.name}</p>
                        <p>€${product.price}</p>
                    </div>
                    <p class="text-sm my-2">${product.description}</p>
                    <div class="flex justify-between">
                        <p class="text-blue-300 rounded-2xl">${product.categoryName}</p>
                        <p class="text-amber-300 rounded-2xl">${product.stock} in stock</p>
                    </div>
                    <button type="submit" class="listButton bg-black text-white rounded-xl py-3 w-[100%] mt-4 cursor-pointer" data-id="${product.id}">
                      Add To Cart
                    </button>
                </div>
            `;

            listElement.setAttribute(
                "class",
                "flex flex-col gap-4 p-4 rounded-xl hover:shadow-xl hover:shadow-amber-900/30",
            );

            list.appendChild(listElement);

            if (categoryChecker.includes(product.categoryName) == false) {
                categoryChecker.push(product.categoryName);

                const categoryOption = document.createElement("option");
                categoryOption.innerHTML = `<option value="${product.categoryId}">${product.categoryName}</option>`;
                categoriesContainer.appendChild(categoryOption);
            }
        }
    } catch (error) {
        message.textContent = "did you use npm start to run your localhost?";
    }
}

displayProducts();

// --------------------------------------------------

openFilters.addEventListener("click", () => {
    filterDialog.showModal();
});

closeDialog.addEventListener("click", () => {
    filterDialog.close();
});

//---------------------------------------------------

function hasAtLeastOneFilter() {
    if (searchInput.value.trim() != "") return true;
    if (categoriesContainer.value != "") return true;
    if (stockFilter.checked == true) return true;
    if (maxPrice.value != "") return true;

    return false;
}

function matchesSearch(product) {
    const search = searchInput.value.trim().toLowerCase();
    const text = (product.name + " " + product.description).toLowerCase();

    return text.includes(search);
}

function matchesCategory(product) {
    if (categoriesContainer.value == "") return true;

    return product.categoryName == categoriesContainer.value;
}

function matchesStock(product) {
    if (stockFilter.checked == false) return true;

    return product.stock > 0;
}

function matchesPrice(product) {
    if (maxPrice.value == "") return true;

    return product.price <= Number(maxPrice.value);
}

function productMatches(product) {
    return (
        matchesSearch(product) &&
        matchesCategory(product) &&
        matchesStock(product) &&
        matchesPrice(product)
    );
}

function showProducts(products) {
    list.innerHTML = "";

    for (const product of products) {
        const listElement = document.createElement("li");
        listElement.innerHTML = `<img src="http://localhost:3000${product.image}" class="rounded-2xl">
            <div class="flex flex-col justify-between px-2">
                <div class="flex justify-between font-bold gap-2 text-l">
                    <p>${product.name}</p>
                    <p>€${product.price}</p>
                </div>
                <p class="text-sm my-2">${product.description}</p>
                <div class="flex justify-between">
                    <p class="text-blue-300 rounded-2xl">${product.categoryName}</p>
                    <p class="text-amber-300 rounded-2xl">${product.stock} in stock</p>
                </div>
                <button type="submit" class=" listButton bg-black text-white rounded-xl py-3 w-[100%] mt-4" data-id="${product.id}">
                      Add To Cart
                </button>
            </div>`;

        listElement.setAttribute("class", "flex flex-col gap-4");

        list.appendChild(listElement);
    }
}

function filterProducts(e) {
    e.preventDefault();

    if (allProducts.length == 0) {
        dialog.close();
        return;
    }

    if (hasAtLeastOneFilter() == false) {
        NotifyX.error("", {
            duration: 4000,
            dismissible: true,
            position: "top-center",
            theme: "neon",
            animation: "spring",
            priority: "normal",
            title: "Choose at least 1 filter or close!",
        });
        return;
    }

    const filteredProducts = [];

    for (const product of allProducts) {
        if (productMatches(product)) {
            filteredProducts.push(product);
        }
    }

    showProducts(filteredProducts);
    message.textContent = `${filteredProducts.length} of ${allProducts.length} products`;
    resetFilters.classList.remove("hidden");
    filterDialog.close();
}

function resetDisplay() {
    filterForm.reset();
    resetFilters.classList.add("hidden");

    categoriesContainer.innerHTML = `<option value="">All categories</option>`;
    displayProducts();
}

filterForm.addEventListener("submit", filterProducts);
resetFilters.addEventListener("click", resetDisplay);

//----------------------------------------------------

const cartDialog = document.getElementById("cartDialog");
const openCart = document.getElementById("openCart");
const closeCart = document.getElementById("closeCart");

openCart.addEventListener("click", () => {
    cartDialog.showModal();
});

closeCart.addEventListener("click", () => {
    cartDialog.close();
});

//----------------------------------------------------

const ordersList = document.getElementById("ordersList");
const cartCount = document.querySelector("#cartCount");
const cartTotal = document.querySelector("#cartTotal");
const emptyCartMessage = document.querySelector("#emptyCartMessage");
const emptyCart = document.querySelector("#emptyCart");

let cart = [];
getCart();

function setCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function getCart() {
    const setCart = localStorage.getItem("cart");

    if (setCart) {
        cart = JSON.parse(setCart);
    }

    displayOrders(cart);
}

function addToCart(productId) {
    const product = allProducts.find((product) => product.id == productId);
    const existingPrd = cart.find((product) => product.id == productId);

    if (existingPrd) {
        if (existingPrd.quantity < product.stock) {
            existingPrd.quantity++;
        } else {
            NotifyX.error("", {
                duration: 4000,
                dismissible: true,
                position: "top-center",
                theme: "neon",
                animation: "spring",
                priority: "normal",
                title: "Not enough stock",
            });
        }
    } else {
        cart.push({
            ...product,
            quantity: 1,
        });
    }

    setCart();
    return cart;
}

function displayOrders(cart) {
    ordersList.innerHTML = "";

    if (cart.length === 0) {
        emptyCartMessage.classList.remove("hidden");
    } else {
        emptyCartMessage.classList.add("hidden");
    }

    cart.forEach((order) => {
        let item = document.createElement("li");
        item.innerHTML = `
            <img src="http://localhost:3000${order.image}" class="rounded-xl w-20">

            <div class="flex flex-col gap-2 flex-1">
                <p class="font-bold">${order.name}</p>
                <p>Unit price: €${order.price}</p>
                <label>Quantity:
                    <input
                        type="number"
                        min="1"
                        max="${order.stock}"
                        value="${order.quantity}"
                        data-id="${order.id}"
                        class="quantityInput border rounded p-1 w-16"
                    >
                </label>
                <p>Subtotal: €${(order.price * order.quantity).toFixed(2)}</p>
                <button
                    class="removeButton bg-black text-white rounded-xl p-2"
                    data-id="${order.id}">
                    Remove
                </button>
            </div>
        `;

        item.setAttribute("class", "flex gap-4 p-4 rounded-xl hover:shadow-xl");

        ordersList.append(item);
    });

    const totalItems = cart.reduce((total, order) => total + order.quantity, 0);

    const totalPrice = cart.reduce(
        (total, order) => total + order.price * order.quantity,
        0,
    );

    cartCount.textContent = totalItems;
    cartTotal.textContent = totalPrice.toFixed(2);
}

function removeFromCart(productId) {
    cart = cart.filter((order) => order.id != productId);

    setCart();
    displayOrders(cart);
}

ordersList.addEventListener("change", function (e) {
    if (e.target.classList.contains("quantityInput")) {
        const productId = e.target.dataset.id;
        const updatedQnt = Number(e.target.value);

        const order = cart.find((order) => order.id == productId);

        if (!order) return;

        if (updatedQnt < 1 || updatedQnt > order.stock) {
            e.target.value = order.quantity;

            NotifyX.error("", {
                duration: 4000,
                dismissible: true,
                position: "top-center",
                theme: "neon",
                animation: "spring",
                priority: "normal",
                title: "Invalid quantity",
            });

            return;
        }

        order.quantity = updatedQnt;

        setCart();

        displayOrders(cart);
    }
});

list.addEventListener("click", function (e) {
    if (e.target.classList.contains("listButton")) {
        const productId = e.target.dataset.id;

        addToCart(productId);
        displayOrders(cart);
    }
});

ordersList.addEventListener("click", function (e) {
    if (e.target.classList.contains("removeButton")) {
        const productId = e.target.dataset.id;

        removeFromCart(productId);
    }
});

emptyCart.addEventListener("click", () => {
    cart = [];
    setCart();

    displayOrders(cart);
});

//-------------------------------------------

const customerDialog = document.getElementById("customerDialog");
const customerForm = document.getElementById("customerForm");
const closeCustomer = document.getElementById("closeCustomer");
const checkout = document.getElementById("checkout");
const submitOrder = document.getElementById("submitOrder");

checkout.addEventListener("click", () => {
    if (cart.length === 0) {
        NotifyX.error("", {
            title: "Your cart is empty",
            duration: 4000,
        });

        return;
    }

    customerDialog.showModal();
});

closeCustomer.addEventListener("click", () => {
    customerDialog.close();
});

customerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const customer = {
        name: document.getElementById("customerName").value.trim(),
        email: document.getElementById("customerEmail").value.trim(),
        address: document.getElementById("customerAddress").value.trim(),
        city: document.getElementById("customerCity").value.trim(),
        telephone: document.getElementById("customerTelephone").value.trim(),
        postalCode: document.getElementById("customerPostalCode").value.trim(),
        note: document.getElementById("customerNote").value.trim(),
    };

    submitOrder.disabled = true;
    submitOrder.textContent = "Sending...";

    try {
        for (const order of cart) {

            const reservation = {
                ...customer,
                productId: Number(order.id),
                quantity: Number(order.quantity),
            };

            const response = await fetch(
                "http://localhost:3000/api/reservations",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(reservation),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);

                const errorMessage = errorData && 
                    errorData.message
                    ? errorData.message
                    : "Something went wrong while placing your order.";

                throw new Error(errorMessage);
            }
        }

        cart = [];

        setCart();
        displayOrders(cart);

        customerForm.reset();

        customerDialog.close();
        cartDialog.close();

        NotifyX.success("", {
                duration: 4000,
                dismissible: true,
                position: "top-center",
                theme: "neon",
                animation: "spring",
                priority: "normal",
                title: "Your order has been placed successfully!",
            });

    } catch (error) {

        console.error(error);
        NotifyX.error("", {
                duration: 4000,
                dismissible: true,
                position: "top-center",
                theme: "neon",
                animation: "spring",
                priority: "normal",
                title: "error.message",
            });

    } finally {

        submitOrder.disabled = false;
        submitOrder.textContent = "Place order";

    }
});