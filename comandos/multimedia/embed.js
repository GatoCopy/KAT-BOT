const { COLOR_SERVER } = require('../../config/constantes');

module.exports = {
    nombre: 'embed',
    descripcion: 'Crea un mensaje embed con título y descripción',
    categoria: 'multimedia',
    soloAdmin: false,

    async ejecutar(evento, args, responder) {
        // 1. Si escriben solo !embed, mostramos la guía
        if (args.length === 0) {
            const guiaEmbed = {
                embeds: [
                    {
                        type: 'Text',
                        title: '📖 Guía del Comando !embed',
                        description:
                            '```\n' +
                            '🔹 Título + Mensaje:\n' +
                            '!embed Tu Título | Tu mensaje aquí\n\n' +
                            '🔹 Solo Mensaje:\n' +
                            '!embed Tu mensaje aquí\n\n' +
                            '🔹 Truco de Fondo Oscuro:\n' +
                            'Para que el contenido tenga fondo negro/oscuro,\n' +
                            'encierra tu texto entre ``` como en esta guía.\n' +
                            '```',
                        colour: COLOR_SERVER
                    }
                ]
            };
            return await responder(guiaEmbed);
        }

        const textoCompleto = args.join(' ');
        let tituloEmbed = null;
        let descripcionEmbed = textoCompleto;

        // Separar título y contenido si usan "|"
        if (textoCompleto.includes('|')) {
            const partes = textoCompleto.split('|');
            tituloEmbed = partes[0].trim();
            descripcionEmbed = partes.slice(1).join('|').trim();
        }

        const objetoEmbed = {
            type: 'Text',
            description: descripcionEmbed,
            colour: COLOR_SERVER
        };

        if (tituloEmbed) {
            objetoEmbed.title = tituloEmbed;
        }

        await responder({ embeds: [objetoEmbed] });
    }
};
