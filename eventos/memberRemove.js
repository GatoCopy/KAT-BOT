const { enviarMensajeDeServidor } = require('../servicios/bienvenida');

module.exports = async function manejarMemberRemove(member) {
    try {
        if (!member.user || member.user.bot) return;
        await enviarMensajeDeServidor('despedida', member.guild, member.user);
    } catch (error) {
        console.error('⚠️ Error enviando mensaje de despedida:', error);
    }
};
