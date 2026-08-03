const WebSocket = require('ws');
const path = require('path');
require('dotenv').config();

const { WS_URL, PING_INTERVAL_MS, RECONEXION_MS } = require('./config/constantes');
const { TOKEN } = require('./servicios/api');
const { commands, cargarComandos } = require('./utilidades/cargadorComandos');
const eventos = require('./eventos');

if (!TOKEN) {
    console.error('❌ Error: No se encontró BOT_TOKEN o TOKEN en el archivo .env');
    process.exit(1);
}

// Cargar todos los comandos desde la carpeta principal
cargarComandos(path.join(__dirname, 'comandos'));

function conectarBot() {
    const ws = new WebSocket(WS_URL);
    let miBotId = null;
    let pingInterval = null;

    // Contexto compartido que se pasa a cada handler de evento
    const ctx = {
        commands,
        getBotId: () => miBotId,
        setBotId: (id) => { miBotId = id; },
    };

    ws.on('open', () => {
        console.log('🔗 Conectando WebSocket a Stoat...');
        ws.send(JSON.stringify({
            type: 'Authenticate',
            token: TOKEN
        }));

        // Mantener la conexión con un Ping de vida
        pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'Ping', data: Date.now() }));
            }
        }, PING_INTERVAL_MS);
    });

    ws.on('message', async (data) => {
        try {
            const evento = JSON.parse(data);
            const handler = eventos.get(evento.type);
            if (handler) {
                await handler(evento, ctx);
            }
        } catch (e) {
            console.error('⚠️ Error procesando evento:', e);
        }
    });

    ws.on('close', () => {
        console.log(`⚠️ Conexión cerrada. Reintentando en ${RECONEXION_MS / 1000} segundos...`);
        clearInterval(pingInterval);
        setTimeout(conectarBot, RECONEXION_MS);
    });

    ws.on('error', (err) => {
        console.error('❌ Error en WebSocket:', err.message);
    });
}

conectarBot();
