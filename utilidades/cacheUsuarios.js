const { obtenerUsuario } = require('../servicios/api');

const TTL_MS = 10 * 60 * 1000; // 10 minutos
const cache = new Map(); // userId -> { nombre, expira }

async function obtenerNombreUsuario(userId) {
    const entrada = cache.get(userId);
    if (entrada && entrada.expira > Date.now()) {
        return entrada.nombre;
    }

    const usuario = await obtenerUsuario(userId);
    const nombre = usuario ? (usuario.display_name || usuario.username) : userId;

    cache.set(userId, { nombre, expira: Date.now() + TTL_MS });
    return nombre;
}

module.exports = { obtenerNombreUsuario };
