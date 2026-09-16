const statusCatalog = [
    { code: 200, when: "GET exitoso o accion completada", example: "GET /players/me" },
    { code: 201, when: "Recurso creado", example: "POST /tournaments/1/register" },
    { code: 202, when: "Solicitud aceptada, se procesa despues", example: "POST /queue" },
    { code: 204, when: "Accion exitosa sin body", example: "DELETE /queue/:ticketId" },
    { code: 308, when: "Ruta movida permanentemente", example: "POST /legacy/queue" },
    { code: 400, when: "JSON malformado o id invalido", example: "POST /queue con body roto" },
    { code: 401, when: "Falta la cabecera x-api-key", example: "cualquier ruta sin cabecera" },
    { code: 403, when: "Jugador baneado", example: "x-api-key: banned-player" },
    { code: 404, when: "Ruta o recurso inexistente", example: "GET /queue/999" },
    { code: 405, when: "Metodo no permitido en la ruta", example: "DELETE /tournaments" },
    { code: 409, when: "Estado en conflicto", example: "POST /queue dos veces seguidas" },
    { code: 410, when: "Recurso que existio y ya no", example: "GET /tournaments/1" },
    { code: 422, when: "Datos validos en forma pero no en reglas", example: "POST /tournaments/2/register con rank invalido" },
    { code: 429, when: "Demasiadas peticiones", example: "mas de 5 peticiones en 10 s" },
    { code: 500, when: "Error no controlado", example: "GET /crash" },
    { code: 501, when: "Ruta declarada pero no implementada", example: "GET /replays" },
    { code: 503, when: "Servidor en mantenimiento", example: "tras POST /maintenance" },
];

export { statusCatalog };
