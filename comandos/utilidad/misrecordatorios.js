const { obtenerRecordatoriosPendientesDe } = require('../../servicios/recordatorios');
const { formatearDuracion } = require('../../utilidades/tiempo');
const { COLOR_SERVER } = require('../../config/constantes');

module.exports = {
    nombre: 'misrecordatorios',
    descripcion: 'Lista tus recordatorios pendientes',
    categoria: 'utilidad',
    soloAdmin: false,

    ejecutar: async (evento, args, responder) => {
        const pendientes = obtenerRecordatoriosPendientesDe(evento.author);

        if (!pendientes.length) {
            return await responder('📭 No tienes recordatorios pendientes.');
        }

        const ahora = Date.now();
        const lineas = pendientes.map(r =>
            `\`#${r.id}\` en **${formatearDuracion(r.recordar_en - ahora)}** — ${r.mensaje}`
        );

        await responder({
            embeds: [{
                type: 'Text',
                title: '📋 Tus recordatorios pendientes',
                description: lineas.join('\n'),
                colour: COLOR_SERVER
            }]
        });
    }
};
