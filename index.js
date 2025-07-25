sock.ev.on('connection.update', (update) => {
    const { qr, connection, lastDisconnect } = update;
    if (qr) {
        console.log('📱 WhatsApp QR Code:\n', qr);
    }

    if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('connection closed due to', lastDisconnect?.error, ', reconnecting', shouldReconnect);
        if (shouldReconnect) {
            startSock();
        }
    } else if (connection === 'open') {
        console.log('✅ Bot WhatsApp’a bağlandı!');
    }
});
