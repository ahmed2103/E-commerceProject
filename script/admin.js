import { storeSession } from "./utils";

const pageSize = 5;
let page;
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
    const admin = JSON.parse(localStorage.getItem('user'));
    heading1.innerText += ` ${admin.name}`;

    viewsManager.addEventListener('change', async () => {
        const viewsManagerValue = viewsManager.value;
        switch (viewsManagerValue) {
            case 'user':
                page = 1;
                userControl.style.display = 'block';
                productControl.style.display = 'none';
                await storeSession('users');
                const userList = JSON.parse(localStorage.getItem('users')).slice(0, pageSize);
                console.log(userList);
                for (let user of userList) {
                    const newRow = userRow.cloneNode(true);
                    newRow.querySelector('span').textContent = user.id;
                    newRow.querySelector('.userName').value = user.name;
                    newRow.querySelector('.roleMod').value = user.role;
                    console.log(user.role);
                    newRow.style.display = 'table-row';
                    userBody.appendChild(newRow);
                }
                const newUserRow = userRow.cloneNode(true);
                newUserRow.removeChild(newUserRow.getElementsByTagName('td')[3]);
                newUserRow.querySelector('span').textContent = 'New User';
                newUserRow.style.display = 'table-row';
                userBody.appendChild(newUserRow);
                break;
            case 'product':
                page = 1;
                userControl.style.display = 'none';
                productControl.style.display = 'block';
                break;
            default:
                page = 1;
                userTable.style.display = 'none';
        }
    })
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
                }).then(response => alert('User Updated' + response.status))
                    .catch(err => alert(err));
                await storeSession('users');
            }
            if(target.className === 'userDelete') {
                const userRow = target.closest('.userRow');
                const userId = userRow.querySelector('span').textContent;
                console.log(userId);
                fetch(`http://localhost:3000/users/${userId}`, {
                    method: 'DELETE'
                }).then(res => alert('User Deleted' + res.status))
                    .catch(err => alert(err));
                userRow.remove();
                await storeSession('users');
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
            return;
        }else{
            const newUser = {
                id: newId,
                name: userName,
                role: userRole
            }
            fetch(`http://localhost:3000/users`, {
                method: 'POST',
                body: JSON.stringify(newUser)
            }).then(res => alert('User Added'+ res.status))
            await storeSession('users');
            lastUserRow.querySelector('.userName').value= '';
            lastUserRow.querySelector('.roleMod').value= '';
        }
    })
})