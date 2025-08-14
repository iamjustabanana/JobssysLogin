<template>
  <div class="container mt-5">
    <h1 class="text-center mb-4">教師資料</h1>
    <div ref="statusMessageDiv" class="alert mt-4 hidden" role="alert">{{ statusMessage }}</div>

    <!-- 姓名查詢區塊 -->
    <div v-show="showSearchSection" class="mb-3 p-3 border rounded bg-light">
      <h5 class="mb-3">依姓名查詢教師資料</h5>
      <div class="input-group">
        <input v-model="teacherNameSearch" type="text" class="form-control" placeholder="請輸入姓名">
        <button @click="searchTeacherByName" class="btn btn-primary">查詢</button>
      </div>
    </div>

    <!-- 教師資料表單 -->
    <form v-show="showTeacherForm" class="mt-4 p-4 border rounded bg-light" @submit.prevent="submitTeacherForm">
      <h5 class="mb-3">教師詳細資料</h5>
      <input type="hidden" v-model="teacherForm.id">
      <input type="hidden" v-model="teacherForm.lineId">
      <div class="mb-3">
        <label for="name" class="form-label">姓名:</label>
        <input v-model="teacherForm.name" type="text" class="form-control" id="name" name="name" required>
      </div>
      <div class="mb-3">
        <label for="phone" class="form-label">電話:</label>
        <input v-model="teacherForm.phone" type="text" class="form-control" id="phone" name="phone" required>
      </div>
      <div class="mb-3">
        <label for="idCard" class="form-label">身分證:</label>
        <input v-model="teacherForm.idCard" type="text" class="form-control" id="idCard" name="idCard" required>
      </div>
      <div class="mb-3">
        <label for="highestEducation" class="form-label">最高學歷:</label>
        <input v-model="teacherForm.highestEducation" type="text" class="form-control" id="highestEducation" name="highestEducation">
      </div>
      <div class="mb-3">
        <label for="secondaryEducation" class="form-label">次高學歷:</label>
        <input v-model="teacherForm.secondaryEducation" type="text" class="form-control" id="secondaryEducation" name="secondaryEducation">
      </div>
      <div class="mb-3">
        <label for="experienceDescription" class="form-label">學經歷描述:</label>
        <textarea v-model="teacherForm.experienceDescription" class="form-control" id="experienceDescription" name="experienceDescription" rows="3"></textarea>
      </div>
      <button type="submit" class="btn btn-success mt-3">送出</button>
    </form>
  </div>
</template>

<script setup>
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '10.0.4.39';
const API_URL = isDev ? import.meta.env.VITE_API_URL_DEV : import.meta.env.VITE_API_URL_PROD;

import { ref, reactive, onMounted } from 'vue';
const statusMessage = ref('');
const statusType = ref('');
const statusMessageDiv = ref(null);
const showTeacherForm = ref(false);
const teacherForm = reactive({
  id: '',
  lineId: '',
  name: '',
  phone: '',
  idCard: '',
  highestEducation: '',
  secondaryEducation: '',
  experienceDescription: ''
});

function displayMessage(message, type = 'info') {
  statusMessage.value = message;
  statusType.value = type;
  if (statusMessageDiv.value) {
    statusMessageDiv.value.classList.remove('hidden', 'alert-success', 'alert-danger', 'alert-info');
    if (type === 'success') statusMessageDiv.value.classList.add('alert-success');
    else if (type === 'error') statusMessageDiv.value.classList.add('alert-danger');
    else if (type === 'info') statusMessageDiv.value.classList.add('alert-info');
  }
}

function getJwtToken() {
  const teacherInfo = JSON.parse(localStorage.getItem('teacherInfo'));
  return teacherInfo ? teacherInfo.token : null;
}

function fillTeacherForm(teacher) {
  if (teacher) {
    teacherForm.id = teacher.id || '';
    teacherForm.name = teacher.name || '';
    teacherForm.phone = teacher.phone || '';
    teacherForm.idCard = teacher.idCard || '';
    teacherForm.highestEducation = teacher.highestEducation || '';
    teacherForm.secondaryEducation = teacher.secondaryEducation || '';
    teacherForm.experienceDescription = teacher.experienceDescription || '';
    teacherForm.lineId = teacher.lineId || '';
  } else {
    teacherForm.id = '';
    teacherForm.name = '';
    teacherForm.phone = '';
    teacherForm.idCard = '';
    teacherForm.highestEducation = '';
    teacherForm.secondaryEducation = '';
    teacherForm.experienceDescription = '';
    teacherForm.lineId = '';
  }
}

async function fetchTeacherProfile() {
  const token = getJwtToken();
  console.log('[TeacherProfile] localStorage teacherInfo:', localStorage.getItem('teacherInfo'));
  console.log('[TeacherProfile] 取得 token:', token);
  if (!token) {
    displayMessage('未找到登入憑證，請重新登入。', 'error');
    console.warn('[TeacherProfile] 未找到登入憑證，原本會跳回登入頁，已註解跳轉方便 debug');
    // setTimeout(() => { window.location.href = '/teacherlogin'; }, 3000);
    return;
  }
  try {
    const response = await fetch(`${API_URL}/api/teachers/teacher-profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    console.log('[TeacherProfile] API 回傳:', data);
    if (response.ok && data.teacherRecord) {
      fillTeacherForm(data.teacherRecord);
      showTeacherForm.value = true;
      displayMessage('已載入教師資料。', 'success');
    } else {
      displayMessage(`查詢教師資料失敗: ${data.error || '未知錯誤'}`, 'error');
      console.warn('[TeacherProfile] 查詢教師資料失敗:', data.error || '未知錯誤');
    }
  } catch (error) {
    displayMessage(`與後端通訊失敗: ${error.message}`, 'error');
    console.error('[TeacherProfile] API 通訊失敗:', error);
  }
}

onMounted(() => {
  fetchTeacherProfile();
});
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
.form-label {
  font-weight: bold;
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
