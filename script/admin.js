import { storeInSession, displayAndHide, truncate, partitioner, rowsCreator,orderRowsCreator } from "./utils.js";

const pageSize = 5;
let page = 1;
window.addEventListener('load', () => {
    const heading1 = document.getElementsByTagName('h1')[0];
    const viewsManager = document.getElementById('viewsManager');
    const userTable = document.getElementById('userTable');
    const userControl = document.getElementById('userControl');
    const userRow = document.getElementsByClassName('userRow')[0];
    const productRow = document.getElementsByClassName('productRow')[0];
    const productTable = document.getElementById('productTable');
    const productControl = document.getElementById('productControl');
    const userBody = document.getElementById('userBody');
    const userAdd = document.getElementById('userAdd');
    const productBody = document.getElementById('productBody');
    const productAdd = document.getElementById('productAdd');
    const orderControl = document.getElementById('orderControl');
    const orderTable = document.getElementById('orderTable');
    const orderBody = document.getElementById('orderBody');
    const orderRow = document.getElementsByClassName('orderRow')[0];
    const prev = document.getElementById('prev');
    const next = document.getElementById('next');


    const admin = JSON.parse(localStorage.getItem('user'));
    heading1.innerText += ` ${admin.name}`;

    viewsManager.addEventListener('change', async () => {
        const viewsManagerValue = viewsManager.value;
        switch (viewsManagerValue) {
            case 'user':
                page = 1;
                displayAndHide([prev,next,userControl,productControl,orderControl])
                await storeInSession('users');
                truncate(userBody, '.userRow');
                const userList = partitioner('users', page, pageSize);
                rowsCreator(userList, userRow, userBody,'role', ['.userName', '.roleMod']);
                break;

            case 'product':
                page = 1;
                displayAndHide([prev,next,productControl,userControl,orderControl])
                await storeInSession('products');
                truncate(productBody, '.productRow');
                const productList = partitioner('products', page, pageSize);
                rowsCreator(productList, productRow,productBody,'status', ['.productName', '.statusModification']);
                break;

            default:
                page = 1;
                displayAndHide([prev,next,orderControl,productControl,userControl])
                await storeInSession('orders');
                truncate(orderBody, '.orderRow');
                const orderList = partitioner('orders', page, pageSize);
                orderRowsCreator(orderList,orderBody,orderRow)
        }
    });

    userTable.addEventListener('click', async function(event){
        const target = event.target;
        if (target.tagName === 'BUTTON' ) {
            if(target.className === 'userUpdate') {
                const userRow = target.closest('.userRow');
                const userId = userRow.querySelector('span').textContent;
                const userName = userRow.querySelector('.userName').value;
                const userRole = userRow.querySelector('.roleMod').value;
                console.log(userRow, userId, userName, userRole);
                const updatedUser = {
                    id: userId,
                    name: userName,
                    role: userRole
                }
                fetch(`http://localhost:3000/users/${userId}`, {
                    method: 'PUT',
                    body: JSON.stringify(updatedUser)
                }).then(response => alert('User Updated ' + response.status))
                    .catch(err => alert(err));
                await storeInSession('users');
            }
            if(target.className === 'userDelete') {
                const userRow = target.closest('.userRow');
                const userId = userRow.querySelector('span').textContent;
                console.log(userId);
                fetch(`http://localhost:3000/users/${userId}`, {
                    method: 'DELETE'
                }).then(res => alert('User Deleted ' + res.status))
                    .catch(err => alert(err));
                userRow.remove();
                await storeInSession('users');
            }
        }
    });

    productTable.addEventListener('click', async function(event){
        const target = event.target;
        if (target.tagName === 'BUTTON' ) {
            if(target.className === 'productUpdate') {
                const productRow = target.closest('.productRow');
                const productId = productRow.querySelector('span').textContent;
                const productName = productRow.querySelector('.productName').value;
                const productStatus = productRow.querySelector('.statusModification').value;
                console.log(productRow, productId, productName, productStatus);
                const updatedProduct = {
                    id: productId,
                    name: productName,
                    status: productStatus
                }
                fetch(`http://localhost:3000/products/${productId}`, {
                    method: 'PUT',
                    body: JSON.stringify(updatedProduct)
                }).then(response => alert('Product Updated ' + response.status))
                    .catch(err => alert(err));
                await storeInSession('products');
            }
            if(target.className === 'productDelete') {
                const productRow = target.closest('.productRow');
                const productId = productRow.querySelector('span').textContent;
                console.log(productId);
                fetch(`http://localhost:3000/products/${productId}`, {
                    method: 'DELETE'
                }).then(res => alert('Product Deleted ' + res.status))
                    .catch(err => alert(err));
                productRow.remove();
                await storeInSession('products');
            }
        }
    });

    orderTable.addEventListener('click', async function(event){
        console.log(event)
        const target = event.target;
        if (target.tagName === 'BUTTON' ) {
            if(target.className === 'orderUpdate') {
                console.log(event)
                const orderRow = target.closest('.orderRow');
                const orderId = orderRow.querySelector('span').textContent;
                const orderState = orderRow.querySelector('.orderState').value;
                console.log(orderRow, orderId, orderState);
                const updatedOrder = {
                    ...JSON.parse(localStorage.getItem('orders')).find(order => order.id === orderId),
                    status: orderState
                }
                fetch(`http://localhost:3000/orders/${orderId}`, {
                    method: 'PUT',
                    body: JSON.stringify(updatedOrder)
                }).then(response => alert('Order Updated ' + response.status))
                    .catch(err => alert(err));
            }
            if(target.className === 'orderDelete') {
                const orderRow = target.closest('.orderRow');
                const orderId = orderRow.querySelector('span').textContent;
                console.log(orderId);
                fetch(`http://localhost:3000/orders/${orderId}`, {
                    method: 'DELETE'
                }).then(res => alert('Order Deleted ' + res.status))
                    .catch(err => alert(err));
                orderRow.remove();
            }
        }
    })

    userAdd.addEventListener('click', async function()  {
        const UserRows = document.querySelectorAll('.userRow');
        const lastUserRow = UserRows[UserRows.length - 1];
        const userName = lastUserRow.querySelector('.userName').value;
        const userRole = lastUserRow.querySelector('.roleMod').value;
        const newId = Number(JSON.parse(localStorage.getItem('users')).slice(-1)[0].id) + 1;
        if(userName === '' || userRole === '') {
            alert('Please fill in all fields');
        }else{
            const newUser = {
                id: newId,
                name: userName,
                role: userRole
            }
            fetch(`http://localhost:3000/users`, {
                method: 'POST',
                body: JSON.stringify(newUser)
            }).then(res => alert('User Added '+ res.status))
            await storeSession('users');
            lastUserRow.querySelector('.userName').value= '';
            lastUserRow.querySelector('.roleMod').value= '';
        }
    });

    productAdd.addEventListener('click', async function()  {
        const productRows = document.querySelectorAll('.productRow');
        const lastProductRow = productRows[productRows.length - 1];
        const productName = lastProductRow.querySelector('.productName').value;
        const productStatus = lastProductRow.querySelector('.statusModification').value;
        const newId = Number(JSON.parse(localStorage.getItem('products')).slice(-1)[0].id) + 1;

        if(productName === '' || productStatus === '') {
            alert('Please fill in all fields');
        } else {
            const newProduct = {
                id: newId,
                name: productName,
                status: productStatus
            }
            fetch(`http://localhost:3000/products`, {
                method: 'POST',
                body: JSON.stringify(newProduct)
            }).then(res => alert('Product Added '+ res.status))
                .catch(err => alert(err));
            await storeSession('products');
            lastProductRow.querySelector('.productName').value = '';
            lastProductRow.querySelector('.statusModification').value = '';
        }
    });
    next.addEventListener('click', async function()  {
        page++;
        const viewsManagerValue = viewsManager.value;
        switch (viewsManagerValue) {
            case 'user':
                console.log(document.getElementById('userBody'));
                const userList = partitioner('users', page, pageSize);
                if (userList.length === 0) {
                    page--;
                    alert('No more users');
                    return;
                }
                truncate(document.getElementById('userBody'), '.userRow');
                rowsCreator(userList, userRow, userBody,'role', ['.userName', '.roleMod']);
                break;

            case 'product':
                const productList = partitioner('products', page, pageSize);
                if (productList.length === 0) {
                    page--;
                    alert('No more products');
                    return;
                }
                truncate(document.getElementById('productBody'), '.productRow');
                rowsCreator(productList, productRow,productBody,'status', ['.productName', '.statusModification']);
                break;

            default:
                const orderList = partitioner(document.getElementById('orderBody'), page, pageSize);
                if (orderList.length === 0) {
                    page--;
                    alert('No more orders');
                    return;
                }
                truncate(document.getElementById('orderBody'), '.orderRow');
                orderRowsCreator(orderList,orderBody,orderRow)
        }
    })
    prev.addEventListener('click', async function()  {
        page--;
        const viewsManagerValue = viewsManager.value;
        switch (viewsManagerValue) {
            case 'user':
                const userList = partitioner('users', page, pageSize);
                if (userList.length === 0) {
                    page++;
                    alert('No more users');
                    return;
                }
                truncate(document.getElementById('userBody'), '.userRow');

                rowsCreator(userList, userRow, userBody,'role', ['.userName', '.roleMod']);
                break;

            case 'product':
                const productList = partitioner('products', page, pageSize);
                if (productList.length === 0) {
                    page++;
                    alert('No more products');
                    return;
                }
                truncate(document.getElementById('productBody'), '.productRow');
                rowsCreator(productList, productRow,productBody,'status', ['.productName', '.statusModification']);
                break;

            default:
                const orderList = partitioner(document.getElementById('orderBody'), page, pageSize);
                if (orderList.length === 0) {
                    page++;
                    alert('No more orders');
                    return;
                }
                truncate(document.getElementById('orderBody'), '.orderRow');
                orderRowsCreator(orderList,orderBody,orderRow)
        }
    })
    
});