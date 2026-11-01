const { obtenerCanal, ponerModoLento } = require('../../../servicios/api');
const { registrarAccion } = require('../../../servicios/logs');
const { parsearDuracion, formatearDuracion } = require('../../../utilidades/tiempo');

const MAX_SEGUNDOS = 21600; // límite de Discord: 6 horas

module.exports = {
    nombre: 'slowmode',
    descripcion: 'Activa el modo lento en este canal (tiempo mínimo entre mensajes de cada usuario)',
    categoria: 'moderacion',

    ejecutar: async (evento, args, responder) => {
        const entrada = (args[0] || '').toLowerCase();

        if (!entrada) {
            return await responder(
                '⚠️ **Uso:**\n' +
                '`!slowmode <tiempo>` — ej: `!slowmode 10s`, `!slowmode 2m` (máximo 6h)\n' +
                '`!slowmode off` — lo desactiva'
            );
        }

        let segundos;
        if (entrada === 'off' || entrada === '0') {
            segundos = 0;
        } else {
            const ms = parsearDuracion(entrada);
            if (!ms) {
                return await responder('⚠️ No entendí ese tiempo. Ej: `10s`, `2m`, `1h`.');
            }
            segundos = Math.round(ms / 1000);
            if (segundos > MAX_SEGUNDOS) {
                return await responder('⚠️ El máximo que permite Discord es **6 horas** (`6h`).');
            }
        }

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        const exito = await ponerModoLento(evento.channel, segundos, `Por moderador (${evento.author})`);
        if (!exito) {
            return await responder('❌ No pude cambiar el modo lento. Verifica que el bot tenga permiso `Manage Channels` en este canal.');
        }

        await registrarAccion({
            servidorId: canal.server,
            tipo: 'slowmode',
            moderadorId: evento.author,
            detalle: `**Canal:** <#${evento.channel}>\n**Modo lento:** ${segundos ? formatearDuracion(segundos * 1000) : 'desactivado'}`
        });

        await responder(segundos
            ? `🐌 Modo lento activado: **${formatearDuracion(segundos * 1000)}** entre mensajes.`
            : '🐌 Modo lento **desactivado**.');
    }
};
