const { construirContextoServidor } = require('../servicios/contextoIA');

const TTL_MS = 5 * 60 * 1000; // 5 minutos
const cache = new Map(); // servidorId -> { contexto, expira }

async function obtenerContextoCacheado(servidorId) {
    const entrada = cache.get(servidorId);
    if (entrada && entrada.expira > Date.now()) {
        return entrada.contexto;
    }

    const contexto = await construirContextoServidor(servidorId);
    cache.set(servidorId, { contexto, expira: Date.now() + TTL_MS });
    return contexto;
}

/**
 * Se llama cuando algo relevante cambia (!infokat, !setrol) para que la
 * próxima pregunta a KAT ya refleje lo nuevo, sin esperar los 5 minutos.
 */
function invalidar(servidorId) {
    cache.delete(servidorId);
}

module.exports = { obtenerContextoCacheado, invalidar };
