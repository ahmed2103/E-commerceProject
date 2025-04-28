window.addEventListener('load', () => {
    const form = document.forms[0]
    window.addEventListener('submit', (e) => {
        localStorage.removeItem('user');
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        let user;

        fetch('http://localhost:3000/users').then(res => res.json()).then(users => {
            for (user of users) {
                if (user.email === email) {
                    if (user.password === password) {
                        localStorage.setItem('user', JSON.stringify(user));
                        window.location.href = `${user.role}.html`;
                        break;
                    } else {
                        alert('Incorrect password');
                        break;
                    }
                }else if (user.email !== email && user.id === users[users.length - 1].id) {
                    alert('User not found');
                }
            }
        })
    })
})