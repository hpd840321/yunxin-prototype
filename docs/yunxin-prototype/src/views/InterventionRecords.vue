<template>
  <div class="records-page">
    <header class="page-header">
      <h1 class="page-title">干预记录</h1>
      <p class="page-subtitle">查看所有学生的关怀记录与再评估结果</p>
      <div class="filter-row">
        <div class="search-box">
          <input v-model="store.searchQuery" type="text" placeholder="搜索学生姓名..." class="search-input" />
        </div>
        <div class="filter-tabs">
          <button v-for="tab in tabs" :key="tab.key"
            class="tab-btn"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key">
            {{ tab.label }}
          </button>
        </div>
      </div>
    </header>

    <div class="records-list">
      <div v-for="p in filteredProfiles" :key="p.student.id" class="record-card">
        <div class="record-top">
          <div class="record-student">
            <span class="record-name">{{ store.maskMode ? p.student.name[0] + '同学' : p.student.name }}</span>
            <RiskBadge :level="p.currentLevel" :trend="p.trend" size="sm" />
            <span class="record-class">{{ p.student.className }}</span>
          </div>
          <div class="record-stats">
            <span>{{ p.interventionRecords.length }}条记录</span>
            <span v-if="p.reassessmentResult" class="reassessment" :class="p.reassessmentResult">
              {{ reassessmentLabel(p.reassessmentResult) }}
            </span>
          </div>
        </div>

        <!-- 干预记录时间线 -->
        <div v-if="p.interventionRecords.length > 0" class="timeline">
          <div v-for="r in p.interventionRecords.slice(-3).reverse()" :key="r.id" class="tl-item">
            <div class="tl-dot" :class="r.type" />
            <div class="tl-content">
              <div class="tl-header">
                <span class="tl-type">{{ typeLabel(r.type) }}</span>
                <span class="tl-date">{{ r.date }}</span>
                <span class="tl-author">{{ r.author }}</span>
              </div>
              <p class="tl-text">{{ r.content }}</p>
            </div>
          </div>
        </div>
        <div v-else class="no-records">暂无干预记录</div>

        <div class="record-actions">
          <button class="btn-link" @click="viewStudent(p.student.id)">查看完整画像</button>
        </div>
      </div>

      <div v-if="filteredProfiles.length === 0" class="empty-state">
        <p>没有找到匹配的记录</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import RiskBadge from '@/components/RiskBadge.vue'

const router = useRouter()
const store = useAppStore()

const activeTab = ref<'all' | 'attention' | 'resolved'>('all')

const tabs = [
  { key: 'all' as const, label: '全部' },
  { key: 'attention' as const, label: '需关注' },
  { key: 'resolved' as const, label: '已结案' },
]

const filteredProfiles = computed(() => {
  let list = store.allProfiles

  // 搜索过滤
  if (store.searchQuery) {
    const q = store.searchQuery.toLowerCase()
    list = list.filter(p => p.student.name.includes(q))
  }

  // Tab 过滤
  if (activeTab.value === 'attention') {
    const attentionLevels = ['yellow_red_trend', 'red', 'black']
    list = list.filter(p => attentionLevels.includes(p.currentLevel) || p.interventionRecords.length > 0)
  } else if (activeTab.value === 'resolved') {
    list = list.filter(p => p.reassessmentResult === 'recovered')
  }

  // 按风险等级排序
  return list.sort((a, b) => {
    const order = ['black', 'red', 'yellow_red_trend', 'yellow', 'green_yellow_trend', 'green']
    return order.indexOf(a.currentLevel) - order.indexOf(b.currentLevel)
  })
})

function typeLabel(t: string) {
  const map: Record<string, string> = { observation: '观察记录', communication: '沟通记录', activity: '活动记录', referral: '转介记录' }
  return map[t] ?? t
}
function reassessmentResult(r: string) {
  const map: Record<string, string> = { recovered: '已恢复', maintained: '维持观察', worsened: '继续恶化' }
  return map[r] ?? r
}
function reassessmentLabel(r: string) {
  return reassessmentResult(r)
}

function viewStudent(id: number) {
  store.selectStudent(id)
  router.push(`/student/${id}`)
}
</script>

<style scoped>
.records-page { padding: 32px; max-width: 900px; margin: 0 auto; }
.page-title { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 4px; }
.page-subtitle { font-size: 14px; color: #6B7280; margin: 0 0 20px; }

.filter-row { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
.search-box { flex: 1; min-width: 200px; }
.search-input {
  width: 100%;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1.5px solid #E2EFE7;
  background: #fff;
  font-size: 14px;
  color: #1F2937;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.search-input:focus { border-color: #15803D; }
.filter-tabs { display: flex; gap: 4px; background: #F3F4F6; padding: 3px; border-radius: 10px; }
.tab-btn { padding: 6px 14px; border: none; border-radius: 8px; background: transparent; font-size: 13px; font-weight: 600; color: #6B7280; cursor: pointer; transition: all 0.15s; }
.tab-btn.active { background: #fff; color: #15803D; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

.records-list { display: flex; flex-direction: column; gap: 16px; margin-top: 20px; }
.record-card { background: #fff; border-radius: 16px; padding: 20px; border: 1px solid #E2EFE7; box-shadow: 0 1px 4px rgba(0,0,0,0.02); }
.record-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.record-student { display: flex; align-items: center; gap: 8px; }
.record-name { font-weight: 700; font-size: 15px; color: #1F2937; }
.record-class { font-size: 12px; color: #9CA3AF; }
.record-stats { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #9CA3AF; }
.reassessment { padding: 2px 8px; border-radius: 6px; font-weight: 600; font-size: 11px; }
.reassessment.recovered { background: #ECFDF5; color: #15803D; }
.reassessment.maintained { background: #FEFCE8; color: #A16207; }
.reassessment.worsened { background: #FEF2F2; color: #DC2626; }

.timeline { padding-left: 12px; margin-bottom: 12px; }
.tl-item { display: flex; gap: 10px; position: relative; padding: 4px 0; }
.tl-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
.tl-dot.observation { background: #3B82F6; }
.tl-dot.communication { background: #EAB308; }
.tl-dot.activity { background: #22C55E; }
.tl-dot.referral { background: #EF4444; }
.tl-header { display: flex; gap: 8px; margin-bottom: 2px; }
.tl-type { font-size: 12px; font-weight: 600; color: #1F2937; }
.tl-date, .tl-author { font-size: 11px; color: #9CA3AF; }
.tl-text { margin: 0; font-size: 13px; color: #4B5563; line-height: 1.5; }
.no-records { color: #D1D5DB; font-size: 13px; padding: 8px 0; }

.record-actions { border-top: 1px solid #F0F7F3; padding-top: 12px; }
.btn-link { border: none; background: none; color: #15803D; font-weight: 600; font-size: 13px; cursor: pointer; padding: 4px 8px; border-radius: 6px; transition: all 0.15s; }
.btn-link:hover { background: #ECFDF5; }
.empty-state { text-align: center; padding: 48px; color: #9CA3AF; }
</style>
