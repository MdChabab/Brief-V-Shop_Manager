const message = document.querySelector("#message");
const list = document.querySelector("#products");
const categoriesContainer = document.getElementById("categoryFilter");
const dialog = document.querySelector("#filterDialog");
const openFilters = document.querySelector("#openFilters");
const closeDialog = document.querySelector("#closeDialog");
const filterForm = document.querySelector("#filterForm");
const searchInput = document.querySelector("#searchInput");
const stockFilter = document.querySelector("#stockFilter");
const maxPrice = document.querySelector("#maxPrice");
const filterError = document.querySelector("#filterError");
const resetButton = document.querySelector("#resetFilters");

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
                    <button type="submit" class="bg-black text-white rounded-xl py-3 w-[100%] mt-4">
                      Add To Cart
                    </button>
                </div>
            `;

            listElement.setAttribute("class", "flex flex-col gap-4");

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
    dialog.showModal();
});

closeDialog.addEventListener("click", () => {
    dialog.close();
});

//--------------------------------------------------

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
                <button type="submit" class="bg-black text-white rounded-xl py-3 w-[100%] mt-4">
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
        alert("Please choose at least one filter");
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
