// وظيفة للتحقق من صحة البريد الإلكتروني
function validateEmail(email) {
    const emailPattern =/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
}

// وظيفة للتحقق من صحة كلمة المرور
function validatePassword(password) {
    // تأكيد من أن كلمة المرور تتضمن حد أدنى من الحروف والأرقام
    return password.length >= 6;
}

// وظيفة لتبديل إظهار/إخفاء كلمة المرور
function togglePassword() {
    const passwordInput = document.getElementById("password");
    const passwordIcon = document.querySelector(".icon-right");
    
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        passwordIcon.classList.remove("fa-eye-slash");
        passwordIcon.classList.add("fa-eye");
    } else {
        passwordInput.type = "password";
        passwordIcon.classList.remove("fa-eye");
        passwordIcon.classList.add("fa-eye-slash");
    }
}

// إضافة مستمع الحدث لزر تسجيل الدخول
document.getElementById("loginform").addEventListener("submit", function(event) {
    event.preventDefault(); // منع الإرسال التلقائي للنموذج

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value; //  إضافة قراءة الدور من القائمة
    const errorMessage = document.querySelector(".error");

    // التحقق من المدخلات
    if (!email || !password || !role) {
        errorMessage.textContent = "All fields are required!";
        errorMessage.classList.add("show");

        setTimeout(() => {
        errorMessage.classList.remove("show");
        }, 5000);

    } else if (!validateEmail(email)) {
        errorMessage.textContent = "Please enter a valid email address.";
        errorMessage.classList.add("show");

        setTimeout(() => {
        errorMessage.classList.remove("show");
        }, 5000);

    } else if (!validatePassword(password)) {
        errorMessage.textContent = "Password must be at least 6 characters long.";
        errorMessage.classList.add("show");

        setTimeout(() => {
        errorMessage.classList.remove("show");
        }, 5000);

    } else {
        errorMessage.classList.remove("show");

        // تحضير بيانات التسجيل وإضافة الدور
        const formData = new FormData();  
        formData.append("email", email);
        formData.append("password", password);
        formData.append("role", role); //  إرسال نوع المستخدم مع البيانات

        // استخدام fetch لإرسال البيانات إلى الباك اند
        fetch('/login', { 
            method: 'POST', 
            body: formData 
        })
        .then(response => response.json())  // انتظار الرد من الخادم
        .then(data => {
            if (data.success) { 
                // إذا كانت عملية تسجيل الدخول ناجحة
                alert("Login successful! Redirecting to dashboard...");

            //  خزّني الدور في localStorage
             localStorage.setItem("role", role);
             localStorage.setItem("email", email);    

            // توجيه حسب الدور
            if (role.toLowerCase() === 'doctor' || role.toLowerCase() === 'nurse') {
            // الأطباء والممرضين يتوجهون للصفحة الرئيسية أولاً
            window.location.href = "Dashboard.html";
            } else if (role.toLowerCase() === 'patient') {
            // المريض يتوجه مباشرة لصفحة التحليلات
            window.location.href = "Analytics_Dashboard.html";
            } else {
                // دور غير معروف - ممكن تعيد المستخدم لتسجيل الدخول
            alert("Unknown user role! Redirecting to login.");
            window.location.href = "login.html";
            }

            }else {
                // إذا كانت العملية فشلت، إظهار رسالة خطأ
                errorMessage.textContent = data.message || "Invalid email or password!";
                errorMessage.classList.add("show");

                setTimeout(() => {
                errorMessage.classList.remove("show");
                }, 5000);

            }
        })
        .catch(error => {
            // في حال حدوث خطأ أثناء الاتصال بالخادم
            console.error("Error:", error);
            errorMessage.textContent = "An error occurred. Please try again later.";
            errorMessage.classList.add("show");
            
            setTimeout(() => {
            errorMessage.classList.remove("show");
            }, 5000);

        });
    }
});


