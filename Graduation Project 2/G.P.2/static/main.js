
 document.addEventListener("DOMContentLoaded", function () {
    
     const BASE_URL = 'http://127.0.0.1:5000';
    // دوال toggle password و role change
    function togglePassword() {
        const passwordInput = document.getElementById("password");
        const toggleIcon = document.getElementById("togglePassword");
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        toggleIcon.classList.toggle("fa-eye");
        toggleIcon.classList.toggle("fa-eye-slash");
    }

    function handleRoleChange() {
        const roleSelect = document.getElementById("role");
        const patientIdField = document.getElementById("patientIdField");

        if (roleSelect.value === "patient") {
            patientIdField.style.display = "block";
        } else {
            patientIdField.style.display = "none";
            document.getElementById("patient_id").value = "";
        }
    }

    // إظهار أو إخفاء حقل patient ID حسب الدور (تحديث عند تغير القيمة)
    const roleSelect = document.getElementById("role");
    const patientIdField = document.getElementById("patientIdField");
    roleSelect.addEventListener("change", function () {
        if (this.value === "patient") {
            patientIdField.style.display = "block";
        } else {
            patientIdField.style.display = "none";
        }
    });

    // إرسال نموذج تسجيل الدخول باستخدام fetch + معالجة النتائج
    const loginForm = document.getElementById("loginForm");
    const errorMsg = document.getElementById("login-error");

    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault(); // منع الإرسال التقليدي

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const role = roleSelect.value;
            const patient_id = document.getElementById("patient_id").value;

            fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password,
                    role,
                    patient_id: role === "patient" ? patient_id : null
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = "/home"; // أو أي صفحة بعد تسجيل الدخول
                } else {
                    errorMsg.style.display = "block";
                    errorMsg.textContent = data.message || "خطأ في تسجيل الدخول.";
                }
            })
            .catch(err => {
                errorMsg.style.display = "block";
                errorMsg.textContent = "حدث خطأ في الاتصال بالخادم.";
                console.error("Login Error:", err);
            });
        });
    }

    

    // إرسال نموذج تسجيل الدخول (طريقة أخرى باستخدام FormData) - إذا عندك نموذج loginForm
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = new FormData(loginForm);

            const res = await fetch(`${BASE_URL}/login`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const text = await res.text();
            if (res.redirected) {
                window.location.href = res.url;
            } else {
                const loginMessage = document.getElementById('loginMessage');
                if (loginMessage) loginMessage.textContent = text || 'Login failed.';
            }
        });
    }

    // بحث في input_with_icon
    const searchInput = document.getElementById("input_with_icon");
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            const query = searchInput.value.toLowerCase();
            console.log("Searching for: " + query);
        });
    }

    // زر تسجيل الخروج
    const authButton = document.getElementById("authBtn");
    if (authButton) {
        authButton.addEventListener("click", function () {
            alert("You have successfully logged out");
            window.location.href = "Login.html";
        });
    }

    // Toggle تفاصيل الكارد
    function toggleCard(cardId) {
        const card = document.getElementById(cardId);
        const details = card.querySelector('.Additional-details');
        if (details.style.display === 'block') {
            details.style.display = 'none';
        } else {
            details.style.display = 'block';
        }
    }

    console.log("About page loaded!");

    // نوت تفاعلية
    const note = document.querySelector('.note');
    if (note) {
        note.addEventListener('click', () => {
            alert("This is for educational use only.");
        });
    }

    // حفظ بيانات المريض
    const form = document.getElementById("patient-form");
    const saveButton = document.querySelector(".btn-save");

    if (form && saveButton) {
        saveButton.addEventListener("click", async function (event) {
            event.preventDefault();

            const formData = new FormData(form);

            const checkedHistories = [];
            const historyCheckboxes = document.querySelectorAll('input[name="patient_history"]:checked');

            historyCheckboxes.forEach(cb => {
                if (cb.value === "Other") {
                    const otherText = document.getElementById("other_history_input")?.value.trim();
                    if (otherText) {
                        checkedHistories.push(otherText);
                    } else {
                        checkedHistories.push("Other");
                    }
                } else {
                    checkedHistories.push(cb.value);
                }
            });

            formData.delete("patient_history");
            formData.append("patient_history", checkedHistories.join(", "));

            if (!formData.get("Timestamp")) {
                const now = new Date();
                formData.set("Timestamp", now.toISOString());
            }

            try {
                const response = await fetch("/save_patient", {
                    method: "POST",
                    body: formData
                });

                if (response.ok) {
                    alert("✔ Patient data saved successfully.");
                    form.reset();
                } else {
                    const errorText = await response.text();
                    alert("❌ Failed to save data: " + errorText);
                }
            } catch (error) {
                console.error("❌ Server communication error:", error);
                alert("❌ An error occurred while connecting to the server.");
            }
        });
    }

    // تسجيل الخروج
    const logoutBtn = document.getElementById("logout-Btn") || document.querySelector(".logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async function (e) {
            e.preventDefault();

            try {
                const response = await fetch("/logout", {
                    method: "POST",
                    credentials: "same-origin",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (response.ok) {
                    window.location.href = "/login";
                } else {
                    alert("❌ Logout failed.");
                }
            } catch (error) {
                console.error("❌ Logout error:", error);
                alert("❌ Could not connect to the server.");
            }
        });
    }



    // رسم بياني للقياسات الزمنية حسب PatientID والقياسات المختارة
    const patientSelect = document.getElementById("patientSelect");
    const checkboxes = document.querySelectorAll(".metric-checkbox");
    const chartCanvas = document.getElementById("metricsChart");

    async function fetchPatientData() {
        const patientId = patientSelect.value;
        if (!patientId) return null;

        const response = await fetch("/analytics_data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ patient_id: patientId })
        });

        if (!response.ok) {
            console.error("Failed to fetch data");
            return null;
        }

        const data = await response.json();
        return data;
    }

    async function updateChart() {
        const selectedMetrics = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        if (!patientSelect.value || selectedMetrics.length === 0) {
            if (window.chartInstance) {
                window.chartInstance.destroy();
                window.chartInstance = null;
            }
            chartCanvas.getContext('2d').clearRect(0, 0, chartCanvas.width, chartCanvas.height);
            return;
        }

        const data = await fetchPatientData();
        if (!data || data.error) {
            alert(data?.error || "No data found.");
            if (window.chartInstance) {
                window.chartInstance.destroy();
                window.chartInstance = null;
            }
            return;
        }

        const labels = data.timestamps;
        const datasets = selectedMetrics.map(metric => ({
            label: metric,
            data: data.values[metric] || [],
            borderColor: getRandomColor(),
            fill: false,
            tension: 0.3
        }));

        if (window.chartInstance) {
            window.chartInstance.destroy();
        }

        window.chartInstance = new Chart(chartCanvas, {
            type: "line",
            data: { labels, datasets },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: { display: true, text: "Timestamp" }
                    },
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    function getRandomColor() {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    if (patientSelect) {
        patientSelect.addEventListener("change", updateChart);
    }

    if (checkboxes) {
        checkboxes.forEach(cb => cb.addEventListener("change", updateChart));
    }
});
