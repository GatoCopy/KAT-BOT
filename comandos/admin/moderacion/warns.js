const { obtenerCanal } = require('../../../servicios/api');
const { obtenerWarns } = require('../../../servicios/warns');
const { limpiarId } = require('../../../utilidades/parseMencion');
const { COLOR_SERVER } = require('../../../config/constantes');

module.exports = {
    nombre: 'warns',
    descripcion: 'Lista las advertencias de un usuario',
    categoria: 'moderacion',

    ejecutar: async (evento, args, responder) => {
        const idObjetivo = limpiarId(args[0]);
        if (!idObjetivo) {
            return await responder('⚠️ **Uso:** `!warns <@usuario>`');
        }

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        const warns = obtenerWarns(canal.server, idObjetivo);
        if (!warns.length) {
            return await responder('📭 Este usuario no tiene advertencias en este servidor.');
        }

        const lineas = warns.map(w => {
            const fecha = new Date(w.creado_en).toLocaleDateString('es-ES', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
            return `\`#${w.id}\` **${fecha}** — ${w.razon || '*Sin razón especificada*'}`;
        });

        await responder({
            embeds: [{
                type: 'Text',
                title: `⚠️ Advertencias (${warns.length})`,
                description: `${lineas.join('\n')}\n\n*Usa \`!delwarn <id>\` para eliminar una.*`,
                colour: COLOR_SERVER
            }]
        });
    }
};
