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
