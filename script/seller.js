import {
    display, hide, truncate, partitioner, orderRowsCreator, productRowsCreator, instancesGetter, confirmUpdate, confirmDelete
} from "./utils.js";

const pageSize = 5;
let page = 1;
let currentView;

window.addEventListener('load', async () => {
    // DOM Elements
    const dashAncor = document.getElementById('dashboardAnchor');
    const userName = document.querySelector('.dashboard-username');
    const productAnchor = document.getElementById('productAnchor');
    const orderAnchor = document.getElementById('orderAnchor');
    const lastOrdersTable = document.getElementById('lastOrdersTable');
    const lastOrdersBody = document.getElementById('lastOrdersBody');
    const productRow = document.getElementsByClassName('productRow')[0];
    const productTable = document.getElementById('productTable');
    const productControl = document.getElementById('productControl');
    const productBody = document.getElementById('productBody');
    const productAdd = document.getElementById('productAdd');
    const orderControl = document.getElementById('orderControl');
    const orderTable = document.getElementById('orderTable');
    const orderBody = document.getElementById('ordersBody');
    const orderRow = document.getElementsByClassName('orderRow')[0];
    const prev = document.getElementById('prev');
    const next = document.getElementById('next');
    const deleteModal = document.getElementById('deleteModal');
    const updateModal = document.getElementById('updateModal');
    const form = document.querySelector('.seller-form');

    // Get seller from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if(user.role !== "seller") window.location.href = "./unauthorized.html";
    const seller = user;
    userName.innerText = `${seller.name}`;

    // Initialize Dashboard
    dashAncor.addEventListener('click', async () => {
        currentView = 'dashboard';
        document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
        document.getElementById('dashboard-view').classList.add('active');

        // Update stats
        document.getElementById('oCount').textContent = (await instancesGetter('orders')).filter(order => order.sellerId === seller.id).length;
        document.getElementById('pCount').textContent = (await instancesGetter('products')).filter(product => product.sellerId === seller.id).length;
        document.getElementById('cCount').textContent = (await instancesGetter('users')).filter(user => user.role === 'customer').length;

        // Show recent orders
        truncate(lastOrdersBody, '.orderRow');
        const lastOrders = (await instancesGetter('orders'))
            .filter(order => order.sellerId === seller.id)
            .slice(-5).reverse();
        await orderRowsCreator(lastOrders, lastOrdersBody, orderRow);

        hide([prev, next]);
    });

    // Products View
    productAnchor.addEventListener('click', async () => {
        currentView = 'products';
        document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
        document.getElementById('products-view').classList.add('active');

        page = 1;
        display([prev, next]);
        truncate(productBody, '.productRow');

        const productList = (await instancesGetter('products')).filter(product => product.sellerId === seller.id);
        productRowsCreator(partitioner(productList, page, pageSize), productRow, productBody, 'status', ['.productName', '.statusModification']);
    });

    // Orders View
    orderAnchor.addEventListener('click', async () => {
        currentView = 'orders';
        document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
        document.getElementById('orders-view').classList.add('active');

        page = 1;
        truncate(orderBody, '.orderRow');

        const orderList = (await instancesGetter('orders')).filter(order => order.sellerId === seller.id);
        const partition = partitioner(orderList, page, pageSize);
        await orderRowsCreator(partition, orderBody, orderRow);

        display([prev, next]);
    });

    // Initialize dashboard on load
    dashAncor.click();

    // Product Table Event Listener
    productTable.addEventListener('click', async function(event) {
        const target = event.target;



        if (target.classList.contains('productDelete')) {
            const productRow = target.closest('.productRow');
            const productId = productRow.getAttribute('id');

            if (await confirmDelete()) {
                fetch(`http://localhost:3000/products/${productId}`, {
                    method: 'DELETE',
                })
                    .then(res => {
                        if (res.ok) {
                            productRow.remove();
                        } else {
                            alert('Failed to delete product');
                        }
                    })
                    .catch(err => alert('Error: ' + err));
            }
        }

        if (target.classList.contains('productUpdate')) {
            // Open product details form
            const modal = document.querySelector('#formModal');
            const modalTitle = modal.querySelector('.modal-header h2');
            modalTitle.textContent = 'Product Details';

            const productRow = target.closest('.productRow');
            const productId = productRow.getAttribute('id');
            const products = await instancesGetter('products');
            const selectedProduct = products.find(product => product.id === productId);

            if (selectedProduct) {
                document.getElementById('name').value = selectedProduct.name;
                document.getElementById('price').value = selectedProduct.price;
                document.getElementById('category').value = selectedProduct.category;
                document.getElementById('description').value = selectedProduct.description;

                // Set a hidden field or data attribute to store product ID
                const btnAction = document.getElementById('success');
                btnAction.textContent = 'Update';
                btnAction.dataset.productId = productId;

                // Display modal
                modal.style.display = 'block';
            }
        }
    });

    // Order Table Event Listener
    orderTable.addEventListener('click', async function(event) {
        const target = event.target;

        if (target.classList.contains('orderUpdate')) {
            const orderRow = target.closest('.orderRow');
            const orderId = orderRow.getAttribute('id');
            const orderState = orderRow.querySelector('.orderState').value;
            const orders = await instancesGetter('orders');
            const oldOrder = orders.find(order => order.id === orderId);

            if (!oldOrder) {
                return;
            }

            if (await confirmUpdate()) {
                const updatedOrder = {
                    ...oldOrder,
                    status: orderState
                };

                fetch(`http://localhost:3000/orders/${orderId}`, {
                    method: 'PUT',
                    body: JSON.stringify(updatedOrder)
                })
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        }
                        throw new Error('Failed to update order');
                    })
                    .catch(err => alert('Error updating order: ' + err));
            }
        }

        if (target.classList.contains('orderDelete')) {
            const orderRow = target.closest('.orderRow');
            const orderId = orderRow.getAttribute('id');

            if (await confirmDelete()) {
                fetch(`http://localhost:3000/orders/${orderId}`, {
                    method: 'DELETE',
                })
                    .then(res => {
                        if (res.ok) {
                            orderRow.remove();
                        } else {
                            alert('Failed to delete order');
                        }
                    })
                    .catch(err => alert('Error: ' + err));
            }
        }
    });

    // Recent Orders Table Event Listener (same functionality as order table)
    lastOrdersTable.addEventListener('click', async function(event) {
        const target = event.target;

        if (target.classList.contains('orderUpdate')) {
            const orderRow = target.closest('.orderRow');
            const orderId = orderRow.getAttribute('id');
            const orderState = orderRow.querySelector('.orderState').value;
            const orders = await instancesGetter('orders');
            const oldOrder = orders.find(order => order.id === orderId);

            if (!oldOrder) {
                return;
            }

            if (await confirmUpdate()) {
                const updatedOrder = {
                    ...oldOrder,
                    status: orderState
                };

                fetch(`http://localhost:3000/orders/${orderId}`, {
                    method: 'PUT',
                    body: JSON.stringify(updatedOrder)
                })
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        }
                        throw new Error('Failed to update order');
                    })
                    .catch(err => alert('Error updating order: ' + err));
            }
        }

        if (target.classList.contains('orderDelete')) {
            const orderRow = target.closest('.orderRow');
            const orderId = orderRow.getAttribute('id');

            if (await confirmDelete()) {
                fetch(`http://localhost:3000/orders/${orderId}`, {
                    method: 'DELETE',
                })
                    .then(res => {
                        if (res.ok) {
                            orderRow.remove();
                        } else {
                            alert('Failed to delete order');
                        }
                    })
                    .catch(err => alert('Error: ' + err));
            }
        }
    });

    // Product Add Button
    // Product Add Button
    productAdd.addEventListener('click', function() {
        // Open empty form for adding product
        const modal = document.querySelector('#formModal');
        const modalTitle = modal.querySelector('.modal-header h2');
        modalTitle.textContent = 'Add New Product';

        // Clear form
        document.getElementById('name').value = '';
        document.getElementById('price').value = '';
        document.getElementById('category').value = '0';
        document.getElementById('description').value = '';
        document.getElementById('image').value = '';

        // Set button text
        const btnAction = document.getElementById('success');
        btnAction.textContent = 'Add';
        btnAction.dataset.productId = '';

        // Display modal
        modal.style.display = 'block';
    });

// Form submit handler for productForm
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const btnAction = document.getElementById('success');
        const productId = btnAction.dataset.productId;
        const modal = document.querySelector('#formModal');

        // Get form data
        const name = document.getElementById('name').value;
        const price = document.getElementById('price').value;
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;
        const imageInput = document.getElementById('image');

        if (name === '' || price === '' || category === '0') {
            return;
        }

        // Function to handle image data
        const getImageData = () => {
            return new Promise((resolve) => {
                if (imageInput.files && imageInput.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        resolve(e.target.result);
                    };
                    reader.readAsDataURL(imageInput.files[0]);
                } else {
                    resolve(null);
                }
            });
        };

        // Update existing product
        if (productId) {
            const products = await instancesGetter('products');
            const oldProduct = products.find(product => product.id === productId);

            if (!oldProduct) {
                alert('Product not found');
                return;
            }

            const imageData = await getImageData();

            const updatedProduct = {
                ...oldProduct,
                name: name,
                price: price,
                category: category,
                description: description,
                status: 'pending',
                ...(imageData && { imageData })
            };

            fetch(`http://localhost:3000/products/${productId}`, {
                method: 'PUT',
                body: JSON.stringify(updatedProduct)
            })
                .then(response => {
                    if (response.ok) {
                        modal.style.display = 'none';

                        // Refresh product view if active
                        if (currentView === 'products') {
                            productAnchor.click();
                        }
                    } else {
                        throw new Error('Failed to update product');
                    }
                })
                .catch(err => alert('Error: ' + err));
        }
        // Add new product
        else {
            if (!imageInput.files || !imageInput.files[0]) {
                alert('Please select an image');
                return;
            }

            const imageData = await getImageData();
            const products = await instancesGetter('products');
            const newId = products.length > 0 ? String(Number(products[products.length - 1].id) + 1) : '1';

            const newProduct = {
                id: newId,
                sellerId: seller.id,
                name: name,
                price: price,
                category: category,
                description: description,
                status: 'pending',
                imageData: imageData
            };

            fetch(`http://localhost:3000/products`, {
                method: 'POST',
                body: JSON.stringify(newProduct)
            })
                .then(response => {
                    if (response.ok) {
                        modal.style.display = 'none';

                        // Refresh product view if active
                        if (currentView === 'products') {
                            productAnchor.click();
                        }
                    } else {
                        throw new Error('Failed to add product');
                    }
                })
                .catch(err => alert('Error: ' + err));
        }
    });

// Modal close handlers
    document.querySelectorAll('.close-modal').forEach((btn) => {
        btn.addEventListener('click', function() {
            document.getElementById('formModal').style.display = 'none';
            document.getElementById('deleteModal').style.display = 'none';
            document.getElementById('updateModal').style.display = 'none';
        });
    });

// Cancel button inside modals
    document.querySelector('#formModal .modal-footer .btn').addEventListener('click', function() {
        document.getElementById('formModal').style.display = 'none';
    });

// Success button in product form modal (alternative to form submit)
    document.getElementById('success').addEventListener('click', function() {
        form.dispatchEvent(new Event('submit'));
    });

// Delete/Update confirm buttons
    document.getElementById('cancelDelete').addEventListener('click', function() {
        document.getElementById('deleteModal').style.display = 'none';
    });

    document.getElementById('cancelUpdate').addEventListener('click', function() {
        document.getElementById('updateModal').style.display = 'none';
    });



    next.addEventListener('click', async function() {
        page++;

        switch (currentView) {
            case 'products':
                const productList = (await instancesGetter('products')).filter(product => product.sellerId === seller.id);
                const partitionedProductList = partitioner(productList, page, pageSize);

                if (partitionedProductList.length === 0) {
                    page--;
                    alert('No more products');
                    return;
                }

                truncate(productBody, '.productRow');
                productRowsCreator(partitionedProductList, productRow, productBody, 'status', ['.productName', '.statusModification']);
                break;

            case 'orders':
                const orderList = (await instancesGetter('orders')).filter(order => order.sellerId === seller.id);
                const partitionedOrderList = partitioner(orderList, page, pageSize);

                if (partitionedOrderList.length === 0) {
                    page--;
                    alert('No more orders');
                    return;
                }

                truncate(orderBody, '.orderRow');
                await orderRowsCreator(partitionedOrderList, orderBody, orderRow);
                break;
        }
    });

    prev.addEventListener('click', async function() {
        if (page <= 1) {
            alert('You are on the first page');
            return;
        }

        page--;

        switch (currentView) {
            case 'products':
                const productList = (await instancesGetter('products')).filter(product => product.sellerId === seller.id);
                truncate(productBody, '.productRow');
                productRowsCreator(partitioner(productList, page, pageSize), productRow, productBody, 'status', ['.productName', '.statusModification']);
                break;

            case 'orders':
                const orderList = (await instancesGetter('orders')).filter(order => order.sellerId === seller.id);
                truncate(orderBody, '.orderRow');
                await orderRowsCreator(partitioner(orderList, page, pageSize), orderBody, orderRow);
                break;
        }
    });
});