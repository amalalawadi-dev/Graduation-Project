function markInvalidField(input) {
  input.classList.add("invalid-input");
}

function clearFieldHighlights() {
  document.querySelectorAll(".invalid-input").forEach(input => {
    input.classList.remove("invalid-input");
  });
}

function calculateBMI() {
  clearFieldHighlights();
  const weightEl = document.getElementById("Weight_kg");
  const heightEl = document.getElementById("Height_m");
  const weight = parseFloat(weightEl.value);
  const height = parseFloat(heightEl.value);

  if (!weight || !height || weight <= 0 || height <= 0) {
    alert("Please enter valid weight and height to calculate BMI.");
    if (!weight || weight <= 0) markInvalidField(weightEl);
    if (!height || height <= 0) markInvalidField(heightEl);
    return;
  }

  const bmi = weight / (height * height);
  document.getElementById("Derived_BMI").value = bmi.toFixed(2);
  showAlert("bmi", bmi);
}

function calculatePulsePressure() {
  clearFieldHighlights();
  const systolicEl = document.getElementById("SystolicBloodPressure");
  const diastolicEl = document.getElementById("DiastolicBloodPressure");
  const systolic = parseFloat(systolicEl.value);
  const diastolic = parseFloat(diastolicEl.value);

  if (!systolic || !diastolic || systolic <= 0 || diastolic <= 0) {
    alert("Please enter valid systolic and diastolic pressure to calculate Pulse Pressure.");
    if (!systolic || systolic <= 0) markInvalidField(systolicEl);
    if (!diastolic || diastolic <= 0) markInvalidField(diastolicEl);
    return;
  }

  const pp = systolic - diastolic;
  document.getElementById("Derived_Pulse_Pressure").value = pp.toFixed(2);
  showAlert("pp", pp);
}

function calculateMAP() {
  clearFieldHighlights();
  const systolicEl = document.getElementById("SystolicBloodPressure");
  const diastolicEl = document.getElementById("DiastolicBloodPressure");
  const systolic = parseFloat(systolicEl.value);
  const diastolic = parseFloat(diastolicEl.value);

  if (!systolic || !diastolic || systolic <= 0 || diastolic <= 0) {
    alert("Please enter valid systolic and diastolic pressure to calculate MAP.");
    if (!systolic || systolic <= 0) markInvalidField(systolicEl);
    if (!diastolic || diastolic <= 0) markInvalidField(diastolicEl);
    return;
  }

  const map = (systolic + 2 * diastolic) / 3;
  document.getElementById("Derived_MAP").value = map.toFixed(2);
  showAlert("map", map);
}

function calculateHRV() {
  clearFieldHighlights();
  const heartRateEl = document.getElementById("HeartRate");
  const heartRate = parseFloat(heartRateEl.value);

  if (!heartRate || heartRate <= 0) {
    alert("Please enter a valid heart rate to calculate HRV.");
    markInvalidField(heartRateEl);
    return;
  }

  const hrv = (60000 / heartRate);
  document.getElementById("Derived_HRV").value = hrv.toFixed(2);
  showAlert("hrv", hrv);
}

function showAlert(type, value) {
  const alertBox = document.getElementById("alerts");
  let message = "";
  let isAbnormal = false;

  switch (type) {
    case "bmi":
      if (value < 18.5 || value > 25) {
        message = `Abnormal BMI: ${value.toFixed(2)}`;
        isAbnormal = true;
      }
      break;
    case "pp":
      if (value < 30 || value > 60) {
        message = `Abnormal Pulse Pressure: ${value.toFixed(2)} mmHg`;
        isAbnormal = true;
      }
      break;
    case "map":
      if (value < 65 || value > 105) {
        message = `Abnormal MAP: ${value.toFixed(2)} mmHg`;
        isAbnormal = true;
      }
      break;
    case "hrv":
      if (value < 400 || value > 1200) {
        message = `Abnormal HRV: ${value.toFixed(2)} ms`;
        isAbnormal = true;
      }
      break;
  }

  alertBox.textContent = isAbnormal ? message : "";
}

document.querySelector(".btn-save").addEventListener("click", async function () {
  clearFieldHighlights();
  const form = document.querySelector("form");
  const formData = new FormData(form);
  const jsonData = {};
  let hasEmptyField = false;
  let hasInvalidNumber = false;

  formData.forEach((value, key) => {
    const input = form.querySelector(`[name="${key}"]`);
    if (!value.trim()) {
      hasEmptyField = true;
      markInvalidField(input);
    } else if (input && input.type === "number" && isNaN(parseFloat(value))) {
      hasInvalidNumber = true;
      markInvalidField(input);
    }
    jsonData[key] = value;
  });

  if (hasEmptyField || hasInvalidNumber) {
    let message = "Please check the following:\n";
    if (hasEmptyField) message += "- All fields must be filled.\n";
    if (hasInvalidNumber) message += "- Some numeric fields are invalid.\n";
    alert(message);
    return;
  }

  try {
    const response = await fetch("/patient_data_entry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonData)
    });

    if (response.ok) {
      alert("Data saved successfully");
    } else {
      alert("Failed to save data");
    }
  } catch (error) {
    alert("Error connecting to the server");
    console.error(error);
  }
});

async function uploadfile() {
  const fileInput = document.getElementById("file-upload");
  const file = fileInput.files[0];
  const warningMessage = document.getElementById("warningMessage");

  if (!file) {
    warningMessage.style.display = "block";
    warningMessage.textContent = "Please select a file to upload";
    return;
  }

  const allowedTypes = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ];

  if (!allowedTypes.includes(file.type)) {
    warningMessage.style.display = "block";
    warningMessage.textContent = "Unsupported file format";
    return;
  }

  warningMessage.style.display = "none";

  try {
    const formData = new FormData();
    formData.append("csvFile", file);

    const response = await fetch("https://your-server.com/api/upload-csv", {
      method: "POST",
      body: formData
    });

    if (response.ok) {
      alert("File uploaded successfully!");
    } else {
      alert("Failed to upload the file.");
    }
  } catch (error) {
    alert("Error occurred during file upload.");
    console.error(error);
  }
}


