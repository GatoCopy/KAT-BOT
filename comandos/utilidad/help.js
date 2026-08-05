const { commands } = require('../../utilidades/cargadorComandos');
const { PREFIX, COLOR_SERVER } = require('../../config/constantes');

// Solo da una etiqueta más bonita para categorías conocidas. Si agregas una
// categoría nueva (una carpeta nueva en comandos/) y no la pones aquí, el
// comando sigue funcionando solo — se muestra con el nombre "crudo" capitalizado.
const NOMBRES_CATEGORIA = {
    admin: '🔒 Moderación y Administración',
    diversion: '🎉 Diversión',
    ia: '🤖 Inteligencia Artificial',
    multimedia: '🖼️ Multimedia',
    utilidad: '🛠️ Utilidad',
};

function nombreCategoria(cat) {
    if (NOMBRES_CATEGORIA[cat]) return NOMBRES_CATEGORIA[cat];
    if (!cat) return '📁 Sin categoría';
    return `📁 ${cat.charAt(0).toUpperCase()}${cat.slice(1)}`;
}

function agruparPorCategoria() {
    const grupos = {};
    for (const comando of commands.values()) {
        const cat = comando.categoria || 'sin-categoria';
        if (!grupos[cat]) grupos[cat] = [];
        grupos[cat].push(comando);
    }
    return grupos;
}

module.exports = {
    nombre: 'help',
    descripcion: 'Muestra las categorías de comandos, los comandos de una categoría, o el detalle de uno',
    categoria: 'utilidad',
    soloAdmin: false,

    ejecutar: async (evento, args, responder) => {
        const grupos = agruparPorCategoria();

        // Sin argumentos → menú de categorías (como el índice de las carpetas del código)
        if (args.length === 0) {
            const lineas = Object.entries(grupos)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([cat, lista]) => `${nombreCategoria(cat)} — \`${PREFIX}help ${cat}\` (${lista.length} comando${lista.length === 1 ? '' : 's'})`);

            return await responder({
                embeds: [{
                    type: 'Text',
                    title: '📖 Comandos de KAT',
                    description:
                        `${lineas.join('\n')}\n\n` +
                        `Escribe \`${PREFIX}help <categoría>\` para ver los comandos de esa sección.\n` +
                        `Escribe \`${PREFIX}help <comando>\` para ver el detalle de uno en específico.`,
                    colour: COLOR_SERVER
                }]
            });
        }

        const consulta = args[0].toLowerCase();

        // ¿El argumento es el nombre de una categoría?
        if (grupos[consulta]) {
            const lista = grupos[consulta].sort((a, b) => a.nombre.localeCompare(b.nombre));
            const lineas = lista.map(c => `\`${PREFIX}${c.nombre}\` — ${c.descripcion || 'Sin descripción'}`);

            return await responder({
                embeds: [{
                    type: 'Text',
                    title: nombreCategoria(consulta),
                    description: `${lineas.join('\n')}\n\n*Escribe \`${PREFIX}help <comando>\` para más detalle de uno específico.*`,
                    colour: COLOR_SERVER
                }]
            });
        }

        // ¿El argumento es el nombre de un comando?
        const comando = commands.get(consulta);
        if (comando) {
            const etiquetaAdmin = comando.soloAdmin ? '🔒 Solo administradores' : '🌐 Uso público';
            return await responder({
                embeds: [{
                    type: 'Text',
                    title: `📖 ${PREFIX}${comando.nombre}`,
                    description:
                        `${comando.descripcion || '*Sin descripción.*'}\n\n` +
                        `**Categoría:** ${nombreCategoria(comando.categoria)}\n` +
                        `**Acceso:** ${etiquetaAdmin}`,
                    colour: COLOR_SERVER
                }]
            });
        }

        await responder(
            `❓ No encontré ninguna categoría ni comando llamado \`${consulta}\`.\n` +
            `Escribe \`${PREFIX}help\` para ver las categorías disponibles.`
        );
    }
};
