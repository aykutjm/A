import express from 'express';
import axios from 'axios';
import crypto from 'crypto';

const app = express();
app.use(express.json()); // ← BU SATIR OLMAZSA req.body BOŞ GELİR

const PORT = process.env.PORT || 3000;

app.post('/decrypt', async (req, res) => {
  console.log('🔍 Gelen body:', req.body); // ← test için

  const { mediaKey, mediaUrl, mediaType } = req.body;

  if (!mediaKey || !mediaUrl || !mediaType) {
    return res.status(400).json({ error: 'Bad request - please check your parameters' });
  }

  res.status(200).json({ message: '✅ Parametreler doğru alındı' });
});

app.listen(PORT, () => {
  console.log(`🚀 Decrypt server çalışıyor: http://localhost:${PORT}`);
});
