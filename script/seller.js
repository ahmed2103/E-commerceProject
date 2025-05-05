import {
    storeInSession, display, hide, truncate, partitioner, rowsCreator, orderRowsCreator, instancesGetter
} from "./utils.js";

const pageSize = 5;
let page = 1;
window.addEventListener('load', () => {
    const heading1 = document.getElementsByTagName('h1')[0];
    const viewsManager = document.getElementById('viewsManager');
    const productRow = document.getElementsByClassName('productRow')[0];
    const productTable = document.getElementById('productTable');
    const productControl = document.getElementById('productControl');
    const productBody = document.getElementById('productBody');
    const productAdd = document.getElementById('productAdd');
    const orderControl = document.getElementById('orderControl');
    const orderTable = document.getElementById('orderTable');
    const orderBody = document.getElementById('orderBody');
    const orderRow = document.getElementsByClassName('orderRow')[0];
    const prev = document.getElementById('prev');
    const next = document.getElementById('next');
    const form = document.forms[0];


    const seller = JSON.parse(localStorage.getItem('user'));
    heading1.innerText += ` ${seller.name}`;

    viewsManager.addEventListener('change', async () => {
        const viewsManagerValue = viewsManager.value;
        switch (viewsManagerValue) {

            case 'product':
                page = 1;
                hide([orderControl]);
                display([prev, next, productControl]);
                truncate(productBody, '.productRow');
                const productList = (await instancesGetter('products')).filter(product => product.sellerId === seller.id);

                console.log(productList);
                rowsCreator(partitioner(productList, page, pageSize), productRow, productBody, 'status', ['.productName', '.statusModification']);
                break;

            case 'order':
                page = 1;
                hide([productControl]);
                display([prev, next, orderControl]);
                truncate(orderBody, '.orderRow');
                const orderList = (await instancesGetter('orders'))
                    .filter(order => order.sellerId === seller.id);
                console.log(orderList);
                orderRowsCreator(partitioner(orderList, page, pageSize), orderBody, orderRow);
        }
    });


    productTable.addEventListener('click', async function(event) {
        const target = event.target;
        if (target.tagName === 'BUTTON') {
            if (target.className === 'productUpdate') {
                const productRow = target.closest('.productRow');
                const productId = productRow.querySelector('span').textContent;
                const productName = productRow.querySelector('.productName').value;
                const productStatus = productRow.querySelector('.statusModification').value;
                const products = await instancesGetter('products');
                const oldProduct = products.find(product => product.id === productId);

                if (!oldProduct) {
                    alert('Product not found');
                    return;
                }

                const updatedProduct = {
                    ...oldProduct,
                    name: productName,
                    status: productStatus
                };

                fetch(`http://localhost:3000/products/${productId}`, {
                    method: 'PUT',
                    body: JSON.stringify(updatedProduct)
                }).then(response => response.json())
                    .then(data => alert('Product Updated Successfully'))
                    .catch(err => alert('Error updating product: ' + err));

                await storeInSession('products');
            }
            if (target.className === 'productDelete') {
                const productRow = target.closest('.productRow');
                const productId = productRow.querySelector('span').textContent;
                console.log(productId);
                fetch(`http://localhost:3000/products/${productId}`, {
                    method: 'DELETE',
                }).then(res => {
                    if (res.ok) {
                        alert('Product Deleted Successfully');
                        productRow.remove();
                    } else {
                        alert('Failed to delete product');
                    }
                }).catch(err => alert('Error: ' + err));
            }
        }
        if (target.className === 'productDetails') {
            form.reset();
            form.style.display = 'flex';
            form.querySelector('h2').innerText = 'Product Details';
            const productRow = target.closest('.productRow');
            const productId = productRow.querySelector('span').textContent;
            const products = await instancesGetter('products');
            const selectedProduct = products.find(product => product.id === productId);
            form.querySelector('span').innerText = productId;
            form.elements['productName'].value = selectedProduct.name;
            form.elements['productPrice'].value = selectedProduct.price;
            form.elements['category'].value = selectedProduct.category;
            form.elements['productDescription'].value = selectedProduct.description;
            form.querySelector('img').src = selectedProduct.imageData;
            form.querySelector('span').textContent = productId;
            if(selectedProduct.imageData) {
                form.querySelector('img').style.display = 'block';
            }
        }
    });

    orderTable.addEventListener('click', async function(event) {
        const target = event.target;
        if (target.tagName === 'BUTTON') {
            if (target.className === 'orderUpdate') {
                console.log(event);
                const orderRow = target.closest('.orderRow');
                const orderId = orderRow.querySelector('span').textContent;
                const orderState = orderRow.querySelector('.orderState').value;
                const orders = await instancesGetter('orders');
                const oldOrder = orders.find(order => order.id === orderId);

                if (!oldOrder) {
                    alert('Order not found');
                    return;
                }

                const updatedOrder = {
                    ...oldOrder,
                    status: orderState
                };

                fetch(`http://localhost:3000/orders/${orderId}`, {
                    method: 'PUT',
                    body: JSON.stringify(updatedOrder)
                }).then(response => response.json())
                    .then(data => alert('Order Updated Successfully'))
                    .catch(err => alert('Error updating order: ' + err));

                await storeInSession('orders');
            }
            if (target.className === 'orderDelete') {
                const orderRow = target.closest('.orderRow');
                const orderId = orderRow.querySelector('span').textContent;
                console.log(orderId);
                fetch(`http://localhost:3000/orders/${orderId}`, {
                    method: 'DELETE',
                }).then(res => {
                    if (res.ok) {
                        alert('Order Deleted Successfully');
                        orderRow.remove();
                    } else {
                        alert('Failed to delete order');
                    }
                }).catch(err => alert('Error: ' + err));
            }
        }
    });


    productAdd.addEventListener('click', function() {
        form.querySelector('span').innerText = '';
        form.querySelector('img').src = ''
        form.querySelector('img').style.display = 'none';
        form.querySelector('h2').innerText = 'New Product';
        form.querySelector('h2').innerText = 'New Product';
        form.reset();
        form.style.display = 'flex';
    });

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        const id = form.querySelector('span').textContent;
        const imageUpdte = document.getElementById('imageInput');

        if (id) {
            let products = await instancesGetter('products');
            const oldProduct = products.find(product => product.id === id);
            if (!oldProduct) {
                alert('Product not found');
                return;
            }

            if (imageUpdte.files && imageUpdte.files[0]) {
                const image = imageUpdte.files[0];
                const reader = new FileReader();
                reader.onload = async () => {
                    const imageData = reader.result;
                    const updatedProduct = {
                        ...oldProduct,
                        name: form.elements['productName'].value,
                        price: form.elements['productPrice'].value,
                        category: form.elements['category'].value,
                        status: 'pending',
                        imageData: imageData,
                        description: form.elements['productDescription'].value
                    };
                    fetch(`http://localhost:3000/products/${id}`, {
                        method: 'PUT',
                        body: JSON.stringify(updatedProduct)
                    })
                        .then(response => response.json())
                        .then(data => alert('Product Updated Successfully'))
                        .catch(err => alert('Error updating product: ' + err));
                };
                reader.readAsDataURL(image);
            } else {
                const updatedProduct = {
                    ...oldProduct,
                    name: form.elements['productName'].value,
                    price: form.elements['productPrice'].value,
                    category: form.elements['category'].value,
                    status: 'pending',
                    description: form.elements['productDescription'].value
                };
                fetch(`http://localhost:3000/products/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(updatedProduct)
                })
                    .then(response => response.json())
                    .then(data => alert('Product Updated Successfully'))
                    .catch(err => alert('Error updating product: ' + err));
            }

            form.style.display = 'none';
            return;
        }
        const formData = new FormData(form);
        const imageInput = document.getElementById('imageInput');
        let products = await instancesGetter('products');
        const newId = products.length > 0 ? Number(products[products.length - 1].id) + 1 : 1;

        if (imageInput.files && imageInput.files[0]) {
            const image = imageInput.files[0];
            const reader = new FileReader();
            reader.onload = async () => {
                const imageData = reader.result;
                const newProduct = {
                    id: newId,
                    sellerId: seller.id,
                    name: formData.get('productName'),
                    price: formData.get('productPrice'),
                    category: formData.get('category'),
                    status: 'pending',
                    imageData: imageData,
                    description: formData.get('productDescription')
                };

                fetch(`http://localhost:3000/products`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newProduct)
                })
                    .then(res => {
                        if (res.ok) {
                            alert('Product Added Successfully');
                            form.reset();
                            form.style.display = 'none';
                            if (viewsManager.value === 'product') {
                                viewsManager.dispatchEvent(new Event('change'));
                            }
                        } else {
                            alert('Failed to add product');
                        }
                    })
                    .catch(err => alert('Error: ' + err));
            };
            reader.readAsDataURL(image);
        } else {
            alert('Please select an image');
        }
    });


    next.addEventListener('click', async function() {
        page++;
        const viewsManagerValue = viewsManager.value;
        switch (viewsManagerValue) {

            case 'product':
                const productList = (await instancesGetter('products')).filter(product => product.sellerId === seller.id);
                const partitionedProductList = partitioner(productList, page, pageSize);
                if (partitionedProductList.length === 0) {
                    page--;
                    alert('No more products');
                    return;
                }
                truncate(document.getElementById('productBody'), '.productRow');
                rowsCreator(partitionedProductList, productRow, productBody, 'status', ['.productName', '.statusModification']);
                break;

            default:
                const orderList = (await instancesGetter('orders')).filter(order => order.sellerId === seller.id);
                const partitionedOrderList = partitioner(orderList, page, pageSize);
                if (partitionedOrderList.length === 0) {
                    page--;
                    alert('No more orders');
                    return;
                }
                truncate(document.getElementById('orderBody'), '.orderRow');
                orderRowsCreator(partitionedOrderList, orderBody, orderRow);
        }
    });

    prev.addEventListener('click', async function() {
        if (page <= 1) {
            alert('You are on the first page');
            return;
        }

        page--;
        const viewsManagerValue = viewsManager.value;
        switch (viewsManagerValue) {

            case 'product':
                const productList = (await instancesGetter('products')).filter(product => product.sellerId === seller.id);
                truncate(document.getElementById('productBody'), '.productRow');
                rowsCreator(partitioner(productList, page, pageSize), productRow, productBody, 'status', ['.productName', '.statusModification']);
                break;

            default:
                const orderList = (await instancesGetter('orders')).filter(order => order.sellerId === seller.id);
                truncate(document.getElementById('orderBody'), '.orderRow');
                orderRowsCreator(partitioner(orderList, page, pageSize), orderBody, orderRow);
        }
    });
});