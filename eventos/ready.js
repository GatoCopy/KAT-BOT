module.exports = async function manejarReady(evento, ctx) {
    // Busca el usuario que coincide con la cuenta del bot o el primero recibido
    ctx.setBotId(evento.users?.[0]?.id || null);
    console.log(`🤖 ¡KAT está online y listo! ID del bot: ${ctx.getBotId()}`);
};
