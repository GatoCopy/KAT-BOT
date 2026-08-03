// Historial en MEMORIA (no en base de datos): se reinicia si el bot se reinicia
// o si se apaga/prende el modo conversación de un canal. Es intencional — mantener
// esto en SQLite agregaría complejidad para un dato que es aceptable perder.

const MAX_MENSAJES_GUARDADOS = 20; // ~10 turnos de ida y vuelta

const historiales = new Map(); // canalId -> [{ role, content }, ...]

function obtenerHistorial(canalId) {
    return historiales.get(canalId) || [];
}

function agregarMensaje(canalId, role, content) {
    const historial = historiales.get(canalId) || [];
    historial.push({ role, content });

    while (historial.length > MAX_MENSAJES_GUARDADOS) {
        historial.shift();
    }

    historiales.set(canalId, historial);
}

function limpiarHistorial(canalId) {
    historiales.delete(canalId);
}

module.exports = { obtenerHistorial, agregarMensaje, limpiarHistorial };
