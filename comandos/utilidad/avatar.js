const { getClient } = require('../../servicios/discordClient');
const { COLOR_SERVER } = require('../../config/constantes');
const { limpiarId } = require('../../utilidades/parseMencion');

module.exports = {
    nombre: 'avatar',
    descripcion: 'Muestra el avatar de un usuario en grande. Ej: !avatar @usuario',
    categoria: 'utilidad',

    ejecutar: async (evento, args, responder) => {
        const idObjetivo = evento.mentions?.[0] || limpiarId(args[0]) || evento.author;

        let usuario;
        try {
            usuario = await getClient().users.fetch(idObjetivo);
        } catch (error) {
            return await responder('❌ No encontré a ese usuario. Verifica el ID o la mención.');
        }

        await responder({
            embeds: [{
                title: `🖼️ Avatar de ${usuario.globalName || usuario.username}`,
                image: usuario.displayAvatarURL({ size: 1024, extension: 'png' }),
                colour: COLOR_SERVER
            }]
        });
    }
};
