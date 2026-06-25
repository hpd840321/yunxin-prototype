<template>
  <div class="counselor-page">
    <header class="top-bar">
      <div>
        <h1 class="page-title">{{ currentLabel }} · 全校脉搏</h1>
        <p class="page-subtitle">第25周（2026.06.15 - 06.21）</p>
      </div>
      <button class="btn-outline" @click="store.toggleMask()">
        {{ store.maskMode ? '解除' : '脱敏' }}
      </button>
    </header>

    <!-- 全校风险分布 -->
    <section class="section-card">
      <h2 class="section-title">全校风险分布</h2>
      <div class="dist-grid">
        <div v-for="d in schoolDist" :key="d.label" class="dist-block">
          <span class="dist-number" :style="{ color: d.color }">{{ d.count }}</span>
          <span class="dist-label">{{ d.label }}</span>
        </div>
      </div>
    </section>

    <!-- 班级概览卡片 -->
    <section class="section-card">
      <h2 class="section-title">各班级风险分布</h2>
      <div class="class-list">
        <div v-for="cls in classes" :key="cls.className" class="class-card">
          <div class="class-header">
            <h3>{{ cls.className }}</h3>
            <span class="student-count">{{ cls.totalStudents }}人</span>
          </div>
          <div class="class-bar">
            <div v-if="cls.green > 0" class="bar-seg green" :style="{ flex: cls.green }" :title="'绿色 ' + cls.green">{{ cls.green }}</div>
            <div v-if="cls.greenYellowTrend > 0" class="bar-seg greenYellowTrend" :style="{ flex: cls.greenYellowTrend }" :title="'黄色走向 ' + cls.greenYellowTrend">{{ cls.greenYellowTrend }}</div>
            <div v-if="cls.yellow > 0" class="bar-seg yellow" :style="{ flex: cls.yellow }" :title="'黄色 ' + cls.yellow">{{ cls.yellow }}</div>
            <div v-if="cls.yellowRedTrend > 0" class="bar-seg yellowRedTrend" :style="{ flex: cls.yellowRedTrend }" :title="'红色走向 ' + cls.yellowRedTrend">{{ cls.yellowRedTrend }}</div>
            <div v-if="cls.red > 0" class="bar-seg red" :style="{ flex: cls.red }" :title="'红色 ' + cls.red">{{ cls.red }}</div>
            <div v-if="cls.black > 0" class="bar-seg black" :style="{ flex: cls.black }" :title="'黑色 ' + cls.black">{{ cls.black }}</div>
          </div>
          <div class="class-link">
            <button class="btn-link" @click="viewClass(cls)">查看班级详情</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 重点关注名单 -->
    <section class="section-card">
      <h2 class="section-title">重点关注名单</h2>
      <div class="focus-list">
        <div v-for="p in focusProfiles" :key="p.student.id" class="focus-item" :style="{ borderLeftColor: RISK_LEVEL_COLORS[p.currentLevel] }">
          <div class="focus-info">
            <span class="focus-name">{{ store.maskMode ? p.student.name[0] + '同学' : p.student.name }}</span>
            <RiskBadge :level="p.currentLevel" :trend="p.trend" size="sm" />
            <span class="focus-class">{{ p.student.className }}</span>
          </div>
          <div class="focus-metrics">
            <span>W_Ratio: <strong>{{ p.metrics.W_Ratio }}%</strong></span>
            <span>连续 <strong>{{ p.metrics.Consecutive_Days }}天</strong></span>
          </div>
          <button class="btn-primary" @click="viewStudent(p.student.id)">查看</button>
        </div>
      </div>
    </section>

    <!-- 全校周趋势 -->
    <section class="section-card">
      <h2 class="section-title">全校周异常占比趋势</h2>
      <WeeklyTrendChart
        :labels="schoolStats.weeklyGlobalRatios.map((_, i) => '第' + (22 + i) + '周')"
        :w-ratio="schoolStats.weeklyGlobalRatios"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { RISK_LEVEL_COLORS } from '@/types'
import RiskBadge from '@/components/RiskBadge.vue'
import WeeklyTrendChart from '@/components/WeeklyTrendChart.vue'
import type { ClassRiskDistribution } from '@/types'

const router = useRouter()
const store = useAppStore()

const currentLabel = computed(() => store.currentRole === 'school_manager' ? '校领导' : '心理老师')
const schoolStats = computed(() => store.schoolStats)
const classes = computed(() => store.classDistributions)

const schoolDist = computed(() => {
  const d = schoolStats.value.schoolRiskDistribution
  return [
    { label: '绿色', count: d.green, color: '#22C55E' },
    { label: '黄色走向', count: d.greenYellowTrend, color: '#84CC16' },
    { label: '黄色', count: d.yellow, color: '#EAB308' },
    { label: '红色走向', count: d.yellowRedTrend, color: '#F97316' },
    { label: '红色', count: d.red, color: '#EF4444' },
    { label: '黑色', count: d.black, color: '#1F2937' },
  ]
})

const focusProfiles = computed(() =>
  store.allProfiles.filter(p =>
    p.currentLevel === 'black' || p.currentLevel === 'red' || p.currentLevel === 'yellow_red_trend'
  )
)

function viewStudent(id: number) {
  store.selectStudent(id)
  router.push(`/student/${id}`)
}
function viewClass(cls: ClassRiskDistribution) {
  // 模拟：导航到班级视图（简化：跳转到 dashboard）
  router.push('/dashboard')
}
</script>

<style scoped>
.counselor-page { padding: 32px; max-width: 1100px; margin: 0 auto; }
.top-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 4px; }
.page-subtitle { font-size: 13px; color: #9CA3AF; margin: 0; }
.btn-outline { padding: 8px 16px; border-radius: 10px; border: 1.5px solid #E2EFE7; background: #fff; font-size: 13px; font-weight: 600; color: #4B5563; cursor: pointer; transition: all 0.15s; }
.btn-outline:hover { border-color: #15803D; color: #15803D; }

.section-card { background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #E2EFE7; margin-bottom: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.02); }
.section-title { font-size: 16px; font-weight: 700; color: #0F172A; margin: 0 0 16px; }

.dist-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
.dist-block { background: #F9FAFB; border-radius: 12px; padding: 16px; text-align: center; }
.dist-number { font-size: 32px; font-weight: 800; display: block; }
.dist-label { font-size: 12px; color: #6B7280; margin-top: 4px; display: block; }

.class-list { display: flex; flex-direction: column; gap: 16px; }
.class-card { background: #F9FAFB; border-radius: 12px; padding: 16px; }
.class-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.class-header h3 { font-size: 15px; font-weight: 700; color: #0F172A; margin: 0; }
.student-count { font-size: 12px; color: #9CA3AF; }
.class-bar { display: flex; height: 28px; border-radius: 8px; overflow: hidden; margin-bottom: 8px; }
.bar-seg { display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; min-width: 20px; }
.bar-seg.green { background: #22C55E; }
.bar-seg.greenYellowTrend { background: #84CC16; }
.bar-seg.yellow { background: #EAB308; }
.bar-seg.yellowRedTrend { background: #F97316; }
.bar-seg.red { background: #EF4444; }
.bar-seg.black { background: #1F2937; color: #fff; }
.class-link { text-align: right; }
.btn-link { border: none; background: none; color: #15803D; font-weight: 600; font-size: 13px; cursor: pointer; padding: 4px 8px; border-radius: 6px; transition: all 0.15s; }
.btn-link:hover { background: #ECFDF5; }

.focus-list { display: flex; flex-direction: column; gap: 12px; }
.focus-item { display: flex; align-items: center; gap: 16px; padding: 14px 16px; border-radius: 12px; border: 1px solid #E2EFE7; border-left-width: 4px; background: #FAFAFA; }
.focus-info { flex: 1; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.focus-name { font-weight: 700; font-size: 14px; color: #1F2937; }
.focus-class { font-size: 12px; color: #9CA3AF; }
.focus-metrics { display: flex; gap: 12px; font-size: 12px; color: #6B7280; }
.focus-metrics strong { color: #1F2937; }
.btn-primary { padding: 8px 16px; border-radius: 10px; border: none; background: linear-gradient(135deg, #15803D, #059669); color: #fff; font-weight: 600; font-size: 13px; cursor: pointer; white-space: nowrap; transition: all 0.15s; }
.btn-primary:hover { box-shadow: 0 4px 12px rgba(21,128,61,0.25); }
</style>
