const cacheInvitaciones = new Map();

async function actualizarCacheServidor(guild) {
    try {
        const invites = await guild.invites.fetch();
        const mapa = new Map();
        invites.forEach(inv => mapa.set(inv.code, inv.uses ?? 0));
        cacheInvitaciones.set(guild.id, mapa);
        return invites;
    } catch (error) {
        console.error(`❌ No pude leer invitaciones de "${guild.name}" (¿falta el permiso Manage Server?):`, error.message);
        return null;
    }
}

async function detectarInvitacionUsada(guild) {
    const anterior = cacheInvitaciones.get(guild.id) || new Map();
    const invitesActuales = await actualizarCacheServidor(guild);
    if (!invitesActuales) return null;

    for (const invite of invitesActuales.values()) {
        const usosAntes = anterior.get(invite.code) || 0;
        if ((invite.uses ?? 0) > usosAntes) {
            return {
                codigo: invite.code,
                creador: invite.inviter?.id || null,
                usos: invite.uses,
            };
        }
    }

    return null;
}

module.exports = { actualizarCacheServidor, detectarInvitacionUsada };
