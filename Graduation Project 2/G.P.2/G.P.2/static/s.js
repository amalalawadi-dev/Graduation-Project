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
            resultBox.textContent = "✔️ تم حفظ البيانات بنجاح";
            form.reset(); // إعادة تعيين النموذج
        } else {
            resultBox.style.color = "red";
            resultBox.textContent = "❌ فشل في حفظ البيانات";
        }
    } catch (err) {
        console.error("❌ خطأ أثناء الإرسال:", err);
        document.getElementById("alerts").style.color = "red";
        document.getElementById("alerts").textContent = "❌ خطأ في الاتصال بالخادم";
    }
});
