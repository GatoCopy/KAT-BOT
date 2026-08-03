const { obtenerEncuesta, cerrarEncuesta, contarVotos } = require('../../servicios/encuestas');
const { esAdministrador } = require('../../servicios/api');
const { COLOR_SERVER } = require('../../config/constantes');

module.exports = {
    nombre: 'cerrarencuesta',
    descripcion: 'Cierra una encuesta y muestra los resultados. Solo quien la creó o un admin.',
    categoria: 'utilidad',
    soloAdmin: false, // el permiso se valida a mano abajo: creador O admin, no solo admin

    ejecutar: async (evento, args, responder) => {
        const idEncuesta = parseInt(args[0], 10);
        if (isNaN(idEncuesta)) {
            return await responder('⚠️ **Uso:** `!cerrarencuesta <id_encuesta>`');
        }

        const encuesta = obtenerEncuesta(idEncuesta);
        if (!encuesta) {
            return await responder(`❌ No encontré la encuesta #${idEncuesta}.`);
        }

        const esCreador = encuesta.creador_id === evento.author;
        if (!esCreador) {
            const esAdmin = await esAdministrador(evento.channel, evento.author);
            if (!esAdmin) {
                return await responder('🚫 Solo quien creó la encuesta o un administrador puede cerrarla.');
            }
        }

        if (encuesta.cerrada) {
            return await responder('🔒 Esta encuesta ya estaba cerrada.');
        }

        cerrarEncuesta(idEncuesta);

        const conteo = contarVotos(idEncuesta);
        const totalVotos = conteo.reduce((acc, c) => acc + c.total, 0);

        const resultados = encuesta.opciones.map((op, i) => {
            const votosOpcion = conteo.find(c => c.opcion === i + 1)?.total || 0;
            const porcentaje = totalVotos ? Math.round((votosOpcion / totalVotos) * 100) : 0;
            return `**${op}** — ${votosOpcion} voto(s) *(${porcentaje}%)*`;
        }).join('\n');

        await responder({
            embeds: [{
                type: 'Text',
                title: `📊 Resultados: ${encuesta.pregunta}`,
                description: `${resultados}\n\n*Total de votos: ${totalVotos}*`,
                colour: COLOR_SERVER
            }]
        });
    }
};
