const { crearEncuesta } = require('../../servicios/encuestas');
const { COLOR_SERVER } = require('../../config/constantes');

module.exports = {
    nombre: 'encuesta',
    descripcion: 'Crea una encuesta. Ej: !encuesta ¿Cuál prefieres? | Pizza | Hamburguesa',
    categoria: 'utilidad',
    soloAdmin: false,

    ejecutar: async (evento, args, responder) => {
        const texto = args.join(' ');

        if (!texto.includes('|')) {
            return await responder(
                '📊 **Uso:** `!encuesta <pregunta> | <opción1> | <opción2> | ...`\n' +
                'Ej: `!encuesta ¿Cuál prefieres? | Pizza | Hamburguesa`'
            );
        }

        const partes = texto.split('|').map(p => p.trim()).filter(Boolean);
        const [pregunta, ...opciones] = partes;

        if (!pregunta || opciones.length < 2) {
            return await responder('⚠️ Necesitas una pregunta y al menos 2 opciones.');
        }
        if (opciones.length > 9) {
            return await responder('⚠️ Máximo 9 opciones por encuesta.');
        }

        const id = crearEncuesta({
            canalId: evento.channel,
            creadorId: evento.author,
            pregunta,
            opciones,
        });

        const listado = opciones.map((op, i) => `**${i + 1}.** ${op}`).join('\n');

        await responder({
            embeds: [{
                type: 'Text',
                title: `📊 Encuesta #${id}`,
                description:
                    `**${pregunta}**\n\n${listado}\n\n` +
                    `Vota con \`!votar ${id} <número>\` · Cierra con \`!cerrarencuesta ${id}\``,
                colour: COLOR_SERVER
            }]
        });
    }
};
