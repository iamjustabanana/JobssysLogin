<template>
  <div class="dashboard-container">
    <h1>教師儀表板</h1>
    <div :class="['status', statusClass]">{{ statusMessage }}</div>
    <div v-if="showProfile" id="profile-area">
      <div class="profile">
        <img :src="userPicture" alt="大頭貼" />
        <h2>{{ userName }}</h2>
      </div>
      <p>您已成功登入 LIFF 應用程式。</p>
      <hr />
      <p>此連結會測試在 LIFF 應用程式內跳轉到另一頁面後，是否仍能記得您的登入狀態。</p>
      <button @click="goToTestPage">前往測試頁面</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import liff from '@line/liff';

const liffId = '2007768647-wdEl9d4G'; // 你的 LIFF ID

const statusMessage = ref('正在初始化 LIFF...');
const statusClass = ref('loading');
const showProfile = ref(false);
const userPicture = ref('');
const userName = ref('');

const goToTestPage = () => {
  liff.openWindow({
    url: './testPage.html',
    external: false
  });
};

onMounted(async () => {
  try {
    await liff.init({ liffId });
    statusMessage.value = 'LIFF 初始化成功。';
    statusClass.value = 'loading';
    console.log('liff.isLoggedIn()', liff.isLoggedIn());
    console.log('liff.getAccessToken()', liff.getAccessToken());
    if (!liff.isLoggedIn()) {
      statusMessage.value = '尚未登入，正在重新導向至登入頁面...';
      liff.login();
    } else {
      const profile = await liff.getProfile();
      userPicture.value = profile.pictureUrl;
      userName.value = `歡迎，${profile.displayName}`;
      statusMessage.value = '';
      showProfile.value = true;
    }
  } catch (err) {
    console.error('LIFF 初始化或登入失敗', err);
    statusClass.value = 'error';
    statusMessage.value = `LIFF 發生錯誤：${err.message}`;
  } 
});
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