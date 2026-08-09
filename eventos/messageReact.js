const { obtenerAutorol } = require('../servicios/autoroles');
const { obtenerMiembro, editarMiembro } = require('../servicios/api');

module.exports = async function manejarMessageReact(reaction, user) {
    if (user.bot) return;

    if (reaction.partial) {
        try { await reaction.fetch(); } catch { return; }
    }

    // Emoji personalizado del server -> usa su ID; emoji unicode -> usa el carácter
    const emojiId = reaction.emoji.id || reaction.emoji.name;

    const autorol = obtenerAutorol(reaction.message.id, emojiId);
    if (!autorol) return;

    const miembro = await obtenerMiembro(autorol.servidor_id, user.id);
    if (!miembro) return;

    const rolesActuales = miembro.roles || [];
    if (rolesActuales.includes(autorol.rol_id)) return;

    await editarMiembro(autorol.servidor_id, user.id, {
        roles: [...rolesActuales, autorol.rol_id]
    });
};
