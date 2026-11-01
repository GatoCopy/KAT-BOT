const { obtenerMiembro, esDueno, obtenerIdBot } = require('../servicios/api');
const { obtenerNivelCacheado, obtenerNivelUsuario } = require('./cacheNiveles');

const RANGO = { publico: 0, moderador: 1, administrador: 2 };

/**
 * Valida si quien ejecuta un comando puede aplicarle una acción de moderación
 * (ban, kick, suspender, apodo, roles...) a ese objetivo.
 *
 * Reglas:
 *  - Nadie puede aplicarse la acción a sí mismo, ni al bot, ni al dueño del servidor.
 *  - El dueño del servidor puede con cualquiera (salvo las tres de arriba).
 *  - Si el objetivo es miembro del servidor, el invocador debe tener un nivel
 *    ESTRICTAMENTE mayor (un moderador no puede tocar a otro moderador ni a un
 *    administrador; un administrador no puede tocar a otro administrador).
 *  - Si el objetivo no está en el servidor (ej. banear por ID a alguien que ya
 *    se fue), no hay jerarquía que comparar y se permite.
 *
 * Retorna { ok: true } o { ok: false, motivo }.
 */
async function validarObjetivo(evento, servidorId, objetivoId) {
    if (objetivoId === evento.author) {
        return { ok: false, motivo: 'No puedes aplicarte esa acción a ti mismo.' };
    }
    if (objetivoId === obtenerIdBot()) {
        return { ok: false, motivo: 'No puedo aplicarme esa acción a mí mismo.' };
    }
    if (await esDueno(servidorId, objetivoId)) {
        return { ok: false, motivo: 'No se puede aplicar esa acción al dueño del servidor.' };
    }
    if (await esDueno(servidorId, evento.author)) {
        return { ok: true };
    }

    const miembro = await obtenerMiembro(servidorId, objetivoId);
    if (!miembro) return { ok: true };

    const nivelInvocador = await obtenerNivelCacheado(evento.channel, evento.author);
    const nivelObjetivo = await obtenerNivelUsuario(evento.channel, objetivoId);

    if (RANGO[nivelInvocador] <= RANGO[nivelObjetivo]) {
        return { ok: false, motivo: 'No puedes aplicar esa acción a alguien de tu mismo nivel o superior.' };
    }

    return { ok: true };
}

module.exports = { validarObjetivo };
