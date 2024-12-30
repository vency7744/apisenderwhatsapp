const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const serverless = require('serverless-http'); // Menggunakan serverless-http

const app = express();
app.use(bodyParser.json());

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database sederhana untuk menyimpan permintaan
let attackRequests = [];

// Endpoint untuk menampilkan halaman utama
app.get('/', (req, res) => {
    res.render('index', { attackRequests });
});

// Endpoint untuk menerima permintaan dari Bot Telegram
app.post('/attack', (req, res) => {
    const { target } = req.body;

    if (!target) {
        return res.status(400).json({ message: 'Target diperlukan.' });
    }

    attackRequests.push({ target, status: 'pending' });
    res.redirect('/');
});

// Endpoint untuk bot WhatsApp mengambil satu permintaan
app.get('/get-attack', (req, res) => {
    const request = attackRequests.find((req) => req.status === 'pending');

    if (!request) {
        return res.status(404).json({ message: 'Tidak ada permintaan.' });
    }

    // Tandai permintaan sebagai "sedang diproses"
    request.status = 'processing';
    res.status(200).json(request);
});

// Endpoint untuk memperbarui status permintaan
app.post('/update-status', (req, res) => {
    const { target, status } = req.body;

    const request = attackRequests.find((req) => req.target === target);
    if (!request) {
        return res.status(404).json({ message: 'Permintaan tidak ditemukan.' });
    }

    request.status = status;
    res.redirect('/');
});

// Ekspor aplikasi untuk Vercel (serverless function)
// Change from app.listen to use the handler
module.exports = app;
module.exports.handler = serverless(app);
