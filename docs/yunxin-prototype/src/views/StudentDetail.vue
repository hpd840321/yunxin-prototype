<template>
  <div class="detail-page" v-if="profile">
    <!-- 顶栏 -->
    <header class="detail-header">
      <button class="btn-back" @click="$router.back()">← 返回</button>
      <div class="header-info">
        <h1 class="student-name">{{ displayName }}</h1>
        <div class="header-tags">
          <RiskBadge :level="profile.currentLevel" :trend="profile.trend" size="md" />
          <span class="class-tag">{{ profile.student.className }}</span>
          <span class="gender-tag">{{ profile.student.gender === 'male' ? '男' : '女' }}</span>
        </div>
      </div>
      <div class="header-week">第25周 · 2026.06.15 - 06.21</div>
    </header>

    <div class="detail-grid">
      <!-- 左侧：核心指标 -->
      <div class="detail-left">
        <!-- 核心指标卡片 -->
        <section class="section-card">
          <h2 class="section-title">核心指标</h2>
          <div class="kpi-grid">
            <div class="kpi-item" :class="{ high: profile.metrics.W_Ratio >= 30 }">
              <span class="kpi-value">{{ profile.metrics.W_Ratio }}%</span>
              <span class="kpi-label">周异常占比 W_Ratio</span>
              <span class="kpi-baseline">基线: {{ profile.baseline.B_Ratio }}%</span>
            </div>
            <div class="kpi-item">
              <span class="kpi-value">{{ profile.metrics.W_Event_1 }}</span>
              <span class="kpi-label">异常事件次数 W_Event_1</span>
              <span class="kpi-baseline">基线: {{ profile.baseline.B_Event_Rate }}%/周</span>
            </div>
            <div class="kpi-item" :class="{ high: profile.metrics.Consecutive_Days >= 3 }">
              <span class="kpi-value">{{ profile.metrics.Consecutive_Days }}天</span>
              <span class="kpi-label">连续异常天数</span>
            </div>
            <div class="kpi-item">
              <span class="kpi-value">{{ profile.metrics.W_Total }}</span>
              <span class="kpi-label">周有效采样数 W_Total</span>
            </div>
            <div class="kpi-item">
              <span class="kpi-value">{{ profile.metrics.W_Event_Rate }}%</span>
              <span class="kpi-label">事件率 W_Event_Rate</span>
            </div>
            <div class="kpi-item">
              <span class="kpi-value" :class="{ high: profile.metrics.Peak_Day_Flag }">{{ profile.metrics.Peak_Day_Flag ? '是' : '否' }}</span>
              <span class="kpi-label">峰值日标记</span>
            </div>
          </div>
        </section>

        <!-- 本周状态分布 -->
        <section class="section-card">
          <h2 class="section-title">本周状态分布</h2>
          <div class="dist-bar">
            <div class="dist-segment good" :style="{ flex: profile.metrics.W_Good }" title="正向状态">
              <span v-if="profile.metrics.W_Good > 200">正向 {{ profile.metrics.W_Good }}</span>
            </div>
            <div class="dist-segment neutral" :style="{ flex: profile.metrics.W_Neutral }" title="中性状态">
              <span v-if="profile.metrics.W_Neutral > 200">中性 {{ profile.metrics.W_Neutral }}</span>
            </div>
            <div class="dist-segment abnormal" :style="{ flex: profile.metrics.W_Abnormal_2 }" title="异常状态">
              <span v-if="profile.metrics.W_Abnormal_2 > 100" class="abnormal-text">异常 {{ profile.metrics.W_Abnormal_2 }}</span>
            </div>
          </div>
          <div class="dist-legend">
            <span><span class="dot good"></span> 正向 {{ percent(profile.metrics.W_Good) }}%</span>
            <span><span class="dot neutral"></span> 中性 {{ percent(profile.metrics.W_Neutral) }}%</span>
            <span><span class="dot abnormal"></span> 异常 {{ percent(profile.metrics.W_Abnormal_2) }}%</span>
          </div>
        </section>

        <!-- 干预记录 -->
        <section class="section-card">
          <h2 class="section-title">干预记录</h2>
          <div v-if="profile.interventionRecords.length > 0" class="record-timeline">
            <div v-for="r in profile.interventionRecords" :key="r.id" class="record-item">
              <div class="record-dot" :class="r.type" />
              <div class="record-content">
                <div class="record-header">
                  <span class="record-type">{{ typeLabel(r.type) }}</span>
                  <span class="record-date">{{ r.date }}</span>
                  <span class="record-author">{{ r.author }}</span>
                </div>
                <p class="record-text">{{ r.content }}</p>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">暂无干预记录</div>
        </section>
      </div>

      <!-- 右侧：趋势图 + 基线对比 + 建议 -->
      <div class="detail-right">
        <!-- 多周趋势 -->
        <section class="section-card">
          <h2 class="section-title">多周趋势</h2>
          <WeeklyTrendChart
            :labels="weeklyLabels"
            :w-ratio="weeklyRatios"
            :b-ratio="profile.baseline.B_Ratio"
            :w-event-rate="weeklyEventRates"
          />
          <div class="threshold-legend">
            <span class="legend-line" style="borderColor: #EAB308">15% 黄色阈值</span>
            <span class="legend-line" style="borderColor: #EF4444">30% 红色阈值</span>
            <span class="legend-line" style="borderColor: #1F2937">50% 黑色阈值</span>
          </div>
        </section>

        <!-- 个体基线对比 -->
        <section class="section-card">
          <h2 class="section-title">个体基线对比</h2>
          <div class="compare-grid">
            <div class="compare-item">
              <span class="compare-label">当前 W_Ratio</span>
              <span class="compare-value" :class="{ high: profile.metrics.W_Ratio >= 30 }">{{ profile.metrics.W_Ratio }}%</span>
              <span class="compare-vs">基线 B_Ratio: {{ profile.baseline.B_Ratio }}%</span>
              <span class="compare-diff" :class="diffClass(profile.metrics.W_Ratio, profile.baseline.B_Ratio)">
                {{ diffText(profile.metrics.W_Ratio, profile.baseline.B_Ratio) }}
              </span>
            </div>
            <div class="compare-item">
              <span class="compare-label">当前 W_Event_Rate</span>
              <span class="compare-value">{{ profile.metrics.W_Event_Rate }}%</span>
              <span class="compare-vs">基线 B_Event_Rate: {{ profile.baseline.B_Event_Rate }}%</span>
              <span class="compare-diff" :class="diffClass(profile.metrics.W_Event_Rate, profile.baseline.B_Event_Rate)">
                {{ diffText(profile.metrics.W_Event_Rate, profile.baseline.B_Event_Rate) }}
              </span>
            </div>
          </div>
        </section>

        <!-- 干预建议 -->
        <section class="section-card suggestion">
          <h2 class="section-title">干预建议</h2>
          <div class="suggestion-level" :style="{ background: levelBg }">
            <strong>当前等级：{{ levelLabel }}</strong>
            <p>{{ suggestionText }}</p>
          </div>
          <div class="suggested-actions">
            <div v-for="(act, i) in suggestedActions" :key="i" class="action-item">
              <span class="action-num">{{ i + 1 }}</span>
              <span>{{ act }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
  <div v-else class="not-found">
    <p>未找到该学生信息</p>
    <button class="btn-back" @click="$router.push('/dashboard')">返回概览</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { RISK_LEVEL_LABELS, RISK_LEVEL_COLORS } from '@/types'
import RiskBadge from '@/components/RiskBadge.vue'
import WeeklyTrendChart from '@/components/WeeklyTrendChart.vue'

const route = useRoute()
const router = useRouter()
const store = useAppStore()

const studentId = computed(() => Number(route.params.id))
const profile = computed(() => store.allProfiles.find(p => p.student.id === studentId.value) ?? null)

const displayName = computed(() => {
  if (!profile.value) return ''
  return store.maskMode ? profile.value.student.name[0] + '同学' : profile.value.student.name
})

const weeklyLabels = computed(() => profile.value?.weeklyHistory.map(w => w.weekLabel) ?? [])
const weeklyRatios = computed(() => profile.value?.weeklyHistory.map(w => w.W_Ratio) ?? [])
const weeklyEventRates = computed(() => profile.value?.weeklyHistory.map(w => w.W_Event_Rate) ?? [])

const levelLabel = computed(() => profile.value ? RISK_LEVEL_LABELS[profile.value.currentLevel] : '')
const levelBg = computed(() => {
  if (!profile.value) return '#F0FDF4'
  return `color-mix(in srgb, ${RISK_LEVEL_COLORS[profile.value.currentLevel]} 12%, #F0FDF4)`
})

const suggestionText = computed(() => {
  if (!profile.value) return ''
  const level = profile.value.currentLevel
  if (level === 'black') return '高风险预警。异常状态已在一周内成为主导状态，系统应直接进入高风险预警和专业转介准备。'
  if (level === 'red') return '异常状态已超出普通波动范围，呈现较明显的持续性和较高强度，需要重点关注和准备专业介入。'
  if (level === 'yellow_red_trend') return '比黄色阶段更密集地观察，家长与学校建立明确的周反馈机制，优先安排系统内轻干预资源。'
  if (level === 'yellow') return '开始出现轻度但值得关注的波动。建议家长带孩子进行轻量活动释放，学校心理老师同步观察。'
  if (level === 'green_yellow_trend') return '存在轻微上升趋势，但尚未确认。建议家长增加陪伴与观察，注意孩子作息和社交变化。'
  return '当前状态良好，建议继续保持规律作息和家校沟通。'
})

const suggestedActions = computed(() => {
  if (!profile.value) return []
  const level = profile.value.currentLevel
  if (level === 'black') return ['立即通知家长，说明当前属于高风险预警', '建议进入专业评估（医院/合作机构/自有团队）', '记录转介结果并跟踪后续反馈']
  if (level === 'red') return ['启动高强度第二阶段验证', '家长必须收到明确提示', '学校心理老师介入判断', '准备第三阶段专业资源转介']
  if (level === 'yellow_red_trend') return ['更密集地观察学生状态', '家长与学校建立明确的周反馈机制', '优先安排系统内轻干预资源', '做下一周期重点追踪']
  if (level === 'yellow') return ['家长带孩子进行轻量活动释放', '可进入配备心理咨询师的运动场馆活动', '学校心理老师或班主任同步观察', '增强家校沟通']
  if (level === 'green_yellow_trend') return ['家长增加陪伴与观察', '注意孩子作息、活动、社交变化', '不进入正式心理咨询', '学校端可做轻量关注']
  return ['保持常规关注', '维持正常家校沟通']
})

function percent(v: number) {
  if (!profile.value) return '0'
  return (v / profile.value.metrics.W_Total * 100).toFixed(1)
}
function typeLabel(t: string) {
  const map: Record<string, string> = { observation: '观察记录', communication: '沟通记录', activity: '活动记录', referral: '转介记录' }
  return map[t] ?? t
}
function diffClass(current: number, baseline: number) {
  const diff = current - baseline
  if (diff >= 10) return 'diff-bad'
  if (diff >= 5) return 'diff-warn'
  return 'diff-good'
}
function diffText(current: number, baseline: number) {
  const diff = current - baseline
  if (diff > 0) return `高于基线 ${diff.toFixed(1)} 个百分点`
  if (diff < 0) return `低于基线 ${Math.abs(diff).toFixed(1)} 个百分点`
  return '与基线持平'
}
</script>

<style scoped>
.detail-page { padding: 32px; max-width: 1200px; margin: 0 auto; }
.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.btn-back {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1.5px solid #E2EFE7;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #4B5563;
  transition: all 0.15s;
}
.btn-back:hover { border-color: #15803D; color: #15803D; }
.header-info { flex: 1; }
.student-name { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 6px; }
.header-tags { display: flex; align-items: center; gap: 8px; }
.class-tag, .gender-tag { font-size: 12px; color: #6B7280; background: #F3F4F6; padding: 2px 10px; border-radius: 6px; }
.header-week { font-size: 13px; color: #9CA3AF; }

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.detail-left, .detail-right { display: flex; flex-direction: column; gap: 24px; }

.section-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #E2EFE7;
  box-shadow: 0 1px 4px rgba(0,0,0,0.02);
}
.section-title { font-size: 16px; font-weight: 700; color: #0F172A; margin: 0 0 16px; }

.kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.kpi-item {
  background: #F9FAFB;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.kpi-item.high { background: #FEF2F2; }
.kpi-value { font-size: 28px; font-weight: 800; color: #1F2937; line-height: 1; }
.kpi-value.high { color: #EF4444; }
.kpi-label { font-size: 12px; color: #6B7280; }
.kpi-baseline { font-size: 11px; color: #9CA3AF; }

.dist-bar { display: flex; height: 32px; border-radius: 8px; overflow: hidden; margin-bottom: 8px; }
.dist-segment { display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: #fff; transition: all 0.2s; min-width: fit-content; padding: 0 4px; }
.dist-segment.good { background: linear-gradient(135deg, #22C55E, #16A34A); }
.dist-segment.neutral { background: linear-gradient(135deg, #9CA3AF, #6B7280); }
.dist-segment.abnormal { background: linear-gradient(135deg, #EF4444, #DC2626); }
.abnormal-text { color: #fff; }
.dist-legend { display: flex; gap: 20px; font-size: 12px; color: #4B5563; }
.dist-legend .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; }
.dist-legend .dot.good { background: #22C55E; }
.dist-legend .dot.neutral { background: #9CA3AF; }
.dist-legend .dot.abnormal { background: #EF4444; }

.record-timeline { display: flex; flex-direction: column; gap: 12px; }
.record-item { display: flex; gap: 12px; position: relative; padding-left: 8px; }
.record-item::before { content: ''; position: absolute; left: 11px; top: 20px; bottom: -12px; width: 2px; background: #E2EFE7; }
.record-item:last-child::before { display: none; }
.record-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
.record-dot.observation { background: #3B82F6; }
.record-dot.communication { background: #EAB308; }
.record-dot.activity { background: #22C55E; }
.record-dot.referral { background: #EF4444; }
.record-content { flex: 1; }
.record-header { display: flex; gap: 8px; align-items: center; margin-bottom: 4px; }
.record-type { font-size: 12px; font-weight: 700; color: #1F2937; }
.record-date { font-size: 11px; color: #9CA3AF; }
.record-author { font-size: 11px; color: #6B7280; }
.record-text { font-size: 13px; color: #4B5563; margin: 0; line-height: 1.5; }

.threshold-legend { display: flex; gap: 16px; margin-top: 8px; font-size: 11px; color: #6B7280; }
.legend-line { border-bottom: 2px dashed; padding-bottom: 2px; }

.compare-grid { display: flex; flex-direction: column; gap: 16px; }
.compare-item { background: #F9FAFB; border-radius: 12px; padding: 16px; }
.compare-label { font-size: 12px; color: #6B7280; display: block; margin-bottom: 4px; }
.compare-value { font-size: 24px; font-weight: 800; color: #1F2937; display: block; }
.compare-value.high { color: #EF4444; }
.compare-vs { font-size: 12px; color: #9CA3AF; display: block; margin-top: 2px; }
.compare-diff { font-size: 13px; font-weight: 600; display: block; margin-top: 4px; }
.compare-diff.diff-good { color: #22C55E; }
.compare-diff.diff-warn { color: #EAB308; }
.compare-diff.diff-bad { color: #EF4444; }

.suggestion .suggestion-level { border-radius: 12px; padding: 12px 16px; margin-bottom: 12px; }
.suggestion .suggestion-level strong { font-size: 14px; }
.suggestion .suggestion-level p { font-size: 13px; margin: 6px 0 0; line-height: 1.5; color: #4B5563; }
.suggested-actions { display: flex; flex-direction: column; gap: 8px; }
.action-item { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #4B5563; padding: 8px 12px; background: #F9FAFB; border-radius: 8px; }
.action-num { width: 20px; height: 20px; border-radius: 50%; background: #15803D; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
.empty-state { color: #9CA3AF; font-size: 14px; text-align: center; padding: 24px; }
.not-found { text-align: center; padding: 64px; color: #9CA3AF; }
.not-found .btn-back { margin-top: 16px; }
</style>
