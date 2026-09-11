document.getElementById("patient-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const BASE_URL = 'http://127.0.0.1:5000';
    const form = e.target;
    const formData = new FormData(form);
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
        params.append(key, value);
    }

    try {
        const response = await fetch("/save_patient", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params
        });

        const resultBox = document.getElementById("alerts");
        if (response.ok) {
            resultBox.style.color = "green";
            resultBox.textContent = "✔️ Patient data saved successfully";
            form.reset(); // Reset the form
        } else {
            resultBox.style.color = "red";
            resultBox.textContent = "❌ Failed to save patient data";
        }
    } catch (err) {
        console.error("❌ Error during submission:", err);
        document.getElementById("alerts").style.color = "red";
        document.getElementById("alerts").textContent = "❌ Server connection error";
    }
});

