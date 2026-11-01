const { detectarInvitacionUsada } = require('../servicios/invites');
const { registrarAccion } = require('../servicios/logs');
const { enviarMensajeDeServidor } = require('../servicios/bienvenida');

module.exports = async function manejarMemberAdd(member) {
    const resultado = await detectarInvitacionUsada(member.guild);

    const detalle = resultado
        ? `**Invitación:** \`${resultado.codigo}\` — creada por ${resultado.creador ? `<@${resultado.creador}>` : 'desconocido'} (${resultado.usos} usos en total)`
        : '**Invitación:** no se pudo determinar (puede ser el enlace de vanity URL del servidor, una invitación de un solo uso ya consumida, o al bot le falta el permiso *Manage Server*).';

    await registrarAccion({
        servidorId: member.guild.id,
        tipo: 'join',
        usuarioId: member.id,
        moderadorId: null,
        detalle,
    });

    // Mensaje de bienvenida (si el servidor lo configuró con !bienvenida). Un fallo aquí no debe tumbar nada más.
    try {
        if (!member.user.bot) {
            await enviarMensajeDeServidor('bienvenida', member.guild, member.user);
        }
    } catch (error) {
        console.error('⚠️ Error enviando mensaje de bienvenida:', error);
    }
};
