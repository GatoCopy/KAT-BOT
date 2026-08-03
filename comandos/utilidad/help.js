const { commands } = require('../../utilidades/cargadorComandos');
const { PREFIX, COLOR_SERVER } = require('../../config/constantes');

// Nombres bonitos para mostrar por categoría (ajusta/agrega según vayas creando nuevas)
const NOMBRES_CATEGORIA = {
    admin: '🔒 Administración',
    diversion: '🎉 Diversión',
    ia: '🤖 Inteligencia Artificial',
    multimedia: '🖼️ Multimedia',
    utilidad: '🛠️ Utilidad',
};

module.exports = {
    nombre: 'help',
    descripcion: 'Muestra todos los comandos disponibles, o detalles de uno en específico',
    categoria: 'utilidad',
    soloAdmin: false,

    ejecutar: async (evento, args, responder) => {
        // !help <comando> → detalle de un solo comando
        if (args.length > 0) {
            const nombreBuscado = args[0].toLowerCase();
            const comando = commands.get(nombreBuscado);

            if (!comando) {
                return await responder(`❓ No encontré ningún comando llamado \`${nombreBuscado}\`.`);
            }

            const etiquetaAdmin = comando.soloAdmin ? '🔒 Solo administradores' : '🌐 Uso público';
            return await responder({
                embeds: [{
                    type: 'Text',
                    title: `📖 ${PREFIX}${comando.nombre}`,
                    description:
                        `${comando.descripcion || '*Sin descripción.*'}\n\n` +
                        `**Categoría:** ${NOMBRES_CATEGORIA[comando.categoria] || comando.categoria || 'Sin categoría'}\n` +
                        `**Acceso:** ${etiquetaAdmin}`,
                    colour: COLOR_SERVER
                }]
            });
        }

        // !help sin argumentos → listado agrupado por categoría
        const porCategoria = {};
        for (const comando of commands.values()) {
            const cat = comando.categoria || 'sin-categoria';
            if (!porCategoria[cat]) porCategoria[cat] = [];
            porCategoria[cat].push(comando);
        }

        let descripcion = '';
        for (const [cat, lista] of Object.entries(porCategoria)) {
            const titulo = NOMBRES_CATEGORIA[cat] || cat;
            descripcion += `**${titulo}**\n`;
            for (const comando of lista.sort((a, b) => a.nombre.localeCompare(b.nombre))) {
                descripcion += `\`${PREFIX}${comando.nombre}\` — ${comando.descripcion || 'Sin descripción'}\n`;
            }
            descripcion += '\n';
        }
        descripcion += `*Escribe \`${PREFIX}help <comando>\` para ver detalles de uno en específico.*`;

        await responder({
            embeds: [{
                type: 'Text',
                title: '📖 Comandos de KAT',
                description: descripcion.trim(),
                colour: COLOR_SERVER
            }]
        });
    }
};
