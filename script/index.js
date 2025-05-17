import { instancesGetter, productCardCreator, addProductCart } from "./utils.js";

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
    const clearCartBtn = document.getElementById('clear-cart');
    const productsGrid = document.querySelector('.products-grid');
    const sortList = document.getElementById('sort');
    const checkOutBtn = document.getElementById('checkout-btn');
    const BuyBtn = document.querySelector('.buy-now');
    const allAnchor = document.querySelector('#all');
    const laptopAnchors = document.querySelectorAll('#laptop');
    const mobileAnchor = document.querySelector('#mobile');
    const accountAnchor = document.querySelector('#account-link');
    const loginBtn = document.querySelector('#account-menu > li:nth-child(1) > a > button');

    if(localStorage.getItem('user')) loginBtn.style.display = 'none';

    const allProducts = (await instancesGetter('products')).filter(p => p.status === 'approved');

    productCardCreator(allProducts, productCard, productGrid, productModal);

    searchInput.addEventListener('blur', async () => {
        const searchValue = searchInput.value;
        if (!searchValue) {
            productGrid.innerHTML = '';
            const allProducts = (await instancesGetter('products')).filter(p => p.status === 'approved');
            productCardCreator(allProducts, productCard, productGrid, productModal);
            return;
        }
    });

    searchButton.addEventListener('click', async () => {
        productGrid.innerHTML = '';
        const searchValue = searchInput.value;
        const allProducts = (await instancesGetter('products')).filter(p => p.status === 'approved');
        const filteredProducts = allProducts.filter(product => product.name.toLowerCase().includes(searchValue.toLowerCase()));
        productCardCreator(filteredProducts, productCard, productGrid, productModal);
    });

    cartIcon.addEventListener('click', async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            alert("Please login to view your cart");
            return;
        }

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

    productsGrid.addEventListener('click', async (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            await addProductCart(e.target);
        }
    });

    clearCartBtn.addEventListener('click', async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            alert("Please login to modify your cart");
            return;
        }

        const carts = await instancesGetter('carts');
        const cart = carts.find(c => c.userId === user.id);

        if (cart) {
            cart.products = [];
            await fetch(`http://localhost:3000/carts/${cart.id}`, {
                method: 'PUT',
                body: JSON.stringify(cart)
            });
        }

        cartItemsElement.innerHTML = '';
        document.querySelector('#cart-total-price').textContent = '0$';
    });

    sortList.addEventListener('change', async () => {
        const sortValue = sortList.value;
        let sortedProducts = [...allProducts];

        switch (sortValue) {
            case('price-low-high'):
                sortedProducts.sort((a, b) => a.price - b.price);
                break;
            case('price-high-low'):
                sortedProducts.sort((a, b) => b.price - a.price);
                break;
            default:
                break;
        }

        productGrid.innerHTML = '';
        productCardCreator(sortedProducts, productCard, productGrid, productModal);
    });

    const checkoutBtn = document.getElementById('checkout-btn');
    checkoutBtn.addEventListener('click', async (e) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            alert("Please login to checkout");
            return;
        }

        const carts = await instancesGetter('carts');
        const cart = carts.find(c => c.userId === user.id);
        if (!cart || !cart.products || cart.products.length === 0) {
            return;
        }

        const products = await instancesGetter('products');

        const cartItems = cart.products.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
                customerId: user.id,
                status: 'pending',
                sellerId: product?.sellerId || null,
                productId: item.productId,
                quantity: item.quantity,
                date: new Date().toISOString(),
            };
        });

        for (const item of cartItems) {
            await fetch('http://localhost:3000/orders', {
                method: 'POST',
                body: JSON.stringify(item)
            });
        }

        await fetch(`http://localhost:3000/carts/${cart.id}`, {
            method: 'PUT',
            body: JSON.stringify({ ...cart, products: [] })
        });

        cartModal.style.display = "none";
    });

    if (allAnchor) {
        allAnchor.addEventListener('click', async (e) => {
            const allProducts = (await instancesGetter('products')).filter(p => p.status === 'approved');
            productGrid.innerHTML = '';
            productCardCreator(allProducts, productCard, productGrid, productModal);
        });
    }

    laptopAnchors.forEach(anchor => {
        anchor.addEventListener('click', async (e) => {
            const allProducts = await instancesGetter('products');
            const filteredProducts = allProducts.filter(product => product.category === 'Laptops' && product.status === 'approved');
            productGrid.innerHTML = '';
            productCardCreator(filteredProducts, productCard, productGrid, productModal);
        });
    });

    if (mobileAnchor) {
        mobileAnchor.addEventListener('click', async (e) => {
            const allProducts = await instancesGetter('products');
            const filteredProducts = allProducts.filter(product => product.category === 'Mobiles' && product.status === 'approved');
            productGrid.innerHTML = '';
            productCardCreator(filteredProducts, productCard, productGrid, productModal);
        });
    }

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            productModal.style.display = "none";
            cartModal.style.display = "none";
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === productModal) {
            productModal.style.display = "none";
        }
        if (e.target === cartModal) {
            cartModal.style.display = "none";
        }
    });

    const updateCartCount = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;

        const carts = await instancesGetter('carts');
        const cart = carts.find(c => c.userId === user.id);

        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            if (cart && cart.products) {
                let count = 0;
                cart.products.forEach(item => {
                    count += item.quantity;
                });
                cartCount.textContent = count;
            } else {
                cartCount.textContent = '0';
            }
        }
    };
    accountAnchor.addEventListener('click', (e) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            e.preventDefault();
            window.location.href = './login.html';
            return;
        }
    })

    await updateCartCount();
    setInterval(updateCartCount, 300);
});