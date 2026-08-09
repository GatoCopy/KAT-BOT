const { obtenerCanal } = require('../servicios/api');

const TTL_MS = 30 * 60 * 1000; // 30 minutos — un canal casi nunca cambia de servidor
const cache = new Map(); // channelId -> { servidorId, expira }

async function obtenerServidorDeCanal(channelId) {
    const entrada = cache.get(channelId);
    if (entrada && entrada.expira > Date.now()) {
        return entrada.servidorId;
    }

    const canal = await obtenerCanal(channelId);
    const servidorId = canal?.server || null;
    cache.set(channelId, { servidorId, expira: Date.now() + TTL_MS });
    return servidorId;
}

module.exports = { obtenerServidorDeCanal };
