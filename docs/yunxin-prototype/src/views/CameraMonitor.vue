<template>
  <div class="camera-page">
    <header class="top-bar">
      <div>
        <h1 class="page-title">摄像头监控</h1>
        <p class="page-subtitle">IPC 摄像头实时状态与检测概览</p>
      </div>
      <div class="top-stats">
        <span class="stat-chip online">{{ onlineCount }} 在线</span>
        <span class="stat-chip offline">{{ offlineCount }} 离线</span>
        <span class="stat-chip fault">{{ faultCount }} 故障</span>
      </div>
    </header>

    <!-- 摄像头网格 -->
    <section class="camera-grid">
      <div v-for="cam in cameras" :key="cam.id" class="camera-card" :class="cam.status">
        <!-- 摄像头画面占位 -->
        <div class="cam-feed" :class="cam.status">
          <div class="cam-overlay">
            <div class="cam-status-dot" :class="cam.status" />
            <span class="cam-status-text">{{ statusLabel(cam.status) }}</span>
          </div>
          <div class="cam-scene-badge">{{ SCENE_LABELS[cam.scene] }}</div>
          <div v-if="cam.status === 'online'" class="cam-mock-detection">
            <div class="mock-face" style="left:35%;top:30%">
              <span class="mock-label">张明悦 投入积极</span>
            </div>
            <div class="mock-face" style="left:55%;top:25%">
              <span class="mock-label">李思远 困惑思考</span>
            </div>
            <div class="mock-face" style="left:45%;top:55%">
              <span class="mock-label">王雨桐 疲惫退缩</span>
            </div>
          </div>
          <div v-if="cam.status === 'degraded'" class="cam-degraded-msg">
            帧率下降 (15fps) · 部分帧跳过
          </div>
          <div v-if="cam.status === 'offline'" class="cam-offline-msg">
            设备离线
          </div>
        </div>

        <!-- 摄像头信息 -->
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
              <span class="detail-label">分辨率</span>
              <span class="detail-value">{{ cam.resolution }}</span>
            </div>
            <div class="cam-detail-item">
              <span class="detail-label">采样</span>
              <span class="detail-value">{{ cam.todayDetections.toLocaleString() }}</span>
            </div>
          </div>
          <div class="cam-footer">
            <span class="cam-last-seen">{{ cam.status === 'online' ? '实时' : '最后在线 ' + cam.lastSeen.slice(11, 19) }}</span>
            <span class="cam-faces">{{ cam.todayFaces }} 人</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 最近检测日志 -->
    <section class="section-card">
      <div class="section-header">
        <h2 class="section-title">实时检测日志</h2>
        <div class="log-filter">
          <button class="filter-btn" :class="{ active: logFilter === 'all' }" @click="logFilter = 'all'">全部</button>
          <button class="filter-btn" :class="{ active: logFilter === 2 }" @click="logFilter = 2">系统2（高精度）</button>
          <button class="filter-btn" :class="{ active: logFilter === 1 }" @click="logFilter = 1">系统1（实时）</button>
        </div>
      </div>
      <div class="log-table-wrap">
        <table class="log-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>摄像头</th>
              <th>学生</th>
              <th>状态</th>
              <th>置信度</th>
              <th>系统</th>
              <th v-if="showEmotions">情绪分布</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in filteredLog" :key="e.id" class="log-row">
              <td class="cell-time">{{ e.timestamp.slice(11, 19) }}</td>
              <td>{{ cameras.find(c => c.id === e.cameraId)?.name.slice(0, 8) ?? '未知' }}</td>
              <td>
                <span v-if="e.studentName" class="cell-student">
                  <span class="student-avatar-xs">{{ e.studentName[0] }}</span>
                  {{ e.studentName }}
                </span>
                <span v-else class="cell-unknown">未识别</span>
              </td>
              <td><span class="state-tag" :class="e.state">{{ STATE_LABELS[e.state] }}</span></td>
              <td>
                <span class="conf-bar">
                  <span class="conf-fill" :style="{ width: (e.confidence * 100).toFixed(0) + '%', background: e.confidence > 0.9 ? '#22C55E' : e.confidence > 0.7 ? '#EAB308' : '#EF4444' }" />
                </span>
                <span class="conf-val">{{ (e.confidence * 100).toFixed(0) }}%</span>
              </td>
              <td><span class="sys-badge" :class="'sys-' + e.cameraSystem">S{{ e.cameraSystem }}</span></td>
              <td v-if="showEmotions" class="cell-emotions">
                <span v-for="(v, k) in e.emotions" :key="k" class="emotion-mini" :style="{ color: RAW_EMOTIONS.find(r => r.key === k)?.color }">
                  {{ (v * 100).toFixed(0) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button class="expand-btn" @click="showEmotions = !showEmotions">
        {{ showEmotions ? '收起情绪分布' : '展开情绪分布' }}
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CAMERAS, DETECTION_LOG } from '@/mock/data'
import { SCENE_LABELS, STATE_LABELS, RAW_EMOTIONS } from '@/types'

const logFilter = ref<'all' | 1 | 2>('all')
const showEmotions = ref(false)

const cameras = computed(() => CAMERAS)
const onlineCount = computed(() => CAMERAS.filter(c => c.status === 'online').length)
const offlineCount = computed(() => CAMERAS.filter(c => c.status === 'offline').length)
const faultCount = computed(() => CAMERAS.filter(c => c.status === 'fault').length)

const filteredLog = computed(() => {
  if (logFilter.value === 'all') return DETECTION_LOG
  return DETECTION_LOG.filter(e => e.cameraSystem === logFilter.value)
})

function statusLabel(s: string) {
  return { online: '在线', offline: '离线', fault: '故障', degraded: '降级' }[s] ?? s
}
</script>

<style scoped>
.camera-page { padding: 32px; max-width: 1200px; margin: 0 auto; }
.top-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 4px; }
.page-subtitle { font-size: 13px; color: #9CA3AF; margin: 0; }
.top-stats { display: flex; gap: 8px; }
.stat-chip { padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; }
.stat-chip.online { background: #ECFDF5; color: #15803D; }
.stat-chip.offline { background: #F3F4F6; color: #6B7280; }
.stat-chip.fault { background: #FEF2F2; color: #DC2626; }

/* Camera Grid */
.camera-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; margin-bottom: 24px; }
.camera-card { background: #fff; border-radius: 16px; border: 1px solid #E2EFE7; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.02); transition: all 0.2s; }
.camera-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }

.cam-feed { position: relative; height: 180px; background: linear-gradient(135deg, #1a2332 0%, #2d3a4a 100%); display: flex; align-items: center; justify-content: center; }
.cam-feed.offline { opacity: 0.6; }
.cam-overlay { position: absolute; top: 10px; left: 12px; display: flex; align-items: center; gap: 6px; }
.cam-status-dot { width: 8px; height: 8px; border-radius: 50%; }
.cam-status-dot.online { background: #22C55E; box-shadow: 0 0 6px rgba(34,197,94,0.6); }
.cam-status-dot.offline { background: #9CA3AF; }
.cam-status-dot.fault { background: #EF4444; }
.cam-status-text { color: rgba(255,255,255,0.7); font-size: 11px; }
.cam-scene-badge { position: absolute; top: 10px; right: 12px; padding: 2px 8px; border-radius: 4px; background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.8); font-size: 10px; }

.cam-mock-detection { width: 100%; height: 100%; position: relative; }
.mock-face { position: absolute; width: 40px; height: 48px; border: 2px solid rgba(255,255,255,0.6); border-radius: 4px; }
.mock-label { position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%); white-space: nowrap; font-size: 9px; color: #fff; background: rgba(0,0,0,0.6); padding: 1px 6px; border-radius: 3px; }
.cam-degraded-msg { color: #F97316; font-size: 12px; font-weight: 600; }
.cam-offline-msg { color: rgba(255,255,255,0.4); font-size: 13px; }

.cam-info { padding: 14px; }
.cam-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.cam-name { font-size: 14px; font-weight: 700; color: #0F172A; margin: 0; }
.cam-classroom { font-size: 11px; color: #9CA3AF; }
.cam-details { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px; }
.cam-detail-item { display: flex; flex-direction: column; gap: 1px; }
.detail-label { font-size: 10px; color: #9CA3AF; text-transform: uppercase; }
.detail-value { font-size: 12px; color: #1F2937; font-weight: 600; }
.cam-footer { display: flex; justify-content: space-between; font-size: 11px; color: #9CA3AF; border-top: 1px solid #F0F7F3; padding-top: 8px; }
.cam-faces { font-weight: 600; color: #4B5563; }

/* Detection Log */
.section-card { background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #E2EFE7; margin-bottom: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.02); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
.section-title { font-size: 16px; font-weight: 700; color: #0F172A; margin: 0; }
.log-filter { display: flex; gap: 4px; background: #F3F4F6; padding: 3px; border-radius: 10px; }
.filter-btn { padding: 5px 12px; border: none; border-radius: 8px; background: transparent; font-size: 12px; font-weight: 600; color: #6B7280; cursor: pointer; transition: all 0.15s; }
.filter-btn.active { background: #fff; color: #15803D; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }

.log-table-wrap { overflow-x: auto; }
.log-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.log-table th { text-align: left; padding: 8px 12px; font-weight: 600; color: #6B7280; background: #F9FAFB; border-bottom: 1px solid #E2EFE7; white-space: nowrap; }
.log-table td { padding: 8px 12px; border-bottom: 1px solid #F0F7F3; }
.log-row:hover { background: #F0FDF4; }
.cell-time { font-family: monospace; font-size: 12px; color: #6B7280; }
.cell-student { display: flex; align-items: center; gap: 6px; font-weight: 600; color: #1F2937; }
.student-avatar-xs { width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(135deg, #15803D, #059669); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; }
.cell-unknown { color: #D1D5DB; font-style: italic; }
.state-tag { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.state-tag.engaged { background: #FEFCE8; color: #A16207; }
.state-tag.confused { background: #EDE9FE; color: #6D28D9; }
.state-tag.withdrawn { background: #FEE2E2; color: #DC2626; }
.state-tag.unknown { background: #F3F4F6; color: #9CA3AF; }
.conf-bar { display: inline-block; width: 60px; height: 6px; border-radius: 3px; background: #E5E7EB; vertical-align: middle; }
.conf-fill { display: block; height: 100%; border-radius: 3px; }
.conf-val { font-size: 11px; color: #6B7280; margin-left: 4px; }
.sys-badge { padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; }
.sys-badge.sys-2 { background: #ECFDF5; color: #15803D; }
.sys-badge.sys-1 { background: #FEFCE8; color: #A16207; }
.cell-emotions { display: flex; gap: 4px; }
.emotion-mini { font-size: 10px; font-weight: 700; min-width: 20px; }
.expand-btn { margin-top: 12px; padding: 6px 16px; border: 1px solid #E2EFE7; border-radius: 8px; background: #fff; font-size: 12px; color: #6B7280; cursor: pointer; transition: all 0.15s; }
.expand-btn:hover { border-color: #15803D; color: #15803D; }
</style>
