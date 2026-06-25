<template>
  <div class="admin-page">
    <!-- 顶栏 -->
    <header class="top-bar">
      <div>
        <h1 class="page-title">系统管理</h1>
        <p class="page-subtitle">系统运行概览与全局管理 · 第25周</p>
      </div>
      <div class="top-actions">
        <button class="btn-outline" @click="store.toggleMask()">
          {{ store.maskMode ? '解除脱敏' : '投屏脱敏' }}
        </button>
      </div>
    </header>

    <!-- 系统状态卡片 -->
    <section class="stats-row">
      <div class="stat-card system">
        <span class="stat-icon">🏫</span>
        <span class="stat-value">{{ totalClasses }}</span>
        <span class="stat-label">班级总数</span>
      </div>
      <div class="stat-card system">
        <span class="stat-icon">👨‍🎓</span>
        <span class="stat-value">{{ totalStudents }}</span>
        <span class="stat-label">学生总数</span>
      </div>
      <div class="stat-card system">
        <span class="stat-icon">⚠️</span>
        <span class="stat-value" style="color:#EF4444">{{ riskCount }}</span>
        <span class="stat-label">预警中（红+黑）</span>
      </div>
      <div class="stat-card system">
        <span class="stat-icon">📋</span>
        <span class="stat-value">{{ totalRecords }}</span>
        <span class="stat-label">干预记录</span>
      </div>
    </section>

    <!-- 全校风险分布总览 -->
    <section class="section-card">
      <h2 class="section-title">全校风险分布</h2>
      <div class="admin-dist-grid">
        <div v-for="d in schoolDist" :key="d.label" class="admin-dist-item" :style="{ background: d.bg }">
          <span class="dist-num" :style="{ color: d.color }">{{ d.count }}</span>
          <span class="dist-lbl">{{ d.label }}</span>
        </div>
      </div>
      <div class="global-bar">
        <div v-if="schoolDist.find(d => d.key === 'green')?.count" class="bar-seg green"
          :style="{ flex: getRatio('green') }" :title="'绿色 ' + getRatio('green') + '%'">
          {{ getRatio('green') > 10 ? '绿色 ' + getCount('green') : '' }}
        </div>
        <div v-if="getCount('greenYellowTrend')" class="bar-seg greenYellowTrend"
          :style="{ flex: getRatio('greenYellowTrend') }" :title="'黄色走向 ' + getRatio('greenYellowTrend') + '%'">
        </div>
        <div v-if="getCount('yellow')" class="bar-seg yellow"
          :style="{ flex: getRatio('yellow') }" :title="'黄色 ' + getRatio('yellow') + '%'">
          {{ getRatio('yellow') > 10 ? '黄色 ' + getCount('yellow') : '' }}
        </div>
        <div v-if="getCount('yellowRedTrend')" class="bar-seg yellowRedTrend"
          :style="{ flex: getRatio('yellowRedTrend') }" :title="'红色走向 ' + getRatio('yellowRedTrend') + '%'">
        </div>
        <div v-if="getCount('red')" class="bar-seg red"
          :style="{ flex: getRatio('red') }" :title="'红色 ' + getRatio('red') + '%'">
          {{ getRatio('red') > 8 ? '红色 ' + getCount('red') : '' }}
        </div>
        <div v-if="getCount('black')" class="bar-seg black"
          :style="{ flex: getRatio('black') }" :title="'黑色 ' + getRatio('black') + '%'">
          {{ getRatio('black') > 5 ? '黑色 ' + getCount('black') : '' }}
        </div>
      </div>
    </section>

    <!-- 班级列表与操作 -->
    <section class="section-card">
      <h2 class="section-title">班级管理</h2>
      <div class="class-admin-grid">
        <div v-for="cls in classDistributions" :key="cls.className" class="class-admin-card">
          <div class="class-admin-header">
            <h3>{{ cls.className }}</h3>
            <span class="student-badge">{{ cls.totalStudents }}人</span>
          </div>
          <div class="class-mini-dist">
            <span class="mini-dot green" :style="{ flex: cls.green }" :title="'绿色 ' + cls.green" />
            <span v-if="cls.greenYellowTrend" class="mini-dot greenYellowTrend" :style="{ flex: cls.greenYellowTrend }" />
            <span v-if="cls.yellow" class="mini-dot yellow" :style="{ flex: cls.yellow }" />
            <span v-if="cls.yellowRedTrend" class="mini-dot yellowRedTrend" :style="{ flex: cls.yellowRedTrend }" />
            <span v-if="cls.red" class="mini-dot red" :style="{ flex: cls.red }" />
            <span v-if="cls.black" class="mini-dot black" :style="{ flex: cls.black }" />
          </div>
          <button class="btn-link" @click="viewClass(cls)">查看班级</button>
        </div>
      </div>
    </section>

    <!-- 重点关注直达 -->
    <section class="section-card">
      <h2 class="section-title">重点关注</h2>
      <div class="focus-grid">
        <div v-for="p in focusProfiles" :key="p.student.id" class="focus-chip" :style="{ borderLeftColor: RISK_LEVEL_COLORS[p.currentLevel] }">
          <span class="focus-chip-name">{{ store.maskMode ? p.student.name[0] + '同学' : p.student.name }}</span>
          <span class="focus-chip-class">{{ p.student.className }}</span>
          <span class="focus-chip-level" :style="{ color: RISK_LEVEL_COLORS[p.currentLevel] }">{{ RISK_LEVEL_LABELS[p.currentLevel] }}</span>
          <button class="btn-tiny" @click="viewStudent(p.student.id)">查看</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { RISK_LEVEL_COLORS, RISK_LEVEL_LABELS } from '@/types'
import type { ClassRiskDistribution } from '@/types'

const router = useRouter()
const store = useAppStore()

const classDistributions = computed(() => store.classDistributions)
const totalClasses = computed(() => classDistributions.value.length)
const totalStudents = computed(() => classDistributions.value.reduce((s, c) => s + c.totalStudents, 0))
const totalRecords = computed(() => store.allProfiles.reduce((s, p) => s + p.interventionRecords.length, 0))
const riskCount = computed(() => {
  const d = store.schoolStats.schoolRiskDistribution
  return d.red + d.black
})

const focusProfiles = computed(() =>
  store.allProfiles.filter(p => p.currentLevel === 'black' || p.currentLevel === 'red')
)

const schoolDist = computed(() => {
  const d = store.schoolStats.schoolRiskDistribution
  return [
    { key: 'green', label: '绿色', count: d.green, color: '#22C55E', bg: '#F0FDF4' },
    { key: 'greenYellowTrend', label: '黄色走向', count: d.greenYellowTrend, color: '#84CC16', bg: '#F7FEE7' },
    { key: 'yellow', label: '黄色', count: d.yellow, color: '#EAB308', bg: '#FEFCE8' },
    { key: 'yellowRedTrend', label: '红色走向', count: d.yellowRedTrend, color: '#F97316', bg: '#FFF7ED' },
    { key: 'red', label: '红色', count: d.red, color: '#EF4444', bg: '#FEF2F2' },
    { key: 'black', label: '黑色', count: d.black, color: '#1F2937', bg: '#F3F4F6' },
  ]
})

const total = computed(() => totalStudents.value || 1)

function getCount(key: string) {
  const item = schoolDist.value.find(d => d.key === key)
  return item?.count ?? 0
}
function getRatio(key: string) {
  return Math.round((getCount(key) / total.value) * 100)
}

function viewStudent(id: number) {
  store.selectStudent(id)
  router.push(`/student/${id}`)
}
function viewClass(cls: ClassRiskDistribution) {
  router.push('/dashboard')
}
</script>

<style scoped>
.admin-page { padding: 32px; max-width: 1100px; margin: 0 auto; }
.top-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 4px; }
.page-subtitle { font-size: 13px; color: #9CA3AF; margin: 0; }
.btn-outline { padding: 8px 16px; border-radius: 10px; border: 1.5px solid #E2EFE7; background: #fff; font-size: 13px; font-weight: 600; color: #4B5563; cursor: pointer; transition: all 0.15s; }
.btn-outline:hover { border-color: #15803D; color: #15803D; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
.stat-card { background: #fff; border-radius: 16px; padding: 20px; border: 1px solid #E2EFE7; display: flex; flex-direction: column; gap: 4px; align-items: center; text-align: center; }
.stat-icon { font-size: 28px; }
.stat-value { font-size: 32px; font-weight: 800; color: #0F172A; line-height: 1; }
.stat-label { font-size: 13px; color: #6B7280; font-weight: 500; }

.section-card { background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #E2EFE7; margin-bottom: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.02); }
.section-title { font-size: 16px; font-weight: 700; color: #0F172A; margin: 0 0 16px; }

.admin-dist-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-bottom: 16px; }
.admin-dist-item { border-radius: 12px; padding: 16px; text-align: center; }
.dist-num { font-size: 30px; font-weight: 800; display: block; }
.dist-lbl { font-size: 12px; color: #6B7280; margin-top: 2px; display: block; }

.global-bar { display: flex; height: 32px; border-radius: 10px; overflow: hidden; }
.bar-seg { display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; min-width: 24px; }
.bar-seg.green { background: #22C55E; }
.bar-seg.greenYellowTrend { background: #84CC16; }
.bar-seg.yellow { background: #EAB308; }
.bar-seg.yellowRedTrend { background: #F97316; }
.bar-seg.red { background: #EF4444; }
.bar-seg.black { background: #1F2937; color: #fff; }

.class-admin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.class-admin-card { background: #F9FAFB; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.class-admin-header { display: flex; justify-content: space-between; align-items: center; }
.class-admin-header h3 { font-size: 14px; font-weight: 700; color: #0F172A; margin: 0; }
.student-badge { font-size: 11px; color: #9CA3AF; background: #fff; padding: 2px 8px; border-radius: 6px; }
.class-mini-dist { display: flex; height: 8px; border-radius: 4px; overflow: hidden; }
.mini-dot { }
.mini-dot.green { background: #22C55E; }
.mini-dot.greenYellowTrend { background: #84CC16; }
.mini-dot.yellow { background: #EAB308; }
.mini-dot.yellowRedTrend { background: #F97316; }
.mini-dot.red { background: #EF4444; }
.mini-dot.black { background: #1F2937; }
.btn-link { border: none; background: none; color: #15803D; font-weight: 600; font-size: 13px; cursor: pointer; padding: 4px 8px; border-radius: 6px; transition: all 0.15s; align-self: flex-start; }
.btn-link:hover { background: #ECFDF5; }

.focus-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.focus-chip { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 10px; border: 1px solid #E2EFE7; border-left-width: 4px; background: #FAFAFA; }
.focus-chip-name { font-weight: 700; font-size: 13px; color: #1F2937; }
.focus-chip-class { font-size: 11px; color: #9CA3AF; }
.focus-chip-level { font-size: 11px; font-weight: 600; }
.btn-tiny { padding: 4px 10px; border-radius: 6px; border: none; background: #15803D; color: #fff; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.btn-tiny:hover { background: #059669; }
</style>
