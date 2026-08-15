const { esAdministrador, obtenerCanal, obtenerMiembro } = require('../servicios/api');
const { obtenerConfigRoles } = require('../servicios/roles');

const TTL_MS = 5 * 60 * 1000; // 5 minutos — los roles no cambian tan seguido
const cache = new Map(); // `${channelId}:${userId}` -> { nivel, expira }

/**
 * Resuelve el nivel de un usuario: 'publico' | 'moderador' | 'administrador'.
 *
 * Cuenta como administrador: el dueño del servidor, cualquiera con el permiso
 * nativo de Discord Administrator/KickMembers/BanMembers, o quien tenga el rol
 * configurado con !setrol administrador. Cuenta como moderador quien tenga el
 * rol configurado con !setrol moderador. Los canales sin servidor (DMs) no
 * tienen restricción.
 */
async function obtenerNivelUsuario(channelId, userId) {
    const canal = await obtenerCanal(channelId);
    if (!canal?.server) return 'administrador';

    const esAdminNativo = await esAdministrador(channelId, userId);
    if (esAdminNativo) return 'administrador';

    const config = obtenerConfigRoles(canal.server);
    const miembro = await obtenerMiembro(canal.server, userId);
    const rolesUsuario = miembro?.roles || [];

    if (config.rol_administrador_id && rolesUsuario.includes(config.rol_administrador_id)) {
        return 'administrador';
    }
    if (config.rol_moderador_id && rolesUsuario.includes(config.rol_moderador_id)) {
        return 'moderador';
    }

    return 'publico';
}

async function obtenerNivelCacheado(channelId, userId) {
    const clave = `${channelId}:${userId}`;
    const entrada = cache.get(clave);
    if (entrada && entrada.expira > Date.now()) {
        return entrada.nivel;
    }

    const nivel = await obtenerNivelUsuario(channelId, userId);
    cache.set(clave, { nivel, expira: Date.now() + TTL_MS });
    return nivel;
}

module.exports = { obtenerNivelUsuario, obtenerNivelCacheado };
