const { obtenerAutorol } = require('../servicios/autoroles');
const { obtenerMiembro, editarMiembro } = require('../servicios/api');

module.exports = async function manejarMessageUnreact(evento, ctx) {
    if (ctx.getBotId() && evento.user_id === ctx.getBotId()) return;

    const autorol = obtenerAutorol(evento.id, evento.emoji_id);
    if (!autorol) return;

    const miembro = await obtenerMiembro(autorol.servidor_id, evento.user_id);
    if (!miembro) return;

    const rolesActuales = miembro.roles || [];
    if (!rolesActuales.includes(autorol.rol_id)) return; // ya no lo tenía

    await editarMiembro(autorol.servidor_id, evento.user_id, {
        roles: rolesActuales.filter(r => r !== autorol.rol_id)
    });
};
