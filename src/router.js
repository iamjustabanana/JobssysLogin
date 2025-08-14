import { createRouter, createWebHistory } from 'vue-router';

import TeacherLogin from './components/TeacherLogin.vue';
import TeacherDashboard from './components/TeacherDashboard.vue';
import TeacherProfile from './components/TeacherProfile.vue';
import TestPage from './components/testPage.vue';
import TeacherTrialApplication from './components/TeacherTrialApplication.vue';
import TeacherAttendance from './components/TeacherAttendance.vue';
  

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
  },
  {
    path: '/testPage',
    component: TestPage
  },
  {
    path: '/teachertrialapplication',
    component: TeacherTrialApplication
  },
  {
    path: '/teacherattendance',
    component: TeacherAttendance
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
