//  التحقق من صلاحية الدور قبل تحميل أي شيء
const role = localStorage.getItem("role");
if (role && role.toLowerCase() === "patient") {
    alert("Access denied. Redirecting to analytics page.");
    window.location.href = "Analytics_Dashboard.html";
}
// زر تسجيل الخروج
const logoutBtn = document.getElementById("logout-Btn");
logoutBtn.addEventListener("click", () => {
  // يمكنك هنا مسح بيانات الجلسة أو التوجيه لصفحة تسجيل الدخول
  alert("You have been logged out.");
  window.location.href = "login.html";
});

const searchInput = document.getElementById("input_with_icon");
const patientDetailsDiv = document.getElementById("patient-details");
let patientsData = [];

// تحميل ملف CSV عند بداية الصفحة
fetch("human_vital_signs_dataset_2024.csv")
  .then(response => response.text())
  .then(csvText => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        patientsData = results.data;
      },
    });
  });

// البحث عند الضغط على Enter فقط
searchInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    const searchValue = searchInput.value.trim();
    if (searchValue !== "") {
      const patient = patientsData.find(p => p["Patient ID"] === searchValue);

      if (patient) {
        const { Age, Gender, ["Weight (kg)"]: Weight, ["Height (m)"]: Height, ["Patient ID"]: ID } = patient;

        patientDetailsDiv.innerHTML = `
          <div class="patient-box">
            <h3>Patient Information</h3>
            <p><strong>ID:</strong> ${ID}</p>
            <p><strong>Age:</strong> ${Age}</p>
            <p><strong>Gender:</strong> ${Gender}</p>
            <p><strong>Weight:</strong> ${parseFloat(Weight).toFixed(1)} kg</p>
            <p><strong>Height:</strong> ${parseFloat(Height).toFixed(2)} m</p>
          </div>
        `;
        patientDetailsDiv.style.display = "block";
      } else {
        patientDetailsDiv.innerHTML = "<p>No patient found with this ID.</p>";
        patientDetailsDiv.style.display = "block";
      }
    } else {
      patientDetailsDiv.style.display = "none";
    }
  }
});

// إخفاء البوكس عند الضغط خارجه
document.addEventListener("click", function (e) {
  const isClickInside =
    patientDetailsDiv.contains(e.target) || searchInput.contains(e.target);
  if (!isClickInside) {
    patientDetailsDiv.style.display = "none";
  }
});
