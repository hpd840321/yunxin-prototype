<template>
  <div class="login-page">
    <div class="login-bg" />
    <div class="login-card">
      <div class="brand">
        <div class="brand-icon">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" fill="#15803D" opacity="0.15"/>
            <path d="M20 8C16 8 12 12 12 18c0 8 8 14 8 14s8-6 8-14c0-6-4-10-8-10z" fill="#15803D" opacity="0.6"/>
            <circle cx="20" cy="17" r="3" fill="#15803D"/>
          </svg>
        </div>
        <h1 class="brand-name">云心</h1>
        <p class="brand-desc">校园心理健康风险预警与分级干预系统</p>
        <p class="brand-principle">只做预警 · 不做诊断 · 持续关怀</p>
      </div>

      <div class="role-section">
        <h3 class="section-title">选择角色进入</h3>
        <div class="role-grid">
          <button v-for="r in roles" :key="r.key"
            class="role-btn"
            :class="{ active: selectedRole === r.key }"
            @click="selectedRole = r.key">
            <component :is="r.icon" class="role-icon" />
            <span class="role-label">{{ r.label }}</span>
            <span class="role-desc">{{ r.desc }}</span>
          </button>
        </div>
      </div>

      <button class="enter-btn" :disabled="!selectedRole" @click="handleEnter">
        进入系统
      </button>

      <p class="footer-note">本系统为原型演示，所有数据为模拟数据</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import type { UserRole } from '@/types'
import {
  Users, Heart, School, UserRound, Shield,
} from 'lucide-vue-next'

const router = useRouter()
const store = useAppStore()
const selectedRole = ref<UserRole>('teacher')

const roles = [
  { key: 'admin' as UserRole, label: '系统管理员', desc: '系统配置与全局管理', icon: Shield },
  { key: 'teacher' as UserRole, label: '班主任', desc: '查看班级风险概览与跟进', icon: Users },
  { key: 'counselor' as UserRole, label: '心理老师', desc: '全校预警与专业评估', icon: Heart },
  { key: 'school_manager' as UserRole, label: '校领导', desc: '整体风险分布与趋势', icon: School },
  { key: 'parent' as UserRole, label: '家长', desc: '关注孩子状态与建议', icon: UserRound },
]

function handleEnter() {
  if (!selectedRole.value) return
  store.setRole(selectedRole.value)

  if (selectedRole.value === 'admin') {
    router.push('/admin')
  } else if (selectedRole.value === 'parent') {
    router.push('/parent')
  } else if (selectedRole.value === 'counselor' || selectedRole.value === 'school_manager') {
    router.push('/counselor')
  } else {
    router.push('/dashboard')
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 50%, #F0F9FF 100%);
  position: relative;
  padding: 20px;
}
.login-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.login-card {
  position: relative;
  width: 100%;
  max-width: 480px;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 40px 32px;
  box-shadow: 0 8px 40px rgba(21, 128, 61, 0.08);
  border: 1px solid rgba(226, 239, 231, 0.6);
}
.brand {
  text-align: center;
  margin-bottom: 32px;
}
.brand-icon { margin-bottom: 12px; }
.brand-name {
  font-size: 28px;
  font-weight: 900;
  color: #15803D;
  margin: 0 0 6px;
  letter-spacing: 2px;
}
.brand-desc {
  font-size: 14px;
  color: #6B7280;
  margin: 0 0 4px;
}
.brand-principle {
  font-size: 12px;
  color: #059669;
  font-weight: 500;
}
.section-title {
  font-size: 14px;
  color: #4B5563;
  margin: 0 0 16px;
  font-weight: 600;
}
.role-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.role-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 12px;
  border-radius: 16px;
  border: 2px solid #E2EFE7;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  color: #4B5563;
}
.role-btn:hover {
  border-color: #A7F3D0;
  background: #F0FDF4;
}
.role-btn.active {
  border-color: #15803D;
  background: #ECFDF5;
  color: #15803D;
  box-shadow: 0 0 0 3px rgba(21,128,61,0.1);
}
.role-icon { width: 28px; height: 28px; }
.role-label { font-weight: 700; font-size: 14px; }
.role-desc { font-size: 11px; color: #9CA3AF; text-align: center; line-height: 1.3; }
.role-btn.active .role-desc { color: #059669; }

.enter-btn {
  width: 100%;
  margin-top: 24px;
  padding: 14px;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #15803D, #059669);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(21,128,61,0.2);
}
.enter-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(21,128,61,0.3); }
.enter-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.footer-note { text-align: center; font-size: 11px; color: #D1D5DB; margin-top: 20px; }
</style>
