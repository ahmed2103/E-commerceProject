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
    console.log(instances);
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
    const users = await instancesGetter('users');
    const products = await instancesGetter('products');

    for (const order of orderList) {
        const newOrderRow = rowForClone.cloneNode(true);
        newOrderRow.setAttribute('id', order.id);
        const cellList = newOrderRow.querySelectorAll('td');

        const customer = users.find(user => user.id === order.customerId);
        cellList[0].textContent = customer ? customer.name : 'Unknown';

        cellList[1].querySelector('.orderState').value = order.status;

        let orderDetailString = '';
        for (const product of order.products) {
            const foundProduct = products.find(p => p.id === product.productId);
            orderDetailString += `Product: ${foundProduct?.name || 'N/A'}\tQuantity: ${product.quantity}\n`;
        }

        cellList[2].querySelector('pre').textContent = orderDetailString.trim();
        cellList[3].textContent = order.orderDate;

        newOrderRow.style.display = 'table-row';
        orderBody.appendChild(newOrderRow);
    }
};


const productCardCreator = (productList, productCard, productGrid, productModal) => {
    for (let product of productList) {
        const newProductCard = productCard.cloneNode(true);

        newProductCard.setAttribute('id', product.id);
        newProductCard.querySelector('.product-title').textContent = product.name;
        newProductCard.querySelector('.current-price').textContent = product.price;
        newProductCard.querySelector('img').src = product.imageData;
        newProductCard.querySelector('img').alt = product.name;
        newProductCard.style.display = 'block';
        newProductCard.addEventListener('click', () => {
            productModal.style.display = 'block';
            productModal.querySelector('#product-modal-title').textContent = product.name;
            productModal.querySelector('#product-modal-price').textContent = product.price;
            productModal.querySelector('#product-modal-description').textContent = product.description;
            productModal.querySelector('#product-modal-img').src = product.imageData;
        })
        productGrid.appendChild(newProductCard);
    }
}

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
    return new Promise((resolve) => {
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


export {partitioner,confirmUpdate, confirmDelete, instancesGetter, storeInSession, display, truncate, userRowsCreator, orderRowsCreator, hide, productCardCreator, productRowsCreator};