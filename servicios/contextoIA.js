const { obtenerServidor, obtenerIdsConRol, obtenerUsuario } = require('./api');
const { obtenerConfigRoles } = require('./roles');
const { obtenerInfo } = require('./infoServidor');

const MAX_LISTADOS = 15; // no vale la pena mandarle a la IA una lista de 200 nombres

async function nombresDeIds(ids) {
    const nombres = [];
    for (const id of ids.slice(0, MAX_LISTADOS)) {
        const usuario = await obtenerUsuario(id);
        nombres.push(usuario ? (usuario.display_name || usuario.username) : id);
    }
    if (ids.length > MAX_LISTADOS) nombres.push(`(+${ids.length - MAX_LISTADOS} más)`);
    return nombres;
}

/**
 * Arma un bloque de texto con lo que KAT debería saber del servidor:
 * reglas/info que definieron los admins (!infokat), y quiénes tienen el
 * rol de moderador/administrador ahora mismo (según !setrol). No incluye
 * nada de la conversación — es contexto "de fondo", el mismo para cualquier
 * pregunta que se haga en ese servidor.
 */
async function construirContextoServidor(servidorId) {
    const [servidor, config, infoPersonalizada] = await Promise.all([
        obtenerServidor(servidorId),
        Promise.resolve(obtenerConfigRoles(servidorId)),
        Promise.resolve(obtenerInfo(servidorId)),
    ]);

    let administradores = [];
    let moderadores = [];

    if (config.rol_administrador_id) {
        administradores = await nombresDeIds(await obtenerIdsConRol(servidorId, config.rol_administrador_id));
    }
    if (config.rol_moderador_id) {
        moderadores = await nombresDeIds(await obtenerIdsConRol(servidorId, config.rol_moderador_id));
    }

    const partes = [
        'INFORMACIÓN BASE DE ESTE SERVIDOR (úsala solo si la pregunta es sobre el servidor, sus reglas, o quiénes son sus admins/mods — no la repitas ni la menciones si no viene al caso):',
        `Nombre del servidor: ${servidor?.name || 'Desconocido'}`,
        infoPersonalizada
            ? `Reglas / información definida por los administradores:\n${infoPersonalizada}`
            : 'Reglas / información definida por los administradores: (no se ha configurado nada todavía)',
        `Administradores actuales: ${administradores.length ? administradores.join(', ') : 'no hay rol de administrador configurado con !setrol'}`,
        `Moderadores actuales: ${moderadores.length ? moderadores.join(', ') : 'no hay rol de moderador configurado con !setrol'}`,
    ];

    return partes.join('\n');
}

module.exports = { construirContextoServidor };
