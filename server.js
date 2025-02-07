const express = require("express");
const cors = require("cors");
const db = require("./db");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());


// 📌 เสิร์ฟไฟล์ HTML, CSS, JS จากโฟลเดอร์ "public"
app.use(express.static(path.join(__dirname, "static")));

// 📌 เปิดหน้าเว็บหลัก index.html เมื่อเข้า "/"
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "static", "indexbackup1.html"));
});

// 📌 API ดึงข้อมูลสินค้า
app.get("/products", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM sp_product ORDER BY id DESC");
        if (rows.length > 0) {
            res.status(200).json({
                RespCode: 200,
                RespMessage: "success",
                Result: rows,
            });
        } else {
            res.status(400).json({
                RespCode: 400,
                Log: 0,
                RespMessage: "bad : Not found data",
            });
        }
    } catch (error) {
        res.status(500).json({
            RespCode: 500,
            Log: 1,
            RespMessage: "bad : bad sql",
            Error: error.message,
        });
    }
});

app.post("/calculate-price", async (req, res) => {
    try {
        const { product } = req.body;
        if (!Array.isArray(product) || product.length === 0) {
            return res.status(400).json({ RespCode: 400, RespMessage: "Invalid product data" });
        }

        const [rows] = await db.query("SELECT id, price FROM sp_product ORDER BY id DESC");
        let queryProduct = rows.map(row => ({ id: row.id, price: row.price }));

        let amount = 0;
        product.forEach(p => {
            const foundProduct = queryProduct.find(qp => qp.id === parseInt(p.id));
            if (foundProduct) {
                amount += parseInt(p.count) * parseInt(foundProduct.price);
            }
        });

        // 📌 คำนวณค่าขนส่ง, VAT, และยอดสุทธิ
        const shipping = amount + 60;
        const vat = (shipping * 7) / 100;
        const netAmount = shipping + vat;
        const transid = Date.now(); // ใช้ Timestamp เป็น Transaction ID
        const productJson = JSON.stringify(product);
        const updatedAt = new Date().toISOString().slice(0, 19).replace("T", " ");


        // 📌 บันทึกลงฐานข้อมูล
        const [result] = await db.query(
            "INSERT INTO sp_transaction (transid, orderlist, amount, shipping, vat, netamount, operation, mil, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [transid, productJson, amount, shipping, vat, netAmount, "PENDING", Date.now(), updatedAt]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({
                RespCode: 200,
                RespMessage: "success",
                TransactionID: transid,
                // Orderlist: JSON.stringify(product),
                Amount: amount,
                Shipping: shipping,
                VAT: vat,
                NetAmount: netAmount
            });
        } else {
            res.status(500).json({
                RespCode: 300,
                RespMessage: "bad : insert transaction fail"
            });
        }
    } catch (error) {
        res.status(500).json({
            RespCode: 500,
            RespMessage: "bad : server error",
            Error: error.message
        });
    }
});

app.delete("/cancel-transaction/:transid", async (req, res) => {
    try {
        const { transid } = req.params;

        // 📌 ลบ Transaction จากฐานข้อมูล
        const [result] = await db.query("DELETE FROM sp_transaction WHERE transid = ?", [transid]);

        if (result.affectedRows > 0) {
            res.status(200).json({
                RespCode: 200,
                RespMessage: "Transaction deleted successfully"
            });
        } else {
            res.status(400).json({
                RespCode: 400,
                RespMessage: "Transaction not found or already deleted"
            });
        }
    } catch (error) {
        res.status(500).json({
            RespCode: 500,
            RespMessage: "Error deleting transaction",
            Error: error.message
        });
    }
});
app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    console.log("Received Data:", req.body);

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // ✅ ตรวจสอบว่ามี username หรือ email ซ้ำในฐานข้อมูลหรือไม่
        const [existingUser] = await db.query(
            "SELECT * FROM users WHERE username = ? OR email = ?", 
            [username, email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Username or Email already exists" });
        }

        // ✅ บันทึกรหัสผ่านแบบ Plain Text (ไม่เข้ารหัส `bcrypt`)
        const [result] = await db.query(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)", 
            [username, email, password]
        );

        if (result.affectedRows > 0) {
            res.status(201).json({ message: "User registered successfully" });
        } else {
            res.status(500).json({ message: "Failed to register user" });
        }
    } catch (error) {
        console.error("Sign Up Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    console.log("📥 Login Request Received:", email, password);

    try {
        const [rows] = await db.query(
            "SELECT * FROM users WHERE email = ?", 
            [email]
        );

        if (rows.length === 0) {
            console.log("❌ No user found with this email");
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = rows[0];

        if (password !== user.password) {
            console.log("❌ Password incorrect for:", email);
            return res.status(401).json({ message: "Invalid email or password" });
        }

        console.log("✅ Login Successful for:", user.email, "User ID:", user.id);

        res.status(200).json({ 
            message: "Login successful!", 
            user: { id: user.id, email: user.email, username: user.username } // ✅ ส่ง user_id กลับไปด้วย
        });

    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});





////////////////////////////




// 📌 เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

