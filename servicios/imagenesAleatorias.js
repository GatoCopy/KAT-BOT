// Para agregar un tema nuevo (!perro, !zorro, etc.) solo hay que sumar una
// entrada aquí — no hace falta tocar ninguna otra parte del sistema.
const FUENTES = {
    gato: {
        url: 'https://api.thecatapi.com/v1/images/search',
        extraer: (data) => data?.[0]?.url,
    },
    // perro: {
    //     url: 'https://dog.ceo/api/breeds/image/random',
    //     extraer: (data) => data?.message,
    // },
};

/**
 * Pide una imagen aleatoria a la API pública configurada para ese tema.
 * Retorna la URL de la imagen, o null si algo falló.
 */
async function obtenerImagenAleatoria(tema) {
    const fuente = FUENTES[tema];
    if (!fuente) return null;

    try {
        const respuesta = await fetch(fuente.url);
        if (!respuesta.ok) return null;

        const data = await respuesta.json();
        return fuente.extraer(data) || null;
    } catch (error) {
        console.error(`❌ Error obteniendo imagen de "${tema}":`, error);
        return null;
    }
}

module.exports = { obtenerImagenAleatoria, FUENTES };
