const fs = require('fs');
const path = require('path');

// Map compartido — al ser un módulo de Node, cualquier archivo que lo importe
// recibe la MISMA instancia (Node cachea el require), así que un comando
// puede leer aquí los mismos comandos que index.js cargó.
const commands = new Map();

const ETIQUETA_NIVEL = {
    publico: '🌐 [PÚBLICO]',
    moderador: '🛡️ [MODERADOR]',
    administrador: '🔒 [ADMIN]',
};

/**
 * Carga recursivamente todos los comandos (.js) desde un directorio.
 * El nivel de permiso se infiere del nombre de la carpeta contenedora:
 * "moderacion" -> nivel moderador, "administracion" -> nivel administrador.
 * Una vez detectado, se propaga a cualquier subcarpeta anidada dentro.
 */
function cargarComandos(directorio, nivelHeredado = null) {
    if (!fs.existsSync(directorio)) {
        fs.mkdirSync(directorio, { recursive: true });
        return;
    }

    const elementos = fs.readdirSync(directorio, { withFileTypes: true });

    for (const elemento of elementos) {
        const rutaAbsoluta = path.join(directorio, elemento.name);

        if (elemento.isDirectory()) {
            let nivelParaSubcarpeta = nivelHeredado;
            const nombreCarpeta = elemento.name.toLowerCase();
            if (nombreCarpeta === 'moderacion') nivelParaSubcarpeta = 'moderador';
            if (nombreCarpeta === 'administracion') nivelParaSubcarpeta = 'administrador';

            cargarComandos(rutaAbsoluta, nivelParaSubcarpeta);
        } else if (elemento.isFile() && elemento.name.endsWith('.js')) {
            delete require.cache[require.resolve(rutaAbsoluta)]; // limpiar caché por si hay reinicios
            const comando = require(rutaAbsoluta);

            comando.nivel = nivelHeredado || comando.nivel || 'publico';

            commands.set(comando.nombre, comando);
            console.log(`✅ Comando cargado: !${comando.nombre} ${ETIQUETA_NIVEL[comando.nivel]}`);
        }
    }
}

module.exports = { commands, cargarComandos };
