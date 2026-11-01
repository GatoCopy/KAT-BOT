# 🐱 KAT — Bot multipropósito para Discord

KAT es un bot modular para servidores de Discord, con comandos de moderación, auto-moderación, utilidad, ocio y multimedia. Desarrollado por **Alexander Jerrard (CopyCat)**.

---

## 📂 Estructura del proyecto

```
kat-bot/
├── index.js                 # Punto de entrada: conecta el bot y carga comandos
├── ecosystem.config.js      # Configuración de PM2
├── .env                     # Variables de entorno (NO subir a git)
│
├── comandos/                # Todos los comandos del bot, organizados por categoría
│   ├── admin/
│   │   ├── moderacion/        # Comandos de moderación (nivel moderador)
│   │   └── administracion/    # Configuración del bot (nivel administrador)
│   ├── diversion/             # Comandos de entretenimiento
│   ├── multimedia/            # Embeds, imágenes, etc.
│   └── utilidad/              # Comandos de utilidad general
│
├── eventos/                  # Handlers de eventos de Discord
│   ├── ready.js
│   ├── message.js
│   ├── messageReact.js / messageUnreact.js   # Autoroles por reacción
│   ├── memberAdd.js                          # Rastreo de invitaciones + bienvenida
│   └── memberRemove.js                       # Despedida
│
├── servicios/                # Lógica reutilizable
│   ├── api.js                  # Funciones para hablar con la API de Discord (vía discord.js)
│   ├── db.js                   # Conexión, esquema y migraciones de la base SQLite
│   ├── recordatorios.js        # Acceso a datos de recordatorios
│   ├── encuestas.js            # Acceso a datos de encuestas y votos
│   ├── warns.js                # Acceso a datos de advertencias
│   ├── tempbans.js             # Baneos temporales pendientes
│   ├── autoroles.js            # Autoroles (reacción → rol)
│   ├── bienvenida.js           # Mensajes de bienvenida/despedida
│   ├── logs.js                 # Canal de logs de moderación + historial
│   ├── automod.js              # Motor que revisa cada mensaje (palabras, links, invitaciones, menciones, flood)
│   ├── automodConfig.js        # On/off de cada sistema de auto-moderación, por servidor
│   ├── palabrasProhibidas.js   # Lista de palabras prohibidas por servidor
│   ├── canalesLinks.js         # Canales donde sí se permiten links (whitelist)
│   ├── roles.js                # Roles de moderador/administrador configurados con !setrol
│   ├── invites.js              # Rastreo de qué invitación usó cada miembro
│   ├── imagenesAleatorias.js   # Imágenes aleatorias (!gato)
│   └── scheduler.js            # Revisa periódicamente recordatorios y baneos temporales vencidos
│
├── utilidades/
│   ├── cargadorComandos.js    # Carga los comandos y expone el Map compartido
│   ├── jerarquia.js            # Impide que alguien modere a su mismo nivel o superior
│   ├── crearComandoMensaje.js  # Fábrica de !bienvenida y !despedida
│   ├── tiempo.js               # Parsea/formatea duraciones ("10m", "2h30m")
│   ├── parseMencion.js         # Extrae un ID de una mención "<@ID>" / "<#ID>" o texto plano
│   ├── cacheUsuarios.js        # Cache de nombres de usuario
│   ├── cacheAdmins.js          # Cache de si un usuario es admin
│   ├── cacheNiveles.js         # Cache del nivel (público/moderador/administrador) de cada usuario
│   ├── cacheCanales.js         # Cache de a qué servidor pertenece cada canal
│   └── antiflood.js            # Contador en memoria de mensajes por usuario/canal
│
├── data/
│   └── kat.db                # Base de datos SQLite (se crea sola, NO subir a git)
│
└── config/
    └── constantes.js         # PREFIX, colores, límites de auto-moderación, etc.
```

---

## ⚙️ Configuración (.env)

```env
BOT_TOKEN=tu_token_del_bot_aqui
```

- `BOT_TOKEN` (o `DISCORD_TOKEN`/`TOKEN` como alternativa) — token del bot, desde el Developer Portal de Discord.

---

## 🎮 Comandos

### 🌐 Públicos

| Comando | Categoría | Descripción |
|---|---|---|
| `!help [categoría\|comando]` | utilidad | Menú de categorías, comandos de una categoría, o detalle de uno |
| `!ping` | utilidad | Muestra la latencia actual del bot |
| `!botinfo` | utilidad | Versión, tiempo encendido, servidores y comandos de KAT |
| `!userinfo [@usuario]` | utilidad | Info de un usuario (o de quien ejecuta el comando) |
| `!avatar [@usuario]` | utilidad | Avatar de un usuario en grande |
| `!serverinfo` | utilidad | Info general del servidor (miembros, canales, roles, dueño) |
| `!roleinfo <@rol>` | utilidad | Info de un rol (miembros, color, posición...) |
| `!recordatorio <tiempo> <mensaje>` | utilidad | Crea un recordatorio persistente (ej: `1h30m`) |
| `!misrecordatorios` | utilidad | Lista tus recordatorios pendientes |
| `!encuesta <pregunta> \| <op1> \| <op2>...` | utilidad | Crea una encuesta con hasta 9 opciones |
| `!votar <id> <número>` | utilidad | Vota (o cambia tu voto) en una encuesta |
| `!cerrarencuesta <id>` | utilidad | Cierra y muestra resultados (*solo creador o admin*) |
| `!dado` | diversión | Tira un dado de 6 caras |
| `!moneda` | diversión | Cara o cruz |
| `!elegir <a> \| <b> \| ...` | diversión | Elige una opción al azar |
| `!chiste` | diversión | Cuenta un chiste aleatorio |
| `!bola8 <pregunta>` | diversión | Responde al estilo bola 8 mágica |
| `!gato` | multimedia | Imagen aleatoria de un gato |
| `!embed [Título \| Texto]` | multimedia | Crea un mensaje embed. Sin argumentos, muestra la guía |

### 🛡️ Moderación (moderadores y superior)

| Comando | Descripción |
|---|---|
| `!warn <@usuario> [razón]` | Agrega una advertencia |
| `!warns <@usuario>` | Lista las advertencias de un usuario |
| `!delwarn <id>` | Elimina una advertencia específica |
| `!clearwarns <@usuario>` | Elimina **todas** las advertencias de un usuario |
| `!nota <@usuario> <texto>` | Nota interna sobre un usuario (aparece en `!historial`) |
| `!historial <@usuario>` | Todas las acciones de moderación de un usuario |
| `!suspender <@usuario> <tiempo> [razón]` | Suspende temporalmente (timeout, máx. 28 días) |
| `!desuspender <@usuario>` | Quita la suspensión |
| `!kick <@usuario> [razón]` | Expulsa a un miembro |
| `!ban <@usuario> [razón]` | Banea a un usuario |
| `!tempban <@usuario> <tiempo> [razón]` | Banea por un tiempo; el bot lo desbanea solo |
| `!unban <ID>` | Quita el baneo |
| `!banlist` | Lista los baneados del servidor |
| `!nick <@usuario> <apodo\|reset>` | Cambia o restablece el apodo de un miembro |
| `!rol dar\|quitar <@usuario> <@rol>` | Da o quita un rol (solo roles por debajo del tuyo) |
| `!clear <cantidad>` | Elimina entre 1 y 100 mensajes del canal |
| `!lock [#canal] [razón]` | Bloquea un canal (nadie puede escribir) |
| `!unlock [#canal]` | Desbloquea un canal |
| `!slowmode <tiempo\|off>` | Modo lento del canal (máx. 6h) |

### 🔒 Administración (solo administradores)

| Comando | Descripción |
|---|---|
| `!setrol moderador\|administrador\|ver` | Configura qué rol cuenta como moderador/administrador |
| `!modlogs [on\|off]` | Canal donde se publican los logs de moderación |
| `!autorol crear\|quitar\|lista` | Roles automáticos por reacción |
| `!bienvenida on\|set\|off\|ver\|probar` | Mensaje cuando alguien entra al servidor |
| `!despedida on\|set\|off\|ver\|probar` | Mensaje cuando alguien sale del servidor |
| `!palabraprohibida agregar\|quitar\|lista` | Palabras prohibidas (se borran + se avisa) |
| `!filtrolinks [on\|off]` | Bloquea links fuera de canales permitidos |
| `!linkscanal permitir\|quitar\|lista` | Qué canales permiten links |
| `!filtroinvitaciones [on\|off]` | Bloquea invitaciones a otros servidores de Discord |
| `!antimenciones [on\|off]` | Borra mensajes que mencionan a demasiadas personas |
| `!antiflood [on\|off]` | Auto-suspende a quien mande mensajes muy seguidos |
| `!decir [ID canal] <mensaje>` | El bot envía un mensaje por ti (anuncios) |

> Los comandos dentro de `comandos/admin/moderacion/` son de nivel **moderador** y los de `comandos/admin/administracion/` de nivel **administrador**; el loader lo asigna solo según la carpeta. Los administradores pueden usar todo lo de moderación.

---

## ➕ Cómo agregar un comando nuevo

1. Crea un archivo `.js` dentro de la subcarpeta de `comandos/` que corresponda (o crea una nueva categoría, ej. `comandos/musica/`).
2. Usa esta plantilla base:

```js
module.exports = {
    nombre: 'saludo',              // Lo que el usuario escribirá: !saludo
    descripcion: 'Saluda al usuario',
    categoria: 'diversion',        // Agrupa el comando en !help

    ejecutar: async (evento, args, responder) => {
        // evento    → el mensaje original: { _id, channel, author, content, mentions }
        // args      → array con las palabras después del comando: "!saludo Copy" → ['Copy']
        // responder → función para responder: puede recibir texto o un objeto { embeds: [...] }

        await responder(`👋 ¡Hola, ${args[0] || 'amigo'}!`);
    }
};
```

3. Guarda el archivo. **No hay que tocar `index.js`, `help.js`, ni ningún otro archivo** — el loader recorre `comandos/` de forma recursiva y lo detecta solo la próxima vez que reinicies el bot. `!help` también se actualiza solo: agrupa por el campo `categoria`. Si inventas una categoría nueva, aparece automáticamente, solo que sin un emoji bonito — para eso, opcionalmente agrega una línea en `NOMBRES_CATEGORIA` dentro de `comandos/utilidad/help.js`.

### Si tu comando necesita hablar con una API externa

No repitas `fetch` a mano dentro del comando. Crea `servicios/tuServicio.js` con la lógica de la llamada (fetch, headers, manejo de errores) e impórtala en tu comando. Así, si luego otro comando necesita lo mismo, ya está reutilizable.

### Si tu comando necesita hablar con la API de Discord

Ya existen funciones listas en `servicios/api.js` (`enviarMensaje`, `eliminarMensaje`, `editarMiembro`, `bloquearCanal`, `gestionarRolMiembro`, etc.). Impórtalas en vez de usar `discord.js` directamente.

### Si tu comando actúa sobre otro usuario

Llama a `validarObjetivo` de `utilidades/jerarquia.js` antes de actuar: impide que alguien se aplique la acción a sí mismo, al bot o al dueño, y que un moderador toque a otro moderador o a un administrador.

---

## 🎨 Cómo personalizar el bot

Todo lo "de marca" y los límites viven en `config/constantes.js`:

```js
module.exports = {
    PREFIX: '!',                 // Cambia el prefijo de todos los comandos a la vez
    COLOR_SERVER: '#FF5757',     // Color por defecto de los embeds
    ANTIFLOOD_MAX_MENSAJES: 5,
    ANTIFLOOD_VENTANA_MS: 5000,
    ANTIFLOOD_SUSPENSION_MS: 120000,
    ANTIMENCIONES_MAX: 5,        // máximo de personas distintas mencionadas por mensaje
};
```

---

## 🚀 Levantar el bot

Necesitas [Node.js](https://nodejs.org/) 18 o superior y git.

```bash
git clone https://github.com/GatoCopy/KAT-BOT.git
cd KAT-BOT
cp .env.example .env     # en Windows (PowerShell): copy .env.example .env
# edita .env y pega tu BOT_TOKEN
npm install
node index.js            # o, con PM2 (opcional): npm install -g pm2 && npm run pm2
```

**Antes de que arranque necesitas, en el [Developer Portal de Discord](https://discord.com/developers/applications) → tu app → Bot:**
- Activar **Server Members Intent** y **Message Content Intent** (ambos son "Privileged Gateway Intents"). Sin esto el bot se cae al iniciar con un error `DisallowedIntents`.
- Invitarlo a tu servidor desde OAuth2 → URL Generator, marcando el scope `bot` y los permisos de la sección de Moderación.

Con PM2: `pm2 logs KAT` para ver logs y `pm2 restart KAT` para reiniciar tras cambios.

---

## 🛡️ Moderación

⚠️ **Primer paso obligatorio en cada servidor nuevo:** ejecuta `!setrol administrador <ID o mención de un rol>` (como dueño del servidor, que siempre tiene acceso). Sin esto, **nadie más que el dueño** (y quienes tengan permisos nativos de Administrator/Kick/Ban) puede usar los comandos de moderación o administración.

**Permisos que necesita el bot** (en su rol dentro del servidor):

| Permiso | Para qué |
|---|---|
| Kick Members | `!kick` |
| Ban Members | `!ban`, `!tempban`, `!unban`, `!banlist` |
| Moderate Members | `!suspender`, `!desuspender`, antiflood |
| Manage Messages | `!clear` y el borrado de la auto-moderación |
| Manage Roles | `!rol`, `!autorol`, `!lock`/`!unlock` |
| Manage Channels | `!lock`/`!unlock`, `!slowmode` |
| Manage Nicknames | `!nick` |
| Manage Server | rastreo de invitaciones |
| Add Reactions | reacción inicial de los autoroles |

El rol del bot también debe estar **por encima**, en la lista de roles del servidor, de cualquier rol que quiera asignar/quitar o de cualquier miembro que quiera moderar. Si un comando falla con un mensaje genérico de "no pude hacer X", esto es lo primero a revisar.

**Jerarquía:** nadie puede aplicarse una acción a sí mismo, al bot ni al dueño del servidor. Un moderador no puede moderar a otro moderador ni a un administrador, y un administrador no puede moderar a otro administrador (el dueño sí puede con todos). Con `!rol` solo se pueden dar/quitar roles que estén por debajo de tu rol más alto.

**Warns:** son solo un registro (no hacen nada automáticamente). A partir de 3 advertencias, `!warn` te avisa en el propio mensaje para que decidas si aplicar una suspensión o expulsión — no hay castigo automático, a propósito, para que la decisión la siga tomando un humano.

**Baneos temporales:** `!tempban` guarda el vencimiento en la base de datos; el scheduler revisa cada 15 segundos y desbanea al cumplirse. Si el bot estaba apagado cuando venció, desbanea apenas vuelve a arrancar. `!unban` o un `!ban` manual cancelan el tempban pendiente.

### Configurar un autorol paso a paso

1. Activa el "modo desarrollador" en Discord (Configuración de usuario → Avanzado → Modo desarrollador) para poder copiar IDs con click derecho.
2. Envía (o ubica) el mensaje que quieres usar como panel de roles, por ejemplo: "Reacciona con 🎮 para el rol de Gamer".
3. Click derecho sobre ese mensaje → Copiar ID.
4. Ve a Configuración del servidor → Roles, y copia el ID del rol que quieres asignar.
5. En el **mismo canal** donde está el mensaje, ejecuta:
   ```
   !autorol crear <ID_del_mensaje> 🎮 <ID_del_rol>
   ```
6. El bot reacciona solo al mensaje con ese emoji. Cualquiera que reaccione ahí recibe el rol; si quita la reacción, se lo quita.

Puedes tener varios autoroles en el mismo mensaje (uno por cada emoji distinto). `!autorol lista` muestra todos los configurados, y `!autorol quitar <ID_mensaje> <emoji>` elimina uno.

---

## 🤖 Auto-moderación

Cinco sistemas independientes, cada uno con su propio on/off por servidor — activa solo los que necesites. **Los moderadores y administradores están exentos de todos.**

### Logs de moderación
`!modlogs on` en el canal que quieras usar como bitácora. A partir de ahí, **todo** lo que hagan los comandos de moderación y los sistemas de abajo se publica ahí automáticamente. Sin `!modlogs`, todo funciona igual y se guarda igual en el historial (`!historial`), solo que sin publicarse en ningún canal.

### Filtro de palabras
`!palabraprohibida agregar <palabra>` activa el filtro automáticamente y la agrega a la lista. El mensaje **se borra** y se avisa en el canal — **no** se genera un warn formal.

### Filtro de links
`!filtrolinks on` bloquea cualquier link (`http://`, `https://`) en canales que no estén en la whitelist. Usa `!linkscanal permitir` dentro de cada canal donde SÍ quieras permitir links.

### Filtro de invitaciones
`!filtroinvitaciones on` borra mensajes con invitaciones a otros servidores de Discord (`discord.gg/...`, `discord.com/invite/...`), incluso sin `https://`.

### Antimenciones
`!antimenciones on` borra mensajes que mencionan a más de `ANTIMENCIONES_MAX` (5) personas distintas.

### Antiflood
`!antiflood on` — si alguien manda más de 5 mensajes en 5 segundos, se borra el mensaje que rompió el límite y se le suspende 2 minutos (configurable en `config/constantes.js`).

**ℹ️ Sobre invitaciones:** el bot rastrea quién entró por cuál invitación comparando los conteos de uso antes/después de cada entrada (`servicios/invites.js` + `eventos/memberAdd.js`); se registra en el `!historial` de cada usuario. Requiere el permiso **Manage Server**; si falta, registra "no se pudo determinar" en vez de fallar.

---

## 👋 Bienvenida y despedida

`!bienvenida on` activa un mensaje por defecto en el canal donde lo ejecutes; `!bienvenida set <mensaje>` lo personaliza. Igual con `!despedida`. Marcadores disponibles: `{usuario}` (mención), `{nombre}`, `{servidor}`, `{miembros}`. Ejemplo:

```
!bienvenida set 🎉 ¡Bienvenido/a {usuario} a {servidor}! Ya somos {miembros}.
```

`!bienvenida probar` muestra cómo se vería. Los mensajes solo mencionan usuarios (un nombre como "@everyone" no genera ping masivo) y no se envían para bots.

---

## 💾 Persistencia

Todo se guarda en `data/kat.db` (SQLite, vía `better-sqlite3`), así que sobrevive a reinicios: recordatorios, encuestas y votos, warns, historial de moderación, autoroles, configuración de auto-moderación, baneos temporales, bienvenida/despedida, roles de moderador/administrador.

- **Recordatorios y baneos temporales:** un `setInterval` en `servicios/scheduler.js` revisa cada 15 segundos qué venció.
- **Encuestas:** el voto es por **comando de texto** (`!votar <id> <número>`), no por reacciones. Un usuario puede cambiar su voto votando de nuevo.
- **Migraciones:** `servicios/db.js` actualiza solo las bases de datos antiguas al arrancar (agrega columnas nuevas y elimina tablas que ya no se usan).

---

## 📌 Historial del proyecto

Este bot empezó en Stoat/Revolt y se migró a Discord. El sistema de **dos niveles de permisos** (moderador vs. administrador, configurable con `!setrol`) y el comando `!historial` (que también incluye el rastreo de invitaciones) están completos y funcionando.
