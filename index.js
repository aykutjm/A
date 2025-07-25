const {
    default: makeWASocket,
    useSingleFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');

// Auth dosyası yolu
const authFile = './auth_info.json';
const { state, saveState } = useSingleFileAuthState(authFile);

// Bağlantıyı başlat
async function startSock() {
    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({
        version,
        printQRInTerminal: true,
        auth: state,
    });

    // QR kod çıktısı (deprecate edildiği için ayrıca loglamak iyi olur)
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n📱 QR Kodunu Tara:\n', qr);
        }

        if (connection === 'close') {
            const shouldReconnect =
                (lastDisconnect?.error instanceof Boom
                    ? lastDisconnect.error.output?.statusCode
                    : 0) !== DisconnectReason.loggedOut;

            console.log('❌ Bağlantı koptu. Tekrar bağlanılıyor mu?', shouldReconnect);

            if (shouldReconnect) {
                startSock();
            }
        } else if (connection === 'open') {
            console.log('✅ Bot WhatsApp’a bağlandı!');
        }
    });

    // Mesaj geldiğinde yakala
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

        console.log('📩 Gelen mesaj:', text);

        // Basit cevap örneği
        if (text.toLowerCase().includes('selam')) {
