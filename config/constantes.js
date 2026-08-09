module.exports = {
    PREFIX: '!',
    COLOR_SERVER: '#FF5757', // Color naranja/rosa que ya usabas
    ANTIFLOOD_MAX_MENSAJES: 5,       // más de esta cantidad...
    ANTIFLOOD_VENTANA_MS: 5000,      // ...dentro de esta ventana de tiempo, se considera flood
    ANTIFLOOD_SUSPENSION_MS: 120000, // 2 minutos de suspensión automática al detectarlo
    // API_URL, WS_URL, PING_INTERVAL_MS y RECONEXION_MS ya NO hacen falta:
    // discord.js maneja conexión, reconexión y heartbeats internamente.
};
