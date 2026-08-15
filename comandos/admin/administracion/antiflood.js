const { obtenerCanal } = require('../../../servicios/api');
const { obtenerConfigAutomod, actualizarConfigAutomod } = require('../../../servicios/automodConfig');
const { ANTIFLOOD_MAX_MENSAJES, ANTIFLOOD_VENTANA_MS, ANTIFLOOD_SUSPENSION_MS } = require('../../../config/constantes');
const { formatearDuracion } = require('../../../utilidades/tiempo');

module.exports = {
    nombre: 'antiflood',
    descripcion: 'Activa/desactiva la protección automática contra flood (mensajes muy seguidos)',
    categoria: 'administracion',

    ejecutar: async (evento, args, responder) => {
        const accion = (args[0] || '').toLowerCase();

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        if (accion === 'on' || accion === 'activar') {
            actualizarConfigAutomod(canal.server, { antiflood_activado: 1 });
            return await responder(
                `✅ Antiflood **activado**.\n` +
                `Si alguien manda más de **${ANTIFLOOD_MAX_MENSAJES}** mensajes en **${ANTIFLOOD_VENTANA_MS / 1000}s**, se le borra el mensaje y se le suspende **${formatearDuracion(ANTIFLOOD_SUSPENSION_MS)}** automáticamente.\n` +
                `*(Los administradores quedan exentos.)*`
            );
        }

        if (accion === 'off' || accion === 'desactivar') {
            actualizarConfigAutomod(canal.server, { antiflood_activado: 0 });
            return await responder('🔕 Antiflood **desactivado**.');
        }

        const config = obtenerConfigAutomod(canal.server);
        await responder(`ℹ️ Antiflood está **${config.antiflood_activado ? 'activado' : 'desactivado'}**. Usa \`!antiflood on\` o \`!antiflood off\`.`);
    }
};
