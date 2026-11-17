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
const cartDialog = document.getElementById("cartDialog");
const openCart = document.getElementById("openCart");
const closeCart = document.getElementById("closeCart");
const emptyCartMessage = document.getElementById("emptyCartMessage");
const ordersList = document.getElementById("ordersList");

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

    return text.includes(search); // an empty search is always found
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

function filterProducts(event) {
    event.preventDefault();

    if (allProducts.length == 0) {
        dialog.close();
        return;
    }

    if (hasAtLeastOneFilter() == false) {
        Swal.fire({
            icon: "error",
            title: "Choose at least 1 filter or close!",
            target: document.querySelector('dialog[open]')
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
    dialog.close();
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

openCart.addEventListener("click", () => {
    cartDialog.showModal();
});

closeCart.addEventListener("click", () => {
    cartDialog.close();
});

//----------------------------------------------------

let cart = [];

list.addEventListener("click", function(e) {

    if (e.target.classList.contains("listButton")) {

        const productId = e.target.dataset.id;

        addToCart(productId);
        displayOrders(cart);
    }

});

function addToCart(productId) {

    const product = allProducts.find(product => product.id == productId);
    const existingProduct = cart.find(product => product.id == productId);

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    console.log(cart);
    
    return cart;
}

function displayOrders(cart) {

    cart.forEach(order => {
        let item = document.createElement("li")
        item.innerHTML = `<img src="http://localhost:3000${order.image}" class="rounded-2xl w-[20%]">
                <div class="flex flex-col justify-between px-2 w-[80%]">
                    <div class="flex justify-between font-bold gap-2 text-l">
                        <p>${order.name}</p>
                        <p>€${order.price}</p>
                    </div>
                    <div class="flex">
                        <label for="number">Quantity: </label>
                        <input type="number" value="${order.quantity}" class="outline rounded-xl p-1 w-5px">
                    </div>
                </div>
            `;

        item.setAttribute(
            "class",
            "flex gap-4 p-4 rounded-xl hover:shadow-xl",
        );
        
        ordersList.append(item) 
    });
}