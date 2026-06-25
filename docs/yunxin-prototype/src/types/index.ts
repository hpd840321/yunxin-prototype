// ============================================================
// 云心 - 核心类型定义
// ============================================================

export type RiskLevel = 'green' | 'green_yellow_trend' | 'yellow' | 'yellow_red_trend' | 'red' | 'black'

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  green: '绿色', green_yellow_trend: '绿色（黄色走向）', yellow: '黄色',
  yellow_red_trend: '黄色（红色走向）', red: '红色', black: '黑色',
}

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  green: '#22C55E', green_yellow_trend: '#84CC16', yellow: '#EAB308',
  yellow_red_trend: '#F97316', red: '#EF4444', black: '#1F2937',
}

export type UserRole = 'admin' | 'teacher' | 'counselor' | 'school_manager' | 'parent'

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: '系统管理员', teacher: '班主任', counselor: '心理老师',
  school_manager: '校领导', parent: '家长',
}

export interface Student {
  id: number; name: string; gender: 'male' | 'female'
  className: string; grade: string
}

export interface Teacher {
  id: number; name: string
  role: 'head_teacher' | 'subject_teacher' | 'counselor' | 'school_manager'
  grade: string; className?: string; subjects?: string[]
}

export interface TeacherAssignment {
  teacherId: number; classId?: number; gradeId?: number; subjects?: string[]
}

export interface ParentBinding {
  parentId: number; studentIds: number[]
}

export type SampleCategory = 'good' | 'neutral' | 'abnormal'

export interface WeeklyMetrics {
  weekStart: string; weekEnd: string; weekLabel: string
  W_Total: number; W_Abnormal_2: number; W_Good: number; W_Neutral: number
  W_Ratio: number; W_Event_1: number; W_Event_Rate: number
  Consecutive_Days: number; Peak_Day_Flag: boolean
}

export interface IndividualBaseline {
  B_Ratio: number; B_Event_Rate: number; B_Day_Ratio: number; isValid: boolean
}

export type ReassessmentResult = 'recovered' | 'maintained' | 'worsened'

export interface InterventionRecord {
  id: number; date: string
  type: 'observation' | 'communication' | 'activity' | 'referral'
  content: string; author: string; authorRole: UserRole
}

export interface StudentRiskProfile {
  student: Student; currentLevel: RiskLevel; trend: RiskLevel | null
  metrics: WeeklyMetrics; baseline: IndividualBaseline
  weeklyHistory: WeeklyMetrics[]; interventionRecords: InterventionRecord[]
  reassessmentResult: ReassessmentResult | null
}

export interface ClassRiskDistribution {
  className: string; totalStudents: number
  green: number; greenYellowTrend: number; yellow: number
  yellowRedTrend: number; red: number; black: number
}

export interface AlertItem {
  id: number; studentId: number; studentName: string; className: string
  level: RiskLevel; description: string; suggestedAction: string; detectedAt: string
}

// ============================================================
// 课程 & 快照模型
// ============================================================

export interface Lesson {
  id: number; classId: number; weekday: 1 | 2 | 3 | 4 | 5
  period: number; start: string; end: string
  subject: string; teacherName: string; date: string; isSpecial: boolean
}

export interface Snapshot {
  id: number; lessonId: number; captureTime: string
  cameraId: number; photoPath: string
  status: 'pending' | 'analyzing' | 'done' | 'failed'
  totalFaces: number; recognizedCount: number
}

export interface FaceDetection {
  id: number; snapshotId: number; studentId?: number
  studentName?: string; faceBox: { x: number; y: number; w: number; h: number }
  confidence: number; faceQuality: number; recognized: boolean
}

export interface EmotionResult {
  detectionId: number
  happy: number; neutral: number; surprise: number
  sad: number; angry: number; disgust: number; fear: number
  topState: 'engaged' | 'confused' | 'withdrawn' | 'unknown'
  stateConfidence: number; cameraSystem: 1 | 2
}

// ============================================================
// 摄像头 & AI 推理
// ============================================================

export interface Camera {
  id: number; name: string; classroom: string; ip: string
  status: 'online' | 'offline' | 'fault' | 'standby'
  scene: 'classroom' | 'corridor' | 'canteen' | 'gate'
  resolution: string; fps: number; lastSeen: string
  todayDetections: number; todayFaces: number
}

export const SCENE_LABELS: Record<string, string> = {
  classroom: '教室', corridor: '走廊', canteen: '食堂', gate: '校门',
}

export interface AIPipelineStage {
  key: string; label: string
  status: 'ok' | 'degraded' | 'fault' | 'idle'
  latency: number; processed: number
}

export interface DetectionEvent {
  id: number; timestamp: string; cameraId: number
  studentId: number | null; studentName: string | null
  confidence: number; emotions: EmotionScores; state: LearningState
  faceBox: { x: number; y: number; w: number; h: number }
  faceQuality: number; cameraSystem: 1 | 2
}

export interface EmotionScores {
  happy: number; neutral: number; surprise: number
  sad: number; angry: number; disgust: number; fear: number
}

export type LearningState = 'engaged' | 'confused' | 'withdrawn' | 'unknown'

export interface DailySample {
  date: string; cameraId: number
  totalSamples: number; validSamples: number
  stateDistribution: { engaged: number; confused: number; withdrawn: number; unknown: number }
  emotionDistribution: EmotionScores; abnormalEvents: number; peakHour: number
}

export interface GradeClassNode {
  name: string
  classes: { name: string; total: number; enrolled: number; room?: string; cameraId?: number }[]
}

// ============================================================
// 统一情绪颜色 & 标签常量
// ============================================================

export const EMOTION_7 = [
  { key: 'happy',    label: '快乐',    color: '#F4B942' },
  { key: 'neutral',  label: '中性',    color: '#9BAFBC' },
  { key: 'surprise', label: '惊讶',    color: '#9B9ECE' },
  { key: 'sad',      label: '悲伤',    color: '#6B8CAE' },
  { key: 'angry',    label: '愤怒',    color: '#E07C7C' },
  { key: 'disgust',  label: '厌恶',    color: '#8DAF8D' },
  { key: 'fear',     label: '恐惧',    color: '#C9A0B8' },
]

export const STATE_3 = [
  { key: 'engaged',   label: '投入积极', color: '#22C55E' },
  { key: 'confused',  label: '困惑思考', color: '#7C3AED' },
  { key: 'withdrawn', label: '疲惫退缩', color: '#EF4444' },
  { key: 'unknown',   label: '未识别',   color: '#9CA3AF' },
]

export const STATE_LABELS: Record<string, string> = Object.fromEntries(STATE_3.map(s => [s.key, s.label]))
export const STATE_COLORS: Record<string, string> = Object.fromEntries(STATE_3.map(s => [s.key, s.color]))
