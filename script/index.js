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
        const items = await instancesGetter('carts');
        const cartItems = items.find(item => item.userId === JSON.parse(localStorage.getItem('user')).id);
        for (let item of cartItems.items) {
            console.log(item);
            const newCartItem = cartItem.cloneNode(true);
            const productData = await instancesGetter('products');
            const product = productData.find(product => product.id === item.productId);
            newCartItem.querySelector('img').src = product.imageData;
            newCartItem.querySelector('.name').textContent = item.name;
            newCartItem.querySelector('.quantity').textContent = `Quantity: ${item.quantity}`;
            newCartItem.querySelector('.price').textContent = `Price: ${item.price}`;
            newCartItem.style.display = 'block';
            document.querySelector('#cart-total-price').textContent = `${cartItems.totalPrice}$`;
            cartItemsElement.appendChild(newCartItem);
        }
        cartModal.style.display = "block";
    });

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            productModal.style.display = "none";
            cartModal.style.display = "none";
        });
    })
})