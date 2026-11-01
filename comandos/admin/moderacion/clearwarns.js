const { obtenerCanal } = require('../../../servicios/api');
const { eliminarTodosLosWarns } = require('../../../servicios/warns');
const { registrarAccion } = require('../../../servicios/logs');
const { limpiarId } = require('../../../utilidades/parseMencion');

module.exports = {
    nombre: 'clearwarns',
    descripcion: 'Elimina TODAS las advertencias de un usuario en este servidor',
    categoria: 'moderacion',

    ejecutar: async (evento, args, responder) => {
        const idObjetivo = limpiarId(args[0]);
        if (!idObjetivo) {
            return await responder('⚠️ **Uso:** `!clearwarns <@usuario>`');
        }

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        const eliminados = eliminarTodosLosWarns(canal.server, idObjetivo);
        if (!eliminados) {
            return await responder('📭 Ese usuario no tenía advertencias.');
        }

        await registrarAccion({
            servidorId: canal.server,
            tipo: 'clearwarns',
            usuarioId: idObjetivo,
            moderadorId: evento.author,
            detalle: `**Warns eliminados:** ${eliminados}`
        });

        await responder(`🧽 Se eliminaron **${eliminados}** advertencia(s) de ese usuario.`);
    }
};
