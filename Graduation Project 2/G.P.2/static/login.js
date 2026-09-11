// Function to validate email format
function validateEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
}

// Function to validate password
function validatePassword(password) {
    // Ensure the password includes at least 6 characters
    return password.length >= 6;
}

// Function to toggle show/hide password
function togglePassword() {
    const passwordInput = document.getElementById("password");
    const passwordIcon = document.querySelector(".icon-right");
    
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        passwordIcon.classList.remove("fa-eye-slash");
        passwordIcon.classList.add("fa-eye");
    } else {
        passwordInput.type = "password";
        passwordIcon.classList.remove("fa-eye");
        passwordIcon.classList.add("fa-eye-slash");
    }
}

// Add event listener for the login form submission
document.getElementById("loginform").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value; // Get selected role
    const errorMessage = document.querySelector(".error");

    // Input validation
    if (!email || !password || !role) {
        errorMessage.textContent = "All fields are required!";
        errorMessage.classList.add("show");

        setTimeout(() => {
            errorMessage.classList.remove("show");
        }, 5000);

    } else if (!validateEmail(email)) {
        errorMessage.textContent = "Please enter a valid email address.";
        errorMessage.classList.add("show");

        setTimeout(() => {
            errorMessage.classList.remove("show");
        }, 5000);

    } else if (!validatePassword(password)) {
        errorMessage.textContent = "Password must be at least 6 characters long.";
        errorMessage.classList.add("show");

        setTimeout(() => {
            errorMessage.classList.remove("show");
        }, 5000);

    } else {
        errorMessage.classList.remove("show");

        // Prepare form data and include role
        const formData = new FormData();  
        formData.append("email", email);
        formData.append("password", password);
        formData.append("role", role);

        // Send data to the backend using fetch
        fetch('/login', { 
            method: 'POST', 
            body: formData 
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Login successful! Redirecting to dashboard...");

                // Store role and email in localStorage
                localStorage.setItem("role", role);
                localStorage.setItem("email", email);    

                // Redirect based on role
                if (role.toLowerCase() === 'doctor' || role.toLowerCase() === 'nurse') {
                    window.location.href = "Dashboard.html";
                } else if (role.toLowerCase() === 'patient') {
                    window.location.href = "Analytics_Dashboard.html";
                } else {
                    alert("Unknown user role! Redirecting to login.");
                    window.location.href = "login.html";
                }

            } else {
                // If login failed, show error message
                errorMessage.textContent = data.message || "Invalid email or password!";
                errorMessage.classList.add("show");

                setTimeout(() => {
                    errorMessage.classList.remove("show");
                }, 5000);
            }
        })
        .catch(error => {
            // Handle connection errors
            console.error("Error:", error);
            errorMessage.textContent = "An error occurred. Please try again later.";
            errorMessage.classList.add("show");
            
            setTimeout(() => {
                errorMessage.classList.remove("show");
            }, 5000);
        });
    }
});



