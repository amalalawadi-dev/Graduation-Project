window.onload = function() {
    // Get DOM elements
    const form = document.querySelector('form');
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirm-password');
    const roleField = document.getElementById('role');
    const successMessage = document.getElementById('success-message');

    // Function to validate email format
    function isValidEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    }

    // Ensure required elements exist
    if (!form || !emailField || !passwordField || !confirmPasswordField || !roleField) {
        console.error("Some required form elements are missing!");
        return; // Do not proceed if elements are missing
    }

    // Form submission event
    form.onsubmit = async function(event) {
        // Prevent default form submission
        event.preventDefault();

        // Get trimmed values
        const email = emailField.value.trim();
        const password = passwordField.value.trim();
        const confirmPassword = confirmPasswordField.value.trim();
        const role = document.getElementById('role').value;

        // Validate email format
        if (!isValidEmail(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        // Check if role is selected
        if (!role) {
            alert("Please select a role.");
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // Ensure password is not too short
        if (password.length < 6) {
            alert("Password must be at least 6 characters long!");
            return;
        }

        // Create data object to send to the backend
        const formData = {
            email: email,
            password: password,
            role: role,
        };

        try {
            // Send data to the server using fetch
            const response = await fetch('/api/create-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // If successful, show success message
                successMessage.style.display = 'block';
                successMessage.textContent = "Your account has been created successfully!";

                // Reset form fields
                form.reset();

                // Store user information in localStorage
                localStorage.setItem("userEmail", email);
                localStorage.setItem("role", role);

                // Redirect based on user role
                if (role === "doctor" || role === "nurse") {
                    window.location.href = "Dashboard.html";
                } else if (role === "patient") {
                    window.location.href = "Analytics_Dashboard.html";
                }

            } else {
                // Show error message from server
                alert(data.message || "An error occurred while creating your account.");
            }

        } catch (error) {
            // Show error if fetch fails
            alert("An error occurred. Please try again.");
        }
    };
};

