/**
 * Extrae un ID de un argumento, ya venga como mención "<@ID>" o "<@!ID>"
 * (Discord usa el segundo formato para menciones con apodo), o como ID puro.
 */
function limpiarId(texto) {
    if (!texto) return null;
    const match = texto.match(/^<@!?(\d+)>$/);
    return match ? match[1] : texto;
}

module.exports = { limpiarId };
