document.addEventListener('DOMContentLoaded', function () {
    let loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            let usernameField = document.getElementById('login-username');
            usernameField.value = DOMPurify.sanitize(usernameField.value);
        });
    }

    let registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function (event) {
            let registerUsernameField = document.getElementById('register-username');
            registerUsernameField.value = DOMPurify.sanitize(registerUsernameField.value);
        });
    }
});

