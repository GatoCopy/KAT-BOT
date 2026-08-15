const { actualizarCacheServidor } = require('../servicios/invites');

module.exports = async function manejarReady(client) {
    console.log(`🤖 ¡KAT está online y listo! Conectado como ${client.user.tag}`);

    for (const guild of client.guilds.cache.values()) {
        await actualizarCacheServidor(guild);
    }
};
