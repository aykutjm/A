const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');

const authFile = './auth_info.json';
const { state, saveState } = useSingleFileAuthState(authFile);

async function startSock() {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== 401;
            console.log('connection closed, reconnecting...', shouldReconnect);
            if (shouldReconnect) {
                startSock();
            }
        } else if (connection === 'open') {
            console.log('opened connection');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        console.log(JSON.stringify(m, undefined, 2));
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        await sock.sendMessage(msg.key.remoteJid, { text: 'Merhaba, mesajınızı aldım! 🤖' });
    });

    sock.ev.on('creds.update', saveState);
}

startSock();
