<template>
  <div class="dashboard-page">
    <header class="top-bar">
      <div>
        <h1 class="page-title">情绪驾驶舱</h1>
        <p class="page-subtitle">{{ selectedClass }} · 第25周（2026.06.22 - 06.26） · {{ todayLessons.length }}节课</p>
      </div>
      <div class="top-actions">
        <button class="btn-outline" @click="store.toggleMask()">{{ store.maskMode ? '解除脱敏' : '投屏脱敏' }}</button>
      </div>
    </header>

    <div class="page-body">
      <aside class="page-sidebar">
        <h3 class="sidebar-title">组织架构</h3>
        <GradeClassTree v-model:selected="selectedClass" />
      </aside>

      <div class="page-content">
        <!-- 风险分布 -->
        <section class="stats-row">
          <div v-for="s in statsCards" :key="s.label" class="stat-card" :style="{ borderLeftColor: s.color }">
            <span class="stat-value" :style="{ color: s.color }">{{ s.count }}</span>
            <span class="stat-label">{{ s.label }}</span>
          </div>
        </section>

        <!-- 今日课程 -->
        <section class="section-card">
          <h2 class="section-title">今日课程 · {{ selectedDate }}</h2>
          <div class="lesson-summary-list">
            <div v-for="lesson in todayLessons" :key="lesson.id" class="lesson-summary-item" @click="viewLesson(lesson)">
              <div class="lesson-summary-left">
                <span class="lesson-summary-period">{{ '第' + (lesson.period + 1) + '节' }}</span>
                <div class="lesson-summary-body">
                  <span class="lesson-summary-subject">{{ lesson.subject }}</span>
                  <span class="lesson-summary-time">{{ lesson.start }}-{{ lesson.end }}</span>
                </div>
              </div>
              <div class="lesson-summary-right">
                <span class="lesson-summary-teacher">{{ lesson.teacherName }}</span>
                <span class="lesson-summary-status done">✅ 已分析</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 预警列表 -->
        <section class="section-card">
          <h2 class="section-title">
            <span>重点关注</span>
            <span class="badge-warn">{{ activeAlerts.length }}条</span>
          </h2>
          <div class="alert-list">
            <div v-for="a in activeAlerts" :key="a.id" class="alert-item" :style="{ borderLeftColor: RISK_LEVEL_COLORS[a.level] }">
              <FaceThumb :name="store.maskMode ? '?' : a.studentName" state="withdrawn" size="md" :masked="store.maskMode" :seed="a.studentId" />
              <div class="alert-left">
                <div class="alert-header">
                  <span class="alert-name">{{ store.maskMode ? (a.studentName[0] + '同学') : a.studentName }}</span>
                  <RiskBadge :level="a.level" size="sm" />
                  <span class="alert-class">{{ a.className }}</span>
                </div>
                <p class="alert-desc">{{ a.description }}</p>
                <p class="alert-action">建议：{{ a.suggestedAction }}</p>
              </div>
              <div class="alert-right">
                <button class="btn-primary" @click="viewStudent(a.studentId)">查看画像</button>
              </div>
            </div>
          </div>
          <div v-if="activeAlerts.length === 0" class="empty-state"><p>暂无待处理预警</p></div>
        </section>

        <!-- 学生列表 -->
        <section class="section-card">
          <h2 class="section-title">{{ selectedClass }} 学生周状态</h2>
          <div class="student-grid">
            <StudentCard v-for="p in classProfiles" :key="p.student.id" :profile="p" @click="viewStudent(p.student.id)" />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { RISK_LEVEL_COLORS } from '@/types'
import { LESSONS, CLASS_IDS } from '@/mock/data'
import RiskBadge from '@/components/RiskBadge.vue'
import StudentCard from '@/components/StudentCard.vue'
import GradeClassTree from '@/components/GradeClassTree.vue'
import FaceThumb from '@/components/FaceThumb.vue'

const router = useRouter()
const store = useAppStore()
const selectedClass = ref('初一(1)班')
const selectedDate = ref('2026-06-25')

const classProfiles = computed(() => store.allProfiles.filter(p => p.student.className === selectedClass.value))
const todayLessons = computed(() =>
  LESSONS.filter(l => l.classId === CLASS_IDS[selectedClass.value] && l.date === selectedDate.value).sort((a, b) => a.period - b.period)
)

const statsCards = computed(() => {
  const counts = { green: 0, greenYellowTrend: 0, yellow: 0, yellowRedTrend: 0, red: 0, black: 0 }
  classProfiles.value.forEach(p => {
    if (counts[p.currentLevel] !== undefined) counts[p.currentLevel]++
  })
  return [
    { label: '绿色', count: counts.green, color: '#22C55E' },
    { label: '黄色走向', count: counts.greenYellowTrend, color: '#84CC16' },
    { label: '黄色', count: counts.yellow, color: '#EAB308' },
    { label: '红色走向', count: counts.yellowRedTrend, color: '#F97316' },
    { label: '红色', count: counts.red, color: '#EF4444' },
    { label: '黑色', count: counts.black, color: '#1F2937' },
  ]
})

const activeAlerts = computed(() => store.allAlerts.filter(a => {
  const p = classProfiles.value.find(pp => pp.student.id === a.studentId)
  return !!p
}))

function viewStudent(id: number) {
  store.selectStudent(id)
  router.push(`/student/${id}`)
}
function viewLesson(lesson: any) {
  router.push(`/class/${lesson.classId}/date/${lesson.date}`)
}
</script>

<style scoped>
.dashboard-page { padding: 32px; max-width: 1300px; margin: 0 auto; }
.top-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 4px; }
.page-subtitle { font-size: 13px; color: #9CA3AF; margin: 0; }
.btn-outline {
  padding: 8px 16px;
  border-radius: 10px;
  border: 1.5px solid #E2EFE7;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  color: #4B5563;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-outline:hover { border-color: #15803D; color: #15803D; }

.page-body { display: flex; gap: 24px; align-items: flex-start; }
.page-sidebar { width: 220px; flex-shrink: 0; background: #fff; border-radius: 16px; border: 1px solid #E2EFE7; padding: 16px; position: sticky; top: 32px; }
.sidebar-title { font-size: 13px; font-weight: 700; color: #0F172A; margin: 0 0 8px; padding-bottom: 8px; border-bottom: 1px solid #F0F7F3; }
.page-content { flex: 1; min-width: 0; }

.stats-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}
.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #E2EFE7;
  border-left-width: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-value { font-size: 28px; font-weight: 800; line-height: 1; }
.stat-label { font-size: 12px; color: #6B7280; font-weight: 500; }

.section-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #E2EFE7;
  margin-bottom: 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.02);
}
.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #0F172A;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.badge-warn {
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: #EF4444;
  padding: 2px 8px;
  border-radius: 10px;
}

.lesson-summary-list { display: flex; flex-direction: column; gap: 8px; }
.lesson-summary-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-radius: 12px; border: 1px solid #E2EFE7; cursor: pointer; transition: all 0.15s; }
.lesson-summary-item:hover { border-color: #A7F3D0; background: #F0FDF4; }
.lesson-summary-left { display: flex; align-items: center; gap: 12px; }
.lesson-summary-period { font-size: 11px; font-weight: 700; color: #15803D; background: #ECFDF5; padding: 2px 8px; border-radius: 6px; }
.lesson-summary-body { display: flex; flex-direction: column; }
.lesson-summary-subject { font-size: 14px; font-weight: 700; color: #1F2937; }
.lesson-summary-time { font-size: 11px; color: #9CA3AF; }
.lesson-summary-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.lesson-summary-teacher { font-size: 12px; color: #4B5563; }
.lesson-summary-status { font-size: 11px; font-weight: 600; }
.lesson-summary-status.done { color: #15803D; }

.alert-list { display: flex; flex-direction: column; gap: 12px; }
.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  border-radius: 12px;
  background: #FAFAFA;
  border: 1px solid #E2EFE7;
  border-left-width: 4px;
}
.alert-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.alert-name { font-weight: 700; font-size: 14px; color: #1F2937; }
.alert-class { font-size: 12px; color: #9CA3AF; }
.alert-desc { font-size: 13px; color: #4B5563; margin: 0 0 4px; line-height: 1.5; }
.alert-action { font-size: 12px; color: #059669; margin: 0; font-weight: 500; }
.alert-right { flex-shrink: 0; }
.btn-primary {
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #15803D, #059669);
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-primary:hover { box-shadow: 0 4px 12px rgba(21,128,61,0.25); }

.student-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.empty-state { text-align: center; padding: 32px; color: #9CA3AF; font-size: 14px; }
</style>
