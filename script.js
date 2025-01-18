const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const mysql = require('mysql2');

const app = express();
app.use(bodyParser.json());

// إعداد Twilio
const accountSid = 'TWILIO_ACCOUNT_SID'; // استبدل بـ SID
const authToken = 'TWILIO_AUTH_TOKEN'; // استبدل بـ Token
const client = twilio(accountSid, authToken);

// إعداد قاعدة البيانات
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'reflect_app'
});

// إرسال OTP
app.post('/send-otp', (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000); // رمز مكون من 6 أرقام
  client.messages.create({
    body: `رمز التحقق الخاص بك: ${otp}`,
    from: 'TWILIO_PHONE_NUMBER', // رقم Twilio الخاص بك
    to: phone
  })
  .then(() => {
    db.query('INSERT INTO users (phone, otp) VALUES (?, ?)', [phone, otp], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'تم إرسال رمز التحقق' });
    });
  })
  .catch(err => res.status(500).json({ error: err.message }));
});

// التحقق من OTP
app.post('/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  db.query('SELECT * FROM users WHERE phone = ? AND otp = ?', [phone, otp], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ error: 'رمز التحقق غير صحيح' });
    res.json({ message: 'تم تسجيل الدخول بنجاح' });
  });
});

// تشغيل الخادم
app.listen(3000, () => console.log('الخادم يعمل على المنفذ 3000'));
