import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserRole, StudentRiskProfile, ClassRiskDistribution, AlertItem } from '@/types'
import {
  STUDENT_PROFILES, CLASS_DISTRIBUTIONS, ALERTS, SCHOOL_STATS,
} from '@/mock/data'

export const useAppStore = defineStore('app', () => {
  // ---- 状态 ----
  const currentRole = ref<UserRole>('teacher')
  const maskMode = ref(false)          // 投屏脱敏模式
  const selectedStudentId = ref<number | null>(null)
  const searchQuery = ref('')

  // ---- 计算属性 ----

  const allProfiles = computed(() => STUDENT_PROFILES)
  const allAlerts = computed(() => ALERTS)
  const schoolStats = computed(() => SCHOOL_STATS)

  const classDistributions = computed(() => CLASS_DISTRIBUTIONS)

  /** 按角色过滤后的预警列表 */
  const filteredAlerts = computed(() => {
    if (currentRole.value === 'parent') {
      // 家长只看自己孩子 — 通过 store 中的 parentChildren 判断
      return ALERTS.filter(a => parentChildren.value.includes(a.studentId))
    }
    return ALERTS
  })

  const selectedProfile = computed(() => {
    if (!selectedStudentId.value) return null
    return STUDENT_PROFILES.find(p => p.student.id === selectedStudentId.value) ?? null
  })

  const parentChildren = computed(() => {
    if (currentRole.value !== 'parent') return []
    // 模拟：当前家长角色下对应的子女
    return [101, 108]
  })

  const parentProfiles = computed(() => {
    return STUDENT_PROFILES.filter(p => parentChildren.value.includes(p.student.id))
  })

  // ---- 操作 ----
  function setRole(role: UserRole) {
    currentRole.value = role
    selectedStudentId.value = null
  }

  function toggleMask() {
    maskMode.value = !maskMode.value
  }

  function selectStudent(id: number | null) {
    selectedStudentId.value = id
  }

  function setSearch(q: string) {
    searchQuery.value = q
  }

  return {
    currentRole, maskMode, selectedStudentId, searchQuery,
    allProfiles, allAlerts, schoolStats, classDistributions,
    filteredAlerts, selectedProfile, parentChildren, parentProfiles,
    setRole, toggleMask, selectStudent, setSearch,
  }
})
