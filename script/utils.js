const pageShow = (table,postList) => {
    postList.forEach((post) => {
        const tableRow = document.createElement('tr');
        for (let val of Object.values(post)) {
            const tableCellValue = document.createElement('td');
            tableCellValue.textContent = val;
            tableRow.appendChild(tableCellValue);
        }
        table.appendChild(tableRow);
    })
}
const changePage = (table) => {
    const postList = JSON.parse(localStorage.getItem('data')).slice((currentPage - 1) * 10, currentPage * 10);
    table.innerHTML = '';
    const createdTableHeader = document.createElement('thead');
    const createdTableRow = document.createElement('tr');
    for (let key in postList[0]) {
        console.log(key);
        const createdTableHeaderCell = document.createElement('th');
        createdTableHeaderCell.textContent = key;
        createdTableRow.appendChild(createdTableHeaderCell);
    }
    createdTableHeader.appendChild(createdTableRow);

    postList.forEach((post) => {
        const tableRow = document.createElement('tr');
        for (let val of Object.values(post)) {
            const tableCellValue = document.createElement('td');
            tableCellValue.textContent = val;
            tableRow.appendChild(tableCellValue);
        }
        table.appendChild(tableRow);
    })
}
const storeInSession = (path) =>
    fetch(`http://localhost:3000/${path}/`)
        .then(response => response.json())
        .then(data => localStorage.setItem(path, JSON.stringify(data)))
        .catch(() => alert('Error fetching data from server'));

const displayAndHide = (arr) => {
        arr[0].style.display = 'inline-block';
        arr[1].style.display = 'inline-block';
        arr[2].style.display = 'block';
        arr[3].style.display = 'none';
        arr[4].style.display = 'none';
}
const truncate = (elementBody, row) => {
    const existingOrderRows = [...elementBody.querySelectorAll(row)].slice(1);
    existingOrderRows.forEach(row => row.remove());
}
const partitioner = (modelStr, pageNum, pageSize) =>
     JSON.parse(localStorage.getItem(modelStr)).slice((pageNum-1) * pageSize, pageSize*pageNum);

const rowsCreator = (models, itemToClone,bodyElement, objSpecific,classesList) => {
    models.forEach(model => {
        const newRow = itemToClone.cloneNode(true);
        newRow.querySelector('span').textContent = model.id;
        newRow.querySelector(classesList[0]).value = model.name;
        newRow.querySelector(classesList[1]).value = model[objSpecific];
        newRow.style.display = 'table-row';
        bodyElement.appendChild(newRow);
    });
    const newRow = itemToClone.cloneNode(true);
    newRow.removeChild(newRow.getElementsByTagName('td')[3]);
    newRow.querySelector('span').textContent = 'New';
    newRow.style.display = 'table-row';
    bodyElement.appendChild(newRow);
}
const orderRowsCreator = (orderList, orderBody,rowForClone) => {
    orderList.forEach(order => {
        const newOrderRow = rowForClone.cloneNode(true);
        newOrderRow.querySelector('span').textContent = order.id;
        let orderDetailString = ``

        order.products.forEach(product => {
            orderDetailString += `product id: ${product.productId}\tquantity: ${product.quantity}`;
        });
        console.log(orderDetailString);
        newOrderRow.querySelector('pre').textContent = orderDetailString;
        newOrderRow.querySelector('.orderState').value = order.status;
        newOrderRow.querySelector('.orderDate').textContent = order.orderDate;
        newOrderRow.style.display = 'table-row';
        orderBody.appendChild(newOrderRow);
    });
}

export {partitioner, changePage, storeInSession, displayAndHide, truncate, rowsCreator, orderRowsCreator};