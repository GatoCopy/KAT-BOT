const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(path.join(DATA_DIR, 'kat.db'));
db.pragma('journal_mode = WAL'); // mejor manejo de escrituras concurrentes

db.exec(`
    CREATE TABLE IF NOT EXISTS recordatorios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id TEXT NOT NULL,
        canal_id TEXT NOT NULL,
        mensaje TEXT NOT NULL,
        recordar_en INTEGER NOT NULL,
        creado_en INTEGER NOT NULL,
        enviado INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS encuestas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        canal_id TEXT NOT NULL,
        creador_id TEXT NOT NULL,
        pregunta TEXT NOT NULL,
        opciones TEXT NOT NULL,
        creada_en INTEGER NOT NULL,
        cerrada INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS votos (
        encuesta_id INTEGER NOT NULL,
        usuario_id TEXT NOT NULL,
        opcion INTEGER NOT NULL,
        PRIMARY KEY (encuesta_id, usuario_id)
    );

    CREATE TABLE IF NOT EXISTS canales_ia (
        canal_id TEXT PRIMARY KEY,
        activado_por TEXT NOT NULL,
        activado_en INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS warns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        servidor_id TEXT NOT NULL,
        usuario_id TEXT NOT NULL,
        moderador_id TEXT NOT NULL,
        razon TEXT,
        creado_en INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS autoroles (
        mensaje_id TEXT NOT NULL,
        emoji_id TEXT NOT NULL,
        rol_id TEXT NOT NULL,
        servidor_id TEXT NOT NULL,
        canal_id TEXT NOT NULL,
        creado_por TEXT NOT NULL,
        creado_en INTEGER NOT NULL,
        PRIMARY KEY (mensaje_id, emoji_id)
    );

    CREATE TABLE IF NOT EXISTS logs_moderacion (
        servidor_id TEXT PRIMARY KEY,
        canal_id TEXT NOT NULL,
        activado_por TEXT NOT NULL,
        activado_en INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS automod_config (
        servidor_id TEXT PRIMARY KEY,
        antiflood_activado INTEGER NOT NULL DEFAULT 0,
        filtro_palabras_activado INTEGER NOT NULL DEFAULT 0,
        filtro_links_activado INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS palabras_prohibidas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        servidor_id TEXT NOT NULL,
        palabra TEXT NOT NULL,
        UNIQUE(servidor_id, palabra)
    );

    CREATE TABLE IF NOT EXISTS canales_links_permitidos (
        servidor_id TEXT NOT NULL,
        canal_id TEXT NOT NULL,
        PRIMARY KEY (servidor_id, canal_id)
    );

    CREATE TABLE IF NOT EXISTS info_servidor (
        servidor_id TEXT PRIMARY KEY,
        contenido TEXT NOT NULL,
        actualizado_en INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS roles_config (
        servidor_id TEXT PRIMARY KEY,
        rol_moderador_id TEXT,
        rol_administrador_id TEXT
    );

    CREATE TABLE IF NOT EXISTS historial_moderacion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        servidor_id TEXT NOT NULL,
        usuario_id TEXT,
        moderador_id TEXT,
        tipo TEXT NOT NULL,
        detalle TEXT,
        creado_en INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS invitaciones_uso (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        servidor_id TEXT NOT NULL,
        usuario_id TEXT NOT NULL,
        codigo_invitacion TEXT,
        invitado_por TEXT,
        creado_en INTEGER NOT NULL
    );
`);

module.exports = db;
