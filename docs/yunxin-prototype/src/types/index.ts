// ============================================================
// 云心 - 核心类型定义
// 基于：云心-校园心理健康风险预警与分级干预系统.md
// ============================================================

/** 风险等级 */
export type RiskLevel = 'green' | 'green_yellow_trend' | 'yellow' | 'yellow_red_trend' | 'red' | 'black'

/** 风险等级展示名 */
export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  green: '绿色',
  green_yellow_trend: '绿色（黄色走向）',
  yellow: '黄色',
  yellow_red_trend: '黄色（红色走向）',
  red: '红色',
  black: '黑色',
}

/** 风险等级对应颜色 */
export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  green: '#22C55E',
  green_yellow_trend: '#84CC16',
  yellow: '#EAB308',
  yellow_red_trend: '#F97316',
  red: '#EF4444',
  black: '#1F2937',
}

/** 用户角色 */
export type UserRole = 'admin' | 'teacher' | 'counselor' | 'school_manager' | 'parent'

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: '系统管理员',
  teacher: '班主任',
  counselor: '心理老师',
  school_manager: '校领导',
  parent: '家长',
}

/** 学生信息 */
export interface Student {
  id: number
  name: string
  gender: 'male' | 'female'
  className: string
  grade: string
}

/** 教师信息 */
export interface Teacher {
  id: number
  name: string
  role: 'head_teacher' | 'subject_teacher' | 'counselor' | 'school_manager'
  grade: string
  className?: string      // 班主任关联班级
  subjects?: string[]     // 任课学科
}

/** 分类状态（3.3 数据分类） */
export type SampleCategory = 'good' | 'neutral' | 'abnormal'

/** 周级核心指标（3.5） */
export interface WeeklyMetrics {
  weekStart: string          // ISO date
  weekEnd: string            // ISO date
  weekLabel: string          // "第1周", "第2周", ...
  W_Total: number            // 周总有效采样数
  W_Abnormal_2: number       // 周异常样本数（系统2）
  W_Good: number             // 周正向样本数
  W_Neutral: number          // 周中性样本数
  W_Ratio: number            // 周异常占比（百分比，如 17.55）
  W_Event_1: number          // 周异常事件次数（系统1）
  W_Event_Rate: number       // 周异常事件归一化率（百分比）
  Consecutive_Days: number   // 连续异常天数
  Peak_Day_Flag: boolean     // 单日异常峰值标记
}

/** 个体基线（3.6） */
export interface IndividualBaseline {
  B_Ratio: number            // 周基线异常占比
  B_Event_Rate: number       // 周基线事件率
  B_Day_Ratio: number        // 日基线异常占比
  isValid: boolean           // 基线是否有效（是否已有足够周数）
}

/** 再评估结果（4.6） */
export type ReassessmentResult = 'recovered' | 'maintained' | 'worsened'

/** 干预记录 */
export interface InterventionRecord {
  id: number
  date: string
  type: 'observation' | 'communication' | 'activity' | 'referral'
  content: string
  author: string
  authorRole: UserRole
}

/** 学生完整周风险画像 */
export interface StudentRiskProfile {
  student: Student
  currentLevel: RiskLevel
  trend: RiskLevel | null           // 趋势标记（走向）
  metrics: WeeklyMetrics            // 本周指标
  baseline: IndividualBaseline      // 个体基线
  weeklyHistory: WeeklyMetrics[]    // 过去多周历史（含本周）
  interventionRecords: InterventionRecord[]
  reassessmentResult: ReassessmentResult | null
}

/** 班级风险分布统计 */
export interface ClassRiskDistribution {
  className: string
  totalStudents: number
  green: number
  greenYellowTrend: number
  yellow: number
  yellowRedTrend: number
  red: number
  black: number
}

/** 预警通知 */
export interface AlertItem {
  id: number
  studentId: number
  studentName: string
  className: string
  level: RiskLevel
  description: string
  suggestedAction: string
  detectedAt: string
}

// ============================================================
// 摄像头与 AI 推理数据
// ============================================================

/** IPC 摄像头信息 */
export interface Camera {
  id: number
  name: string
  classroom: string
  ip: string
  status: 'online' | 'offline' | 'fault'
  scene: 'classroom' | 'corridor' | 'lab' | 'canteen' | 'playground' | 'library' | 'gate'
  resolution: string
  fps: number
  lastSeen: string              // ISO date
  todayDetections: number
  todayFaces: number
}

/** 场景分析模式（6.3 场景化隐私分级） */
export const SCENE_LABELS: Record<string, string> = {
  classroom: '教室',
  corridor: '走廊',
  lab: '实验室',
  canteen: '食堂',
  playground: '操场',
  library: '图书馆',
  gate: '校门',
}

/** AI 推理流水线阶段 */
export interface AIPipelineStage {
  key: string
  label: string
  status: 'ok' | 'degraded' | 'fault' | 'idle'
  latency: number                // ms
  processed: number
}

/** 单次检测事件 */
export interface DetectionEvent {
  id: number
  timestamp: string
  cameraId: number
  studentId: number | null      // null = 未识别
  studentName: string | null
  confidence: number            // 0-1
  emotions: EmotionScores
  state: LearningState
  faceBox: { x: number; y: number; w: number; h: number }
  faceQuality: number           // 0-1
  cameraSystem: 1 | 2           // 系统1（实时）或系统2（延迟分析）
}

/** 七类情绪概率 */
export interface EmotionScores {
  happy: number
  neutral: number
  surprise: number
  sad: number
  angry: number
  disgust: number
  fear: number
}

/** 学习三态（明眸映射结果） */
export type LearningState = 'engaged' | 'confused' | 'withdrawn' | 'unknown'

export const STATE_LABELS: Record<LearningState, string> = {
  engaged: '投入积极',
  confused: '困惑思考',
  withdrawn: '疲惫退缩',
  unknown: '未识别',
}

export const STATE_COLORS: Record<LearningState, string> = {
  engaged: '#F2C94C',
  confused: '#9B9ECE',
  withdrawn: '#BDBDBD',
  unknown: 'transparent',
}

/** 日采样汇总 */
export interface DailySample {
  date: string
  cameraId: number
  totalSamples: number
  validSamples: number
  stateDistribution: { engaged: number; confused: number; withdrawn: number; unknown: number }
  emotionDistribution: EmotionScores
  abnormalEvents: number
  peakHour: number              // 异常峰值时段（0-23）
}

/** 年级-班级树节点 */
export interface GradeClassNode {
  name: string
  classes: { name: string; total: number; enrolled: number }[]
}

/** 七类情绪原始标签与颜色 */
export const RAW_EMOTIONS = [
  { key: 'happy',    label: '快乐',    color: '#F4B942' },
  { key: 'neutral',  label: '中性',    color: '#9BAFBC' },
  { key: 'surprise', label: '惊讶',    color: '#9B9ECE' },
  { key: 'sad',      label: '悲伤',    color: '#6B8CAE' },
  { key: 'angry',    label: '愤怒',    color: '#E07C7C' },
  { key: 'disgust',  label: '厌恶',    color: '#8DAF8D' },
  { key: 'fear',     label: '恐惧',    color: '#C9A0B8' },
]
