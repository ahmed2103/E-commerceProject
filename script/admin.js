import { display, hide, truncate, partitioner, orderRowsCreator,confirmUpdate,confirmDelete, instancesGetter,userRowsCreator,productRowsCreator } from "./utils.js";

const pageSize = 10;
let page = 1;
let currentView;
window.addEventListener('load', async () => {
    const dashAncor = document.getElementById('dashboardAnchor');
    const userName = document.querySelector('.dashboard-username');
    const userAnchor = document.getElementById('userAnchor');
    const userBody = document.getElementById('usersBody');
    const userControl = document.getElementById('userControl');
    const userRow = document.getElementsByClassName('userRow')[0];
    const userTable = document.getElementById('userTable');
    const productAnchor =document.getElementById('productAnchor');
    const orderAnchor =document.getElementById('orderAnchor');
    const productRow = document.getElementsByClassName('productRow')[0];
    const productTable = document.getElementById('productTable');
    const productControl = document.getElementById('productControl');
    const productBody = document.getElementById('productBody');
    const orderControl = document.getElementById('orderControl');
    const orderTable = document.getElementById('orderTable');
    const orderBody = document.getElementById('ordersBody');
    const orderRow = document.getElementsByClassName('orderRow')[0];
    const prev = document.getElementById('prev');
    const next = document.getElementById('next');
    const modal = document.getElementById('modal');
    const lastOrdersTable = document.getElementById('lastOrdersTable');
    let userAdd;

    const lastOrdersBody = document.getElementById('lastOrdersBody');
    const lastOrders = (await instancesGetter('orders')).slice(-5).reverse();


    const admin = JSON.parse(localStorage.getItem('user'));
    userName.innerText = `Hello ${admin.name}`;
    dashAncor.addEventListener('click', async () => {
        document.getElementById('oCount').textContent = (await instancesGetter('orders')).length;
        document.getElementById('pCount').textContent = (await instancesGetter('products')).length;
        document.getElementById('cCount').textContent = (await instancesGetter('users')).length;
        truncate(lastOrdersBody, '.orderRow');
        await orderRowsCreator(lastOrders, lastOrdersBody, orderRow);
        hide([prev,next])
    })

    userAnchor.addEventListener('click', async () => {
        page = 1;
        currentView = 'users';
        truncate(userBody, '.userRow');
        const userList = await instancesGetter('users');
        userRowsCreator(partitioner(userList, page, pageSize), userRow, userBody);
        display([prev,next]);
        userAdd = document.getElementById('userAdd');
        userAdd.onclick = async function() {
                const userRows = document.querySelectorAll('.userRow');
                const lastUserRow = userRows[userRows.length - 1];
                const userName = lastUserRow.querySelector('.userName').value;
                const userRole = lastUserRow.querySelector('.roleMod').value;

                const users = await instancesGetter('users');
                const newId = users.length > 0 ? Number(users[users.length - 1].id) + 1 : 1;

                if (userName === '' || userRole === '') {
                    alert('Please fill in all fields');
                } else {
                    const newUser = {
                        id: newId,
                        name: userName,
                        role: userRole
                    };

                    fetch(`http://localhost:3000/users`, {
                        method: 'POST',
                        body: JSON.stringify(newUser)
                    }).then(res => {
                        if (res.ok) {
                            alert('User Added Successfully');
                            lastUserRow.querySelector('.userName').value = '';
                            lastUserRow.querySelector('.roleMod').value = 'customer';
                        }
                    }).catch(err => alert('Error: ' + err));
                }
        };
    });
    productAnchor.addEventListener('click', async () => {
        page = 1;
        display([prev,next]);
        currentView = 'products';
        truncate(productBody, '.productRow');
        const productList = await instancesGetter('products');
        productRowsCreator(partitioner(productList, page, pageSize), productRow, productBody, 'status', ['.productName', '.statusModification']);
    });
    orderAnchor.addEventListener('click', async () => {
                page = 1;
                currentView = 'orders';
                truncate(orderBody, '.orderRow');
                const orderList = await instancesGetter('orders');
                const partition = partitioner(orderList, page, pageSize);
                await orderRowsCreator(partition, orderBody, orderRow);
                display([prev,next]);
    });
    dashAncor.click()
    //
    userTable.addEventListener('click', async function(event) {
        const target = event.target;
        if (target.classList.contains('userUpdate')) {
            console.log('update')
                const userRow = target.closest('.userRow');
                const userId= userRow.getAttribute('id');
                const userRole = userRow.querySelector('.roleMod').value;
                const users = await instancesGetter('users');
                const oldUser = users.find(user => user.id === userId);

                if (!oldUser) {
                    alert('User not found');
                    return;
                }
                if (await confirmUpdate()){
                    const updatedUser = {
                        ...oldUser,
                        role: userRole
                    };

                    fetch(`http://localhost:3000/users/${userId}`, {
                        method: 'PUT',
                        body: JSON.stringify(updatedUser)
                    }).then(response => response.json())
                        .then(data => alert('User Updated Successfully'))
                        .catch(err => alert('Error updating user: ' + err));
                }


            }
            if (target.classList.contains('userDelete')) {
                const userRow = target.closest('.userRow');
                const userId = userRow.getAttribute('id');
                console.log(userId);
                if(await confirmDelete()){
                    fetch(`http://localhost:3000/users/${userId}`, {
                        method: 'DELETE',
                    }).then(res => {
                        if (res.ok) {
                            userRow.remove();
                        } else {
                            alert('Failed to delete user');
                        }
                    }).catch(err => alert('Error: ' + err));
                }

            }
    });
    //
    productTable.addEventListener('click', async function(event) {
        const target = event.target;
        console.log(target.classList);

        if (target.classList.contains('productUpdate')) {
                const productRow = target.closest('.productRow');
                const productId = productRow.getAttribute('id');
                const productStatus = productRow.querySelector('.statusModification').value;
                const products = await instancesGetter('products');
                const oldProduct = products.find(product => product.id === productId);

                if (!oldProduct) {
                    alert('Product not found');
                    return;
                }
                if(await confirmUpdate()){
                    const updatedProduct = {
                    ...oldProduct,
                    status: productStatus
                };

                    fetch(`http://localhost:3000/products/${productId}`, {
                        method: 'PUT',
                        body: JSON.stringify(updatedProduct)
                    }).catch(err => alert('Error updating product: ' + err));}


            }
            if (target.classList.contains('productDelete')) {
                const productRow = target.closest('.productRow');
                const productId = productRow.getAttribute('id');
                if(await confirmDelete()){
                    fetch(`http://localhost:3000/products/${productId}`, {
                        method: 'DELETE',

                    }).then(res => {
                        if (res.ok) {
                            productRow.remove();
                        } else {
                            alert('Failed to delete product');
                        }
                    }).catch(err => alert('Error: ' + err));
                }

            }
    });
    //
    lastOrdersTable.addEventListener('click', async function(event) {
        const target = event.target;
        console.log(target.classList);
            if (target.classList.contains('orderUpdate')) {
                const orderRow = target.closest('.orderRow');
                const orderId = orderRow.getAttribute('id');
                const orderState = orderRow.querySelector('.orderState').value;
                const orders = await instancesGetter('orders');
                const oldOrder = orders.find(order => order.id === orderId);

                if (!oldOrder) {
                    alert('Order not found');
                    return;
                }
                if (await confirmUpdate()){
                    const updatedOrder = {
                        ...oldOrder,
                        status: orderState
                    };

                    fetch(`http://localhost:3000/orders/${orderId}`, {
                        method: 'PUT',
                        body: JSON.stringify(updatedOrder)
                    }).catch(err => alert('Error updating order: ' + err));
                }

            }
            if (target.classList.contains('orderDelete')) {
                const orderRow = target.closest('.orderRow');
                const orderId = orderRow.getAttribute('id');
                if(await confirmDelete()){
                    fetch(`http://localhost:3000/orders/${orderId}`, {
                        method: 'DELETE',

                    }).then(res => {
                        if (res.ok) {
                            orderRow.remove();
                        }
                    }).catch(err => alert('Error: ' + err));
                }

        }
    });
    orderTable.addEventListener('click', async function(event) {
        const target = event.target;
        console.log(target.classList);
        if (target.classList.contains('orderUpdate')) {
            const orderRow = target.closest('.orderRow');
            const orderId = orderRow.getAttribute('id');
            const orderState = orderRow.querySelector('.orderState').value;
            const orders = await instancesGetter('orders');
            const oldOrder = orders.find(order => order.id === orderId);

            if (!oldOrder) {
                alert('Order not found');
                return;
            }
            if (await confirmUpdate()){
                const updatedOrder = {
                    ...oldOrder,
                    status: orderState
                };

                fetch(`http://localhost:3000/orders/${orderId}`, {
                    method: 'PUT',
                    body: JSON.stringify(updatedOrder)
                }).catch(err => alert('Error updating order: ' + err));
            }

        }
        if (target.classList.contains('orderDelete')) {
            const orderRow = target.closest('.orderRow');
            const orderId = orderRow.getAttribute('id');
            if(await confirmDelete()){
                fetch(`http://localhost:3000/orders/${orderId}`, {
                    method: 'DELETE',

                }).then(res => {
                    if (res.ok) {
                        orderRow.remove();
                    }
                }).catch(err => alert('Error: ' + err));
            }

        }
    });

    //


    //
    next.addEventListener('click', async function() {
        page++;
        switch (currentView) {
            case 'users':
                const userList = await instancesGetter('users');
                const partitionedUserList = partitioner(userList, page, pageSize);
                if (partitionedUserList.length === 0) {
                    page--;
                    alert('No more users');
                    return;
                }
                truncate(userBody, '.userRow');
                userRowsCreator(partitionedUserList, userRow, userBody, 'role', ['.userName', '.roleMod']);
                break;

            case 'products':
                const productList = await instancesGetter('products');
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
                const orderList = await instancesGetter('orders');
                const partitionedOrderList = partitioner(orderList, page, pageSize);
                if (partitionedOrderList.length === 0) {
                    page--;
                    alert('No more orders');
                    return;
                }
                truncate(orderBody, '.orderRow');
                await orderRowsCreator(partitioner(orderList, page, pageSize), orderBody, orderRow);
        }
    });

    prev.addEventListener('click', async function() {
        console.log(currentView)
        if (page <= 1) {
            alert('You are on the first page');
            return;
        }

        page--;
        switch (currentView) {
            case 'users':
                const userList = await instancesGetter('users');
                truncate(userBody, '.userRow');
                userRowsCreator(partitioner(userList, page, pageSize), userRow, userBody, 'role', ['.userName', '.roleMod']);
                break;

            case 'products':
                const productList = await instancesGetter('products');
                truncate(productBody, '.productRow');
                productRowsCreator(partitioner(productList, page, pageSize), productRow, productBody, 'status', ['.productName', '.statusModification']);
                break;

            case 'orders':
                const orderList = await instancesGetter('orders');
                truncate(orderBody, '.orderRow');
                await orderRowsCreator(partitioner(orderList, page, pageSize), orderBody, orderRow);
        }
    });
});