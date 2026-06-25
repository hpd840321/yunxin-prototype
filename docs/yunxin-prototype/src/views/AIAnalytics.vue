<template>
  <div class="ai-page">
    <header class="top-bar">
      <div>
        <h1 class="page-title">AI 人脸分析</h1>
        <p class="page-subtitle">人脸注册管理 · 识别质量监控 · 推理流水线 · 日采样数据</p>
      </div>
      <div class="uptime-badge">
        <span class="uptime-dot" /> 系统运行: {{ AI_SYSTEM_STATS.pipelineUptime }}%
      </div>
    </header>

    <div class="page-body">
      <!-- 左侧组织树 -->
      <aside class="page-sidebar">
        <h3 class="sidebar-title">组织架构</h3>
        <GradeClassTree v-model:selected="selectedClass" />
      </aside>

      <!-- 右侧内容 -->
      <div class="page-content">
        <!-- 顶部指标 -->
        <section class="stats-row">
          <div class="stat-card">
            <span class="stat-icon">📷</span>
            <span class="stat-value">{{ (AI_SYSTEM_STATS.todayTotalDetections / 1000).toFixed(1) }}k</span>
            <span class="stat-label">今日检测帧</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">👤</span>
            <span class="stat-value">{{ enrolledCount }}/{{ classStudents.length }}</span>
            <span class="stat-label">人脸注册</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">🎯</span>
            <span class="stat-value">{{ (avgClassConfidence * 100).toFixed(0) }}%</span>
            <span class="stat-label">平均识别置信度</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">⚡</span>
            <span class="stat-value">{{ AI_SYSTEM_STATS.p95Latency }}ms</span>
            <span class="stat-label">P95 推理延迟</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">🔴</span>
            <span class="stat-value" style="color:#EF4444">{{ AI_SYSTEM_STATS.system1EventCount }}</span>
            <span class="stat-label">今日实时异常事件</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">📊</span>
            <span class="stat-value">{{ AI_SYSTEM_STATS.system2SampleCount }}</span>
            <span class="stat-label">今日延迟采样数</span>
          </div>
        </section>

        <!-- 人脸注册网格（当前班级） -->
        <section class="section-card">
          <h2 class="section-title">人脸注册状态 · {{ selectedClass }}</h2>
          <div class="face-grid">
            <div v-for="s in classStudents" :key="s.id" class="face-cell" :class="{ unregistered: !FACE_ENROLLMENT[s.id]?.registered }">
              <div class="face-card-avatar">
                <span class="fca-char">{{ s.name[0] }}</span>
                <div v-if="FACE_ENROLLMENT[s.id]?.registered" class="fca-ring" :style="{ borderColor: faceQualityColor(FACE_ENROLLMENT[s.id].quality) }" />
                <div v-else class="fca-ring" style="border-color: #D1D5DB; border-style: dashed" />
              </div>
              <div class="face-card-info">
                <span class="face-card-name">{{ s.name }}</span>
                <span v-if="FACE_ENROLLMENT[s.id]?.registered" class="face-card-quality" :style="{ color: faceQualityColor(FACE_ENROLLMENT[s.id].quality) }">
                  人脸质量 {{ (FACE_ENROLLMENT[s.id].quality * 100).toFixed(0) }}%
                </span>
                <span v-else class="face-card-quality unreg">未注册</span>
                <span class="face-card-updated">{{ FACE_ENROLLMENT[s.id]?.lastUpdated || '--' }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- AI 流水线 -->
        <section class="section-card">
          <h2 class="section-title">AI 推理流水线</h2>
          <div class="pipeline">
            <div v-for="(stage, i) in PIPELINE_STAGES" :key="stage.key" class="pipeline-stage">
              <div class="pipeline-node">
                <div class="pipeline-dot" :class="stage.status" />
                <div class="pipeline-connector" v-if="i < PIPELINE_STAGES.length - 1" />
              </div>
              <div class="pipeline-body">
                <div class="pipeline-header">
                  <span class="pipeline-label">{{ stage.label }}</span>
                  <span class="pipeline-status" :class="stage.status">{{ statusText(stage.status) }}</span>
                </div>
                <div class="pipeline-metrics">
                  <span>延迟: <strong>{{ stage.latency }}ms</strong></span>
                  <span>处理: <strong>{{ stage.processed.toLocaleString() }}帧</strong></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 日采样趋势 -->
        <section class="section-card">
          <h2 class="section-title">本周日采样趋势 · {{ selectedClass }}</h2>
          <div class="daily-chart">
            <div class="daily-bars">
              <div v-for="(d, i) in dailyData" :key="i" class="daily-col">
                <div class="daily-bar-stack" :title="d.date">
                  <div class="daily-bar-seg withdrawn" :style="{ height: d.stateDistribution.withdrawn + 'px' }" />
                  <div class="daily-bar-seg confused" :style="{ height: d.stateDistribution.confused + 'px' }" />
                  <div class="daily-bar-seg engaged" :style="{ height: d.stateDistribution.engaged + 'px' }" />
                </div>
                <div class="daily-label">{{ d.date.slice(5) }}</div>
                <div v-if="d.abnormalEvents > 0" class="daily-event">{{ d.abnormalEvents }}</div>
              </div>
            </div>
            <div class="daily-legend">
              <span><span class="legend-dot engaged" /> 投入积极</span>
              <span><span class="legend-dot confused" /> 困惑思考</span>
              <span><span class="legend-dot withdrawn" /> 疲惫退缩</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PIPELINE_STAGES, DAILY_SAMPLES, AI_SYSTEM_STATS, STUDENTS, FACE_ENROLLMENT, GRADE_TREE, DETECTION_LOG } from '@/mock/data'
import GradeClassTree from '@/components/GradeClassTree.vue'

const selectedClass = ref('初一(1)班')

const classStudents = computed(() => STUDENTS.filter(s => s.className === selectedClass.value))
const enrolledCount = computed(() => classStudents.value.filter(s => FACE_ENROLLMENT[s.id]?.registered).length)

const avgClassConfidence = computed(() => {
  const logs = DETECTION_LOG.filter(e => e.studentId && classStudents.value.some(s => s.id === e.studentId))
  if (logs.length === 0) return 0
  return logs.reduce((s, e) => s + e.confidence, 0) / logs.length
})

const classCameraId = computed(() => selectedClass.value === '初一(1)班' ? 1 : 2)

const dailyData = computed(() =>
  DAILY_SAMPLES.filter(d => d.cameraId === classCameraId.value).slice(-7)
)

function faceQualityColor(q: number) {
  return q >= 0.85 ? '#22C55E' : q >= 0.7 ? '#EAB308' : '#EF4444'
}

function statusText(s: string) {
  return { ok: '正常', degraded: '降级', fault: '故障', idle: '空闲' }[s] ?? s
}
</script>

<style scoped>
.ai-page { padding: 32px; max-width: 1300px; margin: 0 auto; }
.top-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 4px; }
.page-subtitle { font-size: 13px; color: #9CA3AF; margin: 0; }
.uptime-badge { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 10px; background: #ECFDF5; font-size: 12px; font-weight: 600; color: #15803D; }
.uptime-dot { width: 6px; height: 6px; border-radius: 50%; background: #22C55E; }

.page-body { display: flex; gap: 24px; align-items: flex-start; }
.page-sidebar { width: 220px; flex-shrink: 0; background: #fff; border-radius: 16px; border: 1px solid #E2EFE7; padding: 16px; position: sticky; top: 32px; }
.sidebar-title { font-size: 13px; font-weight: 700; color: #0F172A; margin: 0 0 8px; padding-bottom: 8px; border-bottom: 1px solid #F0F7F3; }
.page-content { flex: 1; min-width: 0; }

.stats-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-bottom: 24px; }
.stat-card { background: #fff; border-radius: 14px; padding: 14px 12px; border: 1px solid #E2EFE7; display: flex; flex-direction: column; align-items: center; gap: 3px; text-align: center; }
.stat-icon { font-size: 20px; }
.stat-value { font-size: 22px; font-weight: 800; color: #0F172A; line-height: 1; }
.stat-label { font-size: 10px; color: #6B7280; font-weight: 500; }

.section-card { background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #E2EFE7; margin-bottom: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.02); }
.section-title { font-size: 15px; font-weight: 700; color: #0F172A; margin: 0 0 16px; }

/* Face Grid */
.face-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 10px; }
.face-cell { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 12px; border: 1px solid #E2EFE7; background: #FAFAFA; transition: all 0.15s; }
.face-cell.unregistered { opacity: 0.6; }
.face-cell:hover { border-color: #A7F3D0; background: #F0FDF4; }
.face-card-avatar { position: relative; width: 40px; height: 40px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.fca-char { font-size: 16px; font-weight: 700; color: #15803D; z-index: 1; }
.fca-ring { position: absolute; inset: -2px; border-radius: 50%; border: 2.5px solid; }
.face-card-info { display: flex; flex-direction: column; min-width: 0; }
.face-card-name { font-size: 13px; font-weight: 700; color: #1F2937; }
.face-card-quality { font-size: 10px; font-weight: 600; }
.face-card-quality.unreg { color: #D1D5DB; }
.face-card-updated { font-size: 10px; color: #9CA3AF; }

/* Pipeline */
.pipeline { display: flex; flex-direction: column; gap: 0; }
.pipeline-stage { display: flex; gap: 12px; }
.pipeline-node { display: flex; flex-direction: column; align-items: center; width: 24px; flex-shrink: 0; }
.pipeline-dot { width: 14px; height: 14px; border-radius: 50%; margin-top: 4px; }
.pipeline-dot.ok { background: #22C55E; }
.pipeline-dot.degraded { background: #F97316; }
.pipeline-dot.fault { background: #EF4444; }
.pipeline-dot.idle { background: #D1D5DB; }
.pipeline-connector { width: 2px; flex: 1; background: #E2EFE7; min-height: 24px; }
.pipeline-body { flex: 1; padding-bottom: 14px; }
.pipeline-header { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
.pipeline-label { font-weight: 700; font-size: 13px; color: #1F2937; }
.pipeline-status { font-size: 10px; font-weight: 600; padding: 1px 8px; border-radius: 6px; }
.pipeline-status.ok { background: #ECFDF5; color: #15803D; }
.pipeline-status.degraded { background: #FFF7ED; color: #C2410C; }
.pipeline-metrics { display: flex; gap: 16px; font-size: 11px; color: #6B7280; }
.pipeline-metrics strong { color: #1F2937; }

/* Daily Chart */
.daily-bars { display: flex; align-items: flex-end; gap: 8px; height: 180px; padding-bottom: 22px; }
.daily-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
.daily-bar-stack { width: 100%; max-width: 42px; display: flex; flex-direction: column-reverse; border-radius: 6px 6px 0 0; overflow: hidden; }
.daily-bar-seg { width: 100%; transition: height 0.3s; min-height: 2px; }
.daily-bar-seg.engaged { background: linear-gradient(180deg, #F2C94C, #EAB308); }
.daily-bar-seg.confused { background: linear-gradient(180deg, #9B9ECE, #7C3AED); }
.daily-bar-seg.withdrawn { background: linear-gradient(180deg, #BDBDBD, #6B7280); }
.daily-label { font-size: 10px; color: #9CA3AF; margin-top: 3px; }
.daily-event { font-size: 9px; color: #EF4444; font-weight: 700; }
.daily-legend { display: flex; gap: 12px; font-size: 11px; color: #4B5563; margin-top: 8px; }
.legend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 4px; }
.legend-dot.engaged { background: #EAB308; }
.legend-dot.confused { background: #7C3AED; }
.legend-dot.withdrawn { background: #6B7280; }
</style>
