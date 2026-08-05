/**
 * Extrae un ID de un argumento, ya venga como mención "<@ID>" o como ID puro.
 * Sirve tanto para menciones de usuario como, en la práctica, cualquier texto
 * envuelto en <@...>.
 */
function limpiarId(texto) {
    if (!texto) return null;
    const match = texto.match(/^<@([A-Za-z0-9]+)>$/);
    return match ? match[1] : texto;
}

module.exports = { limpiarId };
