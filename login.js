document.addEventListener("DOMContentLoaded", function () {
    // ✅ ดึง Element ของฟอร์ม และปุ่ม
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");
    const signInButton = document.getElementById("signInButton");
    const signUpButton = document.getElementById("signUpButton");

    // ✅ สลับหน้า Signup ↔ Login
    if (signInButton && signUpButton) {
        signInButton.addEventListener("click", function (event) {
            event.preventDefault();
            document.getElementById("signup").style.display = "none";
            document.getElementById("signIn").style.display = "block";
        });

        signUpButton.addEventListener("click", function (event) {
            event.preventDefault();
            document.getElementById("signIn").style.display = "none";
            document.getElementById("signup").style.display = "block";
        });
    }

    // ✅ ฟังก์ชันสมัครสมาชิก
    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            // ดึงค่าจาก input
            const username = document.getElementById("username").value;
            const email = document.getElementById("registerEmail").value;
            const password = document.getElementById("registerPassword").value;

            try {
                const response = await fetch("http://localhost:3000/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, email, password })
                });

                const result = await response.json();

                if (response.ok) {
                    alert("Sign Up Successful! Please login.");
                    document.getElementById("signInButton").click(); // ✅ เปลี่ยนไปหน้า Login
                } else {
                    alert("Sign Up Failed: " + result.message);
                }
            } catch (error) {
                console.error("Sign Up Error:", error);
                alert("Error: Could not connect to server");
            }
        });
    }
});


document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    console.log("Sending Data:", { username, email, password }); // ✅ Log ข้อมูลที่ส่งไป

    try {
        const response = await fetch("http://localhost:3000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const result = await response.json();
        console.log("Server Response:", result); // ✅ Log ค่าที่ตอบกลับจากเซิร์ฟเวอร์

        if (response.ok) {
            alert("Sign Up Successful! Please login.");
            document.getElementById("signInButton").click();
        } else {
            alert("Sign Up Failed: " + result.message);
        }
    } catch (error) {
        console.error("Sign Up Error:", error);
        alert("Error: Could not connect to server");
    }
});

document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    console.log("📤 Sending Login Data:", { email, password });

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();
        console.log("📥 Server Response:", result);

        if (response.ok) {
            localStorage.setItem("user_id", result.user.id);  // ✅ เก็บ user_id
            localStorage.setItem("user", JSON.stringify(result.user)); // ✅ เก็บ username ด้วย
            alert("Login successful! Redirecting...");
            window.location.href = "indexbackup1.html";
        } else {
            alert("Login Failed: " + result.message);
        }
    } catch (error) {
        console.error("❌ Login Error:", error);
        alert("Error: Could not connect to server");
    }
});
