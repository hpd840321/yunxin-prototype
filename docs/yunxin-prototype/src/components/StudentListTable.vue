<template>
  <div class="table-wrapper">
    <table class="student-table">
      <thead>
        <tr>
          <th>姓名</th>
          <th>班级</th>
          <th>当前等级</th>
          <th>W_Ratio</th>
          <th>W_Event_Rate</th>
          <th>连续异常</th>
          <th>峰值日</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in profiles" :key="p.student.id"
          :class="{ 'clickable': true, 'selected': selectedId === p.student.id }"
          @click="$emit('select', p.student.id)">
          <td>
            <div class="student-cell">
              <span class="avatar">{{ p.student.name[0] }}</span>
              <span>{{ desensitize(p.student.name) }}</span>
            </div>
          </td>
          <td>{{ p.student.className }}</td>
          <td>
            <RiskBadge :level="p.currentLevel" :trend="p.trend" size="sm" />
          </td>
          <td><span class="metric" :class="{ high: p.metrics.W_Ratio >= 30, medium: p.metrics.W_Ratio >= 15 && p.metrics.W_Ratio < 30 }">{{ p.metrics.W_Ratio }}%</span></td>
          <td><span class="metric">{{ p.metrics.W_Event_Rate }}%</span></td>
          <td>{{ p.metrics.Consecutive_Days }}天</td>
          <td>
            <span v-if="p.metrics.Peak_Day_Flag" class="peak-indicator">⚠</span>
            <span v-else class="muted">—</span>
          </td>
          <td>
            <button class="btn-link" @click.stop="$emit('select', p.student.id)">查看</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { StudentRiskProfile } from '@/types'
import RiskBadge from './RiskBadge.vue'
import { useAppStore } from '@/stores/app'

const props = defineProps<{
  profiles: StudentRiskProfile[]
  selectedId?: number | null
}>()

defineEmits<{ select: [id: number] }>()

const store = useAppStore()
const desensitize = computed(() => (name: string) => store.maskMode ? name[0] + '同学' : name)
</script>

<style scoped>
.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #E2EFE7;
  background: #fff;
}
.student-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.student-table th {
  text-align: left;
  padding: 12px 16px;
  font-weight: 600;
  color: #4B5563;
  background: #F9FAFB;
  border-bottom: 1px solid #E2EFE7;
  white-space: nowrap;
}
.student-table td {
  padding: 10px 16px;
  border-bottom: 1px solid #F0F7F3;
}
.student-table tr:last-child td { border-bottom: none; }
.student-table tr.clickable {
  cursor: pointer;
  transition: background 0.15s;
}
.student-table tr.clickable:hover { background: #F0FDF4; }
.student-table tr.selected { background: #ECFDF5; }

.student-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #15803D, #059669);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}
.metric { font-weight: 600; color: #1F2937; }
.metric.high { color: #EF4444; }
.metric.medium { color: #EAB308; }
.peak-indicator { font-size: 14px; }
.muted { color: #D1D5DB; }
.btn-link {
  border: none;
  background: none;
  color: #15803D;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}
.btn-link:hover { background: #ECFDF5; }
</style>
