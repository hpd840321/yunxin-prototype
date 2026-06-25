<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <div class="app-root">
        <!-- 侧边导航（登录页不显示） -->
        <aside v-if="!isLoginPage" class="app-sidebar">
          <div class="sidebar-brand">
            <div class="brand-icon">
              <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" fill="#15803D" opacity="0.15"/>
                <path d="M20 8C16 8 12 12 12 18c0 8 8 14 8 14s8-6 8-14c0-6-4-10-8-10z" fill="#15803D" opacity="0.6"/>
                <circle cx="20" cy="17" r="3" fill="#15803D"/>
              </svg>
            </div>
            <span class="brand-text">云心</span>
          </div>

          <nav class="sidebar-nav">
            <router-link v-for="item in navItems" :key="item.path"
              :to="item.path"
              class="nav-item"
              :class="{ active: isActive(item.path) }">
              <component :is="item.icon" class="nav-icon" :size="18" />
              <span class="nav-label">{{ item.label }}</span>
            </router-link>
          </nav>

          <div class="sidebar-footer">
            <div class="role-badge">
              <span class="role-icon">{{ roleIcon }}</span>
              <span class="role-name">{{ roleName }}</span>
            </div>
            <router-link to="/" class="logout-link">切换角色</router-link>
          </div>
        </aside>

        <!-- 主内容区 -->
        <main class="app-main" :class="{ full: isLoginPage }">
          <router-view />
        </main>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NConfigProvider, NMessageProvider, zhCN, dateZhCN } from 'naive-ui'
import { useAppStore } from '@/stores/app'
import { ROLE_LABELS } from '@/types'
import {
  LayoutDashboard, Activity, Heart, ClipboardList, UserRound, Shield,
} from 'lucide-vue-next'

const route = useRoute()
const store = useAppStore()
const isLoginPage = computed(() => route.path === '/')

const roleName = computed(() => ROLE_LABELS[store.currentRole])
const roleIcon = computed(() => {
  const map: Record<string, string> = { admin: '管', teacher: '师', counselor: '心', school_manager: '管', parent: '家' }
  return map[store.currentRole] ?? '师'
})

const navItems = computed(() => {
  const role = store.currentRole
  const items = [
    { path: '/dashboard', label: '班级概览', icon: LayoutDashboard },
    { path: '/counselor', label: '全校脉搏', icon: Activity },
    { path: '/records',   label: '干预记录', icon: ClipboardList },
  ]
  // 系统管理员 — 全权限导航
  if (role === 'admin') {
    return [
      { path: '/admin',    label: '系统管理', icon: Shield },
      { path: '/dashboard', label: '班级概览', icon: LayoutDashboard },
      { path: '/counselor', label: '全校脉搏', icon: Activity },
      { path: '/records',   label: '干预记录', icon: ClipboardList },
    ]
  }
  // 家长特定导航
  if (role === 'parent') {
    return [
      { path: '/parent', label: '子女状态', icon: Heart },
      { path: '/records', label: '记录', icon: ClipboardList },
    ]
  }
  // 校领导/心理老师
  if (role === 'school_manager' || role === 'counselor') {
    return items
  }
  // 班主任
  return [
    ...items,
    { path: '/records', label: '干预记录', icon: Heart },
  ]
})

function isActive(path: string) {
  if (path === '/counselor') return route.path === '/counselor'
  return route.path.startsWith(path)
}
</script>

<style>
/* 全局样式 */
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Noto Sans SC', 'Figtree', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #F0FDF4;
  color: #1F2937;
  -webkit-font-smoothing: antialiased;
}
</style>

<style scoped>
.app-root {
  display: flex;
  min-height: 100vh;
}

.app-sidebar {
  width: 220px;
  background: #fff;
  border-right: 1px solid #E2EFE7;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
}
.sidebar-brand {
  padding: 20px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #F0F7F3;
}
.brand-text { font-size: 18px; font-weight: 900; color: #15803D; letter-spacing: 1px; }

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  color: #4B5563;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s;
}
.nav-item:hover { background: #F0FDF4; color: #15803D; }
.nav-item.active { background: #ECFDF5; color: #15803D; font-weight: 600; }
.nav-icon { flex-shrink: 0; }

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid #F0F7F3;
}
.role-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #F0FDF4;
  border-radius: 10px;
  margin-bottom: 8px;
}
.role-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #15803D, #059669);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
}
.role-name { font-size: 13px; font-weight: 600; color: #1F2937; }
.logout-link {
  display: block;
  text-align: center;
  font-size: 12px;
  color: #9CA3AF;
  text-decoration: none;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.15s;
}
.logout-link:hover { color: #15803D; background: #F0FDF4; }

.app-main {
  flex: 1;
  min-height: 100vh;
  background: #F0FDF4;
}
.app-main.full {
  /* 登录页全屏 */
}
</style>
