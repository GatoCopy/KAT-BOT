const { ANTIFLOOD_MAX_MENSAJES, ANTIFLOOD_VENTANA_MS } = require('../config/constantes');

const registros = new Map(); // `${userId}:${channelId}` -> [timestamps]

/**
 * Registra un mensaje nuevo del usuario en ese canal y retorna true si,
 * contando este mensaje, superó el límite dentro de la ventana de tiempo.
 */
function registrarMensaje(userId, channelId) {
    const clave = `${userId}:${channelId}`;
    const ahora = Date.now();

    const timestamps = (registros.get(clave) || []).filter(t => ahora - t < ANTIFLOOD_VENTANA_MS);
    timestamps.push(ahora);
    registros.set(clave, timestamps);

    return timestamps.length > ANTIFLOOD_MAX_MENSAJES;
}

module.exports = { registrarMensaje };
