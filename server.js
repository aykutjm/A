import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/decrypt', async (req, res) => {
  try {
    const { mediaKey, mediaUrl, mediaType } = req.body;

    const infoStr = {
      image: 'WhatsApp Image Keys',
      video: 'WhatsApp Video Keys',
      audio: 'WhatsApp Audio Keys',
      document: 'WhatsApp Document Keys'
    }[mediaType];

    if (!infoStr) {
      return res.status(400).json({ error: 'Unsupported mediaType' });
    }

    const mediaKeyBuffer = Buffer.from(mediaKey, 'base64');
    const expandedMediaKey = crypto.hkdfSync('sha256', mediaKeyBuffer, Buffer.alloc(0), Buffer.from(infoStr), 112);

    const iv = expandedMediaKey.slice(0, 16);
    const cipherKey = expandedMediaKey.slice(16, 48);

    const { data: encrypted } = await axios.get(mediaUrl, {
      responseType: 'arraybuffer'
    });

    const fileBuffer = Buffer.from(encrypted);
    const fileContent = fileBuffer.slice(0, fileBuffer.length - 10);

    const decipher = crypto.createDecipheriv('aes-256-cbc', cipherKey, iv);
    const decrypted = Buffer.concat([decipher.update(fileContent), decipher.final()]);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(decrypted);

  } catch (err) {
    console.error('❌ Hata:', err);
    res.status(500).json({ error: 'Decrypt failed', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Decrypt server running at http://localhost:${PORT}`);
});
