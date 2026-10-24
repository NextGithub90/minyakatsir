import fs from 'node:fs';

const port = 9223;
const pages = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
const page = pages.find((entry) => entry.type === 'page');
if (!page) throw new Error('No Chrome page target found.');

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let nextId = 1;
const pending = new Map();
const browserErrors = [];
const networkFailures = [];

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') browserErrors.push(message.params.exceptionDetails.text);
  if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') browserErrors.push(message.params.entry.text);
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) {
    networkFailures.push({ status: message.params.response.status, url: message.params.response.url });
  }
});

const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value;

await send('Page.enable');
await send('Runtime.enable');
await send('Log.enable');
await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });

async function setViewport(width, height, mobile = false) {
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
    screenWidth: width,
    screenHeight: height
  });
}

async function loadPage() {
  await send('Page.navigate', { url: 'http://127.0.0.1:4173' });
  await wait(2200);
  await evaluate('document.fonts.ready.then(() => true)');
  await wait(400);
}

async function capture(name, width, height, fullPage) {
  if (fullPage) await evaluate(`(() => {
    document.querySelectorAll('.reveal').forEach((element) => {
      element.classList.add('visible');
      element.style.transition = 'none';
      element.style.opacity = '1';
      element.style.transform = 'none';
    });
    document.querySelectorAll('img[loading="lazy"]').forEach((image) => image.loading = 'eager');
    return Promise.all([...document.images].map((image) => image.complete
      ? image.decode?.().catch(() => true)
      : new Promise((resolve) => {
          image.addEventListener('load', resolve, { once: true });
          image.addEventListener('error', resolve, { once: true });
        })
    )).then(() => true);
  })()`);
  if (fullPage) await wait(350);
  if (fullPage) {
    await evaluate(`(async () => {
      const location = document.querySelector('#location');
      if (location) {
        location.scrollIntoView({ block: 'center' });
        await new Promise((resolve) => setTimeout(resolve, 3200));
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, 0);
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
      return true;
    })()`);
  }
  const metrics = await evaluate(`({
    innerWidth,
    innerHeight,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    menuVisible: getComputedStyle(document.querySelector('.menu-toggle')).display,
    headerVisible: getComputedStyle(document.querySelector('.site-header')).visibility
  })`);
  const params = { format: 'png', fromSurface: true, captureBeyondViewport: fullPage };
  if (fullPage) params.clip = { x: 0, y: 0, width, height: metrics.scrollHeight, scale: 1 };
  const screenshot = await send('Page.captureScreenshot', params);
  fs.writeFileSync(new URL(`playwright/${name}.png`, import.meta.url), Buffer.from(screenshot.data, 'base64'));
  return metrics;
}

async function captureViewport(name) {
  const screenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  fs.writeFileSync(new URL(`playwright/${name}.png`, import.meta.url), Buffer.from(screenshot.data, 'base64'));
}

await setViewport(1600, 1000, false);
await loadPage();
const desktop = await capture('desktop-cdp-full', 1600, 1000, true);
await evaluate(`document.querySelector('#location').scrollIntoView({ block: 'center' })`);
await wait(3500);
await captureViewport('desktop-cdp-location');
await evaluate(`document.querySelector('#faq').scrollIntoView({ block: 'center' })`);
await wait(350);
await captureViewport('desktop-cdp-faq');
const desktopInteraction = await evaluate(`(async () => {
  const initialProducts = document.querySelectorAll('.product-card').length;
  document.querySelector('#loadMoreProducts').click();
  const productsAfterLoadMore = document.querySelectorAll('.product-card').length;
  document.querySelector('#showAllProducts').click();
  const productsAfterShowAll = document.querySelectorAll('.product-card').length;
  document.querySelector('.search-toggle').click();
  const opened = document.querySelector('.search-panel').classList.contains('open');
  document.querySelector('.search-close').click();
  const faqItems = [...document.querySelectorAll('.faq-item')];
  faqItems[1].querySelector('summary').click();
  await new Promise((resolve) => setTimeout(resolve, 50));
  return {
    initialProducts,
    productsAfterLoadMore,
    productsAfterShowAll,
    searchOpened: opened,
    searchClosed: !document.querySelector('.search-panel').classList.contains('open'),
    faqAccordionExclusive: faqItems[1].open && !faqItems[0].open,
    mapEmbedPresent: Boolean(document.querySelector('.map-frame iframe[src*="google.com/maps"]'))
  };
})()`);

await setViewport(390, 844, true);
await loadPage();
const mobileTop = await capture('mobile-cdp-top', 390, 844, false);
const mobileFull = await capture('mobile-cdp-full', 390, 844, true);
await evaluate(`document.querySelector('#location').scrollIntoView({ block: 'center' })`);
await wait(3500);
await captureViewport('mobile-cdp-location');
await evaluate(`document.querySelector('#faq').scrollIntoView({ block: 'start' })`);
await wait(350);
await captureViewport('mobile-cdp-faq');
const mobileInteraction = await evaluate(`(async () => {
  const productGrid = document.querySelector('#productGrid');
  const initialProducts = productGrid.children.length;
  const initialProductScroll = productGrid.scrollLeft;
  document.querySelector('#loadMoreProducts').click();
  await new Promise((resolve) => setTimeout(resolve, 750));
  const productsAfterLoadMore = productGrid.children.length;
  const productScrollAfterLoadMore = productGrid.scrollLeft;
  document.querySelector('.menu-toggle').click();
  const opened = document.querySelector('.mobile-menu').classList.contains('open');
  document.querySelector('.menu-toggle').click();
  return {
    initialProducts,
    productsAfterLoadMore,
    loadMoreAdvancedCarousel: productScrollAfterLoadMore > initialProductScroll,
    menuOpened: opened,
    menuClosed: !document.querySelector('.mobile-menu').classList.contains('open')
  };
})()`);

console.log(JSON.stringify({ desktop, mobileTop, mobileFull, desktopInteraction, mobileInteraction, browserErrors, networkFailures }, null, 2));
socket.close();
