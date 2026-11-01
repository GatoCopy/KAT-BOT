const { obtenerCanal } = require('../../../servicios/api');
const { obtenerConfigAutomod, actualizarConfigAutomod } = require('../../../servicios/automodConfig');

module.exports = {
    nombre: 'filtroinvitaciones',
    descripcion: 'Activa/desactiva el bloqueo de invitaciones a otros servidores de Discord (discord.gg/...)',
    categoria: 'administracion',

    ejecutar: async (evento, args, responder) => {
        const accion = (args[0] || '').toLowerCase();

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        if (accion === 'on' || accion === 'activar') {
            actualizarConfigAutomod(canal.server, { filtro_invitaciones_activado: 1 });
            return await responder(
                '✅ Filtro de invitaciones **activado**. Se borrarán los mensajes con invitaciones de Discord (`discord.gg/...`, `discord.com/invite/...`).\n' +
                '*(Los moderadores y administradores quedan exentos.)*'
            );
        }

        if (accion === 'off' || accion === 'desactivar') {
            actualizarConfigAutomod(canal.server, { filtro_invitaciones_activado: 0 });
            return await responder('🔕 Filtro de invitaciones **desactivado**.');
        }

        const config = obtenerConfigAutomod(canal.server);
        await responder(`ℹ️ El filtro de invitaciones está **${config.filtro_invitaciones_activado ? 'activado' : 'desactivado'}**. Usa \`!filtroinvitaciones on\` o \`!filtroinvitaciones off\`.`);
    }
};
