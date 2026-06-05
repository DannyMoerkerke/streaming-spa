const routes = new Map([
  ['/', { title: 'Home | Streaming SPA', page: 'pages/home.html' }],
  ['/about', { title: 'About | Streaming SPA', page: 'pages/about.html' }],
  ['/info', { title: 'Info | Streaming SPA', page: 'pages/info.html' }],
  ['/list', { title: 'Info | Streaming SPA', page: 'pages/list.html' }],
]);

const baseUrl = new URL('.', document.currentScript.src);
const navLinks = [...document.querySelectorAll('nav a')];

const getRoutePath = url => {
  const { pathname } = new URL(url, location.href);
  const basePath = baseUrl.pathname.replace(/\/$/, '');

  if (basePath && pathname.startsWith(`${basePath}/`)) {
    const routePath = pathname.slice(basePath.length) || '/';
    return routePath === '/index.html' ? '/' : routePath;
  }

  return pathname === '/index.html' ? '/' : pathname;
};

const getRoute = url => {
  return routes.get(getRoutePath(url)) ?? routes.get('/');
};

const setActiveLink = url => {
  const pathname = getRoutePath(url);

  navLinks.forEach(link => {
    const isActive = getRoutePath(link.href) === pathname;
    link.toggleAttribute('aria-current', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    }
  });
};

const renderRoute = async url => {
  if(!('streamAppendHTMLUnsafe' in HTMLElement.prototype)) {
    document.querySelector('.page').innerHTML = `
      <p>Your browser does not support out-of-order streaming HTML.</p>
      <p>Open this app in a Chromium-based browser version 148+ with experimental web features enabled</p>
  `;

    return;
  }
  const route = getRoute(url);
  const response = await fetch(new URL(route.page, baseUrl));

  const html = await response.text();
  const writer = document.body.streamAppendHTMLUnsafe().getWriter();
  await writer.write(html);

  // write the list chunks
  if(url.pathname.endsWith('/list')) {
    await writeListChunks(writer)
  }

  await writer.close();

  document.title = route.title;
  setActiveLink(url);
};

const writeListChunks = async (writer) => {
  return new Promise((resolve) => {
    setTimeout(async() => {
      await writer.write(`
        <template for="list">
          <ul>
            <li>Item 1</li>
            <?marker name="items">
          </ul>
        </template>`);
    }, 2000);

    setTimeout(async() => {
      await writer.write(`
        <template for="items">
          <li>Item 2</li>
          <li>Item 3</li>
          <?marker name="items">
        </template>`);
    }, 5000);

    setTimeout(async() => {
      await writer.write(`
        <template for="items">
          <li>Item 4</li>
          <?marker name="items">
        </template>`);

      resolve();
    }, 8000);
  })
};

navigation.addEventListener('navigate', event => {
  const url = new URL(event.destination.url);

  if (url.origin !== location.origin || !routes.has(getRoutePath(url))) {
    return;
  }

  event.intercept({
    async handler() {
      await renderRoute(url);
    },
  });
});


renderRoute(new URL(location.href));
