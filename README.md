# MCP para la API de actores — guía para la clase

## Qué es MCP (para presentar antes de empezar)

MCP (Model Context Protocol) es un estándar para que un agente de IA use
herramientas externas. En vez de que el agente "adivine" cómo hablarle a una
API, alguien define un puñado de **tools** (funciones con nombre, descripción
y parámetros) y el agente las invoca en lenguaje natural cuando las necesita.
Hoy vamos a exponer el server GraphQL de actores como un conjunto de tools
MCP, y vamos a pedirle a un agente que opere sobre esos datos sin escribir
ninguna consulta a mano.

## Paso 1 — Instalar dependencias

```bash
cd mcp-actores
npm install
```

## Paso 2 — Apuntar al server GraphQL desplegado

Abrir `server.js` y reemplazar esta línea con la URL real de Render:

```js
const GRAPHQL_URL = process.env.ACTORES_API_URL || "https://TU-APP.onrender.com/graphql";
```

## Paso 3 — Conectar el servidor MCP a Claude Desktop

Abrir (o crear) el archivo de configuración de Claude Desktop:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

Agregar esta entrada (con la ruta absoluta real a la carpeta del proyecto):

```json
{
  "mcpServers": {
    "actores": {
      "command": "node",
      "args": ["/ruta/absoluta/a/mcp-actores/server.js"]
    }
  }
}
```

Guardar y reiniciar Claude Desktop por completo (cerrar y volver a abrir).

## Paso 4 — Verificar que aparece

Al abrir una conversación nueva en Claude Desktop debería verse el ícono de
herramientas (🔨) con "actores" listado y sus 4 tools: `listar_actores`,
`agregar_actor`, `actualizar_actor`, `eliminar_actor`.

## Paso 5 — Probar en lenguaje natural

Consignas sugeridas para que los alumnos prueben, en orden creciente de
complejidad:

1. "Mostrame todos los actores registrados."
2. "Agregá a Paul Rudd en la película Ant-Man."
3. "¿Qué actores aparecen en más de una película?"
4. "Actualizá la película de todos los actores de Ant-Man a Ant-Man and the Wasp."

Para la consigna 4 (que requiere encadenar listar + actualizar varias veces),
pedirles que muestren qué tools invocó el agente y en qué orden — eso es lo
que van a comparar con lo que ellos mismos habrían tenido que escribir a mano.

## Nota si la query de listado no se llama `actors`

Si tu esquema define la query de listado con otro nombre, ajustar la primera
tool en `server.js`:

```js
const data = await graphqlRequest(`query { actors { id name movie } }`);
```
