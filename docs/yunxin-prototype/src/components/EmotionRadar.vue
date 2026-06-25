<template>
  <div ref="chartRef" class="radar-container" :style="{ width: width, height: height }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { EMOTION_7 } from '@/types'

const props = withDefaults(defineProps<{
  emotions: Record<string, number>
  width?: string
  height?: string
}>(), { width: '100%', height: '200px' })

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

function render() {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)

  const values = EMOTION_7.map(e => Math.round(((props.emotions as any)[e.key] ?? 0) * 100))

  chart.setOption({
    radar: {
      indicator: EMOTION_7.map(e => ({ name: e.label, max: 50 })),
      center: ['50%', '50%'],
      radius: '65%',
      axisName: { color: '#4B5563', fontSize: 11, fontWeight: 600 },
      splitArea: { areaStyle: { color: ['rgba(21,128,61,0.02)', 'rgba(21,128,61,0.04)'] } },
      axisLine: { lineStyle: { color: '#E2EFE7' } },
      splitLine: { lineStyle: { color: '#E2EFE7' } },
    },
    series: [{
      type: 'radar',
      data: [{ value: values, name: '情绪概率', areaStyle: { color: 'rgba(21,128,61,0.15)' } }],
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: '#15803D', width: 2 },
      itemStyle: { color: '#15803D' },
    }],
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#E2EFE7',
      borderWidth: 1,
      textStyle: { fontSize: 12, color: '#1F2937' },
      formatter: (params: any) => {
        const idx = params.dataIndex
        const e = EMOTION_7[idx]
        return `<strong>${e.label}</strong>: ${values[idx]}%`
      },
    },
  }, true)
}

onMounted(render)
watch(() => props.emotions, render, { deep: true })
onBeforeUnmount(() => { chart?.dispose(); chart = null })
</script>

<style scoped>
.radar-container { min-height: 180px; }
</style>
