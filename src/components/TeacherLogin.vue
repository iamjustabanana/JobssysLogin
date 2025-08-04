<!-- filepath: src/components/TeacherLogin.vue -->
<template>
  <div class="login-center-wrapper">
    <div class="container bg-white p-5 rounded shadow-sm" style="max-width: 28rem;">
    <h1 class="text-center mb-4 fw-bold">教師登入</h1>
    <p class="text-center text-muted mb-4">請使用您的 LINE 帳號登入以維護個人資料。</p>

    <button id="lineLoginBtn" class="btn btn-success w-100 d-flex align-items-center justify-content-center py-2"
            style="background-color: #06C755; border-color: #06C755;" @click="loginWithLine">
      <svg class="line-icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.707 9.879l-4.243 4.243a.999.999 0 01-1.414 0l-2.121-2.121a.999.999 0 111.414-1.414l1.414 1.414 3.536-3.536a.999.999 0 111.414 1.414z"/>
      </svg>
      使用 LINE 登入
    </button>

      <div id="statusMessage" class="alert mt-4" role="alert" :class="{ 'hidden': !showMessage, 'alert-success': messageType === 'success', 'alert-danger': messageType === 'error', 'alert-info': messageType === 'info' }">
        {{ statusMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'TeacherLogin',
  setup() {
    const statusMessage = ref('');
    const showMessage = ref(false);
    const messageType = ref('');

    // 從 window.ENV 獲取當前環境的配置
    // 取得環境變數（Vite）
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '10.0.4.39';
    const LIFF_ID = import.meta.env.VITE_LIFF_ID;
    const LINE_REDIRECT_URI = isDev ? import.meta.env.VITE_LINE_REDIRECT_URI_DEV : import.meta.env.VITE_LINE_REDIRECT_URI_PROD;
    const BACKEND_CALLBACK_URL = isDev ? import.meta.env.VITE_BACKEND_CALLBACK_URL_DEV : import.meta.env.VITE_BACKEND_CALLBACK_URL_PROD;


    const displayMessage = (message, type) => {
      statusMessage.value = message;
      messageType.value = type;
      showMessage.value = true;
    };

    // 確保 LIFF SDK 載入
    let liffReady = false;
    async function ensureLiffReady() {
      if (window.liff) {
        liffReady = true;
        return;
      }
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
        script.onload = () => { liffReady = true; resolve(); };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    const loginWithLine = async () => {
      await ensureLiffReady();
      console.log('[LINE Login] redirectUri:', LINE_REDIRECT_URI);
      if (window.liff && liffReady) {
        try {
          window.liff.login({ redirectUri: LINE_REDIRECT_URI });
        } catch (e) {
          displayMessage('LINE 登入觸發失敗: ' + e.message, 'error');
        }
      } else {
        displayMessage('LIFF SDK 載入失敗，請稍後再試。', 'error');
      }
    };

    onMounted(async () => {
      await ensureLiffReady();
      console.log('[LIFF] LIFF_ID:',LIFF_ID);
      if (window.liff && liffReady) {
        console.log('[LIFF] liff.init liffId:',LIFF_ID);
        window.liff.init({ liffId: LIFF_ID })
          .then(() => {
            console.log('teacherLogin.vue: LIFF initialized successfully.');
            if (window.liff.isLoggedIn()) {
              window.location.href = '/teacherDashboard.html';
            } else {
              displayMessage('請點擊按鈕使用 LINE 登入', 'info');
            }
          })
          .catch((err) => {
            console.error('teacherLogin.vue: LIFF 初始化失敗', err);
            displayMessage(`LIFF 初始化失敗: ${err.message}`, 'error');
          });
      } else {
        displayMessage('LIFF SDK 載入失敗，請稍後再試。', 'error');
      }
    });

    return {
      statusMessage,
      showMessage,
      messageType,
      loginWithLine
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');

.login-center-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  font-family: 'Inter', sans-serif;
}
.login-center-wrapper {
  min-height: 100vh;
  min-width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  font-family: 'Inter', sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
}
.line-icon {
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 0.75rem;
}
.hidden {
  display: none;
}
</style>