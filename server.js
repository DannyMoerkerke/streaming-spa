import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8888;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

app.use(express.static(__dirname));

const writeListChunks = async res => {
  await sleep(2000);
  res.write(`
        <template for="list">
          <ul>
            <li>Item 1</li>
            <?marker name="items">
          </ul>
        </template>`);

  await sleep(3000);
  res.write(`
        <template for="items">
          <li>Item 2</li>
          <li>Item 3</li>
          <?marker name="items">
        </template>`);

  await sleep(3000);
  res.write(`
        <template for="items">
          <li>Item 4</li>
          <?marker name="items">
        </template>`);

  await sleep(1000);
  res.write(`
        <template for="items">
          <li>Item 5</li>
          <li>Item 6</li>
          <li>Item 7</li>
          <?marker name="items">
        </template>`);

  await sleep(1500);
  res.write(`
        <template for="items">
          <li>Item 8</li>
          <?marker name="items">
        </template>
        <template for="status">
          <strong>Complete!</strong>
        </template>`);
};

app.get('/server-list', async (req, res) => {
  res.status(200);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.flushHeaders();

  res.write(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Server List | Streaming SPA</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="./">Streaming SPA</a>
      <nav aria-label="Primary navigation">
        <a href="./">Home</a>
        <a href="about">About</a>
        <a href="info">Info</a>
        <a href="client-list">Client List</a>
        <a href="server-list" aria-current="page">Server List</a>
      </nav>
    </header>

    <main id="app">
      <section class="page">
        <?marker name="content">
      </section>
    </main>

    <footer class="site-footer">
      <p>Source: <a href="https://github.com/DannyMoerkerke/streaming-spa">https://github.com/DannyMoerkerke/streaming-spa</a></p>
    </footer>

    <script src="app.js"></script>
  </body>
</html>
`);

  res.write(`<template for="content">
<?start name="content">
  <p class="eyebrow">Server List</p>
  <h1 id="info-title">A continuously updated list.</h1>
  <p>This list is streamed in chunks.</p>
  <div>
    <?start name="status">
    Loading…
    <?end>
    <?marker name="list">
</div>
<?end>
</template>
`);

  await writeListChunks(res);
  res.end();
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
