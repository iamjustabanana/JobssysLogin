import { createRouter, createWebHistory } from 'vue-router';

import TeacherLogin from './components/TeacherLogin.vue';
import TeacherDashboard from './components/TeacherDashboard.vue';
import TeacherProfile from './components/TeacherProfile.vue';

const routes = [
  {
    path: '/',
    redirect: '/teacherlogin'   
  },
  {
    path: '/teacherlogin',
    component: TeacherLogin
  },
  {
    path: '/teacherdashboard',
    component: TeacherDashboard
  },
  {
    path: '/teacherprofile',
    component: TeacherProfile
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
