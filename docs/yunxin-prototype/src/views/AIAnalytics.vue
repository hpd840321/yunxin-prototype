<template>
  <div class="ai-page">
    <header class="top-bar">
      <div>
        <h1 class="page-title">AI 推理分析</h1>
        <p class="page-subtitle">AI 推理流水线状态 · 日采样数据 · 置信度与性能监控</p>
      </div>
      <div class="uptime-badge">
        <span class="uptime-dot" /> 系统运行: {{ AI_SYSTEM_STATS.pipelineUptime }}%
      </div>
    </header>

    <!-- 顶部状态卡片 -->
    <section class="stats-row">
      <div class="stat-card">
        <span class="stat-icon">📷</span>
        <span class="stat-value">{{ (AI_SYSTEM_STATS.todayTotalDetections / 1000).toFixed(1) }}k</span>
        <span class="stat-label">今日检测帧</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">👤</span>
        <span class="stat-value">{{ AI_SYSTEM_STATS.todayRecognizedFaces }}</span>
        <span class="stat-label">今日识别人脸</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">🎯</span>
        <span class="stat-value">{{ (AI_SYSTEM_STATS.avgConfidence * 100).toFixed(0) }}%</span>
        <span class="stat-label">平均置信度</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">⚡</span>
        <span class="stat-value">{{ AI_SYSTEM_STATS.p95Latency }}ms</span>
        <span class="stat-label">P95 延迟</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">📊</span>
        <span class="stat-value">{{ AI_SYSTEM_STATS.queueDepth }}</span>
        <span class="stat-label">排队待处理</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">🔴</span>
        <span class="stat-value" style="color:#EF4444">{{ AI_SYSTEM_STATS.system1EventCount }}</span>
        <span class="stat-label">系统1事件</span>
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
              <span>处理: <strong>{{ stage.processed.toLocaleString() }}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 日采样趋势 -->
    <section class="section-card">
      <h2 class="section-title">本周日采样趋势</h2>
      <div class="daily-chart">
        <div class="daily-bars">
          <div v-for="(d, i) in dailyData" :key="d.date" class="daily-col">
            <div class="daily-bar-stack" :title="d.date + ' - 有效: ' + d.validSamples + ', 异常事件: ' + d.abnormalEvents">
              <div class="daily-bar-seg withdrawn" :style="{ height: d.stateDistribution.withdrawn + 'px' }" />
              <div class="daily-bar-seg confused" :style="{ height: d.stateDistribution.confused + 'px' }" />
              <div class="daily-bar-seg engaged" :style="{ height: d.stateDistribution.engaged + 'px' }" />
            </div>
            <div class="daily-label">{{ d.date.slice(5) }}</div>
            <div v-if="d.abnormalEvents > 0" class="daily-event-badge">{{ d.abnormalEvents }}次</div>
          </div>
        </div>
        <div class="daily-legend">
          <span><span class="legend-dot engaged" /> 投入积极</span>
          <span><span class="legend-dot confused" /> 困惑思考</span>
          <span><span class="legend-dot withdrawn" /> 疲惫退缩</span>
        </div>
      </div>
    </section>

    <!-- 系统对比：系统1 vs 系统2 -->
    <section class="section-card">
      <h2 class="section-title">双系统分析对比</h2>
      <div class="dual-system">
        <div class="sys-panel sys1">
          <h3 class="sys-title">系统1：实时筛查</h3>
          <div class="sys-stats">
            <div><span class="sys-stat-val">{{ AI_SYSTEM_STATS.system1EventCount }}</span> 今日异常事件</div>
            <div><span class="sys-stat-val">低</span> 准确率</div>
            <div><span class="sys-stat-val">实时</span> 延迟</div>
          </div>
          <p class="sys-desc">快速捕捉课堂上的突发异常表情事件，适合统计"异常发生了几次"</p>
        </div>
        <div class="sys-panel sys2">
          <h3 class="sys-title">系统2：延迟分析</h3>
          <div class="sys-stats">
            <div><span class="sys-stat-val">{{ AI_SYSTEM_STATS.system2SampleCount }}</span> 今日采样数</div>
            <div><span class="sys-stat-val">高</span> 准确率</div>
            <div><span class="sys-stat-val">10min~半天</span> 延迟</div>
          </div>
          <p class="sys-desc">全天高频采样（300-400次/日×人），后端批量分析，适合计算"异常在整体中占多少"</p>
        </div>
      </div>
    </section>

    <!-- 班级情绪分布 -->
    <section class="section-card">
      <h2 class="section-title">各班级今日情绪分布</h2>
      <div class="class-emotions">
        <div v-for="cls in classEmotions" :key="cls.name" class="class-emotion-row">
          <span class="ce-name">{{ cls.name }}</span>
          <div class="ce-bar">
            <div v-for="e in cls.dist" :key="e.key" class="ce-seg" :style="{ flex: e.val, background: e.color }" :title="e.label + ' ' + e.percent + '%'" />
          </div>
          <span class="ce-top">{{ cls.dist[0].label }} {{ cls.dist[0].percent }}%</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PIPELINE_STAGES, DAILY_SAMPLES, AI_SYSTEM_STATS } from '@/mock/data'
import { RAW_EMOTIONS } from '@/types'

const dailyData = computed(() => DAILY_SAMPLES.filter(d => d.cameraId === 1).slice(-7))

const classEmotions = computed(() => {
  const class1 = DAILY_SAMPLES.filter(d => d.cameraId === 1).slice(-5)
  const class2 = DAILY_SAMPLES.filter(d => d.cameraId === 3).slice(-5)

  function calcDist(samples: typeof DAILY_SAMPLES) {
    const merged: Record<string, number> = {}
    for (const d of samples) {
      for (const k of ['happy', 'neutral', 'surprise', 'sad', 'angry', 'disgust', 'fear'] as const) {
        merged[k] = (merged[k] ?? 0) + d.emotionDistribution[k]
      }
    }
    const total = Object.values(merged).reduce((s, v) => s + v, 0)
    return RAW_EMOTIONS.map(e => ({
      key: e.key,
      label: e.label,
      color: e.color,
      val: (merged[e.key] ?? 0) / total,
      percent: +((merged[e.key] ?? 0) / total * 100).toFixed(1),
    })).sort((a, b) => b.val - a.val)
  }

  return [
    { name: '初一(1)班', dist: calcDist(class1) },
    { name: '初一(2)班', dist: calcDist(class2) },
  ]
})

function statusText(s: string) {
  return { ok: '正常', degraded: '降级', fault: '故障', idle: '空闲' }[s] ?? s
}
</script>

<style scoped>
.ai-page { padding: 32px; max-width: 1200px; margin: 0 auto; }
.top-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 4px; }
.page-subtitle { font-size: 13px; color: #9CA3AF; margin: 0; }
.uptime-badge { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 10px; background: #ECFDF5; font-size: 12px; font-weight: 600; color: #15803D; }
.uptime-dot { width: 6px; height: 6px; border-radius: 50%; background: #22C55E; }

/* Stats */
.stats-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; margin-bottom: 24px; }
.stat-card { background: #fff; border-radius: 16px; padding: 18px; border: 1px solid #E2EFE7; display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center; }
.stat-icon { font-size: 24px; }
.stat-value { font-size: 26px; font-weight: 800; color: #0F172A; line-height: 1; }
.stat-label { font-size: 11px; color: #6B7280; font-weight: 500; }

/* Pipeline */
.section-card { background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #E2EFE7; margin-bottom: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.02); }
.section-title { font-size: 16px; font-weight: 700; color: #0F172A; margin: 0 0 16px; }
.pipeline { display: flex; flex-direction: column; gap: 0; }
.pipeline-stage { display: flex; gap: 12px; }
.pipeline-node { display: flex; flex-direction: column; align-items: center; width: 24px; flex-shrink: 0; }
.pipeline-dot { width: 14px; height: 14px; border-radius: 50%; margin-top: 4px; }
.pipeline-dot.ok { background: #22C55E; }
.pipeline-dot.degraded { background: #F97316; }
.pipeline-dot.fault { background: #EF4444; }
.pipeline-dot.idle { background: #D1D5DB; }
.pipeline-connector { width: 2px; flex: 1; background: #E2EFE7; min-height: 24px; }
.pipeline-body { flex: 1; padding-bottom: 16px; }
.pipeline-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.pipeline-label { font-weight: 700; font-size: 14px; color: #1F2937; }
.pipeline-status { font-size: 11px; font-weight: 600; padding: 1px 8px; border-radius: 6px; }
.pipeline-status.ok { background: #ECFDF5; color: #15803D; }
.pipeline-status.degraded { background: #FFF7ED; color: #C2410C; }
.pipeline-status.fault { background: #FEF2F2; color: #DC2626; }
.pipeline-metrics { display: flex; gap: 16px; font-size: 12px; color: #6B7280; }
.pipeline-metrics strong { color: #1F2937; }

/* Daily Chart */
.daily-chart { }
.daily-bars { display: flex; align-items: flex-end; gap: 8px; height: 200px; padding-bottom: 24px; position: relative; }
.daily-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
.daily-bar-stack { width: 100%; max-width: 48px; display: flex; flex-direction: column-reverse; border-radius: 6px 6px 0 0; overflow: hidden; }
.daily-bar-seg { width: 100%; transition: height 0.3s; min-height: 2px; }
.daily-bar-seg.engaged { background: linear-gradient(180deg, #F2C94C, #EAB308); }
.daily-bar-seg.confused { background: linear-gradient(180deg, #9B9ECE, #7C3AED); }
.daily-bar-seg.withdrawn { background: linear-gradient(180deg, #BDBDBD, #6B7280); }
.daily-label { font-size: 10px; color: #9CA3AF; margin-top: 4px; }
.daily-event-badge { font-size: 9px; color: #EF4444; font-weight: 700; margin-top: 2px; }
.daily-legend { display: flex; gap: 16px; font-size: 12px; color: #4B5563; margin-top: 8px; }
.legend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 4px; }
.legend-dot.engaged { background: #EAB308; }
.legend-dot.confused { background: #7C3AED; }
.legend-dot.withdrawn { background: #6B7280; }

/* Dual System */
.dual-system { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.sys-panel { border-radius: 12px; padding: 20px; border: 1px solid #E2EFE7; }
.sys-panel.sys1 { background: #FFFBEB; }
.sys-panel.sys2 { background: #ECFDF5; }
.sys-title { font-size: 15px; font-weight: 700; margin: 0 0 12px; color: #1F2937; }
.sys-stats { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; font-size: 13px; color: #4B5563; }
.sys-stat-val { font-weight: 800; color: #1F2937; margin-right: 4px; }
.sys-desc { font-size: 12px; color: #6B7280; line-height: 1.6; margin: 0; }

/* Class Emotions */
.class-emotions { display: flex; flex-direction: column; gap: 12px; }
.class-emotion-row { display: flex; align-items: center; gap: 12px; }
.ce-name { width: 80px; font-size: 13px; font-weight: 600; color: #1F2937; flex-shrink: 0; }
.ce-bar { flex: 1; display: flex; height: 24px; border-radius: 6px; overflow: hidden; }
.ce-seg { transition: all 0.2s; min-width: 4px; }
.ce-top { width: 80px; font-size: 11px; color: #6B7280; text-align: right; flex-shrink: 0; }
</style>
