const { obtenerCanal, editarMiembro } = require('../../../servicios/api');
const { registrarAccion } = require('../../../servicios/logs');
const { limpiarId } = require('../../../utilidades/parseMencion');
const { parsearDuracion, formatearDuracion } = require('../../../utilidades/tiempo');
const { validarObjetivo } = require('../../../utilidades/jerarquia');

const MAX_SUSPENSION_MS = 28 * 24 * 60 * 60 * 1000; // límite de Discord para un timeout: 28 días

module.exports = {
    nombre: 'suspender',
    descripcion: 'Suspende temporalmente a un miembro (no puede enviar mensajes ni reaccionar durante ese tiempo)',
    categoria: 'moderacion',

    ejecutar: async (evento, args, responder) => {
        const idObjetivo = limpiarId(args[0]);
        const duracionMs = parsearDuracion(args[1]);

        if (!idObjetivo || !duracionMs) {
            return await responder(
                '⚠️ **Uso:** `!suspender <@usuario> <tiempo> [razón]`\n' +
                'Ej: `!suspender @Copy 30m Spam en el chat`\n' +
                'Unidades: `s` segundos, `m` minutos, `h` horas, `d` días'
            );
        }

        if (duracionMs > MAX_SUSPENSION_MS) {
            return await responder('⚠️ Discord solo permite suspender hasta **28 días** (`28d`). Para algo más largo usa `!tempban`.');
        }

        const razon = args.slice(2).join(' ') || null;

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        const validacion = await validarObjetivo(evento, canal.server, idObjetivo);
        if (!validacion.ok) {
            return await responder(`🚫 ${validacion.motivo}`);
        }

        const hasta = new Date(Date.now() + duracionMs).toISOString();
        const resultado = await editarMiembro(canal.server, idObjetivo, { timeout: hasta }, razon);

        if (!resultado) {
            return await responder('❌ No pude suspender a ese usuario. Verifica el ID/mención y que el bot tenga permiso `TimeoutMembers`.');
        }

        await registrarAccion({
            servidorId: canal.server,
            tipo: 'suspension',
            usuarioId: idObjetivo,
            moderadorId: evento.author,
            detalle: `**Duración:** ${formatearDuracion(duracionMs)}\n**Razón:** ${razon || 'Sin razón especificada'}`
        });

        await responder(
            `🔇 Usuario suspendido por **${formatearDuracion(duracionMs)}**.${razon ? `\n**Razón:** ${razon}` : ''}`
        );
    }
};
