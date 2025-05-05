import { instancesGetter} from "./utils";

window.addEventListener("load", function () {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const form = document.forms[0];
    const passwordError = form.querySelector('#password-error');
    const emailFound = form.querySelector('#email-found');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (passwordInput.value !== confirmPasswordInput.value) {
            errorMessage.style.display = 'block';
        }
        else{
            errorMessage.style.display = 'none';
            const users = await instancesGetter('users');
            const user = users.find(user => user.email === emailInput.value);
            if (user) {
                    emailFound.style.display = 'block';
                return;
            }else{
                emailFound.style.display = 'none';
                const formData = new FormData(form);
                fetch('http://localhost:3000/api/users', {
                    method: 'POST',
                    id: Number(users.slice(-1)[0].id) + 1,
                    name: formData.get('name'),
                    email: formData.get('email'),
                    password: formData.get('password'),
                    role: 'customer'
                })
            }
        }
    })
})