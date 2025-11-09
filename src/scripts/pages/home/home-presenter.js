import Swal from 'sweetalert2';
import { subscribeForPush, unsubscribeFromPush, requestNotificationPermission } from '../../utils/notification-helper';
import { addFavorite, getAllFavorites, deleteFavorite } from '../../data/db';
import * as Api from '../../data/api';
import * as AuthModel from '../../utils/auth';

export default class HomePresenter {
  #view;
  #model;
  #authModel;
  #utils;
<<<<<<< HEAD
  #allStories = []; 
  #map = null;
  #favoriteStoryIds = new Set(); 
=======
  #allStories = [];
  #map = null;
  #favoriteStoryIds = new Set();
>>>>>>> d79ece6 (Simpan Perubahan)

  constructor({ view, model, authModel, utils }) {
    this.#view = view;
    this.#model = model;
    this.#authModel = authModel;
    this.#utils = utils;
  }

  async init() {
    const token = this.#authModel.getAccessToken();
    if (!token) {
<<<<<<< HEAD
      
      
=======


>>>>>>> d79ece6 (Simpan Perubahan)
    }

    this.#view.showLogoutButton(true);
    this.#addSubscribeButton(); // Tombol toggle notifikasi

    this.#map = this.#view.renderMap();
    this.#view.renderCityMarkers(this.#map);
    this.#view.renderClickPopup(this.#map);

<<<<<<< HEAD
    
=======

>>>>>>> d79ece6 (Simpan Perubahan)
    await this.#loadFavoriteIds();

    await this.#loadStories(this.#map);
    this.#loadLocalReports(this.#map);

    this.#setupDetailNavigation();
<<<<<<< HEAD
    this.#setupSearchListener(); 

    
=======
    this.#setupSearchListener();


>>>>>>> d79ece6 (Simpan Perubahan)
    this.#view.setupLikeButtonListener(this.#handleLikeToggle.bind(this));
  }

  async #loadFavoriteIds() {
    try {
      const favorites = await getAllFavorites();
      this.#favoriteStoryIds = new Set(favorites.map(story => story.id));
    } catch (e) {
      console.error('Gagal memuat favorit dari IDB', e);
      this.#favoriteStoryIds = new Set();
    }
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


      // Kirim ID favorit ke view saat merender
<<<<<<< HEAD
      this.#view.renderStories(map, this.#allStories, this.#favoriteStoryIds); 
=======
      this.#view.renderStories(map, this.#allStories, this.#favoriteStoryIds);
>>>>>>> d79ece6 (Simpan Perubahan)
      this.#view.setupNavigation();

      // notifikasi push untuk pengguna yang subscribe
      this.#showPushNotification('Berhasil memuat berita terbaru!');
    } catch (error) {
      console.error('Gagal memuat data API:', error);
      try {
<<<<<<< HEAD
        
        const cached = await getAllFavorites(); 
        if (cached && cached.length) {
          this.#allStories = cached;
          this.#favoriteStoryIds = new Set(cached.map(story => story.id)); 
          
          
          this.#view.renderStories(map, this.#allStories, this.#favoriteStoryIds); 
=======

        const cached = await getAllFavorites();
        if (cached && cached.length) {
          this.#allStories = cached;
          this.#favoriteStoryIds = new Set(cached.map(story => story.id));


          this.#view.renderStories(map, this.#allStories, this.#favoriteStoryIds);
>>>>>>> d79ece6 (Simpan Perubahan)
        }
      } catch (e) {
        console.error('Gagal memuat data dari IDB', e);
      }
    }
  }

  // Fungsi baru untuk menangani Like/Unlike
  async #handleLikeToggle(id) {
    const story = this.#allStories.find((s) => s.id === id);
    if (!story) {
      console.error('Story tidak ditemukan:', id);
<<<<<<< HEAD
      return false; 
=======
      return false;
>>>>>>> d79ece6 (Simpan Perubahan)
    }

    const isCurrentlyLiked = this.#favoriteStoryIds.has(id);

    try {
      if (isCurrentlyLiked) {
        // Proses Unlike
        await deleteFavorite(id);
        this.#favoriteStoryIds.delete(id);
<<<<<<< HEAD
        return false; 
=======
        return false;
>>>>>>> d79ece6 (Simpan Perubahan)
      } else {
        // Proses Like
        await addFavorite(story);
        this.#favoriteStoryIds.add(id);
<<<<<<< HEAD
        return true; 
=======
        return true;
>>>>>>> d79ece6 (Simpan Perubahan)
      }
    } catch (err) {
      console.error('Gagal memproses like/unlike:', err);
      Swal.fire('Error', 'Gagal menyimpan favorit, coba lagi.', 'error');
<<<<<<< HEAD
      return isCurrentlyLiked; 
=======
      return isCurrentlyLiked;
>>>>>>> d79ece6 (Simpan Perubahan)
    }
  }

  async #loadLocalReports(map) {
    const reportsLS = JSON.parse(localStorage.getItem('reports')) || [];
    if (reportsLS.length) {
      this.#view.renderLocalReports(map, reportsLS);
    }
<<<<<<< HEAD
    
=======

>>>>>>> d79ece6 (Simpan Perubahan)
  }

  handleLogout() {
    this.#authModel.removeAccessToken();
    setTimeout(() => {
<<<<<<< HEAD
      window.location.replace('#/login');
=======
      window.location.hash = '#/login';
>>>>>>> d79ece6 (Simpan Perubahan)
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

<<<<<<< HEAD
  
async #handleSubscribeToggle(button) {
  
  button.disabled = true;
  button.innerHTML = `<i class="loader-button"></i> Memproses...`;

  try {
    const token = this.#authModel.getAccessToken();
    if (!token) {
=======

  async #handleSubscribeToggle(button) {

    button.disabled = true;
    button.innerHTML = `<i class="loader-button"></i> Memproses...`;

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
        await unsubscribeFromPush(); //
        subscribedUsers = subscribedUsers.filter((t) => t !== token);
        localStorage.setItem('subscribedUsers', JSON.stringify(subscribedUsers));

        Swal.fire({
          icon: 'info',
          title: 'Berhenti Berlangganan',
          text: 'Kamu tidak akan menerima notifikasi terbaru lagi.',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // Subscribe flow
        const granted = await requestNotificationPermission(); //
        if (!granted) {
          return;
        }

        const subscription = await subscribeForPush(); //
        if (subscription) {
          subscribedUsers.push(token);
          localStorage.setItem('subscribedUsers', JSON.stringify(subscribedUsers));

        }
      }
    } catch (error) {
      console.error('Gagal toggle subscribe:', error);
>>>>>>> d79ece6 (Simpan Perubahan)
      Swal.fire({
        icon: 'warning',
        title: 'Login Diperlukan',
        text: 'Anda harus login untuk berlangganan berita.',
      });
<<<<<<< HEAD
      return; 
    }

    let subscribedUsers = JSON.parse(localStorage.getItem('subscribedUsers')) || [];
    const isSubscribed = subscribedUsers.includes(token);

    if (isSubscribed) {
      // Unsubscribe flow
      await unsubscribeFromPush(); //
      subscribedUsers = subscribedUsers.filter((t) => t !== token);
      localStorage.setItem('subscribedUsers', JSON.stringify(subscribedUsers));

      Swal.fire({
        icon: 'info',
        title: 'Berhenti Berlangganan',
        text: 'Kamu tidak akan menerima notifikasi terbaru lagi.',
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      // Subscribe flow
      const granted = await requestNotificationPermission(); //
      if (!granted) {
        return; 
      }

      const subscription = await subscribeForPush(); //
      if (subscription) {
        subscribedUsers.push(token);
        localStorage.setItem('subscribedUsers', JSON.stringify(subscribedUsers));

      }
    }
  } catch (error) {
    console.error('Gagal toggle subscribe:', error);
    Swal.fire({
      icon: 'error',
      title: 'Terjadi Kesalahan',
      text: 'Gagal mengubah status berlangganan.',
    });
  } finally {

    button.disabled = false;
    

    const token = this.#authModel.getAccessToken();
    const subscribedUsers = JSON.parse(localStorage.getItem('subscribedUsers')) || [];
    const isSubscribed = token && subscribedUsers.includes(token);

    if (isSubscribed) {
      button.textContent = 'Unsubscribe';
      button.style.backgroundColor = '#dc3545';
    } else {
      button.textContent = 'Subscribe';
      button.style.backgroundColor = '#28a745';
=======
    } finally {

      button.disabled = false;


      const token = this.#authModel.getAccessToken();
      const subscribedUsers = JSON.parse(localStorage.getItem('subscribedUsers')) || [];
      const isSubscribed = token && subscribedUsers.includes(token);

      if (isSubscribed) {
        button.textContent = 'Unsubscribe';
        button.style.backgroundColor = '#dc3545';
      } else {
        button.textContent = 'Subscribe';
        button.style.backgroundColor = '#28a745';
      }
>>>>>>> d79ece6 (Simpan Perubahan)
    }
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
          icon: '/images/map.png',
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
<<<<<<< HEAD
      
      const detailButton = e.target.closest('.btn-detail'); 
=======

      const detailButton = e.target.closest('.btn-detail');
>>>>>>> d79ece6 (Simpan Perubahan)
      if (detailButton) {
        const id = detailButton.dataset.id;
        if (!id) return;

        if (document.startViewTransition) {
          document.startViewTransition(() => {
<<<<<<< HEAD
            window.location.href = `#/reports/${id}`;
          });
        } else {
          window.location.href = `#/reports/${id}`;
=======
            window.location.href = `#/reports/${id}`; 
          });
        } else {
          window.location.href = `#/reports/${id}`; 
>>>>>>> d79ece6 (Simpan Perubahan)
        }
      }
    });
  }

  // ==================================================
  // 🔍 FITUR: SEARCH 
  // ==================================================

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