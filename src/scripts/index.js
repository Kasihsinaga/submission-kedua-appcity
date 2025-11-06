import '../styles/styles.css';
import App from './pages/app';
import mapLogo from '../public/images/map.png';
import { registerServiceWorker } from './utils';
import { registerServiceWorker as registerHelperSW } from './utils'; 

let deferredPrompt = null;

document.addEventListener('DOMContentLoaded', async () => {
  const logo = document.querySelector('.logo');
  if (logo) logo.src = mapLogo;

  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  // page transition helper
  const transition = async () => {
    const mainContent = document.querySelector('#main-content');
    if (mainContent) {
      mainContent.classList.remove('fade-in');
      mainContent.classList.add('fade-out');
      await new Promise((r) => setTimeout(r, 400));
    }

    await app.renderPage();

    if (mainContent) {
      mainContent.classList.remove('fade-out');
      mainContent.classList.add('fade-in');
    }
  };

  // default to login
  if (window.location.hash === '' || window.location.hash === '#/') {
    window.location.hash = '#/login';
  }

  // register service worker 
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered at /sw.js');
    } catch (err) {
      console.warn('Service worker register failed', err);
    }
  }

  // handle beforeinstallprompt for PWA
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    if (!document.getElementById('install-btn')) {
      const installBtn = document.createElement('button');
      installBtn.id = 'install-btn';
      installBtn.textContent = 'Install App';
      installBtn.className = 'add-report-btn';
      installBtn.style.position = 'fixed';
      installBtn.style.right = '18px';
      installBtn.style.bottom = '18px';
      document.body.appendChild(installBtn);

      installBtn.addEventListener('click', async () => {
        installBtn.remove();
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        deferredPrompt = null;
        console.log('User choice for install:', choice.outcome);
      });
    }
  });

  await transition();

  window.addEventListener('hashchange', transition);

  try {
    if (typeof registerServiceWorker === 'function') {
      await registerServiceWorker();
    }
  } catch (e) {
  }

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});