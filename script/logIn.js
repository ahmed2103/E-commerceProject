window.addEventListener('load', () => {
    const form = document.forms[0];

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        localStorage.removeItem('user');
        localStorage.removeItem('users');


        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        fetch('http://localhost:3000/users')
            .then(res => res.json())
            .then(users => {
                const user = users.find(user => user.email === email);

                if (!user) {
                    alert('User not found');
                    return;
                }

                if (user.password !== password) {
                    alert('Incorrect password');
                    return;
                }

                localStorage.setItem('user', JSON.stringify(user));
                window.location.href = `${user.role}.html`;
            })
            .catch(err => {
                console.error('Error fetching users:', err);
                alert('An error occurred');
            });
    });
});
