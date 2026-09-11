document.addEventListener('DOMContentLoaded', () => {
  const BASE_URL = 'http://127.0.0.1:5000';

  const patientIdInput = document.getElementById('patientIdInput');
  const predictionDiv = document.getElementById('predictionResult');
  const checkboxes = document.querySelectorAll('.metric-checkbox');
  const downloadBtn = document.getElementById('downloadReportBtn');
  const chartsContainer = document.getElementById('chartsContainer');

  function triggerFetchAndRender() {
    const patientId = patientIdInput.value.trim();
    if (!patientId) return;

    const selectedMetrics = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    if (selectedMetrics.length === 0) return;

    fetch('/get_patient_data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_id: patientId, metrics: selectedMetrics }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        predictionDiv.innerHTML = `<p style="color:red;">${data.error}</p>`;
        return;
      }

      renderCharts(data);
      updateCards(data);

      // ✅ عرض التنبؤ فقط بدون صورة
      predictionDiv.innerHTML = `
        <h3>🧪 Risk Prediction:
          <span style="color:${data.prediction === "High Risk" ? "red" : "green"}">
            ${data.prediction}
          </span>
        </h3>
      `;
    })
    .catch(err => {
      predictionDiv.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
      console.error('Fetch error:', err);
    });
  }

  function renderCharts(data) {
    chartsContainer.innerHTML = '';
    const timestamps = data.timestamps || [];

    Object.keys(data).forEach(metric => {
      if (['timestamps', 'prediction', 'plot_url'].includes(metric)) return;

      const canvas = document.createElement('canvas');
      chartsContainer.appendChild(canvas);

      new Chart(canvas, {
        type: 'line',
        data: {
          labels: timestamps,
          datasets: [{
            label: metric,
            data: data[metric],
            borderColor: 'rgba(75, 192, 192, 1)',
            fill: false,
            tension: 0.1,
          }],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: `${metric} over time`,
            },
          },
        },
      });
    });
  }

  function updateCards(data) {
    const heartRates = data['HeartRate'] || [];
    const temperatures = data['BodyTemperature'] || [];
    const systolic = data['SystolicBloodPressure'] || [];
    const diastolic = data['DiastolicBloodPressure'] || [];

    const avg = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : '--';

    const cards = document.querySelectorAll('.card');
    if (cards.length >= 3) {
      cards[0].textContent = `🧠 Avg. Heart Rate: ${avg(heartRates)}`;
      cards[1].textContent = `🌡 Avg. Temp: ${avg(temperatures)}`;
      cards[2].textContent = `🩸 Blood Pressure: ${avg(systolic)}/${avg(diastolic)}`;
    }
  }

  patientIdInput.addEventListener('input', triggerFetchAndRender);
  patientIdInput.addEventListener('change', triggerFetchAndRender);
  checkboxes.forEach(cb => cb.addEventListener('change', triggerFetchAndRender));

  window.selectAllMetrics = function(selectAllCheckbox) {
    const isChecked = selectAllCheckbox.checked;
    checkboxes.forEach(cb => { cb.checked = isChecked; });
    triggerFetchAndRender();
  };

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Patient Report - MedAnalyzer", 20, 20);

      const notes = document.getElementById('doctorNotes')?.value || '';
      doc.setFontSize(12);
      doc.text("Doctor Notes:", 20, 35);
      doc.text(notes, 20, 45);

      const charts = document.querySelectorAll("#chartsContainer canvas");
      let yPosition = 60;

      for (let i = 0; i < charts.length; i++) {
        const chart = charts[i];
        const imgData = chart.toDataURL('image/png');
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.addImage(imgData, 'PNG', 20, yPosition, 160, 90);
        yPosition += 100;
      }

      doc.save("patient_report.pdf");
    });
  } else {
    console.error("❌ زر التحميل غير موجود في الصفحة!");
  }
});










