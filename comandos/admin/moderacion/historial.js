const { obtenerCanal } = require('../../../servicios/api');
const { obtenerHistorial, ETIQUETAS_TIPO } = require('../../../servicios/logs');
const { limpiarId } = require('../../../utilidades/parseMencion');
const { COLOR_SERVER } = require('../../../config/constantes');

module.exports = {
    nombre: 'historial',
    descripcion: 'Muestra el historial de acciones de moderación de un usuario',
    categoria: 'moderacion',

    ejecutar: async (evento, args, responder) => {
        const idObjetivo = limpiarId(args[0]);
        if (!idObjetivo) {
            return await responder('⚠️ **Uso:** `!historial <@usuario>`');
        }

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        const historial = obtenerHistorial(canal.server, idObjetivo);
        if (!historial.length) {
            return await responder('📭 Este usuario no tiene acciones de moderación registradas.');
        }

        const lineas = historial.map(h => {
            const fecha = new Date(h.creado_en).toLocaleDateString('es-ES', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
            const etiqueta = ETIQUETAS_TIPO[h.tipo] || h.tipo;
            const mod = h.moderador_id ? ` — por <@${h.moderador_id}>` : '';
            return `**${fecha}** — ${etiqueta}${mod}${h.detalle ? `\n${h.detalle}` : ''}`;
        });

        await responder({
            embeds: [{
                type: 'Text',
                title: `📋 Historial de moderación`,
                description: lineas.join('\n\n'),
                colour: COLOR_SERVER
            }]
        });
    }
};
