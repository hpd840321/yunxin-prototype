<template>
  <div class="tree">
    <div v-for="grade in GRADE_TREE" :key="grade.name" class="tree-grade">
      <button class="grade-header" @click="toggleGrade(grade.name)">
        <svg class="arrow" :class="{ open: expandedGrades.has(grade.name) }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        <span class="grade-name">{{ grade.name }}</span>
        <span class="grade-count">{{ grade.classes.length }}班</span>
      </button>
      <div v-if="expandedGrades.has(grade.name)" class="class-list">
          <button
            v-for="cls in grade.classes"
            :key="cls.name"
            class="class-item"
            :class="{ active: props.selected === cls.name }"
            @click="selectClass(cls.name)"
          >
          <div class="class-left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c6 3 10 0 12-2v-3"/></svg>
            <span class="class-name">{{ cls.name }}</span>
          </div>
          <div class="class-right">
            <span class="class-total">{{ cls.total }}人</span>
            <span class="class-face" :class="{ full: cls.enrolled === cls.total }">
              人脸 {{ cls.enrolled }}/{{ cls.total }}
            </span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { GRADE_TREE } from '@/mock/data'

const props = withDefaults(defineProps<{ selected?: string }>(), { selected: '初一(1)班' })
const emit = defineEmits<{ 'update:selected': [name: string] }>()

const expandedGrades = ref<Set<string>>(new Set(['初一年级']))

function toggleGrade(name: string) {
  if (expandedGrades.value.has(name)) expandedGrades.value.delete(name)
  else expandedGrades.value.add(name)
}

function selectClass(name: string) {
  emit('update:selected', name)
}
</script>

<style scoped>
.tree { padding: 4px 0; }
.tree-grade { margin-bottom: 2px; }
.grade-header { display: flex; align-items: center; gap: 6px; width: 100%; padding: 8px 12px; border: none; border-radius: 8px; background: transparent; cursor: pointer; font-size: 13px; color: #4B5563; transition: all 0.15s; }
.grade-header:hover { background: #F0FDF4; }
.arrow { transition: transform 0.2s; flex-shrink: 0; }
.arrow.open { transform: rotate(90deg); }
.grade-name { font-weight: 700; color: #1F2937; }
.grade-count { margin-left: auto; font-size: 11px; color: #9CA3AF; font-weight: 500; }

.class-list { margin: 2px 0 2px 8px; display: flex; flex-direction: column; gap: 1px; }
.class-item { display: flex; align-items: center; justify-content: space-between; gap: 6px; width: 100%; padding: 7px 12px; border: none; border-radius: 8px; background: transparent; cursor: pointer; font-size: 12px; color: #4B5563; transition: all 0.15s; }
.class-item:hover { background: #F0FDF4; }
.class-item.active { background: #ECFDF5; color: #15803D; font-weight: 600; }
.class-left { display: flex; align-items: center; gap: 6px; }
.class-right { display: flex; align-items: center; gap: 6px; }
.class-total { font-size: 11px; color: #9CA3AF; }
.class-face { font-size: 10px; color: #22C55E; background: #ECFDF5; padding: 1px 6px; border-radius: 4px; font-weight: 600; }
.class-face.full { background: #15803D; color: #fff; }
</style>
