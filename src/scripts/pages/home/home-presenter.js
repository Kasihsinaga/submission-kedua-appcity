import Swal from 'sweetalert2';
import { subscribeForPush, unsubscribeFromPush, requestNotificationPermission } from '../../utils/notification-helper';
import { addReport, getAllReports } from '../../data/db';
import * as Api from '../../data/api';
import * as AuthModel from '../../utils/auth';

export default class HomePresenter {
  #view;
  #model;
  #authModel;
  #utils;
  #allStories = []; 
  #map = null; 

  constructor({ view, model, authModel, utils }) {
    this.#view = view;
    this.#model = model;
    this.#authModel = authModel;
    this.#utils = utils;
  }

  async init() {
    const token = this.#authModel.getAccessToken();
    if (!token) {
      this.#view.showAuthError();
      this.#view.showLogoutButton(false);
      return;
    }

    this.#view.showLogoutButton(true);
    this.#addSubscribeButton(); // Tombol toggle notifikasi

    this.#map = this.#view.renderMap(); 
    this.#view.renderCityMarkers(this.#map);
    this.#view.renderClickPopup(this.#map);

    await this.#loadStories(this.#map);
    this.#loadLocalReports(this.#map);

    this.#setupDetailNavigation();
    this.#setupSearchListener(); 
  }

  async #loadStories(map) {
    try {
      const result = await this.#model.getStories();
      let stories = [];

      if (Array.isArray(result)) {
        stories = result;
      } else if (result && result.listStory) {
        stories = result.listStory;
      }

      this.#allStories = stories; 

      // save to IDB for offline access
      if (stories && stories.length) {
        for (const s of stories) {
          try { await addReport(s); } catch (e) { /* ignore */ }
        }
      }

      this.#view.renderStories(map, this.#allStories); 
      this.#view.setupNavigation();

      // notifikasi push untuk pengguna yang subscribe
      this.#showPushNotification('Berhasil memuat berita terbaru!');
    } catch (error) {
      console.error('Gagal memuat data API:', error);
      try {
        const cached = await getAllReports();
        if (cached && cached.length) {
          this.#allStories = cached; 
          this.#view.renderStories(map, this.#allStories);
        }
      } catch (e) {
        console.error('Gagal memuat data dari IDB', e);
      }
    }
  }

  async #loadLocalReports(map) {
    const reportsLS = JSON.parse(localStorage.getItem('reports')) || [];
    if (reportsLS.length) {
      this.#view.renderLocalReports(map, reportsLS);
    }

    try {
      const cached = await getAllReports();
      if (cached && cached.length) {
      }
    } catch (e) {
      console.error('Gagal ambil cached reports', e);
    }
  }

  handleLogout() {
    this.#authModel.removeAccessToken();
    setTimeout(() => {
      window.location.replace('/#/login');
    }, 0);
  }

  formatDate(dateString) {
    return this.#utils.showFormattedDate(dateString);
  }

  // ==================================================
  // 🔔 FITUR: SUBSCRIBE TOGGLE PUSH NOTIFICATION
  // ==================================================
  #addSubscribeButton() {
    const navList = document.getElementById('nav-list');
    if (!navList) return;

    const oldButton = document.getElementById('subscribe-button');
    if (oldButton) oldButton.remove();

    const token = this.#authModel.getAccessToken();
    const subscribedUsers = JSON.parse(localStorage.getItem('subscribedUsers')) || [];
    const isSubscribed = token && subscribedUsers.includes(token);

    const subscribeButton = document.createElement('button');
    subscribeButton.id = 'subscribe-button';
    subscribeButton.textContent = isSubscribed ? 'Unsubscribe' : 'Subscribe';
    subscribeButton.style.cssText = `
      padding: 6px 10px;
      border: none;
      background-color: ${isSubscribed ? '#dc3545' : '#28a745'};
      color: white;
      border-radius: 4px;
      cursor: pointer;
      margin-left: 8px;
      transition: background-color 0.3s ease;
    `;

    navList.appendChild(subscribeButton);

    subscribeButton.addEventListener('click', () =>
      this.#handleSubscribeToggle(subscribeButton)
    );
  }

  async #handleSubscribeToggle(button) {
    try {
      const token = this.#authModel.getAccessToken();
      if (!token) {
        Swal.fire({
          icon: 'warning',
          title: 'Login Diperlukan',
          text: 'Anda harus login untuk berlangganan berita.',
        });
        return;
      }

      let subscribedUsers = JSON.parse(localStorage.getItem('subscribedUsers')) || [];
      const isSubscribed = subscribedUsers.includes(token);

      if (isSubscribed) {
        // Unsubscribe flow
        await unsubscribeFromPush();
        subscribedUsers = subscribedUsers.filter((t) => t !== token);
        localStorage.setItem('subscribedUsers', JSON.stringify(subscribedUsers));
        button.textContent = 'Subscribe';
        button.style.backgroundColor = '#28a745';

        Swal.fire({
          icon: 'info',
          title: 'Berhenti Berlangganan',
          text: 'Kamu tidak akan menerima notifikasi terbaru lagi.',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // Subscribe flow
        const granted = await requestNotificationPermission();
        if (!granted) {
          return;
        }

        const subscription = await subscribeForPush();
        if (subscription) {
          subscribedUsers.push(token);
          localStorage.setItem('subscribedUsers', JSON.stringify(subscribedUsers));
          button.textContent = 'Unsubscribe';
          button.style.backgroundColor = '#dc3545';
        }
      }
    } catch (error) {
      console.error('Gagal toggle subscribe:', error);
      Swal.fire({
        icon: 'error',
        title: 'Terjadi Kesalahan',
        text: 'Gagal mengubah status berlangganan.',
      });
    }
  }

  #showPushNotification(message) {
    const token = this.#authModel.getAccessToken();
    const subscribedUsers = JSON.parse(localStorage.getItem('subscribedUsers')) || [];
    const isSubscribed = token && subscribedUsers.includes(token);

    if (isSubscribed && Notification.permission === 'granted') {
      try {
        new Notification('Digitalisasi Berita Acara', {
          body: message,
          icon: '/icons/icon-192x192.png',
        });
      } catch (e) {
        console.warn('Notification failed', e);
      }
    }
  }

  // ==================================================
  // 🧭 FITUR: NAVIGASI KE HALAMAN DETAIL LAPORAN
  // ==================================================
  #setupDetailNavigation() {
    document.addEventListener('click', (e) => {
      const detailButton = e.target.closest('[data-report-id], .btn-detail, [data-id], [data-report]');
      if (detailButton) {
        const id = detailButton.dataset.reportId || detailButton.dataset.id || detailButton.getAttribute('data-report');
        if (!id) return;
        window.location.href = `/#/reports/${id}`;
      }
    });
  }

  // ==================================================
  // 🔍 FITUR: SEARCH 
  // ==================================================
  
  /**
   * Menambahkan event listener ke search bar
   */
  #setupSearchListener() {
    const searchBar = document.getElementById('searchBar');
    if (!searchBar) return;

    searchBar.addEventListener('input', (e) => {
      this.#handleSearch(e.target.value);
    });
  }

  #handleSearch(term) {
    const lowerCaseTerm = term.toLowerCase().trim();
    
    if (!lowerCaseTerm) {
      this.#view.renderStories(this.#map, this.#allStories);
      return;
    }
    
    // Filter data berdasarkan nama atau deskripsi
    const filteredStories = this.#allStories.filter((story) => {
      const name = story.name || '';
      const description = story.description || '';
      
      return (
        name.toLowerCase().includes(lowerCaseTerm) ||
        description.toLowerCase().includes(lowerCaseTerm)
      );
    });

    // Render ulang daftar laporan dengan data yang sudah difilter
    this.#view.renderStories(this.#map, filteredStories);
  }
}