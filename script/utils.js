const storeInSession = (path) =>
    fetch(`http://localhost:3000/${path}/`)
        .then(response => response.json())
        .then(data => localStorage.setItem(path, JSON.stringify(data)))
        .catch(() => alert('Error fetching data from server'));

const display = (arr) => arr.forEach(element => element.style.display = 'block');
const hide = (arr) => arr.forEach(element => element.style.display = 'none');

const truncate = (elementBody, row) => {
    const existingRows = [...elementBody.querySelectorAll(row)].slice(1);
    existingRows.forEach(row => row.remove());
}
const instancesGetter = async(modelStr) => {
    const res = await fetch(`http://localhost:3000/${modelStr}`);
    const instances = await res.json();
    return instances;
}
const partitioner = (list, pageNum, pageSize) => {
    console.log(list.slice((pageNum - 1) * pageSize, pageNum * pageSize));
    return list.slice((pageNum - 1) * pageSize, pageNum * pageSize);
}

const userRowsCreator = (models, itemToClone,bodyElement) => {
    models.forEach(model => {
        const newRow = itemToClone.cloneNode(true);
        newRow.setAttribute('id', model.id);
        const cellList= newRow.querySelectorAll('td');
        console.log(model.role);
        cellList[0].textContent = model.name;
        cellList[1].textContent = model.email;
        cellList[2].querySelector('.roleMod').value = model.role;
        newRow.style.display = 'table-row';
        bodyElement.appendChild(newRow);
    });
        const newRow = itemToClone.cloneNode(true);
        console.log(newRow);
        newRow.getElementsByTagName('td')[3].innerHTML = '';
        const newText = document.createElement('input');
        newText.setAttribute('type', 'text');
        newText.setAttribute('class', 'newUserName');
        newText.className = 'userName';
        newRow.querySelectorAll('td')[0].appendChild(newText);
        const newBtn = document.createElement('button');
        newBtn.innerHTML = '<i class="fas fa-plus"></i>';
        newBtn.id = 'userAdd'
        newRow.getElementsByTagName('td')[3].appendChild(newBtn);
        newRow.style.display = 'table-row';
        bodyElement.appendChild(newRow);
}
const productRowsCreator = (models, itemToClone,bodyElement, objSpecific,classesList) => {
    models.forEach(model => {
        const newRow = itemToClone.cloneNode(true);
        newRow.setAttribute('id', model.id);
        const cellList= newRow.querySelectorAll('td');
        cellList[0].textContent = model.name;
        cellList[1].querySelector('.statusModification').value = model.status;
        cellList[2].textContent = model.category;
        cellList[3].textContent = model.price;
        newRow.style.display = 'table-row';
        bodyElement.appendChild(newRow);
    });

}
const orderRowsCreator = async (orderList, orderBody, rowForClone) => {
    const [users, products] = await Promise.all([
        instancesGetter('users'),
        instancesGetter('products'),
    ]);

    for (const order of orderList) {
        const newRow = rowForClone.cloneNode(true);
        newRow.setAttribute('id', order.id);
        const cells = newRow.querySelectorAll('td');

        const customer = users.find(user => user.id === order.customerId);
        cells[0].textContent = customer?.name || 'Unknown';

        const statusSelect = cells[1].querySelector('.orderState');
        if (statusSelect) statusSelect.value = order.status;


        cells[2].textContent = order.quantity

        cells[3].textContent = order.date || 'N/A';

        newRow.style.display = 'table-row';
        orderBody.appendChild(newRow);
    }
};





const productCardCreator = (productList, productCard, productGrid, productModal) => {
    const modalTitle = productModal.querySelector('#product-modal-title');
    const modalPrice = productModal.querySelector('#product-modal-price');
    const modalDescription = productModal.querySelector('#product-modal-description');
    const modalImage = productModal.querySelector('#product-modal-img');
    const modalClose = productModal.querySelector('#modal-close');

    for (let product of productList) {
        const newProductCard = productCard.cloneNode(true);
        newProductCard.setAttribute('id', product.id);

        newProductCard.querySelector('.product-title').textContent = product.name;
        newProductCard.querySelector('.current-price').textContent = product.price;
        newProductCard.querySelector('img').src = product.imageData;
        newProductCard.querySelector('img').alt = product.name;
        newProductCard.style.display = 'block';

        newProductCard.addEventListener('click', () => {
            window.location.href = 'product.html?id=' + product.id;
        })
        productGrid.appendChild(newProductCard);
    }


};



const confirmUpdate = () => {
    return new Promise((resolve) => {
        const modal = document.getElementById('updateModal');
        const cancelBtn = document.getElementById('cancelUpdate');
        const confirmBtn = document.getElementById('confirmUpdate');
        console.log('from modal', modal);
        modal.style.display = 'block';
        cancelBtn.onclick = () => {
            modal.style.display = 'none';
            resolve(false);
        }
        confirmBtn.onclick = () => {
            modal.style.display = 'none';
            resolve(true);
        }
    })
}
const confirmDelete = () => {
    return new Promise( (resolve) => {
        const modal = document.getElementById('deleteModal');
        console.log('from modal', modal);
        const cancelBtn = document.getElementById('cancelDelete');
        const confirmBtn = document.getElementById('confirmDelete');
        modal.style.display = 'block';
        cancelBtn.onclick = () => {
            modal.style.display = 'none';
            resolve(false);
        }
        confirmBtn.onclick = () => {
            modal.style.display = 'none';
            resolve(true);
        }
    })
}

const   addProductCart = async (target,e) => {
    if (target.classList.contains('add-to-cart'))
    {
        e.stopPropagation();
        const productCard = target.closest('.product-card');
        const productId = productCard.getAttribute('id');
        const quantity =  1;

        const user = JSON.parse(localStorage.getItem('user'));
        const carts = await instancesGetter('carts');
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
    }
}


export {partitioner,confirmUpdate, confirmDelete, instancesGetter, addProductCart,storeInSession, display, truncate, userRowsCreator, orderRowsCreator, hide, productCardCreator, productRowsCreator};