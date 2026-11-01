const { obtenerCanal, obtenerServidor, obtenerUsuario } = require('../servicios/api');
const {
    PLANTILLAS_POR_DEFECTO,
    guardarMensaje,
    desactivarMensaje,
    obtenerMensaje,
    renderizarPlantilla,
} = require('../servicios/bienvenida');

const MAX_LARGO = 500;

/**
 * Fábrica de los comandos !bienvenida y !despedida, que funcionan igual y solo
 * cambian el texto y cuándo se disparan. `tipo` es 'bienvenida' o 'despedida'.
 */
function crearComandoMensaje({ tipo, descripcion, cuando }) {
    const nombre = tipo;
    const ayuda =
        '⚠️ **Uso:**\n' +
        `\`!${nombre} on\` — activa el mensaje por defecto en **este canal**\n` +
        `\`!${nombre} set <mensaje>\` — activa un mensaje personalizado en **este canal**\n` +
        `\`!${nombre} off\` — lo desactiva\n` +
        `\`!${nombre} ver\` — muestra la configuración actual\n` +
        `\`!${nombre} probar\` — muestra cómo se vería\n\n` +
        '**Marcadores:** `{usuario}` (mención), `{nombre}` (nombre de usuario), `{servidor}`, `{miembros}`';

    return {
        nombre,
        descripcion,
        categoria: 'administracion',

        ejecutar: async (evento, args, responder) => {
            const accion = (args[0] || '').toLowerCase();

            const canal = await obtenerCanal(evento.channel);
            if (!canal?.server) {
                return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
            }

            if (accion === 'on') {
                guardarMensaje(canal.server, tipo, evento.channel, PLANTILLAS_POR_DEFECTO[tipo]);
                return await responder(`✅ Mensaje de ${tipo} **activado** en este canal ${cuando}.\nPuedes personalizarlo con \`!${nombre} set <mensaje>\`.`);
            }

            if (accion === 'set') {
                const mensaje = args.slice(1).join(' ').trim();
                if (!mensaje) return await responder(ayuda);
                if (mensaje.length > MAX_LARGO) {
                    return await responder(`⚠️ El mensaje es demasiado largo (máximo **${MAX_LARGO}** caracteres).`);
                }
                guardarMensaje(canal.server, tipo, evento.channel, mensaje);
                return await responder(`✅ Mensaje de ${tipo} guardado para este canal. Pruébalo con \`!${nombre} probar\`.`);
            }

            if (accion === 'off') {
                desactivarMensaje(canal.server, tipo);
                return await responder(`🔕 Mensaje de ${tipo} **desactivado**.`);
            }

            if (accion === 'ver' || accion === 'probar') {
                const config = obtenerMensaje(canal.server, tipo);
                if (!config) {
                    return await responder(`ℹ️ El mensaje de ${tipo} está desactivado. Usa \`!${nombre} on\` para activarlo.`);
                }

                if (accion === 'ver') {
                    return await responder(
                        `ℹ️ Mensaje de ${tipo} activo en <#${config.canalId}> ${cuando}:\n\`\`\`\n${config.mensaje}\n\`\`\``
                    );
                }

                const servidor = await obtenerServidor(canal.server);
                const usuario = await obtenerUsuario(evento.author);
                return await responder(renderizarPlantilla(config.mensaje, {
                    usuarioId: evento.author,
                    nombre: usuario?.username || 'Usuario',
                    servidor: servidor?.name || 'este servidor',
                    miembros: servidor?.memberCount,
                }));
            }

            await responder(ayuda);
        }
    };
}

module.exports = { crearComandoMensaje };
