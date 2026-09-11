window.onload = function() {
    // الحصول على العناصر
    const form = document.querySelector('form');
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirm-password');
    const roleField = document.getElementById('role');
    const successMessage = document.getElementById('success-message');

    // دالة للتحقق من صحة البريد الإلكتروني
    function isValidEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    }

    // التأكد من وجود العناصر المطلوبة
    if (!form || !emailField || !passwordField || !confirmPasswordField || !roleField) {
        console.error("Some required form elements are missing!");
        return; // لا تكمل تنفيذ الكود لو العناصر مش موجودة
    }

// الحدث عند إرسال النموذج
    form.onsubmit = async function(event) {
        // منع إرسال النموذج الافتراضي
        event.preventDefault();
        // جلب القيم مع حذف الفراغات الزائدة
        const email = emailField.value.trim();
        const password = passwordField.value.trim();
        const confirmPassword = confirmPasswordField.value.trim();
        const role = document.getElementById('role').value;

        // التحقق من صحة البريد الإلكتروني
        if (!isValidEmail(email)) {
            alert("Please enter a valid email address.");
            return;
        }
        // التحقق من اختيار الدور
        if (!role) {
        alert("Please select a role.");
        return;
    }

// التحقق من تطابق كلمة المرور مع تأكيد كلمة المرور
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
// التحقق من أن كلمة المرور ليست فارغة
        if (password.length < 6) {
            alert("Password must be at least 6 characters long!");
            return;
        }
// إنشاء كائن يحتوي على البيانات التي سيتم إرسالها إلى الباك اند
        const formData = {
            email: email,
            password: password,
            role: role,
        };
        try { // Try block (يتم فيها تجربة كود قد يسبب خطأ) Error Handling
// إرسال البيانات إلى الخادم باستخدام fetch
            const response = await fetch('/api/create-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // إذا كانت الاستجابة صحيحة، إظهار رسالة النجاح
                successMessage.style.display = 'block';
                successMessage.textContent = "Your account has been created successfully!";
                
                // مسح الحقول بعد إرسال البيانات
                form.reset();  // مسح جميع الحقول بعد ارسال البيانات بنجاح

                // حفظ معلومات المستخدم في localStorage
                localStorage.setItem("userEmail", email);
                localStorage.setItem("role", role);

                // التوجيه حسب الدور
                if (role === "doctor" || role === "nurse") {
                    window.location.href = "Dashboard.html"; // الصفحة الرئيسية للأطباء والممرضين
                } else if (role === "patient") {
                    window.location.href = "Analytics_Dashboard.html"; // صفحة نتائج المريض فقط
                }

            } else {
                // إذا كان هناك خطأ من الخادم، عرض رسالة خطأ
                alert(data.message || "An error occurred while creating your account.");
            }
        } catch (error) { // catch block (Error Handling) ( Tryيتم تنفيذها اذا حدث خطأ داخل)
            // إذا حدث خطأ في الاتصال بالخادم، عرض رسالة خطأ
            alert("An error occurred. Please try again.");
        }
    };
};
