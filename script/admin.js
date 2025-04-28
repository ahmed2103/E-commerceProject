window.addEventListener('load', () => {
    const heading1 = document.getElementsByTagName('h1')[0];
    const admin = JSON.parse(localStorage.getItem('user'));
    heading1.innerText += ` ${admin.name}`;
    const viewsManager = document.getElementById('viewsManager');
    const userTable = document.getElementById('userTable');

    viewsManager.addEventListener('change', () => {
        const viewsManagerValue = viewsManager.value;
        switch (viewsManagerValue) {
            case 'User':
                userTable.style.display = 'block';
                break;
            case 'Admin':
                userTable.style.display = 'none';
                break;
            default:
                userTable.style.display = 'none';
        }
        if (viewsManagerValue === 'User') {
            userTable.style.display = 'block';
        }
    })

})