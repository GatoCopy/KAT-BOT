const { esAdministrador } = require('../servicios/api');

const TTL_MS = 5 * 60 * 1000; // 5 minutos — los roles no cambian tan seguido
const cache = new Map(); // `${channelId}:${userId}` -> { esAdmin, expira }

async function esAdministradorCacheado(channelId, userId) {
    const clave = `${channelId}:${userId}`;
    const entrada = cache.get(clave);
    if (entrada && entrada.expira > Date.now()) {
        return entrada.esAdmin;
    }

    const esAdmin = await esAdministrador(channelId, userId);
    cache.set(clave, { esAdmin, expira: Date.now() + TTL_MS });
    return esAdmin;
}

module.exports = { esAdministradorCacheado };
