import { instancesGetter, productCardCreator } from "./utils.js";

window.addEventListener('load', async (e) => {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const productCard = document.querySelector('.product-card');
    const productGrid = document.querySelector('.products-grid');
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById("cart-modal");
    const closeModalBtns = document.querySelectorAll(".close-modal");
    const productModal = document.getElementById("product-modal");
    const cartItem = document.querySelector('.cart-item');
    const cartItemsElement = document.getElementById('cart-items');



    const allProducts = await instancesGetter('products');

    productCardCreator(allProducts,productCard,productGrid,productModal);
    searchInput.addEventListener('blur', async () => {
        const searchValue = searchInput.value;
        if (!searchValue) {
            productGrid.innerHTML=''
            const allProducts = await instancesGetter('products');
            productCardCreator(allProducts, productCard, productGrid, productModal);
            return;
        }
    })


    searchButton.addEventListener('click', async () => {
        productGrid.innerHTML = '';
        const searchValue = searchInput.value;
        const allProducts = await instancesGetter('products');
        const filteredProducts = allProducts.filter(product => product.name.toLowerCase().includes(searchValue.toLowerCase()));
        productCardCreator(filteredProducts, productCard, productGrid, productModal);
    })

    cartIcon.addEventListener('click', async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const carts = await instancesGetter('carts');
        const products = await instancesGetter('products');
        const cart = carts.find(c => c.userId === user.id);

        cartItemsElement.innerHTML = '';

        if (!cart || !cart.products || cart.products.length === 0) {
            document.querySelector('#cart-total-price').textContent = '0$';
            cartModal.style.display = "block";
            return;
        }

        let totalPrice = 0;

        for (let item of cart.products) {
            const product = products.find(p => p.id === item.productId);
            if (!product) continue;

            const newCartItem = cartItem.cloneNode(true);
            newCartItem.querySelector('img').src = product.imageData || 'placeholder.jpg';
            newCartItem.querySelector('.name').textContent = product.name;
            newCartItem.querySelector('.quantity').textContent = `Quantity: ${item.quantity}`;
            newCartItem.querySelector('.price').textContent = `Price: ${product.price}$`;

            totalPrice += product.price * item.quantity;

            newCartItem.style.display = 'block';
            cartItemsElement.appendChild(newCartItem);
        }

        document.querySelector('#cart-total-price').textContent = `${totalPrice}$`;
        cartModal.style.display = "block";
    });





    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            productModal.style.display = "none";
            cartModal.style.display = "none";
        });
    })
})