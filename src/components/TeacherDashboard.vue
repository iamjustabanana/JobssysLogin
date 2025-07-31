<template>
  <div class="container mt-5">
    <h1 class="text-center mb-4">教師功能面板</h1>
    <div id="statusMessage" class="alert mt-4 hidden" role="alert"></div>
    <p class="text-center text-muted">歡迎您，<span id="teacherNameDisplay" class="fw-bold"></span>！</p>
    <p class="text-center text-muted">您的 LINE ID: <span id="lineIdDisplay"></span></p>

    <div class="row mt-4">
      <div class="col-md-6 mb-3">
        <a href="/teacherProfile.html" class="btn btn-primary w-100 py-3">
          <i class="bi bi-person-circle"></i> 維護個人資料
        </a>
      </div>
      <div class="col-md-6 mb-3">
        <a href="#" class="btn btn-info w-100 py-3 text-white">
          <i class="bi bi-book"></i> 管理課程
        </a>
      </div>
      <div class="col-md-6 mb-3">
        <a href="#" class="btn btn-warning w-100 py-3">
          <i class="bi bi-calendar-check"></i> 查看試聽申請
        </a>
      </div>
      <div class="col-md-6 mb-3">
        <button id="logoutBtn" class="btn btn-danger w-100 py-3">
          <i class="bi bi-box-arrow-right"></i> 登出
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import liff from '@line/liff';

export default {
  name: 'TeacherDashboard',
  mounted() {
    // 直接用 Vite 變數取得環境設定
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '10.0.4.39';
    const envConfig = {
      API_URL: isDev ? import.meta.env.VITE_API_URL_DEV : import.meta.env.VITE_API_URL_PROD,
      LINE_REDIRECT_URI: isDev ? import.meta.env.VITE_LINE_REDIRECT_URI_DEV : import.meta.env.VITE_LINE_REDIRECT_URI_PROD,
      BACKEND_CALLBACK_URL: isDev ? import.meta.env.VITE_BACKEND_CALLBACK_URL_DEV : import.meta.env.VITE_BACKEND_CALLBACK_URL_PROD,
      LINE_CHANNEL_ID: import.meta.env.VITE_LINE_CHANNEL_ID,
      LIFF_ID: import.meta.env.VITE_LIFF_ID
    };
    this.initializeDashboard(envConfig);
  },
  methods: {
    initializeDashboard(envConfig) {
      const LIFF_ID = envConfig.LIFF_ID;
      const API_URL = envConfig.API_URL;
      const BACKEND_CALLBACK_URL = envConfig.BACKEND_CALLBACK_URL;

      const teacherNameDisplay = $('#teacherNameDisplay');
      const lineIdDisplay = $('#lineIdDisplay');
      const statusMessageDiv = $('#statusMessage');
      const logoutBtn = $('#logoutBtn');

      function displayMessage(message, type) {
        statusMessageDiv.text(message);
        statusMessageDiv.removeClass('hidden alert-success alert-danger alert-info');
        if (type === 'success') {
          statusMessageDiv.addClass('alert-success');
        } else if (type === 'error') {
          statusMessageDiv.addClass('alert-danger');
        } else if (type === 'info') {
          statusMessageDiv.addClass('alert-info');
        }
        statusMessageDiv.show();
      }

      function saveTeacherInfoToLocalStorage(teacherRecord, token) {
        console.log('Dashboard: Saving teacherInfo to localStorage:', { ...teacherRecord, token });
        localStorage.setItem('teacherInfo', JSON.stringify({ ...teacherRecord, token }));
      }

      function loadTeacherInfoFromLocalStorage() {
        const teacherInfo = JSON.parse(localStorage.getItem('teacherInfo'));
        const jwtToken = teacherInfo ? teacherInfo.token : null;
        console.log('Dashboard: Loading teacherInfo from localStorage:', teacherInfo);
        console.log('Dashboard: Extracted jwtToken from teacherInfo:', jwtToken);

        if (teacherInfo && teacherInfo.id && teacherInfo.name && teacherInfo.lineId && jwtToken) {
          displayTeacherInfo(teacherInfo);
          displayMessage('歡迎回到教師功能面板！', 'success');
        } else {
          displayMessage('無法獲取教師身份資訊，請重新登入。', 'error');
          console.error('Dashboard: Missing teacherInfo or jwtToken in localStorage. Redirecting to login.');
          setTimeout(() => {
            window.location.href = '/teacherLogin.html';
          }, 60000);
        }
      }

      function displayTeacherInfo(teacher) {
        teacherNameDisplay.text(teacher.name);
        lineIdDisplay.text(teacher.lineId);
      }

      liff.init({ liffId: LIFF_ID })
        .then(() => {
          console.log('Dashboard: LIFF initialized successfully.');
          console.log('Dashboard: liff.isLoggedIn() =', liff.isLoggedIn());

          if (!liff.isLoggedIn()) {
            displayMessage('您尚未登入，正在跳轉至登入頁面...', 'info');
            setTimeout(() => {
              window.location.href = '/teacherLogin.html';
            }, 60000);
            return;
          }

          return liff.getProfile();
        })
        .then(profile => {
          console.log('Dashboard: LIFF profile obtained:', profile);
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get('code');

          if (code) {
            console.log('Dashboard: Code found in URL. Calling sendLineCodeToBackend.');
            displayMessage('正在驗證 LINE 登入資訊並獲取教師資料...', 'info');
            this.sendLineCodeToBackend(code, profile.userId, envConfig, displayMessage, saveTeacherInfoToLocalStorage, displayTeacherInfo); // Pass necessary variables
          } else {
            console.log('Dashboard: No code in URL. Loading teacher info from localStorage.');
            loadTeacherInfoFromLocalStorage();
          }
        })
        .catch(err => {
          console.error('Dashboard: LIFF 錯誤:', err);
          displayMessage(`LIFF 初始化失敗: ${err.message}，請重新登入。`, 'error');
          setTimeout(() => {
            window.location.href = '/teacherLogin.html';
          }, 60000);
        });

      logoutBtn.on('click', () => {
        console.log('Dashboard: Logout button clicked.');
        localStorage.removeItem('teacherInfo');
        localStorage.removeItem('jwtToken');
        if (liff.isLoggedIn()) {
          liff.logout();
        }
        displayMessage('已登出，正在跳轉至登入頁面...', 'info');
        setTimeout(() => {
          window.location.href = '/teacherLogin.html';
        }, 60000);
      });
    },
    async sendLineCodeToBackend(code, lineUserId, envConfig, displayMessage, saveTeacherInfoToLocalStorage, displayTeacherInfo) {
      try {
        console.log('Dashboard: Sending code to backend callback...');
        console.log('Dashboard: Backend URL:', envConfig.BACKEND_CALLBACK_URL);
        console.log('Dashboard: Request body for backend callback:', JSON.stringify({ code: code, redirect_uri: envConfig.LINE_REDIRECT_URI, lineId: lineUserId }));

        const response = await fetch(envConfig.BACKEND_CALLBACK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: code, redirect_uri: envConfig.LINE_REDIRECT_URI, lineId: lineUserId }),
        });

        console.log('Dashboard: Backend callback raw response status:', response.status);
        console.log('Dashboard: Backend callback raw response ok:', response.ok);

        const data = await response.json();
        console.log('Dashboard: Backend callback parsed response data:', data);

        if (response.ok && data.teacherRecord && data.token) {
          saveTeacherInfoToLocalStorage(data.teacherRecord, data.token);
          displayTeacherInfo(data.teacherRecord);
          displayMessage('LINE 登入成功！歡迎您！', 'success');
        } else {
          displayMessage(`LINE 登入處理失敗: ${data.error || '未知錯誤'}，請重新登入或綁定資料。`, 'error');
          console.error('Dashboard: Backend callback failed or missing data. Redirecting to profile for binding.');
          setTimeout(() => {
            window.location.href = '/teacherProfile.html';
          }, 60000);
        }
      } catch (error) {
        displayMessage(`與後端通訊失敗: ${error.message}，請重新登入。`, 'error');
        console.error('Dashboard: Error in sendLineCodeToBackend:', error);
        setTimeout(() => {
          window.location.href = '/teacherLogin.html';
        }, 60000);
      } finally {
        history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }
}
</script>

<style scoped>
@import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
@import 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css';

body {
  font-family: 'Inter', sans-serif;
  background-color: #f0f2f5;
  padding-top: 20px;
  padding-bottom: 20px;
}
.container {
  background-color: #ffffff;
  padding: 2.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
.message {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  word-break: break-all;
}
.message.success {
  background-color: #d1fae5;
  color: #065f46;
}
.message.error {
  background-color: #fee2e2;
  color: #991b1b;
}
.message.info {
  background-color: #e0f2fe;
  color: #0c4a6e;
}
.hidden {
  display: none;
}
</style>