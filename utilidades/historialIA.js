// Historial en MEMORIA (no en base de datos): se reinicia si el bot se reinicia
// o si se apaga/prende la memoria de un canal. Es intencional — mantener esto
// en SQLite agregaría complejidad para un dato que es aceptable perder.

const MAX_PETICIONES = 20; // se recuerdan hasta las últimas 20 idas y vueltas
const MAX_MENSAJES_GUARDADOS = MAX_PETICIONES * 2; // cada petición = 1 mensaje de usuario + 1 de KAT

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
