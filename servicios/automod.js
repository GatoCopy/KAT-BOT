const { eliminarMensaje, editarMiembro, enviarMensaje } = require('./api');
const { obtenerConfigAutomod } = require('./automodConfig');
const { obtenerPalabrasProhibidas } = require('./palabrasProhibidas');
const { canalPermiteLinks } = require('./canalesLinks');
const { registrarAccion } = require('./logs');
const { obtenerServidorDeCanal } = require('../utilidades/cacheCanales');
const { obtenerNivelCacheado } = require('../utilidades/cacheNiveles');
const { registrarMensaje } = require('../utilidades/antiflood');
const { formatearDuracion } = require('../utilidades/tiempo');
const { ANTIFLOOD_SUSPENSION_MS } = require('../config/constantes');

const REGEX_LINK = /(https?:\/\/[^\s]+)/i;

/**
 * Revisa un mensaje contra todo lo que esté activado en ese servidor.
 * Retorna true si tomó alguna acción (el mensaje se borró), para que el
 * resto del pipeline (procesar como comando) se detenga ahí.
 */
async function revisarMensaje(evento) {
    const servidorId = await obtenerServidorDeCanal(evento.channel);
    if (!servidorId) return false; // no es un canal de servidor (ej. DM)

    const config = obtenerConfigAutomod(servidorId);
    const algoActivado = config.antiflood_activado || config.filtro_palabras_activado || config.filtro_links_activado;
    if (!algoActivado) return false; // nada que revisar, no vale la pena ni chequear admin

    // Moderadores y administradores quedan exentos de la auto-moderación.
    const nivel = await obtenerNivelCacheado(evento.channel, evento.author);
    if (nivel !== 'publico') return false;

    const texto = evento.content || '';

    if (config.filtro_palabras_activado) {
        const accionTomada = await revisarPalabrasProhibidas(evento, servidorId, texto);
        if (accionTomada) return true;
    }

    if (config.filtro_links_activado) {
        const accionTomada = await revisarLinks(evento, servidorId, texto);
        if (accionTomada) return true;
    }

    if (config.antiflood_activado) {
        const accionTomada = await revisarFlood(evento, servidorId);
        if (accionTomada) return true;
    }

    return false;
}

async function revisarPalabrasProhibidas(evento, servidorId, texto) {
    const palabras = obtenerPalabrasProhibidas(servidorId);
    if (!palabras.length) return false;

    const textoNormalizado = texto.toLowerCase();
    const encontrada = palabras.find(p => textoNormalizado.includes(p));
    if (!encontrada) return false;

    await eliminarMensaje(evento.channel, evento._id).catch(() => {});
    await enviarMensaje(evento.channel, `🚫 <@${evento.author}>, ese mensaje se eliminó por contener una palabra no permitida en este servidor.`);

    await registrarAccion({
        servidorId,
        tipo: 'auto-palabra',
        usuarioId: evento.author,
        detalle: `**Canal:** <#${evento.channel}>\n**Mensaje:** ${texto.substring(0, 200)}`
    });

    return true;
}

async function revisarLinks(evento, servidorId, texto) {
    if (!REGEX_LINK.test(texto)) return false;
    if (canalPermiteLinks(servidorId, evento.channel)) return false;

    await eliminarMensaje(evento.channel, evento._id).catch(() => {});
    await enviarMensaje(evento.channel, `🔗 <@${evento.author}>, no se permiten enlaces en este canal.`);

    await registrarAccion({
        servidorId,
        tipo: 'auto-link',
        usuarioId: evento.author,
        detalle: `**Canal:** <#${evento.channel}>\n**Mensaje:** ${texto.substring(0, 200)}`
    });

    return true;
}

async function revisarFlood(evento, servidorId) {
    const estaFloodeando = registrarMensaje(evento.author, evento.channel);
    if (!estaFloodeando) return false;

    await eliminarMensaje(evento.channel, evento._id).catch(() => {});

    const hasta = new Date(Date.now() + ANTIFLOOD_SUSPENSION_MS).toISOString();
    await editarMiembro(servidorId, evento.author, { timeout: hasta }, 'Antiflood automático');

    await enviarMensaje(
        evento.channel,
        `🔇 <@${evento.author}> fue suspendido **${formatearDuracion(ANTIFLOOD_SUSPENSION_MS)}** por enviar mensajes demasiado rápido.`
    );

    await registrarAccion({
        servidorId,
        tipo: 'auto-flood',
        usuarioId: evento.author,
        detalle: `**Canal:** <#${evento.channel}>\n**Suspendido por:** ${formatearDuracion(ANTIFLOOD_SUSPENSION_MS)}`
    });

    return true;
}

module.exports = { revisarMensaje };
