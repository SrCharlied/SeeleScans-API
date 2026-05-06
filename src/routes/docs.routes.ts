import { Elysia } from 'elysia';

const SWAGGER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>SeeleScans API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>body { margin: 0; }</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/openapi.yaml',
        dom_id: '#swagger-ui',
        deepLinking: true,
      });
    };
  </script>
</body>
</html>`;

const docsRoutes = new Elysia()
  .get('/openapi.yaml', () => {
    return new Response(Bun.file('docs/openapi.yaml'), {
      headers: { 'Content-Type': 'application/yaml; charset=utf-8' },
    });
  })
  .get('/docs', () => {
    return new Response(SWAGGER_HTML, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  });

export default docsRoutes;
