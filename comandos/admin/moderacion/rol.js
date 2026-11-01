const { obtenerCanal, gestionarRolMiembro } = require('../../../servicios/api');
const { registrarAccion } = require('../../../servicios/logs');
const { limpiarId } = require('../../../utilidades/parseMencion');
const { validarObjetivo } = require('../../../utilidades/jerarquia');

module.exports = {
    nombre: 'rol',
    descripcion: 'Da o quita un rol a un miembro (solo roles por debajo del tuyo)',
    categoria: 'moderacion',

    ejecutar: async (evento, args, responder) => {
        const accion = (args[0] || '').toLowerCase();
        const idObjetivo = limpiarId(args[1]);
        const idRol = limpiarId(args[2]);

        if ((accion !== 'dar' && accion !== 'quitar') || !idObjetivo || !idRol) {
            return await responder(
                '⚠️ **Uso:**\n' +
                '`!rol dar <@usuario> <@rol o ID>`\n' +
                '`!rol quitar <@usuario> <@rol o ID>`'
            );
        }

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        const validacion = await validarObjetivo(evento, canal.server, idObjetivo);
        if (!validacion.ok) {
            return await responder(`🚫 ${validacion.motivo}`);
        }

        const resultado = await gestionarRolMiembro(
            canal.server, evento.author, idObjetivo, idRol, accion, `Por moderador (${evento.author})`
        );
        if (!resultado.ok) {
            return await responder(`❌ ${resultado.motivo}`);
        }

        await registrarAccion({
            servidorId: canal.server,
            tipo: 'rol',
            usuarioId: idObjetivo,
            moderadorId: evento.author,
            detalle: `**${accion === 'dar' ? 'Rol dado' : 'Rol quitado'}:** ${resultado.nombreRol} (\`${idRol}\`)`
        });

        await responder(accion === 'dar'
            ? `🎭 Rol **${resultado.nombreRol}** asignado.`
            : `🎭 Rol **${resultado.nombreRol}** removido.`);
    }
};
