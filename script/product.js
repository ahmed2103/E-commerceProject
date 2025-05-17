window.addEventListener('load', async () => {
    const productTitle = document.querySelector('.product-title');
    const currentPrice = document.querySelector('.current-price');
    const sellerName = document.querySelector('#seller-name');
    const productDescription = document.querySelector('#product-description');
    const productImage = document.querySelector('#product-img');
    const addToCartBtn = document.querySelector('.btn-primary');
    const qtyInput = document.querySelector('#qty');
    const commentInput = document.querySelector('#comment-input');
    const commentBtn = document.querySelector('#add-comment');
    const reviewsList = document.querySelector('.product-reviews-list');

    const customerName = JSON.parse(localStorage.getItem('user')).name;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    let product = await (await fetch('http://localhost:3000/products/' + productId)).json();
    const seller = await (await fetch('http://localhost:3000/users/' + product.sellerId)).json();

    productTitle.textContent = product.name;
    currentPrice.textContent = product.price;
    productDescription.textContent = product.description;
    productImage.src = product.imageData;
    productImage.alt = product.name;
    sellerName.textContent = seller.name;

    // ✅ Render existing comments
    if (product.comments && Array.isArray(product.comments)) {
        product.comments.forEach(renderComment);
    }

    // ✅ Add new comment
    commentBtn.addEventListener('click', async () => {
        const comment = commentInput.value.trim();
        if (!comment) return;

        const newComment = {
            customerName,
            comment
        };
        const comments = product.comments || [];
        for (const comm of comments) {
            if (comm.customerName === customerName) {
                return;
            }
        }

        product.comments = [...(product.comments || []), newComment];

        await fetch('http://localhost:3000/products/' + product.id, {
            method: 'PUT',
            body: JSON.stringify(product)
        });

        renderComment(newComment);
        commentInput.value = '';
    });

    function renderComment({ customerName, comment }) {
        const commentItem = document.createElement('div');
        commentItem.classList.add('product-reviews-item');
        commentItem.innerHTML = `
            <div class="product-review-user">
                <img class="victor" src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&amp;cs=tinysrgb&amp;w=600" alt="">
                <p>${customerName}</p>
            </div>
            <div class="product-review-content">
                <div class="rating">
                    <div class="stars">
                        <span class="star">★</span>
                        <span class="star">★</span>
                        <span class="star">★</span>
                        <span class="star">★</span>
                        <span class="star">☆</span>
                    </div>
                </div>
                <div class="product-review">${comment}</div>
            </div>
        `;
        reviewsList.appendChild(commentItem);
    }

    addToCartBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const quantity = parseInt(qtyInput.value);
        if (isNaN(quantity) || quantity <= 0) {
            alert('Please enter a valid quantity');
            return;
        }

        const user = JSON.parse(localStorage.getItem('user'));
        const carts = await (await fetch('http://localhost:3000/carts')).json();
        const cart = carts.find(c => c.userId === user.id);

        if (cart) {
            const existingProduct = cart.products.find(p => p.productId === productId);
            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                cart.products.push({ productId, quantity });
            }
            await fetch(`http://localhost:3000/carts/${cart.id}`, {
                method: 'PUT',
                body: JSON.stringify(cart)
            });
        } else {
            const newCart = {
                userId: user.id,
                products: [{ productId, quantity }]
            };
            await fetch('http://localhost:3000/carts', {
                method: 'POST',
                body: JSON.stringify(newCart)
            });
        }

    })
});
