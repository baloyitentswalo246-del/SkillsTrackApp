const form = document.getElementById('loginForm');
const message = document.getElementById('message');

const email = document.getElementById('email');
const password = document.getElementById('password');

function showMessage(text, type) {
    message.textContent = text;
    message.classList.remove('success', 'error');
    message.classList.add(type);
}

form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!email.value.trim() || !password.value) {
        showMessage('Email and password are required.', 'error');
        return;
    }

    console.log('Learner sign-in attempt:', email.value.trim());
    showMessage('Sign in successful!', 'success');
});

