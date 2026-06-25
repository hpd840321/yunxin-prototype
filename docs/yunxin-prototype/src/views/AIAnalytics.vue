<template>
  <div class="faces-page">
    <header class="top-bar">
      <div>
        <h1 class="page-title">人脸底库</h1>
        <p class="page-subtitle">{{ selectedClass }} · 学生人脸注册与质量监控</p>
      </div>
      <div class="top-stats">
        <span class="stat-chip registered">{{ enrolledCount }} 已注册</span>
        <span class="stat-chip unreg">{{ classStudents.length - enrolledCount }} 未注册</span>
      </div>
    </header>
    <div class="page-body">
      <aside class="page-sidebar">
        <h3 class="sidebar-title">组织架构</h3>
        <GradeClassTree v-model:selected="selectedClass" />
        <div class="search-box" style="margin-top:12px">
          <input v-model="searchQuery" placeholder="搜索学生姓名..." class="search-input" />
        </div>
      </aside>
      <div class="page-content">
        <div class="face-grid">
          <div v-for="s in filteredStudents" :key="s.id" class="face-card" :class="{ unregistered: !enrollment(s).registered }">
            <FaceThumb :name="s.name" state="engaged" size="lg" :registered="enrollment(s).registered" />
            <div class="face-card-body">
              <div class="face-card-name">{{ s.name }}</div>
              <div v-if="enrollment(s).registered" class="face-card-quality" :style="{ color: qualityColor(enrollment(s).quality) }">
                质量 {{ (enrollment(s).quality * 100).toFixed(0) }}%
              </div>
              <div v-else class="face-card-quality unreg">未注册人脸</div>
              <div class="face-card-date">{{ enrollment(s).lastUpdated || '--' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { STUDENTS, FACE_ENROLLMENT } from '@/mock/data'
import GradeClassTree from '@/components/GradeClassTree.vue'
import FaceThumb from '@/components/FaceThumb.vue'
const selectedClass = ref('初一(1)班')
const searchQuery = ref('')
const classStudents = computed(() => STUDENTS.filter(s => s.className === selectedClass.value))
const enrolledCount = computed(() => classStudents.value.filter(s => FACE_ENROLLMENT[s.id]?.registered).length)
const filteredStudents = computed(() => { let l=classStudents.value; if(searchQuery.value) l=l.filter(s=>s.name.includes(searchQuery.value)); return l })
function enrollment(s:any){return FACE_ENROLLMENT[s.id]??{registered:false,quality:0,lastUpdated:''}}
function qualityColor(q:number){return q>=0.85?'#22C55E':q>=0.7?'#EAB308':'#EF4444'}
</script>
<style scoped>
.faces-page{padding:32px;max-width:1300px;margin:0 auto}
.top-bar{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}
.page-title{font-size:24px;font-weight:800;color:#0F172A;margin:0 0 4px}
.page-subtitle{font-size:13px;color:#9CA3AF;margin:0}
.top-stats{display:flex;gap:8px}
.stat-chip{padding:4px 12px;border-radius:8px;font-size:12px;font-weight:700}
.stat-chip.registered{background:#ECFDF5;color:#15803D}
.stat-chip.unreg{background:#F3F4F6;color:#6B7280}
.page-body{display:flex;gap:24px;align-items:flex-start}
.page-sidebar{width:220px;flex-shrink:0;background:#fff;border-radius:16px;border:1px solid #E2EFE7;padding:16px;position:sticky;top:32px}
.sidebar-title{font-size:13px;font-weight:700;color:#0F172A;margin:0 0 8px;padding-bottom:8px;border-bottom:1px solid #F0F7F3}
.search-input{width:100%;padding:8px 12px;border-radius:8px;border:1.5px solid #E2EFE7;font-size:13px;outline:none;box-sizing:border-box}
.search-input:focus{border-color:#15803D}
.page-content{flex:1;min-width:0}
.face-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px}
.face-card{display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px;border-radius:16px;border:1px solid #E2EFE7;background:#fff;transition:all 0.15s}
.face-card:hover{box-shadow:0 4px 12px rgba(0,0,0,0.06)}
.face-card.unregistered{opacity:0.6}
.face-card-body{text-align:center}
.face-card-name{font-weight:700;font-size:14px;color:#1F2937}
.face-card-quality{font-size:12px;font-weight:600}
.face-card-quality.unreg{color:#D1D5DB}
.face-card-date{font-size:10px;color:#9CA3AF;margin-top:2px}
</style>
