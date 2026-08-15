const { obtenerCanal } = require('../../../servicios/api');
const { guardarInfo, obtenerInfo, borrarInfo } = require('../../../servicios/infoServidor');
const { invalidar } = require('../../../utilidades/cacheContextoServidor');

module.exports = {
    nombre: 'infokat',
    descripcion: 'Configura la información base que KAT conoce sobre este servidor (reglas, descripción, contexto)',
    categoria: 'administracion',

    ejecutar: async (evento, args, responder) => {
        const accion = (args[0] || '').toLowerCase();

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        if (accion === 'set') {
            const texto = args.slice(1).join(' ').trim();
            if (!texto) {
                return await responder(
                    '⚠️ **Uso:** `!infokat set <texto>`\n' +
                    'Ej: `!infokat set Reglas: 1) Sé respetuoso. 2) No spam. Este es el server de la comunidad X, dedicado a Y.`'
                );
            }

            guardarInfo(canal.server, texto);
            invalidar(canal.server);
            return await responder('✅ Información guardada. A partir de ahora `!kat` la tendrá en cuenta cuando le pregunten sobre el servidor.');
        }

        if (accion === 'ver') {
            const info = obtenerInfo(canal.server);
            return await responder(
                info
                    ? `ℹ️ **Información actual que KAT conoce de este servidor:**\n${info}`
                    : 'ℹ️ No hay información configurada todavía. Usa `!infokat set <texto>`.'
            );
        }

        if (accion === 'borrar') {
            borrarInfo(canal.server);
            invalidar(canal.server);
            return await responder('🗑️ Información borrada. KAT ya no la usará en sus respuestas.');
        }

        await responder(
            '⚠️ **Uso:**\n' +
            '`!infokat set <texto>` — define reglas/info que KAT debe saber del servidor\n' +
            '`!infokat ver` — muestra la info actual\n' +
            '`!infokat borrar` — la elimina\n\n' +
            '*KAT también sabe automáticamente quiénes son los admins/mods actuales (según lo configurado con `!setrol`), sin que tengas que escribirlo aquí.*'
        );
    }
};
