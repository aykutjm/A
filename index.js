const { default: makeWASocket } = require("@whiskeysockets/baileys");
const { useSingleFileAuthState } = require("@whiskeysockets/baileys/lib/auth");
const { Boom } = require("@hapi/boom");
const path = require("path");

const authFile = path.resolve(__dirname, "auth_info.json");
const { state, saveState } = useSingleFileAuthState(authFile);

async function startSock() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("connection closed due to", lastDisconnect?.error, ", reconnecting", shouldReconnect);
      if (shouldReconnect) {
        startSock();
      }
    } else if (connection === "open") {
      console.log("opened connection ✅");
    }
  });

  sock.ev.on("creds.update", saveState);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    console.log("Gelen mesaj:", text);

    if (text?.toLowerCase() === "merhaba") {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "Merhaba! Size nasıl yardımcı olabilirim? 😊",
      });
    }
  });
}

startSock();
