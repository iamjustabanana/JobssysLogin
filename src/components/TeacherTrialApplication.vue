<template>
  <div class="container mt-4">
    <h2 class="text-center mb-3">教師試聽申請</h2>
    <div v-if="loading" class="alert alert-info">資料載入中...</div>
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
    <div v-if="!loading && !errorMessage">
      <div class="mb-3 d-flex flex-wrap gap-2 align-items-center">
        <label>日期區間：</label>
        <input type="date" v-model="filterStart" class="form-control" style="max-width:150px;">
        <span>~</span>
        <input type="date" v-model="filterEnd" class="form-control" style="max-width:150px;">
        <button class="btn btn-primary" @click="fetchApplications">查詢</button>
      </div>
      <table class="table table-bordered table-hover">
        <thead>
          <tr>
            <th @click="sortBy('student')">姓名</th>
            <th @click="sortBy('school')">學校</th>
            <th @click="sortBy('grade')">年級</th>
            <th @click="sortBy('course')">科系</th>
            <th @click="sortBy('trialdate1')">日期(星期)</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(app, idx) in sortedApplications" :key="app.trialId">
            <td>{{ app.student }}</td>
            <td>{{ app.school }}</td>
            <td>{{ app.grade }}</td>
            <td>{{ app.course }}</td>
            <td>{{ formatDate(app.trialdate1) }}</td>
            <td>
              <button class="btn btn-sm btn-info" @click="toggleExpand(idx)">{{ expandedIdx === idx ? '收合' : '展開' }}</button>
            </td>
          </tr>
          <tr v-if="expandedIdx === idx">
            <td colspan="6">
              <div class="row g-2">
                <div class="col-md-4"><b>時段：</b> {{ app.startTime }}</div>
                <div class="col-md-4"><b>2ndTrial：</b> {{ app.trialDate2 }}</div>
                <div class="col-md-4"><b>BSD：</b> {{ app.billingStartDate }}</div>
                <div class="col-md-12"><b>進度說明：</b> {{ app.caseReport }}</div>
                <div class="col-md-4"><b>Tag：</b> {{ app.tags }}</div>
                <div class="col-md-4"><b>家長電話：</b> {{ app.parentPhone }}</div>
                <div class="col-md-12"><b>Report：</b> {{ app.notes }}</div>
                <div class="col-md-12 mt-2">
                  <button class="btn btn-warning btn-sm" @click="editIdx = idx">編輯</button>
                </div>
                <tr v-if="editIdx === idx">
                  <td colspan="6">
                    <div class="row g-2">
                      <div class="col-md-4"><input v-model="editForm.startTime" class="form-control" placeholder="時段"></div>
                      <div class="col-md-4"><input v-model="editForm.trialDate2" class="form-control" placeholder="2ndTrial"></div>
                      <div class="col-md-4"><input v-model="editForm.billingStartDate" class="form-control" placeholder="BSD"></div>
                      <div class="col-md-12"><input v-model="editForm.caseReport" class="form-control" placeholder="進度說明"></div>
                      <div class="col-md-4"><input v-model="editForm.tags" class="form-control" placeholder="Tag"></div>
                      <div class="col-md-4"><input v-model="editForm.parentPhone" class="form-control" placeholder="家長電話"></div>
                      <div class="col-md-12"><input v-model="editForm.notes" class="form-control" placeholder="Report"></div>
                      <div class="col-md-12 mt-2">
                        <button class="btn btn-success btn-sm" @click="saveEdit(app.trialId)">Save</button>
                        <button class="btn btn-secondary btn-sm" @click="editIdx = null">Cancel</button>
                      </div>
                    </div>
                  </td>
                </tr>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';

const isDev = window.location.hostname === 'localhost' || window.location.hostname === '10.0.4.39';
const API_URL = isDev ? import.meta.env.VITE_API_URL_DEV : import.meta.env.VITE_API_URL_PROD;

const loading = ref(false);
const errorMessage = ref('');
const applications = ref([]);
const filterStart = ref('');
const filterEnd = ref('');
const expandedIdx = ref(null);
const editIdx = ref(null);
const editForm = reactive({
  startTime: '', trialDate2: '', billingStartDate: '', caseReport: '', tags: '', parentPhone: '', notes: ''
});
const sortKey = ref('');
const sortAsc = ref(true);

function getJwtToken() {
  const teacherInfo = JSON.parse(localStorage.getItem('teacherInfo'));
  return teacherInfo ? teacherInfo.token : null;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const week = ['日','一','二','三','四','五','六'];
  return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} (${week[d.getDay()]})`;
}

const sortedApplications = computed(() => {
  let arr = [...applications.value];
  if (sortKey.value) {
    arr.sort((a, b) => {
      if (a[sortKey.value] < b[sortKey.value]) return sortAsc.value ? -1 : 1;
      if (a[sortKey.value] > b[sortKey.value]) return sortAsc.value ? 1 : -1;
      return 0;
    });
  }
  return arr;
});

function sortBy(key) {
  if (sortKey.value === key) sortAsc.value = !sortAsc.value;
  else { sortKey.value = key; sortAsc.value = true; }
}

function toggleExpand(idx) {
  expandedIdx.value = expandedIdx.value === idx ? null : idx;
  editIdx.value = null;
  if (expandedIdx.value !== null) {
    // 預設填入編輯表單
    Object.assign(editForm, applications.value[idx]);
  }
}

async function fetchApplications() {
  loading.value = true;
  errorMessage.value = '';
  const token = getJwtToken();
  if (!token) {
    errorMessage.value = '未找到登入憑證，請重新登入。';
    loading.value = false;
    return;
  }
  let url = `${API_URL}/api/trial-application/my-applications`;
  const params = [];
  if (filterStart.value) params.push(`start=${filterStart.value}`);
  if (filterEnd.value) params.push(`end=${filterEnd.value}`);
  if (params.length) url += '?' + params.join('&');
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (response.ok && Array.isArray(data)) {
      applications.value = data;
    } else {
      errorMessage.value = data.error || '資料取得失敗';
    }
  } catch (err) {
    errorMessage.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function saveEdit(trialId) {
  const token = getJwtToken();
  if (!token) {
    errorMessage.value = '未找到登入憑證，請重新登入。';
    return;
  }
  try {
    const response = await fetch(`${API_URL}/api/trial-application/${trialId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editForm)
    });
    const result = await response.json();
    if (response.ok) {
      applications.value[editIdx.value] = { ...applications.value[editIdx.value], ...editForm };
      editIdx.value = null;
    } else {
      errorMessage.value = result.error || '更新失敗';
    }
  } catch (err) {
    errorMessage.value = err.message;
  }
}

onMounted(() => {
  // 預設查詢 7/24~8/15
  filterStart.value = '2025-07-24';
  filterEnd.value = '2025-08-15';
  fetchApplications();
});
</script>

<style scoped>
.container {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  padding: 2rem;
  margin-bottom: 2rem;
}
</style>
