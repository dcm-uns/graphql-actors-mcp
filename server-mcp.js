#!/usr/bin/env node
// Servidor MCP mínimo para la API GraphQL de actores/películas.
// Traduce "tools" de MCP en llamadas GraphQL contra tu server Apollo ya desplegado.

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

//  Cambiar por la URL real del server desplegado en Render
const GRAPHQL_URL = process.env.ACTORES_API_URL || "http://localhost:3000/graphql";

async function graphqlRequest(query, variables = {}) {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  return json.data;
}

const server = new Server(
  { name: "actores-graphql-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Cada tool es, en esencia, una query o mutation ya conocida, con nombre y
// descripción en lenguaje natural para que el agente sepa cuándo usarla.
const TOOLS = [
  {
    name: "listar_actores",
    description: "Devuelve todos los registros con su actor, película, año, género y director.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "listar_por_genero",
    description: "Filtra las participaciones por género cinematográfico (ej: Acción, Drama, Ciencia Ficción, Fantasía).",
    inputSchema: {
      type: "object",
      properties: {
        genre: { type: "string", description: "Género de la película" }
      },
      required: ["genre"],
    },
  },
  {
    name: "listar_por_director",
    description: "Filtra las participaciones por el nombre del director.",
    inputSchema: {
      type: "object",
      properties: {
        director: { type: "string", description: "Nombre del director" }
      },
      required: ["director"],
    },
  },
  {
    name: "agregar_actor",
    description: "Agrega un nuevo registro indicando actor, película, año, género y director.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nombre del actor" },
        movie: { type: "string", description: "Título de la película" },
        year: { type: "integer", description: "Año de estreno" },
        genre: { type: "string", description: "Género de la película" },
        director: { type: "string", description: "Director de la película" },
      },
      required: ["name", "movie", "year", "genre", "director"],
    },
  },
  {
    name: "actualizar_actor",
    description: "Actualiza los datos de un registro existente, dado su id.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Id del registro" },
        name: { type: "string", description: "Nuevo nombre del actor" },
        movie: { type: "string", description: "Nueva película" },
        year: { type: "integer", description: "Nuevo año" },
        genre: { type: "string", description: "Nuevo género" },
        director: { type: "string", description: "Nuevo director" },
      },
      required: ["id"],
    },
  },
  {
    name: "eliminar_actor",
    description: "Elimina un registro de la base, dado su id.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string", description: "Id del registro" } },
      required: ["id"],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "listar_actores") {
      const data = await graphqlRequest(`query { actors { id name movie year genre director } }`);
      return { content: [{ type: "text", text: JSON.stringify(data.actors, null, 2) }] };
    }

    if (name === "listar_por_genero") {
      const data = await graphqlRequest(
        `query($genre: String!) { actorsByGenre(genre: $genre) { id name movie year genre director } }`,
        args
      );
      return { content: [{ type: "text", text: JSON.stringify(data.actorsByGenre, null, 2) }] };
    }

    if (name === "listar_por_director") {
      const data = await graphqlRequest(
        `query($director: String!) { actorsByDirector(director: $director) { id name movie year genre director } }`,
        args
      );
      return { content: [{ type: "text", text: JSON.stringify(data.actorsByDirector, null, 2) }] };
    }

    if (name === "agregar_actor") {
      const data = await graphqlRequest(
        `mutation($name: String!, $movie: String!, $year: Int!, $genre: String!, $director: String!) {
           addActor(name: $name, movie: $movie, year: $year, genre: $genre, director: $director) { id name movie year genre director }
         }`,
        args
      );
      return { content: [{ type: "text", text: JSON.stringify(data.addActor, null, 2) }] };
    }

    if (name === "actualizar_actor") {
      const data = await graphqlRequest(
        `mutation($id: ID!, $name: String, $movie: String, $year: Int, $genre: String, $director: String) {
           updateActor(id: $id, name: $name, movie: $movie, year: $year, genre: $genre, director: $director) { id name movie year genre director }
         }`,
        args
      );
      return { content: [{ type: "text", text: JSON.stringify(data.updateActor, null, 2) }] };
    }

    if (name === "eliminar_actor") {
      const data = await graphqlRequest(
        `mutation($id: ID!) { deleteActor(id: $id) }`,
        args
      );
      return { content: [{ type: "text", text: JSON.stringify(data.deleteActor, null, 2) }] };
    }

    throw new Error(`Tool desconocida: ${name}`);
  } catch (err) {
    // Devolvemos el error como contenido para que el agente lo vea y pueda reintentar
    return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
