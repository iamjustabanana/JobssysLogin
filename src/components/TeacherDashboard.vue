<template>
  <div class="dashboard-container">
    <h1 class="mb-4">教師功能面板</h1>
    <div :class="['status', statusClass]">{{ statusMessage }}</div>
    <div class="row g-4 justify-content-center">
      <div class="col-12 col-md-8 mb-3">
        <button class="btn btn-primary w-100 py-3" @click="goToProfile">
          <i class="bi bi-person-circle"></i> 教師資料
        </button>
      </div>
      <div class="col-12 col-md-8 mb-3">
        <button class="btn btn-info w-100 py-3 text-white" @click="goToTrialApplication">
          <i class="bi bi-calendar-check"></i> 教師試聽申請
        </button>
      </div>
      <div class="col-12 col-md-8 mb-3">
        <button class="btn btn-warning w-100 py-3" @click="goToAttendance">
          <i class="bi bi-clipboard-check"></i> 教師點名
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
const statusMessage = ref('');
const statusClass = ref('');
const router = useRouter();

const isDev = window.location.hostname === 'localhost' || window.location.hostname === '10.0.4.39';
const API_URL = isDev ? import.meta.env.VITE_API_URL_DEV : import.meta.env.VITE_API_URL_PROD;
const LINE_REDIRECT_URI = isDev ? import.meta.env.VITE_LINE_REDIRECT_URI_DEV : import.meta.env.VITE_LINE_REDIRECT_URI_PROD;
const BACKEND_CALLBACK_URL = isDev ? import.meta.env.VITE_BACKEND_CALLBACK_URL_DEV : import.meta.env.VITE_BACKEND_CALLBACK_URL_PROD;

function saveTeacherInfoToLocalStorage(teacherRecord, token) {
  localStorage.setItem('teacherInfo', JSON.stringify({ ...teacherRecord, token }));
}

async function sendLineCodeToBackend(code, lineUserId) {
  try {
    statusMessage.value = '正在驗證 LINE 登入資訊並獲取教師資料...';
    const response = await fetch(BACKEND_CALLBACK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirect_uri: LINE_REDIRECT_URI, lineId: lineUserId })
    });
    const data = await response.json();
    if (response.ok && data.teacherRecord && data.token) {
      saveTeacherInfoToLocalStorage(data.teacherRecord, data.token);
      statusMessage.value = 'LINE 登入成功！歡迎您！';
    } else {
      statusMessage.value = `LINE 登入處理失敗: ${data.error || '未知錯誤'}，請重新登入或綁定資料。`;
    }
  } catch (error) {
    statusMessage.value = `與後端通訊失敗: ${error.message}，請重新登入。`;
  } finally {
    history.replaceState({}, document.title, window.location.pathname);
  }
}

onMounted(async () => {
  // 檢查 URL 是否有 code
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  if (code) {
    // 取得 lineId（可用 LIFF SDK 或 localStorage）
    let lineUserId = '';
    try {
      // 動態載入 LIFF SDK
      if (!window.liff) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      if (window.liff) {
        await window.liff.init({ liffId: import.meta.env.VITE_LIFF_ID });
        if (window.liff.isLoggedIn()) {
          const profile = await window.liff.getProfile();
          lineUserId = profile.userId;
        }
      }
    } catch (err) {
      // 無法取得 lineId 可略過，後端可用 code 換取
    }
    await sendLineCodeToBackend(code, lineUserId);
  }
});

function goToProfile() {
  router.push('/teacherprofile');
}
function goToTrialApplication() {
  router.push('/teachertrialapplication');
}
function goToAttendance() {
  router.push('/teacherattendance');
}
</script>

<style scoped>
.dashboard-container {
  font-family: Arial, sans-serif;
  text-align: center;
  margin-top: 50px;
}
.profile {
  margin-bottom: 20px;
}
.profile img {
  border-radius: 50%;
  width: 100px;
  height: 100px;
}
.loading {
  color: gray;
}
.error {
  color: red;
}
</style>