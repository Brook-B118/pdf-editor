
if (document.getElementById("register-form")) {
    // Validating registration form

    let form = document.getElementById("register-form");
    let register_username = document.getElementById("register-username");
    let register_password = document.getElementById("register-password");
    let register_confirm_pass = document.getElementById("register-confirm");

    form.addEventListener("submit", function (event) {
        if (register_username.value.length < 4 || register_username.value.length > 25) {
            event.preventDefault();
            let errorMessage = document.getElementById("register-error-message");
            errorMessage.textContent = "Username needs to be between 4 characters and 25 characters in length.";
            form.appendChild(errorMessage);
        } else if (register_password.value != register_confirm_pass.value) {
            event.preventDefault();
            let errorMessage = document.getElementById("register-error-message");
            errorMessage.textContent = "Passwords do not match"
            form.appendChild(errorMessage)
        } else if (register_username.value === "" || register_password.value === "" || register_confirm_pass.value === "") {
            event.preventDefault();
            let errorMessage = document.getElementById("register-error-message");
            errorMessage.textContent = "All fields must be filled out."
            form.appendChild(errorMessage)
        }
    });
}


if (document.getElementById("login-form")) {
    // Validating login form

    // get the other input elements...
    let loginForm = document.getElementById("login-form");
    let login_username = document.getElementById("login-username");
    let login_password = document.getElementById("login-password");

    loginForm.addEventListener("submit", function (event) {
        // validation code for the login form...
        if (login_username.value === "" || login_password.value === "") {
            event.preventDefault();
            let errorMessage = document.getElementById("login-error-message");
            errorMessage.textContent = "All fields must be filled out"
            loginForm.appendChild(errorMessage)
        }
    });
}

