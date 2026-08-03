const { parsearDuracion, formatearDuracion } = require('../../utilidades/tiempo');
const { crearRecordatorio } = require('../../servicios/recordatorios');

module.exports = {
    nombre: 'recordatorio',
    descripcion: 'Crea un recordatorio. Ej: !recordatorio 10m Revisar el horno',
    categoria: 'utilidad',
    soloAdmin: false,

    ejecutar: async (evento, args, responder) => {
        if (args.length < 2) {
            return await responder(
                '⏰ **Uso:** `!recordatorio <tiempo> <mensaje>`\n' +
                'Ej: `!recordatorio 1h30m Reunión de equipo`\n' +
                'Unidades: `s` segundos, `m` minutos, `h` horas, `d` días (se pueden combinar, ej. `1h30m`)'
            );
        }

        const duracionMs = parsearDuracion(args[0]);
        if (!duracionMs || duracionMs <= 0) {
            return await responder('⚠️ No entendí el tiempo. Usa algo como `10m`, `2h`, `1d`, o combinaciones como `1h30m`.');
        }

        const mensaje = args.slice(1).join(' ');
        const recordarEn = Date.now() + duracionMs;

        crearRecordatorio({
            usuarioId: evento.author,
            canalId: evento.channel,
            mensaje,
            recordarEn,
        });

        await responder(`✅ Listo, te recordaré en **${formatearDuracion(duracionMs)}**: "${mensaje}"`);
    }
};
