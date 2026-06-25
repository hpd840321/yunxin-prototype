import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',                name: 'login',            component: () => import('@/views/LoginPage.vue') },
    { path: '/dashboard',       name: 'dashboard',        component: () => import('@/views/TeacherDashboard.vue'), meta: { title: '情绪驾驶舱' } },
    { path: '/class/:classId/date/:date', name: 'class-snapshots', component: () => import('@/views/CameraMonitor.vue'), meta: { title: '课堂快照' } },
    { path: '/student/:id',     name: 'student-detail',   component: () => import('@/views/StudentDetail.vue'), meta: { title: '学生画像' } },
    { path: '/parent',          name: 'parent',           component: () => import('@/views/ParentView.vue'), meta: { title: '子女概览' } },
    { path: '/schedule',        name: 'schedule',         component: () => import('@/views/ScheduleView.vue'), meta: { title: '课程表' } },
    { path: '/faces',           name: 'faces',            component: () => import('@/views/AIAnalytics.vue'), meta: { title: '人脸底库' } },
    { path: '/reports',         name: 'reports',          component: () => import('@/views/CounselorDashboard.vue'), meta: { title: '分析报告' } },
    { path: '/admin',           name: 'admin',            component: () => import('@/views/AdminDashboard.vue'), meta: { title: '系统管理' } },
    { path: '/records',         name: 'records',          component: () => import('@/views/InterventionRecords.vue'), meta: { title: '干预记录' } },
  ],
})

export default router
