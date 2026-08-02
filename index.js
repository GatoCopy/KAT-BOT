const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { WS_URL, PING_INTERVAL_MS, RECONEXION_MS } = require('./config/constantes');
const { TOKEN } = require('./servicios/api');
const eventos = require('./eventos');

if (!TOKEN) {
    console.error('❌ Error: No se encontró BOT_TOKEN o TOKEN en el archivo .env');
    process.exit(1);
}

// Map para almacenar los comandos cargados
const commands = new Map();

// Función para cargar comandos de forma recursiva
function cargarComandos(directorio, esAdminFolder = false) {
    if (!fs.existsSync(directorio)) {
        fs.mkdirSync(directorio, { recursive: true });
        return;
    }

    const elementos = fs.readdirSync(directorio, { withFileTypes: true });

    for (const elemento of elementos) {
        const rutaAbsoluta = path.join(directorio, elemento.name);

        if (elemento.isDirectory()) {
            // Si es la subcarpeta "admin", activamos el flag esAdminFolder
            const esSubAdmin = esAdminFolder || elemento.name.toLowerCase() === 'admin';
            cargarComandos(rutaAbsoluta, esSubAdmin);
        } else if (elemento.isFile() && elemento.name.endsWith('.js')) {
            // Cargar el comando
            delete require.cache[require.resolve(rutaAbsoluta)]; // Limpiar caché por si hay reinicios
            const comando = require(rutaAbsoluta);

            // Si está dentro de la carpeta admin (o subcarpetas de esta), forzamos soloAdmin
            if (esAdminFolder) {
                comando.soloAdmin = true;
            }

            commands.set(comando.nombre, comando);

            const etiquetaAdmin = comando.soloAdmin ? '🔒 [ADMIN]' : '🌐 [PÚBLICO]';
            console.log(`✅ Comando cargado: !${comando.nombre} ${etiquetaAdmin}`);
        }
    }
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
