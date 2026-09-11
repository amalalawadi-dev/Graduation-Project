// Set current user role and ID (replace with real authentication info)
const currentUserRole = "doctor"; // Options: "doctor", "nurse", "patient"
const currentUserId = "123"; // Used to restrict patient access

// HTML elements
const patientInput = document.getElementById("patientIdInput");
const timestampInput = document.getElementById("timestampFilter");
const metricCheckboxes = document.querySelectorAll(".metric-checkbox");
const resultsCards = document.getElementById("resultsCards");
const chartCanvas = document.getElementById("metricsChart");
const notesBox = document.getElementById("doctorNotes");
const downloadBtn = document.getElementById("downloadReportBtn");

let chartInstance = null;

// Fetch data from backend API
async function fetchPatientData() {
  const patientId = patientInput.value.trim();
  const timestamp = timestampInput.value;

  if (!patientId) {
    alert("Please enter a Patient ID");
    return;
  }

  // If user is a patient, restrict access to their own data
  if (currentUserRole === "patient" && patientId !== currentUserId) {
    alert("Access denied: You can only view your own data.");
    return;
  }

  try {
    // Replace this URL with your actual backend endpoint
    const response = await fetch(`https://your-api.com/patient-data?patientId=${patientId}`);
    const data = await response.json();

    // Filter by timestamp if selected
    const filteredData = timestamp
      ? data.filter(d => d.timestamp.startsWith(timestamp))
      : data;

    // Get selected measurements
    const selectedMetrics = Array.from(metricCheckboxes)
      .filter(cb => cb.checked && cb.value !== "Select All")
      .map(cb => cb.value);

    if (selectedMetrics.length === 0) {
      alert("Please select at least one measurement");
      return;
    }

    drawChart(filteredData, selectedMetrics);
    updateStats(filteredData, selectedMetrics);
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("Failed to load patient data.");
  }
}

// Draw chart using Chart.js
function drawChart(data, selectedMetrics) {
  const labels = data.map(d => d.timestamp);

  const datasets = selectedMetrics.map(metric => ({
    label: metric,
    data: data.map(d => d[metric]),
    borderColor: getRandomColor(),
    fill: false,
    tension: 0.2
  }));

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(chartCanvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Patient Measurements Over Time"
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Timestamp"
          }
        },
        y: {
          title: {
            display: true,
            text: "Measurement Value"
          }
        }
      }
    }
  });
}

// Calculate statistics for each selected metric
function updateStats(data, metrics) {
  const container = resultsCards;
  container.innerHTML = "";

  metrics.forEach(metric => {
    const values = data.map(d => d[metric]).filter(v => !isNaN(v));
    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
    const min = Math.min(...values).toFixed(2);
    const max = Math.max(...values).toFixed(2);
    const std = standardDeviation(values).toFixed(2);

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `📊 <strong>${metric}</strong><br>Avg: ${avg}<br>Min: ${min}<br>Max: ${max}<br>Std: ${std}`;
    container.appendChild(card);
  });
}

// Standard deviation helper function
function standardDeviation(values) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(values.map(v => (v - mean) ** 2).reduce((a, b) => a + b, 0) / values.length);
}

// Generate and download PDF report
downloadBtn.addEventListener("click", async () => {
  const patientId = patientInput.value.trim();
  const timestamp = timestampInput.value;
  const selectedMetrics = Array.from(metricCheckboxes)
    .filter(cb => cb.checked && cb.value !== "Select All")
    .map(cb => cb.value);

  const response = await fetch(`https://your-api.com/patient-data?patientId=${patientId}`);
  const data = await response.json();
  const filteredData = timestamp
    ? data.filter(d => d.timestamp.startsWith(timestamp))
    : data;

  const doc = new window.jspdf.jsPDF();
  doc.setFontSize(16);
  doc.text("📄 Patient Report", 10, 15);
  doc.setFontSize(12);
  doc.text(`Patient ID: ${patientId}`, 10, 25);
  doc.text(`Date Filter: ${timestamp || "All"}`, 10, 32);
  doc.text(`Doctor Notes: ${notesBox.value}`, 10, 42);

  let y = 55;
  selectedMetrics.forEach(metric => {
    const values = filteredData.map(d => d[metric]).filter(v => !isNaN(v));
    if (values.length === 0) return;
    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
    const min = Math.min(...values).toFixed(2);
    const max = Math.max(...values).toFixed(2);
    const std = standardDeviation(values).toFixed(2);

    doc.text(`${metric}: Avg = ${avg}, Min = ${min}, Max = ${max}, Std = ${std}`, 10, y);
    y += 10;
  });

  doc.save(`Patient_Report_${patientId}.pdf`);
});

// Handle "Select All" checkbox
window.selectAllMetrics = function (checkbox) {
  const checkboxes = document.querySelectorAll(".metric-checkbox");
  checkboxes.forEach(cb => {
    if (cb.value !== "Select All") cb.checked = checkbox.checked;
  });
}

// Trigger fetch when any input changes
document.getElementById("patientIdInput").addEventListener("change", fetchPatientData);
document.getElementById("timestampFilter").addEventListener("change", fetchPatientData);
metricCheckboxes.forEach(cb => cb.addEventListener("change", fetchPatientData));

// Generate random color for each chart line
function getRandomColor() {
  return "hsl(" + Math.floor(Math.random() * 360) + ", 70%, 60%)";
}
