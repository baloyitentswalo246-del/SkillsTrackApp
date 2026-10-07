const form = document.getElementById('registerForm');
const message = document.getElementById('message');

form.addEventListener('submit', function(event) {
    event.preventDefault();

const name = document.getElementById('fullname');
const email = document.getElementById('email');
const password = document.getElementById('password');

console.log(name.value, email.value, password.value);

function validateForm() {
    if (name.value === '' || email.value === '' || password.value === '') {
        message.textContent = 'All fields are required.';
    } else {
        message.textContent = 'Registration successful!';
    }
}
    console.log({validateForm: validateForm()})
});

