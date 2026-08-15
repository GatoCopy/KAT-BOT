const db = require('./db');

function configurarRol(servidorId, tipo, rolId) {
    const columna = tipo === 'moderador' ? 'rol_moderador_id' : 'rol_administrador_id';

    db.prepare(`
        INSERT INTO roles_config (servidor_id, ${columna}) VALUES (?, ?)
        ON CONFLICT(servidor_id) DO UPDATE SET ${columna} = excluded.${columna}
    `).run(servidorId, rolId);
}

function obtenerConfigRoles(servidorId) {
    return db.prepare(`SELECT * FROM roles_config WHERE servidor_id = ?`).get(servidorId) || {
        servidor_id: servidorId,
        rol_moderador_id: null,
        rol_administrador_id: null,
    };
}

module.exports = { configurarRol, obtenerConfigRoles };
