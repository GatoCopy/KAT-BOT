const { obtenerCanal } = require('../../../servicios/api');
const { obtenerConfigAutomod, actualizarConfigAutomod } = require('../../../servicios/automodConfig');
const { ANTIMENCIONES_MAX } = require('../../../config/constantes');

module.exports = {
    nombre: 'antimenciones',
    descripcion: 'Activa/desactiva la protección contra mensajes que mencionan a demasiadas personas',
    categoria: 'administracion',

    ejecutar: async (evento, args, responder) => {
        const accion = (args[0] || '').toLowerCase();

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        if (accion === 'on' || accion === 'activar') {
            actualizarConfigAutomod(canal.server, { antimenciones_activado: 1 });
            return await responder(
                `✅ Antimenciones **activado**. Si un mensaje menciona a más de **${ANTIMENCIONES_MAX}** personas distintas, se borra.\n` +
                '*(Los moderadores y administradores quedan exentos.)*'
            );
        }

        if (accion === 'off' || accion === 'desactivar') {
            actualizarConfigAutomod(canal.server, { antimenciones_activado: 0 });
            return await responder('🔕 Antimenciones **desactivado**.');
        }

        const config = obtenerConfigAutomod(canal.server);
        await responder(`ℹ️ Antimenciones está **${config.antimenciones_activado ? 'activado' : 'desactivado'}**. Usa \`!antimenciones on\` o \`!antimenciones off\`.`);
    }
};
