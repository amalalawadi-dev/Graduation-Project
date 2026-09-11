
     
function uploadfile() {
    const BASE_URL = 'http://127.0.0.1:5000';
    const fileInput = document.getElementById("file-upload");
    const file = fileInput.files[0];

    if (!file) {
        document.getElementById("warningMessage").innerText = "Please select a file before uploading.";
        document.getElementById("warningMessage").style.display = "block";
        return;
    }

    const formData = new FormData();
    formData.append("file-upload", file); // لاحظ الاسم "file" هنا

    fetch("/upload", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => {
        console.error("Error uploading file:", error);
    });
}


