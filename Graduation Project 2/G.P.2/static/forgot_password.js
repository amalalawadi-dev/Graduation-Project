document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("reset-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("new_password");
    const successMessage = document.getElementById("success-message");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = emailInput.value.trim();
        const newPassword = passwordInput.value.trim();

        if (!email || !newPassword) {
            alert("Please enter your email and new password.");
            return;
        }

        fetch("/forgot_password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                new_password: newPassword
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                successMessage.style.display = "block";
                successMessage.textContent = data.message;
            } else {
                alert("Error: " + data.message);
            }
        })
        .catch(error => {
            alert("An error occurred: " + error);
            console.error(error);
        });
    });
});


