const { obtenerImagenAleatoria } = require('../../servicios/imagenesAleatorias');
const { COLOR_SERVER } = require('../../config/constantes');

module.exports = {
    nombre: 'gato',
    descripcion: 'Envía una imagen aleatoria de un gato',
    categoria: 'multimedia',

    ejecutar: async (evento, args, responder) => {
        const url = await obtenerImagenAleatoria('gato');

        if (!url) {
            return await responder('❌ No pude conseguir una imagen de gato en este momento, intenta de nuevo en un rato.');
        }

        await responder({
            embeds: [{
                type: 'Text',
                title: '🐱 ¡Miau!',
                image: url,
                colour: COLOR_SERVER
            }]
        });
    }
};
