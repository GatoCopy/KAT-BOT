const { obtenerAutorol } = require('../servicios/autoroles');
const { obtenerMiembro, editarMiembro } = require('../servicios/api');

module.exports = async function manejarMessageReact(evento, ctx) {
    // Ignorar la reacción que el propio bot pone al crear el autorol
    if (ctx.getBotId() && evento.user_id === ctx.getBotId()) return;

    const autorol = obtenerAutorol(evento.id, evento.emoji_id);
    if (!autorol) return; // esta reacción no tiene ningún autorol asociado

    const miembro = await obtenerMiembro(autorol.servidor_id, evento.user_id);
    if (!miembro) return;

    const rolesActuales = miembro.roles || [];
    if (rolesActuales.includes(autorol.rol_id)) return; // ya lo tiene, nada que hacer

    await editarMiembro(autorol.servidor_id, evento.user_id, {
        roles: [...rolesActuales, autorol.rol_id]
    });
};
