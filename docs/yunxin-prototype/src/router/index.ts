import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',            name: 'login',              component: () => import('@/views/LoginPage.vue') },
    { path: '/dashboard',   name: 'dashboard',           component: () => import('@/views/TeacherDashboard.vue'), meta: { title: '班级概览' } },
    { path: '/student/:id', name: 'student-detail',      component: () => import('@/views/StudentDetail.vue'), meta: { title: '学生画像' } },
    { path: '/parent',      name: 'parent',              component: () => import('@/views/ParentView.vue'), meta: { title: '子女概览' } },
    { path: '/counselor',   name: 'counselor',           component: () => import('@/views/CounselorDashboard.vue'), meta: { title: '全校脉搏' } },
    { path: '/records',     name: 'intervention-records', component: () => import('@/views/InterventionRecords.vue'), meta: { title: '干预记录' } },
    { path: '/cameras',     name: 'cameras',             component: () => import('@/views/CameraMonitor.vue'), meta: { title: '摄像头' } },
    { path: '/ai-analytics', name: 'ai-analytics',        component: () => import('@/views/AIAnalytics.vue'), meta: { title: 'AI分析' } },
    { path: '/admin',       name: 'admin',               component: () => import('@/views/AdminDashboard.vue'), meta: { title: '系统管理' } },
  ],
})

export default router
