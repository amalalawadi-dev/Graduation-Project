document.addEventListener('DOMContentLoaded', () => {
  const BASE_URL = 'http://127.0.0.1:5000';

  const patientIdInput = document.getElementById('patientIdInput');
  const predictionDiv = document.getElementById('predictionResult');
  const checkboxes = document.querySelectorAll('.metric-checkbox');
  const downloadBtn = document.getElementById('downloadReportBtn');
  const chartsContainer = document.getElementById('chartsContainer');

  // 📌 تحديد الكل
  window.selectAllMetrics = function (selectAllCheckbox) {
    const isChecked = selectAllCheckbox.checked;
    checkboxes.forEach(cb => { cb.checked = isChecked; });
    triggerFetchAndRender();
  };

  // 📥 تحميل التقرير PDF
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
    console.error("The upload button is missing from the page ❌!");
  }

  // 🟢 التهيئة التلقائية إذا كان patientId موجود من السيرفر
  if (typeof patientIdFromServer !== 'undefined' && patientIdFromServer) {
    patientIdInput.value = patientIdFromServer;
    triggerFetchAndRender();
  }

  // 🧠 أحداث الإدخال والتغيير
  patientIdInput.addEventListener('input', triggerFetchAndRender);
  patientIdInput.addEventListener('change', triggerFetchAndRender);
  checkboxes.forEach(cb => cb.addEventListener('change', triggerFetchAndRender));

  // 📊 دالة جلب البيانات وعرضها
  function triggerFetchAndRender() {
    const patientId = patientIdInput.value.trim();
    if (!patientId) return;

    const selectedMetrics = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    if (selectedMetrics.length === 0) return;

    console.log("🔍 Fetching for patient ID:", patientId);

    fetch(`${BASE_URL}/get_patient_data`, {
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

        // 🔮 طلب التنبؤ بالخطر
        fetch(`${BASE_URL}/predict_risk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patient_id: patientId }),
        })
          .then(res => res.json())
          .then(predictionData => {
            if (predictionData.error) {
              predictionDiv.innerHTML = `<p style="color:red;">${predictionData.error}</p>`;
            } else {
              predictionDiv.innerHTML = `
                <h3>🧪 Risk Prediction:
                  <span style="color:${predictionData.risk_prediction === "High Risk" ? "red" : "green"}">
                    ${predictionData.risk_prediction}
                  </span>
                </h3>
              `;
            }
          })
          .catch(err => {
            predictionDiv.innerHTML = `<p style="color:red;">Prediction error: ${err.message}</p>`;
            console.error('Prediction fetch error:', err);
          });
      })
      .catch(err => {
        predictionDiv.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
        console.error('Fetch error:', err);
      });
  }

  // 🖼 عرض الرسوم البيانية
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

  // 🧾 تحديث الكروت (المتوسطات)
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

});













