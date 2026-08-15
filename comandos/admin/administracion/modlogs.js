const { obtenerCanal } = require('../../../servicios/api');
const { activarLogs, desactivarLogs, obtenerCanalLogs } = require('../../../servicios/logs');

module.exports = {
    nombre: 'modlogs',
    descripcion: 'Activa/desactiva el canal de logs de moderación (usa el canal donde ejecutes esto)',
    categoria: 'administracion',

    ejecutar: async (evento, args, responder) => {
        const accion = (args[0] || '').toLowerCase();

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        if (accion === 'on' || accion === 'activar') {
            activarLogs(canal.server, evento.channel, evento.author);
            return await responder(
                '✅ Este canal ahora recibirá los **logs de moderación**: warns, baneos, expulsiones, suspensiones, y acciones automáticas de auto-moderación (filtro de palabras, links, antiflood).'
            );
        }

        if (accion === 'off' || accion === 'desactivar') {
            desactivarLogs(canal.server);
            return await responder('🔕 Logs de moderación **desactivados**.');
        }

        const canalActual = obtenerCanalLogs(canal.server);
        await responder(
            canalActual
                ? `ℹ️ Los logs de moderación se están enviando a <#${canalActual}>.\nUsa \`!modlogs off\` para apagarlos, o \`!modlogs on\` en otro canal para moverlos ahí.`
                : 'ℹ️ Los logs de moderación están desactivados. Usa `!modlogs on` en el canal donde quieras recibirlos.'
        );
    }
};
