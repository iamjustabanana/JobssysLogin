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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const statusMessage = ref('');
const statusClass = ref('');
const router = useRouter();

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