const API = "http://localhost:3000";

async function loadProducts() {
    const message = document.querySelector("#message");
    const list = document.querySelector("#products");
    list.innerHTML = "";

    try {
        const response = await fetch(API + "/api/products");

        if (!response.ok) {
            const problem = await response.json();
            message.textContent = problem.message;
            return;
        }

        const products = await response.json();
        message.textContent = products.length + " products";

        for (const product of products) {
            const item = document.createElement("li");
            item.innerHTML =
                `<img src="${API}${product.image}" class="rounded-2xl">
                <div class="px-2">
                    <div class="flex justify-between font-bold text-2xl">
                        <p>${product.name}</p>
                        <p>€${product.price}</p>
                    </div>
                    <p>${product.description}</p>
                    <div class="flex justify-between">
                        <p class="bg-blue-100 rounded-2xl px-4 my-2">${product.categoryName}</p>
                        <p class="bg-amber-100 rounded-2xl px-4 my-2">${product.stock} in stock</p>
                    </div>
                </div>`
                
            item.setAttribute('class', 'flex flex-col gap-2 py-6 sm:flex-row sm:items-center sm:gap-6 sm:py-4')

            list.appendChild(item);
        }
    } catch (error) {
        message.textContent = "Could not reach the API. Is the server running?";
    }
}

loadProducts();