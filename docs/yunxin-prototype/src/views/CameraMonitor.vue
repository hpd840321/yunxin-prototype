<template>
  <div class="camera-page">
    <header class="top-bar">
      <div>
        <h1 class="page-title">摄像头监控</h1>
        <p class="page-subtitle">IPC 摄像头实时状态与检测概览</p>
      </div>
      <div class="top-stats">
        <span class="stat-chip online">{{ onlineCount }} 在线</span>
        <span class="stat-chip standby">{{ standbyCount }} 待接入</span>
        <span class="stat-chip offline">{{ offlineCount }} 离线</span>
      </div>
    </header>

    <div class="page-body">
      <!-- 左侧：组织架构树 -->
      <aside class="page-sidebar">
        <h3 class="sidebar-title">组织架构</h3>
        <GradeClassTree v-model:selected="selectedClass" />
        <div class="sidebar-info">
          <h4 class="sidebar-subtitle">人脸注册状态</h4>
          <div class="face-summary">
            <div class="face-stat"><span class="face-num">{{ faceRegisteredCount }}</span> 已注册</div>
            <div class="face-stat"><span class="face-num">{{ faceUnregisteredCount }}</span> 未注册</div>
          </div>
        </div>
      </aside>

      <!-- 右侧内容 -->
      <div class="page-content">
        <!-- 摄像头网格（按当前班级过滤） -->
        <section class="camera-grid">
          <div v-for="cam in filteredCameras" :key="cam.id" class="camera-card" :class="cam.status">
            <div class="cam-feed" :class="cam.status">
              <div class="cam-overlay">
                <div class="cam-status-dot" :class="cam.status" />
                <span class="cam-status-text">{{ statusLabel(cam.status) }}</span>
              </div>
              <div class="cam-scene-badge">{{ SCENE_LABELS[cam.scene] }}</div>
              <div v-if="cam.status === 'online'" class="cam-mock-detection">
                <div v-for="(f, fi) in mockFaces" :key="fi" class="mock-face" :style="{ left: f.x + '%', top: f.y + '%', borderColor: f.color }">
                  <div class="mock-face-inner" :style="{ background: f.color + '22' }">
                    <span class="mock-avatar">{{ f.name[0] }}</span>
                  </div>
                  <span class="mock-label" :style="{ background: f.color + 'cc' }">{{ f.name }} {{ f.state }}</span>
                </div>
              </div>
              <div v-if="cam.status === 'standby'" class="cam-msg standby">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M12 3v6l3-3-3-3z"/></svg>
                <span>待接入 · 点位预留</span>
              </div>
            </div>
            <div class="cam-info">
              <div class="cam-header">
                <h3 class="cam-name">{{ cam.name }}</h3>
                <span class="cam-classroom">{{ cam.classroom || '公共区域' }}</span>
              </div>
              <div class="cam-details">
                <div class="cam-detail-item">
                  <span class="detail-label">IP</span>
                  <span class="detail-value">{{ cam.ip }}</span>
                </div>
                <div class="cam-detail-item">
                  <span class="detail-label">场景</span>
                  <span class="detail-value">{{ SCENE_LABELS[cam.scene] }}</span>
                </div>
                <div class="cam-detail-item">
                  <span class="detail-label">检测帧</span>
                  <span class="detail-value">{{ cam.todayDetections.toLocaleString() }}</span>
                </div>
                <div class="cam-detail-item">
                  <span class="detail-label">人脸数</span>
                  <span class="detail-value">{{ cam.todayFaces }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 实时检测日志（含人脸缩略图） -->
        <section class="section-card">
          <div class="section-header">
            <h2 class="section-title">实时人脸检测</h2>
            <div class="log-filter">
              <button class="filter-btn" :class="{ active: logFilter === 'all' }" @click="logFilter = 'all'">全部</button>
              <button class="filter-btn" :class="{ active: logFilter === 2 }" @click="logFilter = 2">系统2（高精度）</button>
              <button class="filter-btn" :class="{ active: logFilter === 1 }" @click="logFilter = 1">系统1（实时）</button>
            </div>
          </div>
          <div class="detection-list">
            <div v-for="e in filteredLog" :key="e.id" class="detection-item">
              <div class="detection-face">
                <div class="face-thumb" :style="{ borderColor: faceStateColor(e.state) }">
                  <span class="face-thumb-char">{{ e.studentName ? e.studentName[0] : '?' }}</span>
                  <div class="face-thumb-overlay" :style="{ background: faceStateColor(e.state) + '33' }" />
                </div>
                <div class="face-quality-dot" :title="'人脸质量: ' + (e.faceQuality * 100).toFixed(0) + '%'" :style="{ background: e.faceQuality > 0.8 ? '#22C55E' : e.faceQuality > 0.6 ? '#EAB308' : '#EF4444' }" />
              </div>
              <div class="detection-info">
                <div class="detection-name">
                  <strong>{{ e.studentName || '未识别' }}</strong>
                  <span class="state-tag" :class="e.state">{{ STATE_LABELS[e.state] }}</span>
                </div>
                <div class="detection-meta">
                  <span>{{ e.timestamp.slice(11, 19) }}</span>
                  <span class="meta-dot">·</span>
                  <span>S{{ e.cameraSystem }}</span>
                  <span class="meta-dot">·</span>
                  <span>置信 {{ (e.confidence * 100).toFixed(0) }}%</span>
                  <span v-if="e.faceQuality" class="meta-dot">·</span>
                  <span v-if="e.faceQuality">人脸质量 {{ (e.faceQuality * 100).toFixed(0) }}%</span>
                </div>
              </div>
              <div class="detection-emotions">
                <div v-for="emo in topEmotions(e.emotions)" :key="emo.key" class="emotion-chip" :style="{ background: emo.color + '18', color: emo.color }">
                  {{ emo.label }} {{ emo.pct }}%
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CAMERAS, DETECTION_LOG, FACE_ENROLLMENT, STUDENTS } from '@/mock/data'
import { SCENE_LABELS, STATE_LABELS, EMOTION_7 } from '@/types'
import GradeClassTree from '@/components/GradeClassTree.vue'

const logFilter = ref<'all' | 1 | 2>('all')
const selectedClass = ref('初一(1)班')

const filteredCameras = computed(() => CAMERAS.filter(c => !c.classroom || c.classroom === selectedClass.value))

const onlineCount = computed(() => CAMERAS.filter(c => c.status === 'online').length)
const standbyCount = computed(() => CAMERAS.filter(c => c.status === 'standby').length)
const offlineCount = computed(() => CAMERAS.filter(c => c.status === 'offline').length)

const classStudentIds = computed(() => STUDENTS.filter(s => s.className === selectedClass.value).map(s => s.id))

const faceRegisteredCount = computed(() => classStudentIds.value.filter(id => FACE_ENROLLMENT[id]?.registered).length)
const faceUnregisteredCount = computed(() => classStudentIds.value.filter(id => !FACE_ENROLLMENT[id]?.registered).length)

const filteredLog = computed(() => {
  let list = DETECTION_LOG
  if (logFilter.value !== 'all') list = list.filter(e => e.cameraSystem === logFilter.value)
  return list
})

const mockFaces = computed(() => {
  const classStudents = STUDENTS.filter(s => s.className === selectedClass.value).slice(0, 6)
  const colors = ['#22C55E', '#7C3AED', '#EF4444', '#EAB308', '#3B82F6', '#22C55E']
  const states = ['投入积极', '困惑思考', '疲惫退缩', '投入积极', '困惑思考', '投入积极']
  return classStudents.map((s, i) => ({
    name: s.name, state: states[i % states.length], color: colors[i % colors.length],
    x: 20 + i * 15, y: 18 + (i % 3) * 20,
  }))
})

function faceStateColor(state: string) {
  return { engaged: '#22C55E', confused: '#7C3AED', withdrawn: '#EF4444', unknown: '#9CA3AF' }[state] ?? '#9CA3AF'
}

function topEmotions(emotions: Record<string, number>) {
  return EMOTION_7.map(e => ({ ...e, pct: +((emotions as any)[e.key] * 100).toFixed(0) }))
    .sort((a, b) => b.pct - a.pct).slice(0, 2)
}

function statusLabel(s: string) {
  return { online: '在线', standby: '待接入', offline: '离线', fault: '故障', degraded: '降级' }[s] ?? s
}
</script>

<style scoped>
.camera-page { padding: 32px; max-width: 1300px; margin: 0 auto; }
.top-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 4px; }
.page-subtitle { font-size: 13px; color: #9CA3AF; margin: 0; }
.top-stats { display: flex; gap: 8px; }
.stat-chip { padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; }
.stat-chip.online { background: #ECFDF5; color: #15803D; }
.stat-chip.standby { background: #FEFCE8; color: #A16207; }
.stat-chip.offline { background: #F3F4F6; color: #6B7280; }

.page-body { display: flex; gap: 24px; align-items: flex-start; }

/* Sidebar */
.page-sidebar { width: 240px; flex-shrink: 0; background: #fff; border-radius: 16px; border: 1px solid #E2EFE7; padding: 16px; position: sticky; top: 32px; }
.sidebar-title { font-size: 13px; font-weight: 700; color: #0F172A; margin: 0 0 8px; padding-bottom: 8px; border-bottom: 1px solid #F0F7F3; }
.sidebar-subtitle { font-size: 12px; font-weight: 600; color: #4B5563; margin: 16px 0 8px; }
.face-summary { display: flex; gap: 8px; }
.face-stat { font-size: 12px; color: #6B7280; background: #F9FAFB; border-radius: 8px; padding: 8px; flex: 1; text-align: center; }
.face-num { font-size: 18px; font-weight: 800; color: #1F2937; display: block; }

.page-content { flex: 1; min-width: 0; }

/* Camera Grid */
.camera-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; margin-bottom: 24px; }
.camera-card { background: #fff; border-radius: 16px; border: 1px solid #E2EFE7; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.02); transition: all 0.2s; }
.camera-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }

.cam-feed { position: relative; height: 170px; background: linear-gradient(135deg, #1a2332 0%, #2d3a4a 100%); display: flex; align-items: center; justify-content: center; }
.cam-feed.offline { opacity: 0.6; }
.cam-overlay { position: absolute; top: 10px; left: 12px; display: flex; align-items: center; gap: 6px; z-index: 2; }
.cam-status-dot { width: 8px; height: 8px; border-radius: 50%; }
.cam-status-dot.online { background: #22C55E; box-shadow: 0 0 6px rgba(34,197,94,0.6); }
.cam-status-dot.offline { background: #9CA3AF; }
.cam-status-text { color: rgba(255,255,255,0.7); font-size: 11px; }
.cam-scene-badge { position: absolute; top: 10px; right: 12px; z-index: 2; padding: 2px 8px; border-radius: 4px; background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.8); font-size: 10px; }
.cam-mock-detection { width: 100%; height: 100%; position: relative; }
.mock-face { position: absolute; }
.mock-face-inner { width: 36px; height: 44px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
.mock-avatar { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.9); }
.mock-label { position: absolute; bottom: -16px; left: 50%; transform: translateX(-50%); white-space: nowrap; font-size: 9px; color: #fff; padding: 1px 6px; border-radius: 3px; }
.cam-msg { color: rgba(255,255,255,0.4); font-size: 13px; }
.cam-msg.standby { display: flex; flex-direction: column; align-items: center; gap: 8px; color: rgba(255,255,255,0.35); }
.cam-info { padding: 14px; }
.cam-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.cam-name { font-size: 13px; font-weight: 700; color: #0F172A; margin: 0; }
.cam-classroom { font-size: 11px; color: #9CA3AF; }
.cam-details { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
.cam-detail-item { display: flex; flex-direction: column; gap: 1px; }
.detail-label { font-size: 10px; color: #9CA3AF; }
.detail-value { font-size: 13px; color: #1F2937; font-weight: 600; }

/* Detection List */
.section-card { background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #E2EFE7; box-shadow: 0 1px 4px rgba(0,0,0,0.02); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
.section-title { font-size: 16px; font-weight: 700; color: #0F172A; margin: 0; }
.log-filter { display: flex; gap: 4px; background: #F3F4F6; padding: 3px; border-radius: 10px; }
.filter-btn { padding: 5px 12px; border: none; border-radius: 8px; background: transparent; font-size: 12px; font-weight: 600; color: #6B7280; cursor: pointer; }
.filter-btn.active { background: #fff; color: #15803D; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }

.detection-list { display: flex; flex-direction: column; gap: 8px; }
.detection-item { display: flex; align-items: center; gap: 14px; padding: 10px 14px; border-radius: 12px; border: 1px solid #F0F7F3; transition: all 0.15s; }
.detection-item:hover { background: #F9FAFB; border-color: #E2EFE7; }
.detection-face { position: relative; flex-shrink: 0; }
.face-thumb { width: 40px; height: 48px; border-radius: 8px; border: 2px solid #E2EFE7; display: flex; align-items: center; justify-content: center; background: #F3F4F6; position: relative; overflow: hidden; }
.face-thumb-char { font-size: 16px; font-weight: 700; color: #4B5563; z-index: 1; }
.face-thumb-overlay { position: absolute; inset: 0; }
.face-quality-dot { position: absolute; bottom: -2px; right: -2px; width: 10px; height: 10px; border-radius: 50%; border: 2px solid #fff; }
.detection-info { flex: 1; min-width: 0; }
.detection-name { display: flex; align-items: center; gap: 6px; margin-bottom: 2px; }
.detection-name strong { font-size: 13px; color: #1F2937; }
.detection-meta { font-size: 11px; color: #9CA3AF; display: flex; gap: 4px; flex-wrap: wrap; }
.meta-dot { color: #D1D5DB; }
.detection-emotions { display: flex; gap: 4px; flex-shrink: 0; }
.emotion-chip { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; white-space: nowrap; }
.state-tag { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.state-tag.engaged { background: #FEFCE8; color: #A16207; }
.state-tag.confused { background: #EDE9FE; color: #6D28D9; }
.state-tag.withdrawn { background: #FEE2E2; color: #DC2626; }
.state-tag.unknown { background: #F3F4F6; color: #9CA3AF; }
</style>
