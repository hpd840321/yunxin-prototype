<template>
  <div class="snapshot-page">
    <header class="top-bar">
      <div>
        <h1 class="page-title">课堂快照</h1>
        <p class="page-subtitle">{{ selectedClass }} · {{ selectedDate }}</p>
      </div>
      <div class="date-nav">
        <button class="btn-ghost" @click="prevDate">‹</button>
        <span class="date-label">{{ selectedDate }}</span>
        <button class="btn-ghost" @click="nextDate">›</button>
      </div>
    </header>

    <div class="page-body">
      <aside class="page-sidebar">
        <h3 class="sidebar-title">组织架构</h3>
        <GradeClassTree v-model:selected="selectedClass" />
        <h4 class="sidebar-subtitle">今日课程</h4>
        <div class="lesson-nav">
          <button v-for="lesson in todayLessons" :key="lesson.id" class="lesson-item"
            :class="{ active: activeLesson?.id === lesson.id }" @click="selectLesson(lesson)">
            <span class="lesson-dot" :class="lessonStatus(lesson)" />
            <div class="lesson-info">
              <span class="lesson-subject">{{ lesson.subject }}</span>
              <span class="lesson-time">{{ lesson.start }}-{{ lesson.end }}</span>
            </div>
            <span class="lesson-snap-count">{{ lessonSnapshots(lesson).length }}</span>
          </button>
        </div>
      </aside>

      <div class="page-content">
        <template v-if="activeLesson">
          <div class="snapshot-viewer">
            <div class="snapshot-main">
              <div class="snapshot-placeholder">
                <div v-for="det in currentDetections" :key="det.id" class="detection-marker"
                  :style="{ left: det.faceBox.x + '%', top: det.faceBox.y + '%', width: det.faceBox.w + '%' }"
                  @click="selectedDetection = det">
                  <FaceThumb :name="displayName(det)" :state="detState(det.id)" :confidence="det.confidence" size="sm" :registered="det.recognized" :masked="false" />
                  <div class="det-label">{{ displayName(det) }}</div>
                </div>
              </div>
              <div class="snapshot-controls">
                <button class="btn-ghost" :disabled="currentSnapIdx <= 0" @click="prevSnap">‹ 上一张</button>
                <span class="snap-counter">{{ currentSnapIdx + 1 }} / {{ lessonSnapshots(activeLesson).length }}</span>
                <button class="btn-ghost" :disabled="currentSnapIdx >= lessonSnapshots(activeLesson).length - 1" @click="nextSnap">下一张 ›</button>
              </div>
            </div>
            <div class="snapshot-detail" v-if="selectedDetection">
              <h3 class="detail-title">检测详情</h3>
              <div class="detail-face">
                <FaceThumb :name="selectedDetection.studentName ?? '?'" state="engaged" size="lg" :confidence="selectedDetection.confidence" />
                <div class="detail-name">{{ selectedDetection.studentName || '未识别' }}</div>
                <div class="detail-meta">置信度 {{ (selectedDetection.confidence * 100).toFixed(0) }}% · 人脸质量 {{ (selectedDetection.faceQuality * 100).toFixed(0) }}%</div>
              </div>
              <div class="detail-section">
                <div class="detail-section-title">情绪概率</div>
                <div v-for="e in detectionEmotions" :key="e.key" class="emotion-bar-row">
                  <span class="emotion-label" :style="{ color: e.color }">{{ e.label }}</span>
                  <div class="emotion-bar-track"><div class="emotion-bar-fill" :style="{ width: e.pct + '%', background: e.color }" /></div>
                  <span class="emotion-pct">{{ e.pct }}%</span>
                </div>
              </div>
            </div>
            <div class="snapshot-detail empty-detail" v-else><p>点击人脸框查看检测详情</p></div>
          </div>
          <div class="class-dist">
            <div v-for="s in currentStateDist" :key="s.key" class="dist-block">
              <span class="dist-value" :style="{ color: s.color }">{{ s.pct }}%</span>
              <span class="dist-label">{{ s.label }}</span>
            </div>
          </div>
        </template>
        <div v-else class="empty-state">请从左侧选择课程查看课堂快照</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { LESSONS, SNAPSHOTS, SNAPSHOT_DETECTIONS } from '@/mock/data'
import { EMOTION_7 } from '@/types'
import GradeClassTree from '@/components/GradeClassTree.vue'
import FaceThumb from '@/components/FaceThumb.vue'

const CLASS_IDS: Record<string, number> = { '初一(1)班':1,'初一(2)班':2,'初一(3)班':3,'初一(4)班':4,'初二(1)班':5,'初二(2)班':6,'初二(3)班':7,'初三(1)班':8,'初三(2)班':9 }

const selectedClass = ref('初一(1)班')
const selectedDate = ref('2026-06-25')
const activeLesson = ref<any>(null)
const currentSnapIdx = ref(0)
const selectedDetection = ref<any>(null)

const todayLessons = computed(() =>
  LESSONS.filter(l => l.classId === CLASS_IDS[selectedClass.value] && l.date === selectedDate.value).sort((a, b) => a.period - b.period)
)

function lessonSnapshots(lesson: any) { return SNAPSHOTS.filter(s => s.lessonId === lesson.id) }

const currentSnap = computed(() => {
  if (!activeLesson.value) return null
  return lessonSnapshots(activeLesson.value)[currentSnapIdx.value] ?? null
})

const currentDetections = computed(() => {
  if (!currentSnap.value) return []
  return SNAPSHOT_DETECTIONS.filter(d => d.snapshotId === currentSnap.value.id)
})

const detectionEmotions = computed(() => {
  if (!selectedDetection.value) return []
  return EMOTION_7.map(e => ({ ...e, pct: Math.round((0.05 + Math.random() * 0.4) * 100) })).sort((a, b) => b.pct - a.pct)
})

const currentStateDist = computed(() => {
  const total = currentDetections.value.length || 1
  const e = currentDetections.value.filter(d => d.confidence > 0.88).length
  const c = currentDetections.value.filter(d => d.confidence > 0.82 && d.confidence <= 0.88).length
  const w = currentDetections.value.length - e - c
  return [
    { key:'engaged', label:'投入积极', color:'#22C55E', pct:Math.round(e/total*100) },
    { key:'confused', label:'困惑思考', color:'#7C3AED', pct:Math.round(c/total*100) },
    { key:'withdrawn', label:'疲惫退缩', color:'#EF4444', pct:Math.round(w/total*100) },
  ]
})

function selectLesson(lesson: any) { activeLesson.value = lesson; currentSnapIdx.value = 0; selectedDetection.value = null }
function detState(_id: number) { const r=Math.random(); return r>0.6?'engaged':r>0.3?'confused':'withdrawn' }
function lessonStatus(lesson: any) { const s=lessonSnapshots(lesson); return s.length===0?'pending':s.every(x=>x.status==='done')?'done':'analyzing' }
function displayName(det: any) { return det.studentName || '未识别' }
function prevSnap() { if(currentSnapIdx.value>0){currentSnapIdx.value--;selectedDetection.value=null} }
function nextSnap() { if(currentSnapIdx.value<lessonSnapshots(activeLesson.value).length-1){currentSnapIdx.value++;selectedDetection.value=null} }
function prevDate() { shiftDate(-1) }
function nextDate() { shiftDate(1) }
function shiftDate(n: number) { const d=new Date(selectedDate.value); d.setDate(d.getDate()+n); selectedDate.value=d.toISOString().slice(0,10) }
</script>

<style scoped>
.snapshot-page { padding: 32px; max-width: 1400px; margin: 0 auto; }
.top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0; }
.page-subtitle { font-size: 13px; color: #9CA3AF; }
.date-nav { display: flex; align-items: center; gap: 8px; }
.date-label { font-weight: 600; color: #1F2937; min-width: 100px; text-align: center; }
.btn-ghost { padding: 6px 12px; border-radius: 8px; border: 1px solid #E2EFE7; background: #fff; cursor: pointer; font-size: 13px; color: #4B5563; }
.btn-ghost:disabled { opacity: 0.3; cursor: default; }
.page-body { display: flex; gap: 24px; align-items: flex-start; }
.page-sidebar { width: 220px; flex-shrink: 0; background: #fff; border-radius: 16px; border: 1px solid #E2EFE7; padding: 16px; position: sticky; top: 32px; }
.sidebar-title { font-size: 13px; font-weight: 700; color: #0F172A; margin: 0 0 8px; padding-bottom: 8px; border-bottom: 1px solid #F0F7F3; }
.sidebar-subtitle { font-size: 12px; font-weight: 600; color: #4B5563; margin: 16px 0 8px; }
.lesson-nav { display: flex; flex-direction: column; gap: 4px; }
.lesson-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 8px; border: none; background: transparent; cursor: pointer; text-align: left; width: 100%; }
.lesson-item:hover { background: #F0FDF4; }
.lesson-item.active { background: #ECFDF5; }
.lesson-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.lesson-dot.done { background: #22C55E; }
.lesson-dot.analyzing { background: #F97316; animation: pulse 1s infinite; }
.lesson-dot.pending { background: #D1D5DB; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.5} }
.lesson-info { flex: 1; }
.lesson-subject { font-size: 13px; font-weight: 600; color: #1F2937; display: block; }
.lesson-time { font-size: 11px; color: #9CA3AF; }
.lesson-snap-count { font-size: 10px; color: #9CA3AF; background: #F3F4F6; padding: 0 6px; border-radius: 4px; }
.page-content { flex: 1; min-width: 0; }
.snapshot-viewer { display: flex; gap: 20px; margin-bottom: 16px; }
.snapshot-main { flex: 1; }
.snapshot-placeholder { position: relative; background: linear-gradient(135deg,#1a2332,#2d3a4a); border-radius: 16px; height: 380px; overflow: hidden; }
.detection-marker { position: absolute; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px; transition: all 0.2s; }
.detection-marker:hover { transform: scale(1.15); z-index: 10; }
.det-label { font-size: 9px; color: #fff; background: rgba(0,0,0,0.6); padding: 1px 6px; border-radius: 3px; white-space: nowrap; }
.snapshot-controls { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 10px; }
.snap-counter { font-size: 13px; color: #6B7280; font-weight: 600; }
.snapshot-detail { width: 280px; flex-shrink: 0; background: #fff; border-radius: 16px; border: 1px solid #E2EFE7; padding: 20px; }
.snapshot-detail.empty-detail { display: flex; align-items: center; justify-content: center; color: #9CA3AF; font-size: 14px; }
.detail-title { font-size: 15px; font-weight: 700; color: #0F172A; margin: 0 0 16px; }
.detail-face { display: flex; flex-direction: column; align-items: center; gap: 6px; margin-bottom: 20px; }
.detail-name { font-size: 16px; font-weight: 700; color: #1F2937; }
.detail-meta { font-size: 11px; color: #9CA3AF; }
.detail-section { margin-bottom: 12px; }
.detail-section-title { font-size: 12px; font-weight: 600; color: #4B5563; margin-bottom: 8px; }
.emotion-bar-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.emotion-label { font-size: 11px; font-weight: 600; width: 32px; flex-shrink: 0; }
.emotion-bar-track { flex: 1; height: 6px; border-radius: 3px; background: #F3F4F6; overflow: hidden; }
.emotion-bar-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
.emotion-pct { font-size: 10px; color: #6B7280; width: 30px; text-align: right; }
.class-dist { display: flex; gap: 12px; }
.dist-block { flex: 1; background: #fff; border-radius: 12px; padding: 12px; text-align: center; border: 1px solid #E2EFE7; }
.dist-value { font-size: 24px; font-weight: 800; display: block; }
.dist-label { font-size: 12px; color: #6B7280; }
.empty-state { text-align: center; padding: 64px; color: #9CA3AF; }
</style>
