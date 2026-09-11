//   التحقق من أن المستخدم "طبيب"
//   التحقق من أن المستخدم "طبيب"

    


//  ثانيًا: دالة فتح وإغلاق التفاصيل   
function toggleCard(cardId) {
  
   const BASE_URL = 'http://127.0.0.1:5000';
    const card = document.getElementById(cardId);
    const details = card.querySelector(".Additional-details");

    if (details.style.display === "none" || details.style.display === "") {
        details.style.display = "block";
    } else {
        details.style.display = "none";
    }
}

//  ثالثًا: تفعيل حفظ الملاحظات في localStorage عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function () {
  
   const BASE_URL = 'http://127.0.0.1:5000';
  for (let i = 1; i <= 20; i++) {
    const textarea = document.getElementById(`notes-card${i}`);
    if (textarea) {
      textarea.value = localStorage.getItem(`notes-card${i}`) || "";
      textarea.addEventListener("input", function () {
        localStorage.setItem(`notes-card${i}`, textarea.value);
      });
    }
  }
});
   
  // // وظيفة لإرسال الوصفة الطبية إلى الباك اند
  async function savePrescription() {
    const patientId = document.getElementById("patientId").value.trim();
    const prescriptionText = document.getElementById("prescriptionText").value.trim();
    const messageBox = document.getElementById("messageBox");

    // التحقق
    if (!patientId || !prescriptionText) {
      messageBox.textContent = "❌ Please fill in all fields.";
      messageBox.style.color = "red";
      return;
    }

    // اعداد كائن الوصفة
    const prescription = {
      patientId: patientId,
      prescription: prescriptionText,
      date: new Date().toISOString() // optional date field
    };

    try {
      // ارسال البيانات للباك اند
      const response = await fetch("https://example.com/api/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(prescription)
      });

      if (response.ok) {
        messageBox.textContent = "✅ Prescription sent successfully.";
        messageBox.style.color = "green";
        messageBox.style.backgroundColor = "#d4edda";  


        // Clear form
        document.getElementById("patientId").value = "";
        document.getElementById("prescriptionText").value = "";
      } else {
        messageBox.textContent = "❌ Failed to send data to server.";
        messageBox.style.color = "red";
        messageBox.style.backgroundColor = "#f8d7da";

      }
    } catch (error) {
      console.error("Error:", error);
      messageBox.textContent = "❌ Network error.";
      messageBox.style.color = "red";
      messageBox.style.backgroundColor = "#f8d7da";

    }
  } 