const storeInSession = (path) =>
    fetch(`http://localhost:3000/${path}/`)
        .then(response => response.json())
        .then(data => localStorage.setItem(path, JSON.stringify(data)))
        .catch(() => alert('Error fetching data from server'));

const display = (arr) => arr.forEach(element => element.style.display = 'block');
const hide = (arr) => arr.forEach(element => element.style.display = 'none');

const truncate = (elementBody, row) => {
    const existingOrderRows = [...elementBody.querySelectorAll(row)].slice(1);
    existingOrderRows.forEach(row => row.remove());
}
const instancesGetter = async(modelStr) => {
    const res = await fetch(`http://localhost:3000/${modelStr}`);
    return  (await res.json());
}
const partitioner = (list, pageNum, pageSize) => {
    return list.slice((pageNum - 1) * pageSize, pageNum * pageSize);
}

const rowsCreator = (models, itemToClone,bodyElement, objSpecific,classesList) => {
    models.forEach(model => {
        const newRow = itemToClone.cloneNode(true);
        newRow.querySelector('span').textContent = model.id;
        newRow.querySelector(classesList[0]).value = model.name;
        newRow.querySelector(classesList[1]).value = model[objSpecific];
        newRow.style.display = 'table-row';
        bodyElement.appendChild(newRow);
    });
    if (objSpecific==='role') { //this means that the object is a user
        const newRow = itemToClone.cloneNode(true);
        newRow.removeChild(newRow.getElementsByTagName('td')[3]);
        newRow.querySelector('span').textContent = 'New';
        newRow.style.display = 'table-row';
        bodyElement.appendChild(newRow);
    }
}
const orderRowsCreator = (orderList, orderBody,rowForClone) => {
    orderList.forEach(order => {
        const newOrderRow = rowForClone.cloneNode(true);
        newOrderRow.querySelector('span').textContent = order.id;
        let orderDetailString = ``

        order.products.forEach(product => {
            orderDetailString += `product id: ${product.productId}\tquantity: ${product.quantity}\n`;
        });
        console.log(orderDetailString);
        newOrderRow.querySelector('pre').textContent = orderDetailString;
        newOrderRow.querySelector('.orderState').value = order.status;
        newOrderRow.querySelector('.orderDate').textContent = order.orderDate;
        newOrderRow.style.display = 'table-row';
        orderBody.appendChild(newOrderRow);
    });
}

export {partitioner, instancesGetter, storeInSession, display, truncate, rowsCreator, orderRowsCreator, hide};