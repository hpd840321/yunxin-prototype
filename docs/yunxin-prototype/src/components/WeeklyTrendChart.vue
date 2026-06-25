<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  labels: string[]
  wRatio: number[]
  bRatio?: number
  wEventRate?: number[]
}>()

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

function render() {
  if (!chartRef.value) return
  if (!chart) {
    chart = echarts.init(chartRef.value)
  }

  const series: echarts.SeriesOption[] = [
    {
      name: '周异常占比 (W_Ratio)',
      type: 'line',
      data: props.wRatio,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { color: '#EF4444', width: 2.5 },
      itemStyle: { color: '#EF4444' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(239, 68, 68, 0.2)' },
          { offset: 1, color: 'rgba(239, 68, 68, 0.02)' },
        ]),
      },
    },
  ]

  // 个体基线
  if (props.bRatio !== undefined) {
    series.push({
      name: '个体基线 (B_Ratio)',
      type: 'line',
      data: Array(props.wRatio.length).fill(props.bRatio),
      lineStyle: { color: '#15803D', width: 2, type: 'dashed' as const },
      symbol: 'none',
      itemStyle: { color: '#15803D' },
    })
  }

  // 事件率
  if (props.wEventRate) {
    series.push({
      name: '异常事件率 (W_Event_Rate)',
      type: 'bar',
      data: props.wEventRate,
      barWidth: 8,
      barGap: '30%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#F97316' },
          { offset: 1, color: '#FBBF24' },
        ]),
        borderRadius: [4, 4, 0, 0],
      },
    })
  }

  // 阈值参考线
  const markLines: echarts.MarkLineOption = {
    silent: true,
    label: { show: false },
    data: [
      { yAxis: 15, lineStyle: { color: '#EAB308', type: 'dashed' as const, width: 1 } },
      { yAxis: 30, lineStyle: { color: '#EF4444', type: 'dashed' as const, width: 1 } },
      { yAxis: 50, lineStyle: { color: '#1F2937', type: 'dashed' as const, width: 1 } },
    ],
  }

  chart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#E2EFE7',
      borderWidth: 1,
      textStyle: { fontSize: 12, color: '#1F2937' },
    },
    legend: {
      bottom: 0,
      textStyle: { fontSize: 12, color: '#6B7280' },
      itemWidth: 14,
      itemHeight: 10,
    },
    grid: { top: 20, right: 16, bottom: 32, left: 48 },
    xAxis: {
      type: 'category',
      data: props.labels,
      axisLine: { lineStyle: { color: '#E2EFE7' } },
      axisLabel: { color: '#6B7280', fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 65,
      splitLine: { lineStyle: { color: '#F0F7F3' } },
      axisLabel: { color: '#6B7280', fontSize: 11, formatter: '{value}%' },
    },
    series: series.map(s => ({ ...s, markLine: markLinePerSeries(s) ? markLines : undefined })),
  }, true)
}

function markLinePerSeries(s: echarts.SeriesOption): boolean {
  return s.name === '周异常占比 (W_Ratio)'
}

onMounted(render)
watch(() => [props.labels, props.wRatio, props.bRatio, props.wEventRate], render, { deep: true })

onBeforeUnmount(() => { chart?.dispose(); chart = null })
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 220px;
}
</style>
