/**
 * Extrae un ID de un argumento, ya venga como mención de usuario "<@ID>" o
 * "<@!ID>" (apodo), mención de rol "<@&ID>", o como ID puro.
 */
function limpiarId(texto) {
    if (!texto) return null;
    const match = texto.match(/^<@[!&]?(\d+)>$/);
    return match ? match[1] : texto;
}

module.exports = { limpiarId };
