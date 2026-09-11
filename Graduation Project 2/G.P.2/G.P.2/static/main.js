document.addEventListener('DOMContentLoaded', function () {
    const BASE_URL = 'http://127.0.0.1:5000';

    const loginForm = document.getElementById('loginForm');
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
                document.getElementById('loginMessage').textContent = text || 'فشل تسجيل الدخول.';
            }
        });
    }

    const searchInput = document.getElementById("input_with_icon");
    const authButton = document.getElementById("authBtn");

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            const query = searchInput.value.toLowerCase();
            console.log("Searching for: " + query);
        });
    }

    if (authButton) {
        authButton.addEventListener("click", function () {
            alert("You have successfully logged out");
            window.location.href = "Login.html";
        });
    }

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

    const note = document.querySelector('.note');
    if (note) {
        note.addEventListener('click', () => {
            alert("This is for educational use only.");
        });
    }

    // 🔹 حفظ بيانات المريض (معدلة لتتوافق مع الهيكل الجديد)
   const form = document.getElementById("patient-form");
   const saveButton = document.querySelector(".btn-save");

    if (form && saveButton) {
    saveButton.addEventListener("click", async function (event) {
        event.preventDefault();

        // نجمع بيانات الفورم
        const formData = new FormData(form);

        // نجمع قيم checkboxes الخاصة بـ patient_history المحددة
        const checkedHistories = [];
        const historyCheckboxes = document.querySelectorAll('input[name="patient_history"]:checked');

        historyCheckboxes.forEach(cb => {
            if (cb.value === "Other") {
                // لو "Other" محدد، ناخذ النص من الحقل المخصص
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

        // نحذف أي قيم سابقة بنفس الاسم
        formData.delete("patient_history");

        // نضيف القيم الجديدة مجمعة في حقل واحد نصي بفواصل
        formData.append("patient_history", checkedHistories.join(", "));

        // تعيين Timestamp إذا لم يكن موجودًا مسبقًا
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
                alert("✔ تم حفظ بيانات المريض بنجاح");
                form.reset();
            } else {
                const errorText = await response.text();
                alert("❌ فشل في حفظ البيانات: " + errorText);
            }
        } catch (error) {
            console.error("❌ خطأ في الاتصال بالخادم:", error);
            alert("❌ حدث خطأ في الاتصال بالخادم");
        }
    });
  }


    // 🔹 تسجيل الخروج
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
                    alert("❌ فشل تسجيل الخروج");
                }
            } catch (error) {
                console.error("❌ خطأ في تسجيل الخروج:", error);
                alert("❌ تعذر الاتصال بالخادم");
            }
        });
    }

 // 🔹 البحث عن مريض باستخدام PatientID
   const searchForm = document.getElementById("search-form");
   const resultDiv = document.getElementById("search-result");

    if (searchForm && resultDiv) {
    searchForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const patientId = document.getElementById("patient_id").value;

        fetch("/search_patient", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({ Patient_id: patientId })
        })
        .then(response => response.json())
        .then(data => {
            console.log("📦 Response Data:", data);
            if (data.found) {
                const p = data.patient;
                resultDiv.innerHTML = `
                    <h3>🔍 Patient Details</h3>
                    <ul>
                        <li><strong>PatientID:</strong> ${p.PatientID}</li>
                        <li><strong>Timestamp:</strong> ${p.Timestamp}</li>
                        <li><strong>Heart Rate:</strong> ${p.HeartRate}</li>
                        <li><strong>Respiratory Rate:</strong> ${p.RespiratoryRate}</li>
                        <li><strong>Body Temperature:</strong> ${p.BodyTemperature}</li>
                        <li><strong>Oxygen Saturation:</strong> ${p.OxygenSaturation}</li>
                        <li><strong>Systolic BP:</strong> ${p.SystolicBloodPressure}</li>
                        <li><strong>Diastolic BP:</strong> ${p.DiastolicBloodPressure}</li>
                        <li><strong>Age:</strong> ${p.Age}</li>
                        <li><strong>Gender:</strong> ${p.Gender}</li>
                        <li><strong>Weight:</strong> ${p.Weight_kg ?? "N/A"} kg</li>
                        <li><strong>Height:</strong> ${p.Height_m ?? "N/A"} m</li>
                        <li><strong>BMI:</strong> ${p.Derived_BMI}</li>
                        <li><strong>MAP:</strong> ${p.Derived_MAP}</li>
                        <li><strong>Pulse Pressure:</strong> ${p.Derived_Pulse_Pressure}</li>
                        <li><strong>HRV:</strong> ${p.Derived_HRV}</li>
                    </ul>
                `;
            } else {
                resultDiv.innerHTML = `<p style="color: red;">❌ No patient found with ID ${patientId}</p>`;
            }
        })
        .catch(error => {
            console.error("❌ Error:", error);
            resultDiv.innerHTML = `<p style="color: red;">An error occurred while searching.</p>`;
        });
    });
  }






    // 🔹 الرسم البياني بناء على PatientID وTimestamp
      const patientSelect = document.getElementById("patientSelect");
const checkboxes = document.querySelectorAll(".metric-checkbox");
const chartCanvas = document.getElementById("metricsChart");

// 🔹 إرسال الطلب إلى السيرفر
async function fetchPatientData() {
    const patientId = patientSelect.value;
    if (!patientId) return null;

    const response = await fetch("/analytics_data", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ patient_id: patientId })  // ✅ فقط PatientID
    });

    if (!response.ok) {
        console.error("Failed to fetch data");
        return null;
    }

    const data = await response.json();
    return data;
}

// 🔹 رسم المخطط بناءً على البيانات
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

// 🔹 لون عشوائي لكل خط

function getRandomColor() {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
}

// 🔹 ربط الأحداث
if (patientSelect) {
    patientSelect.addEventListener("change", updateChart);
}
checkboxes.forEach(cb => cb.addEventListener("change", updateChart));

});























  






 


 

 





  






