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
        message.textContent = `Catalog : ${products.length} products`;

        for (const product of products) {
            const listElement = document.createElement("li");
            listElement.innerHTML = 
            `<img src="http://localhost:3000${product.image}" class="rounded-2xl">
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

function getCardData(card) {
    const texts = card.querySelectorAll("p");

    return {
        name: texts[0].textContent,
        price: Number(texts[1].textContent.replace("€", "")),
        description: texts[2].textContent,
        category: texts[3].textContent.trim(),
        stock: parseInt(texts[4].textContent),
    };
}

function getFilterValues() {
    const categorySelected = categoriesContainer.selectedIndex > 0; 

    return {
        search: searchInput.value.trim().toLowerCase(),
        category: categorySelected ? categoriesContainer.selectedOptions[0].textContent.trim() : "",
        inStockOnly: stockFilter.checked,
        maxPrice: maxPrice.value === "" ? null : Number(maxPrice.value),
    };
}

function hasActiveFilter(filters) {
    return (
        filters.search !== "" ||
        filters.category !== "" ||
        filters.inStockOnly ||
        filters.maxPrice !== null
    );
}

function matchesFilters(card, filters) {
    const data = getCardData(card);
    const text = `${data.name} ${data.description}`.toLowerCase();

    if (filters.search !== "" && !text.includes(filters.search)) return false;
    if (filters.category !== "" && data.category !== filters.category) return false;
    if (filters.inStockOnly && data.stock <= 0) return false;
    if (filters.maxPrice !== null && data.price > filters.maxPrice) return false;

    return true;
}

function filterProducts(filters) {
    const cards = list.children;
    let shown = 0;

    for (const card of cards) {
        const visible = matchesFilters(card, filters);

        card.style.display = visible ? "" : "none";

        if (visible) shown++;
    }

    message.textContent = `${shown} of ${cards.length} products match your filters`;
}

function handleFilterSubmit(event) {
    event.preventDefault();

    if (list.children.length === 0) {
        dialog.close();
        return;
    }

    const filters = getFilterValues();

    if (!hasActiveFilter(filters)) {
        filterError.classList.remove("hidden");
        return;
    }

    filterError.classList.add("hidden");
    filterProducts(filters);
    resetButton.classList.remove("hidden");
    dialog.close();
}

function resetDisplay() {
    for (const card of list.children) {
        card.style.display = "";
    }

    message.textContent = `Catalog : ${list.children.length} products`;
    filterForm.reset();
    filterError.classList.add("hidden");
    resetButton.classList.add("hidden");
}

filterForm.addEventListener("submit", handleFilterSubmit);
resetButton.addEventListener("click", resetDisplay);