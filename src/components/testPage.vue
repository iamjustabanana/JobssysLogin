<template>
  <div class="dashboard-container">
    <h1>測試頁面</h1>
    <div :class="['status', statusClass]">{{ statusMessage }}</div>
    <div v-if="showProfile" id="profile-area">
      <div class="profile">
        <img :src="userPicture" alt="大頭貼" />
        <h2>{{ userName }}</h2>
      </div>
      <p>恭喜！您成功從教師儀表板跳轉到此頁面，且登入狀態仍被保留。</p>
      <button @click="closeWindow">關閉視窗</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import liff from '@line/liff';

const liffId = '2007768647-wdEl9d4G';

const statusMessage = ref('正在初始化 LIFF...');
const statusClass = ref('loading');
const showProfile = ref(false);
const userPicture = ref('');
const userName = ref('');

const closeWindow = () => {
  liff.closeWindow();
};

onMounted(async () => {
  try {
    await liff.init({ liffId });
    statusMessage.value = 'LIFF 初始化成功。';
    statusClass.value = 'loading';
    if (!liff.isLoggedIn()) {
      statusMessage.value = '尚未登入，請返回上一頁。';
    } else {
      const profile = await liff.getProfile();
      userPicture.value = profile.pictureUrl;
      userName.value = profile.displayName;
      statusMessage.value = '';
      showProfile.value = true;
    }
  } catch (err) {
    console.error('LIFF 初始化失敗', err);
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
