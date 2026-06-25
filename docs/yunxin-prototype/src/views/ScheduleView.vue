<template>
  <div class="schedule-page">
    <header class="top-bar">
      <div>
        <h1 class="page-title">课程表</h1>
        <p class="page-subtitle">班级课程表配置 · {{ selectedClass }} · 2026-2027学年</p>
      </div>
      <div class="top-actions">
        <button class="btn-primary">编辑课程表</button>
        <button class="btn-outline">同步教务系统</button>
      </div>
    </header>

    <div class="page-body">
      <aside class="page-sidebar">
        <h3 class="sidebar-title">组织架构</h3>
        <GradeClassTree v-model:selected="selectedClass" />
      </aside>
      <div class="page-content">
        <div class="schedule-grid">
          <div v-for="day in weekDays" :key="day.key" class="day-col">
            <div class="day-header">{{ day.label }}</div>
            <div v-for="lesson in getDayLessons(day.key)" :key="lesson.id" class="lesson-cell">
              <div class="lesson-subject">{{ lesson.subject }}</div>
              <div class="lesson-time">{{ lesson.start }}-{{ lesson.end }}</div>
              <div class="lesson-teacher">{{ lesson.teacherName }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import GradeClassTree from '@/components/GradeClassTree.vue'
import { LESSONS, SCHEDULE_TEMPLATES } from '@/mock/data'

const selectedClass = ref('初一(1)班')

const weekDays = [
  { key: 1, label: '星期一' }, { key: 2, label: '星期二' }, { key: 3, label: '星期三' },
  { key: 4, label: '星期四' }, { key: 5, label: '星期五' },
]

const CLASS_IDS: Record<string, number> = { '初一(1)班': 1, '初一(2)班': 2, '初一(3)班': 3, '初一(4)班': 4, '初二(1)班': 5, '初二(2)班': 6, '初二(3)班': 7, '初三(1)班': 8, '初三(2)班': 9 }

function getDayLessons(weekday: number) {
  const cid = CLASS_IDS[selectedClass.value]
  if (!cid) return []
  return LESSONS.filter(l => l.classId === cid && l.weekday === weekday).sort((a, b) => a.period - b.period)
}
</script>

<style scoped>
.schedule-page { padding: 32px; max-width: 1300px; margin: 0 auto; }
.top-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 4px; }
.page-subtitle { font-size: 13px; color: #9CA3AF; margin: 0; }
.btn-primary { padding: 8px 18px; border-radius: 10px; border: none; background: linear-gradient(135deg, #15803D, #059669); color: #fff; font-weight: 600; font-size: 13px; cursor: pointer; }
.btn-outline { padding: 8px 16px; border-radius: 10px; border: 1.5px solid #E2EFE7; background: #fff; font-size: 13px; font-weight: 600; color: #4B5563; cursor: pointer; }
.page-body { display: flex; gap: 24px; align-items: flex-start; }
.page-sidebar { width: 220px; flex-shrink: 0; background: #fff; border-radius: 16px; border: 1px solid #E2EFE7; padding: 16px; position: sticky; top: 32px; }
.sidebar-title { font-size: 13px; font-weight: 700; color: #0F172A; margin: 0 0 8px; padding-bottom: 8px; border-bottom: 1px solid #F0F7F3; }
.page-content { flex: 1; min-width: 0; }
.schedule-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.day-header { text-align: center; font-weight: 700; font-size: 14px; color: #1F2937; padding: 12px; background: #F9FAFB; border-radius: 10px 10px 0 0; border: 1px solid #E2EFE7; border-bottom: none; }
.day-col { display: flex; flex-direction: column; gap: 4px; }
.lesson-cell { background: #fff; border: 1px solid #E2EFE7; border-radius: 10px; padding: 10px; text-align: center; cursor: pointer; transition: all 0.15s; }
.lesson-cell:hover { border-color: #A7F3D0; background: #F0FDF4; }
.lesson-subject { font-weight: 700; font-size: 14px; color: #0F172A; }
.lesson-time { font-size: 11px; color: #9CA3AF; margin: 2px 0; }
.lesson-teacher { font-size: 12px; color: #4B5563; }
</style>
