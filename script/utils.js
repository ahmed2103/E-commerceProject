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
const storeSession = (path) =>
    fetch(`http://localhost:3000/${path}/`)
        .then(response => response.json())
        .then(data => localStorage.setItem(path, JSON.stringify(data)))
        .catch(() => alert('Error fetching data from server'));

export {pageShow, changePage, storeSession};