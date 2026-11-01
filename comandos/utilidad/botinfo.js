const { getClient } = require('../../servicios/discordClient');
const { commands } = require('../../utilidades/cargadorComandos');
const { COLOR_SERVER } = require('../../config/constantes');
const { formatearDuracion } = require('../../utilidades/tiempo');
const { version } = require('../../package.json');

module.exports = {
    nombre: 'botinfo',
    descripcion: 'Muestra información de KAT: versión, tiempo encendido, servidores y comandos',
    categoria: 'utilidad',

    ejecutar: async (evento, args, responder) => {
        const client = getClient();
        const memoriaMB = (process.memoryUsage().rss / 1024 / 1024).toFixed(0);

        await responder({
            embeds: [{
                title: '🐱 KAT',
                description:
                    'Bot multipropósito: moderación, utilidad y diversión.\n' +
                    'Desarrollado por **Alexander Jerrard (CopyCat)**.\n\n' +
                    `**Versión:** ${version}\n` +
                    `**Encendido hace:** ${formatearDuracion(process.uptime() * 1000)}\n` +
                    `**Servidores:** ${client.guilds.cache.size}\n` +
                    `**Comandos:** ${commands.size}\n` +
                    `**Latencia:** ${Math.round(client.ws.ping)} ms\n` +
                    `**Memoria:** ${memoriaMB} MB\n` +
                    `**Node.js:** ${process.version}`,
                colour: COLOR_SERVER
            }]
        });
    }
};
