/**
 * Extrae un ID de un argumento, ya venga como mención de usuario "<@ID>" o
 * "<@!ID>" (apodo), mención de rol "<@&ID>", o como ID puro.
 */
function limpiarId(texto) {
    if (!texto) return null;
    const match = texto.match(/^<@[!&]?(\d+)>$/);
    return match ? match[1] : texto;
}

/**
 * Igual que limpiarId pero para menciones de canal "<#ID>".
 * Retorna null si el argumento no tiene forma de canal (mención o ID numérico).
 */
function limpiarIdCanal(texto) {
    if (!texto) return null;
    const match = texto.match(/^<#(\d+)>$/);
    if (match) return match[1];
    return /^\d+$/.test(texto) ? texto : null;
}

module.exports = { limpiarId, limpiarIdCanal };
