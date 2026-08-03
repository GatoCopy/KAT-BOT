const fs = require('fs');
const path = require('path');

// Map compartido — al ser un módulo de Node, cualquier archivo que lo importe
// recibe la MISMA instancia (Node cachea el require), así que un comando
// puede leer aquí los mismos comandos que index.js cargó.
const commands = new Map();

/**
 * Carga recursivamente todos los comandos (.js) desde un directorio.
 * Si un archivo está dentro de una carpeta "admin" (o subcarpeta de esta),
 * se le fuerza soloAdmin = true automáticamente.
 */
function cargarComandos(directorio, esAdminFolder = false) {
    if (!fs.existsSync(directorio)) {
        fs.mkdirSync(directorio, { recursive: true });
        return;
    }

    const elementos = fs.readdirSync(directorio, { withFileTypes: true });

    for (const elemento of elementos) {
        const rutaAbsoluta = path.join(directorio, elemento.name);

        if (elemento.isDirectory()) {
            const esSubAdmin = esAdminFolder || elemento.name.toLowerCase() === 'admin';
            cargarComandos(rutaAbsoluta, esSubAdmin);
        } else if (elemento.isFile() && elemento.name.endsWith('.js')) {
            delete require.cache[require.resolve(rutaAbsoluta)];
            const comando = require(rutaAbsoluta);

            if (esAdminFolder) {
                comando.soloAdmin = true;
            }

            commands.set(comando.nombre, comando);

            const etiquetaAdmin = comando.soloAdmin ? '🔒 [ADMIN]' : '🌐 [PÚBLICO]';
            console.log(`✅ Comando cargado: !${comando.nombre} ${etiquetaAdmin}`);
        }
    }
}

module.exports = { commands, cargarComandos };
