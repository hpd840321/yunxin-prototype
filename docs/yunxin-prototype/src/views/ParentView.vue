<template>
  <div class="parent-page">
    <!-- 顶栏 - 去诊断化设计 -->
    <header class="parent-header">
      <div class="header-content">
        <h1 class="page-title">子女状态</h1>
        <p class="page-subtitle">了解一下孩子最近一周的情况</p>
      </div>
    </header>

    <div class="parent-grid" v-if="store.parentProfiles.length > 0">
      <div v-for="p in store.parentProfiles" :key="p.student.id" class="parent-card" :style="{ borderTopColor: RISK_LEVEL_COLORS[p.currentLevel] }">
        <!-- 第一行：状态概览 - 用温和的语言 -->
        <div class="state-section">
          <div class="child-avatar">{{ p.student.name[0] }}</div>
          <div class="state-text">
            <h2 class="child-name">{{ p.student.name }}</h2>
            <p class="child-class">{{ p.student.className }}</p>
            <div class="state-summary">
              <span class="state-badge" :style="{ background: levelBg(p.currentLevel), color: RISK_LEVEL_COLORS[p.currentLevel], borderColor: RISK_LEVEL_COLORS[p.currentLevel] }">
                {{ gentleLabel(p.currentLevel) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 第二行：趋势说明 - 温和的文案 -->
        <section class="info-block">
          <h3 class="block-title">本周状态</h3>
          <p class="block-desc">{{ gentleDescription(p) }}</p>
        </section>

        <!-- 第三行：建议动作 (Section 4.3: 展示动作而非数据) -->
        <section class="info-block">
          <h3 class="block-title">建议</h3>
          <div class="action-list">
            <div v-for="(act, i) in gentleActions(p.currentLevel)" :key="i" class="action-item">
              <div class="action-icon" :style="{ background: RISK_LEVEL_COLORS[p.currentLevel] }">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span class="action-text">{{ act }}</span>
            </div>
          </div>
        </section>

        <!-- 第四行：协同入口 -->
        <button class="coop-btn" @click="viewStudent(p.student.id)">
          与班主任沟通
        </button>
      </div>
    </div>

    <!-- 无子女时的空态 -->
    <div v-else class="empty-state">
      <p>暂无关联子女信息</p>
    </div>

    <!-- 底部说明 -->
    <p class="footer-note">云心系统 · 不做诊断只做预警 · 如有担忧请联系班主任或学校心理老师</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { RISK_LEVEL_COLORS, RISK_LEVEL_LABELS } from '@/types'
import type { RiskLevel, StudentRiskProfile } from '@/types'

const router = useRouter()
const store = useAppStore()

function gentleLabel(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    green: '状态良好',
    green_yellow_trend: '有些波动',
    yellow: '需要关注',
    yellow_red_trend: '需要更多关注',
    red: '建议留意',
    black: '建议及时沟通',
  }
  return map[level]
}

function gentleDescription(p: StudentRiskProfile): string {
  const level = p.currentLevel
  const name = store.maskMode ? p.student.name[0] + '同学' : p.student.name

  if (level === 'black') return `${name}最近一周情绪波动较大，表现出持续的疲惫和低落状态，建议您与孩子耐心沟通，必要时可联系我们寻求专业建议。`
  if (level === 'red') return `${name}最近一周出现了一些值得留意的变化，建议您增加陪伴时间，多关注孩子的情绪状态。`
  if (level === 'yellow_red_trend') return `我们观察到${name}最近有持续的变化趋势，建议您与班主任保持沟通，共同关注孩子的情况。`
  if (level === 'yellow') return `${name}最近一周的状态有些轻微波动，这种情况在成长中比较常见，建议您多和孩子聊聊天，了解最近在学校的情况。`
  if (level === 'green_yellow_trend') return `${name}最近有一些细微的变化，建议您留意孩子的作息和情绪，多些陪伴和关心。`
  return `${name}最近一周的整体状态不错，继续保持良好的生活节奏和沟通习惯就好。`
}

function gentleActions(level: RiskLevel): string[] {
  const map: Record<RiskLevel, string[]> = {
    green: ['继续保持现有的沟通习惯', '关注孩子的作息和饮食'],
    green_yellow_trend: ['多和孩子聊聊学校里的趣事', '注意观察每天的回家情绪', '保证充足的睡眠和户外活动'],
    yellow: ['增加与孩子的交流时间', '可以带孩子进行户外运动或兴趣活动', '如需帮助，可联系班主任了解校内情况'],
    yellow_red_trend: ['与班主任建立周反馈机制', '增加亲子陪伴时间', '关注孩子的社交变化', '必要时可安排系统的轻量活动'],
    red: ['请您近期多关注孩子的状态变化', '建议与班主任和心理老师沟通', '学校已启动关注流程，我们会与您保持联系'],
    black: ['请及时与孩子进行一次坦诚的沟通', '建议联系学校心理老师获取专业建议', '必要时可带往专业机构进行进一步评估'],
  }
  return map[level]
}

function levelBg(level: RiskLevel) {
  return `color-mix(in srgb, ${RISK_LEVEL_COLORS[level]} 12%, white)`
}

function viewStudent(id: number) {
  store.selectStudent(id)
  router.push(`/student/${id}`)
}
</script>

<style scoped>
.parent-page {
  padding: 32px;
  max-width: 700px;
  margin: 0 auto;
}
.parent-header {
  margin-bottom: 24px;
}
.page-title { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 4px; }
.page-subtitle { font-size: 14px; color: #6B7280; margin: 0; }

.parent-grid { display: flex; flex-direction: column; gap: 20px; }
.parent-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #E2EFE7;
  border-top-width: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.state-section { display: flex; gap: 16px; margin-bottom: 20px; }
.child-avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #15803D, #059669); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; flex-shrink: 0; }
.child-name { font-size: 18px; font-weight: 700; color: #0F172A; margin: 0 0 2px; }
.child-class { font-size: 13px; color: #9CA3AF; margin: 0 0 8px; }
.state-summary { display: flex; gap: 6px; }
.state-badge { padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; border: 1.5px solid; }

.info-block { margin-bottom: 16px; }
.block-title { font-size: 14px; font-weight: 700; color: #1F2937; margin: 0 0 6px; }
.block-desc { font-size: 14px; color: #4B5563; line-height: 1.7; margin: 0; }

.action-list { display: flex; flex-direction: column; gap: 8px; }
.action-item { display: flex; align-items: center; gap: 12px; }
.action-icon { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.action-text { font-size: 14px; color: #4B5563; line-height: 1.5; }

.coop-btn {
  width: 100%;
  padding: 12px;
  border-radius: 14px;
  border: 1.5px solid #15803D;
  background: #fff;
  color: #15803D;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.coop-btn:hover { background: #F0FDF4; }

.footer-note { text-align: center; font-size: 12px; color: #9CA3AF; margin-top: 32px; padding-top: 16px; border-top: 1px solid #E2EFE7; }
.empty-state { text-align: center; padding: 48px; color: #9CA3AF; }
</style>
