const { obtenerCanal, cambiarApodo } = require('../../../servicios/api');
const { registrarAccion } = require('../../../servicios/logs');
const { limpiarId } = require('../../../utilidades/parseMencion');
const { validarObjetivo } = require('../../../utilidades/jerarquia');

const MAX_LARGO_APODO = 32; // límite de Discord

module.exports = {
    nombre: 'nick',
    descripcion: 'Cambia el apodo de un miembro (o lo restablece con "reset")',
    categoria: 'moderacion',

    ejecutar: async (evento, args, responder) => {
        const idObjetivo = limpiarId(args[0]);
        const apodoTexto = args.slice(1).join(' ').trim();

        if (!idObjetivo || !apodoTexto) {
            return await responder(
                '⚠️ **Uso:** `!nick <@usuario> <nuevo apodo>`\n' +
                'Para quitarle el apodo: `!nick <@usuario> reset`'
            );
        }

        const restablecer = apodoTexto.toLowerCase() === 'reset';

        if (!restablecer && apodoTexto.length > MAX_LARGO_APODO) {
            return await responder(`⚠️ El apodo es demasiado largo (máximo **${MAX_LARGO_APODO}** caracteres).`);
        }

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        const validacion = await validarObjetivo(evento, canal.server, idObjetivo);
        if (!validacion.ok) {
            return await responder(`🚫 ${validacion.motivo}`);
        }

        const exito = await cambiarApodo(canal.server, idObjetivo, restablecer ? null : apodoTexto, `Cambiado por moderador (${evento.author})`);
        if (!exito) {
            return await responder('❌ No pude cambiar el apodo. Verifica el ID/mención, que el bot tenga permiso `Manage Nicknames` y que su rol esté por encima del de ese miembro.');
        }

        await registrarAccion({
            servidorId: canal.server,
            tipo: 'nick',
            usuarioId: idObjetivo,
            moderadorId: evento.author,
            detalle: restablecer ? '**Apodo:** restablecido' : `**Nuevo apodo:** ${apodoTexto}`
        });

        await responder(restablecer ? '✏️ Apodo restablecido.' : `✏️ Apodo cambiado a **${apodoTexto}**.`);
    }
};
