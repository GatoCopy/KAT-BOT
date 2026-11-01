const { obtenerCanal, banearUsuario } = require('../../../servicios/api');
const { registrarAccion } = require('../../../servicios/logs');
const { crearTempban } = require('../../../servicios/tempbans');
const { limpiarId } = require('../../../utilidades/parseMencion');
const { parsearDuracion, formatearDuracion } = require('../../../utilidades/tiempo');
const { validarObjetivo } = require('../../../utilidades/jerarquia');

module.exports = {
    nombre: 'tempban',
    descripcion: 'Banea a un usuario por un tiempo; el bot lo desbanea solo cuando se cumple',
    categoria: 'moderacion',

    ejecutar: async (evento, args, responder) => {
        const idObjetivo = limpiarId(args[0]);
        const duracionMs = parsearDuracion(args[1]);

        if (!idObjetivo || !duracionMs) {
            return await responder(
                '⚠️ **Uso:** `!tempban <@usuario> <tiempo> [razón]`\n' +
                'Ej: `!tempban @Copy 7d Insultos repetidos`\n' +
                'Unidades: `s` segundos, `m` minutos, `h` horas, `d` días'
            );
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

        const exito = await banearUsuario(canal.server, idObjetivo, razon ? `[Tempban ${formatearDuracion(duracionMs)}] ${razon}` : `Tempban ${formatearDuracion(duracionMs)}`);
        if (!exito) {
            return await responder('❌ No pude banear a ese usuario. Verifica el ID/mención y que el bot tenga permiso `BanMembers`.');
        }

        crearTempban({
            servidorId: canal.server,
            usuarioId: idObjetivo,
            moderadorId: evento.author,
            razon,
            expiraEn: Date.now() + duracionMs,
        });

        await registrarAccion({
            servidorId: canal.server,
            tipo: 'tempban',
            usuarioId: idObjetivo,
            moderadorId: evento.author,
            detalle: `**Duración:** ${formatearDuracion(duracionMs)}\n**Razón:** ${razon || 'Sin razón especificada'}`
        });

        await responder(
            `⏳ Usuario baneado por **${formatearDuracion(duracionMs)}**; se desbaneará automáticamente.${razon ? `\n**Razón:** ${razon}` : ''}`
        );
    }
};
