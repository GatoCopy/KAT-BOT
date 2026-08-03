const UNIDADES_MS = { s: 1000, m: 60000, h: 3600000, d: 86400000 };

/**
 * Convierte un texto como "10m", "2h", "1d12h", "45s" en milisegundos.
 * Acepta combinaciones (ej: "1h30m"). Retorna null si no se pudo parsear nada.
 */
function parsearDuracion(texto) {
    if (!texto) return null;
    const regex = /(\d+)\s*(s|m|h|d)/gi;
    let total = 0;
    let encontrado = false;
    let match;

    while ((match = regex.exec(texto)) !== null) {
        encontrado = true;
        const cantidad = parseInt(match[1], 10);
        const unidad = match[2].toLowerCase();
        total += cantidad * UNIDADES_MS[unidad];
    }

    return encontrado ? total : null;
}

/**
 * Convierte milisegundos en un texto legible: "1d 3h 20m".
 */
function formatearDuracion(ms) {
    const segundosTotales = Math.max(0, Math.floor(ms / 1000));
    const dias = Math.floor(segundosTotales / 86400);
    const horas = Math.floor((segundosTotales % 86400) / 3600);
    const minutos = Math.floor((segundosTotales % 3600) / 60);
    const segundos = segundosTotales % 60;

    const partes = [];
    if (dias) partes.push(`${dias}d`);
    if (horas) partes.push(`${horas}h`);
    if (minutos) partes.push(`${minutos}m`);
    if (!partes.length) partes.push(`${segundos}s`);

    return partes.join(' ');
}

module.exports = { parsearDuracion, formatearDuracion };
