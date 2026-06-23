import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { html } from 'lit';
import { render } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
import './components/json-table.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8888;

app.use(express.static(__dirname));

app.get('/table', async (req, res) => {
  const items = [
    { id: 1, name: 'Alice', role: 'Developer' },
    { id: 2, name: 'Bob', role: 'Designer' },
    { id: 3, name: 'Charlie', role: 'Manager' }
  ];

  const tableHtml = await collectResult(render(html`
    <json-table .items=${items} defer-hydration></json-table>
  `));

  res.type('html').send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Streaming SPA</title>
        <link rel="stylesheet" href="styles.css">
        <script>
          window._items = ${JSON.stringify(items)};
        </script>
        <script type="importmap">
          {
            "imports": {
              "lit": "/node_modules/lit/index.js",
              "@lit/reactive-element": "/node_modules/@lit/reactive-element/reactive-element.js",
              "lit-html": "/node_modules/lit-html/lit-html.js",
              "lit-element/lit-element.js": "/node_modules/lit-element/lit-element.js",
              "lit-html/is-server.js": "/node_modules/lit-html/is-server.js",
              "lit-html/private-ssr-support.js": "/node_modules/lit-html/private-ssr-support.js",
              "lit-html/directive.js": "/node_modules/lit-html/directive.js",
              "lit-html/directive-helpers.js": "/node_modules/lit-html/directive-helpers.js"
            }
          }
        </script>
        <script src="/node_modules/@lit-labs/ssr-client/lit-element-hydrate-support.js" type="module"></script>
      </head>
      <body>
        <header class="site-header">
          <a class="brand" href="./">Streaming SPA</a>
          <nav aria-label="Primary navigation">
            <a href="./" aria-current="page">Home</a>
            <a href="about">About</a>
            <a href="info">Info</a>
            <a href="list">List</a>
          </nav>
        </header>
    
        <main id="app">
          <section class="page">
            ${tableHtml}
          </section>
        </main>
    
        <footer class="site-footer">
          <p>Source: <a href="https://github.com/DannyMoerkerke/streaming-spa">https://github.com/DannyMoerkerke/streaming-spa</a></p>
        </footer>
    
        <script src="app.js"></script>
        <script type="module">
          const init = async () => {
            const table = document.querySelector('json-table');
            
            await import('/components/json-table.js');
            await customElements.whenDefined('json-table');
            table.items = window._items;
          
            table.removeAttribute('defer-hydration');
          }
          
          init();
        </script>
      </body>
    </html>
  `);
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
