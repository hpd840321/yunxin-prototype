import type {
  Student, StudentRiskProfile, WeeklyMetrics, IndividualBaseline,
  ClassRiskDistribution, AlertItem, UserRole, RiskLevel, InterventionRecord,
} from '@/types'

// ============================================================
// 学生信息
// ============================================================

export const STUDENTS: Student[] = [
  { id: 101, name: '张明悦', gender: 'female', className: '初一(1)班', grade: '初一年级' },
  { id: 102, name: '李思远', gender: 'male',   className: '初一(1)班', grade: '初一年级' },
  { id: 103, name: '王雨桐', gender: 'female', className: '初一(1)班', grade: '初一年级' },
  { id: 104, name: '赵子轩', gender: 'male',   className: '初一(1)班', grade: '初一年级' },
  { id: 105, name: '陈欣然', gender: 'female', className: '初一(1)班', grade: '初一年级' },
  { id: 106, name: '刘一鸣', gender: 'male',   className: '初一(1)班', grade: '初一年级' },
  { id: 107, name: '孙雅琪', gender: 'female', className: '初一(1)班', grade: '初一年级' },
  { id: 108, name: '周昊然', gender: 'male',   className: '初一(1)班', grade: '初一年级' },
  { id: 201, name: '吴梓涵', gender: 'female', className: '初一(2)班', grade: '初一年级' },
  { id: 202, name: '郑子皓', gender: 'male',   className: '初一(2)班', grade: '初一年级' },
  { id: 203, name: '林雨萱', gender: 'female', className: '初一(2)班', grade: '初一年级' },
  { id: 204, name: '黄俊杰', gender: 'male',   className: '初一(2)班', grade: '初一年级' },
  { id: 205, name: '徐若曦', gender: 'female', className: '初一(2)班', grade: '初一年级' },
  { id: 206, name: '何子涵', gender: 'male',   className: '初一(2)班', grade: '初一年级' },
  { id: 207, name: '杨思琪', gender: 'female', className: '初一(2)班', grade: '初一年级' },
  { id: 208, name: '罗天佑', gender: 'male',   className: '初一(2)班', grade: '初一年级' },
]

// ============================================================
// 辅助：生成周指标
// ============================================================

function week(date: string, label: string, data: Partial<WeeklyMetrics> & { W_Total: number; W_Abnormal_2: number; W_Event_1: number }): WeeklyMetrics {
  const W_Total = data.W_Total
  const W_Abnormal_2 = data.W_Abnormal_2
  const W_Event_1 = data.W_Event_1
  const W_Good = data.W_Good ?? Math.round((W_Total - W_Abnormal_2) * 0.45)
  const W_Neutral = W_Total - W_Abnormal_2 - W_Good
  const W_Ratio = Math.round((W_Abnormal_2 / W_Total) * 10000) / 100
  const W_Event_Rate = Math.round((W_Event_1 / W_Total) * 10000) / 100
  return {
    weekStart: date,
    weekEnd: '',
    weekLabel: label,
    W_Total, W_Abnormal_2, W_Good, W_Neutral,
    W_Ratio, W_Event_1, W_Event_Rate,
    Consecutive_Days: data.Consecutive_Days ?? 0,
    Peak_Day_Flag: data.Peak_Day_Flag ?? false,
  }
}

function profile(
  studentId: number,
  level: RiskLevel,
  trend: RiskLevel | null,
  weeks: WeeklyMetrics[],
  baseline: Partial<IndividualBaseline> = {},
  records: InterventionRecord[] = [],
  reassessment: ReassessmentResult | null = null,
): StudentRiskProfile {
  const last = weeks[weeks.length - 1]
  return {
    student: STUDENTS.find(s => s.id === studentId)!,
    currentLevel: level,
    trend,
    metrics: last,
    baseline: {
      B_Ratio: baseline.B_Ratio ?? 12,
      B_Event_Rate: baseline.B_Event_Rate ?? 8,
      B_Day_Ratio: baseline.B_Day_Ratio ?? 15,
      isValid: baseline.isValid ?? true,
    },
    weeklyHistory: weeks,
    interventionRecords: records,
    reassessmentResult: reassessment,
  }
}

type ReassessmentResult = 'recovered' | 'maintained' | 'worsened'

// ============================================================
// 周指标生成辅助
// W_Total 约 2000-2800/周，表示每日 300-400 次采样
// ============================================================

// ---------- 绿色稳定学生 ----------

const greenW1 = week('2026-06-15', '第25周', { W_Total: 2450, W_Abnormal_2: 180,  W_Event_1: 22 })
const greenW2 = week('2026-06-08', '第24周', { W_Total: 2380, W_Abnormal_2: 165,  W_Event_1: 18 })
const greenW3 = week('2026-06-01', '第23周', { W_Total: 2520, W_Abnormal_2: 145,  W_Event_1: 15 })
const greenW4 = week('2026-05-25', '第22周', { W_Total: 2400, W_Abnormal_2: 155,  W_Event_1: 20 })

// ---------- 绿色-黄色走向学生 ----------

const trendYW1 = week('2026-06-15', '第25周', { W_Total: 2350, W_Abnormal_2: 410,  W_Event_1: 42,  Consecutive_Days: 2, Peak_Day_Flag: true })
const trendYW2 = week('2026-06-08', '第24周', { W_Total: 2410, W_Abnormal_2: 280,  W_Event_1: 30 })

// ---------- 黄色学生 ----------

const yellowW1 = week('2026-06-15', '第25周', { W_Total: 2280, W_Abnormal_2: 520,  W_Event_1: 55,  Consecutive_Days: 2, Peak_Day_Flag: true })
const yellowW2 = week('2026-06-08', '第24周', { W_Total: 2350, W_Abnormal_2: 480,  W_Event_1: 50,  Consecutive_Days: 2 })

// ---------- 黄色-红色走向学生 ----------

const trendRW1 = week('2026-06-15', '第25周', { W_Total: 2180, W_Abnormal_2: 780,  W_Event_1: 88,  Consecutive_Days: 3, Peak_Day_Flag: true })
const trendRW2 = week('2026-06-08', '第24周', { W_Total: 2250, W_Abnormal_2: 520,  W_Event_1: 60,  Consecutive_Days: 2, Peak_Day_Flag: true })
const trendRW3 = week('2026-06-01', '第23周', { W_Total: 2400, W_Abnormal_2: 380,  W_Event_1: 42 })

// ---------- 红色学生 ----------

const redW1 = week('2026-06-15', '第25周', { W_Total: 2100, W_Abnormal_2: 950,  W_Event_1: 95,  Consecutive_Days: 3, Peak_Day_Flag: true })
const redW2 = week('2026-06-08', '第24周', { W_Total: 2150, W_Abnormal_2: 820,  W_Event_1: 80,  Consecutive_Days: 3, Peak_Day_Flag: true })
const redW3 = week('2026-06-01', '第23周', { W_Total: 2300, W_Abnormal_2: 650,  W_Event_1: 65,  Consecutive_Days: 2 })
const redW4 = week('2026-05-25', '第22周', { W_Total: 2380, W_Abnormal_2: 500,  W_Event_1: 52,  Consecutive_Days: 2 })

// ---------- 黑色学生 ----------

const blackW1 = week('2026-06-15', '第25周', { W_Total: 2000, W_Abnormal_2: 1120, W_Event_1: 120, Consecutive_Days: 5, Peak_Day_Flag: true })
const blackW2 = week('2026-06-08', '第24周', { W_Total: 2050, W_Abnormal_2: 1050, W_Event_1: 115, Consecutive_Days: 4, Peak_Day_Flag: true })
const blackW3 = week('2026-06-01', '第23周', { W_Total: 2100, W_Abnormal_2: 880,  W_Event_1: 92,  Consecutive_Days: 3, Peak_Day_Flag: true })
const blackW4 = week('2026-05-25', '第22周', { W_Total: 2250, W_Abnormal_2: 720,  W_Event_1: 75,  Consecutive_Days: 2, Peak_Day_Flag: true })

// ============================================================
// 完整学生风险画像数据
// ============================================================

export const STUDENT_PROFILES: StudentRiskProfile[] = [
  // ---- 绿色稳定 ----
  profile(101, 'green', null, [greenW2, greenW3, greenW4, greenW1]),
  profile(102, 'green', null, [greenW2, greenW3, greenW4, greenW1], { B_Ratio: 8, B_Event_Rate: 5 }),
  profile(105, 'green', null, [greenW2, greenW3, greenW4, greenW1], { B_Ratio: 10, B_Event_Rate: 6 }),
  profile(106, 'green', null, [greenW2, greenW3, greenW4, greenW1], { B_Ratio: 7, B_Event_Rate: 4 }),
  profile(203, 'green', null, [greenW2, greenW3, greenW4, greenW1], { B_Ratio: 9, B_Event_Rate: 5 }),
  profile(205, 'green', null, [greenW2, greenW3, greenW4, greenW1], { B_Ratio: 11, B_Event_Rate: 7 }),

  // ---- 绿色-黄色走向 ----
  profile(107, 'green_yellow_trend', 'yellow', [greenW2, greenW3, trendYW2, trendYW1],
    { B_Ratio: 11, B_Event_Rate: 8 }, [], 'maintained'),
  profile(206, 'green_yellow_trend', 'yellow', [greenW2, greenW3, trendYW2, trendYW1],
    { B_Ratio: 10, B_Event_Rate: 7 }),

  // ---- 黄色 ----
  profile(104, 'yellow', null, [greenW3, greenW4, yellowW2, yellowW1],
    { B_Ratio: 13, B_Event_Rate: 9 }, [
    { id: 1, date: '2026-06-12', type: 'communication', content: '与家长电话沟通，建议增加户外活动时间', author: '王老师', authorRole: 'teacher' },
    { id: 2, date: '2026-06-14', type: 'observation', content: '课堂注意力有所改善，但课间仍显孤僻', author: '王老师', authorRole: 'teacher' },
  ]),
  profile(202, 'yellow', null, [greenW2, greenW3, yellowW2, yellowW1],
    { B_Ratio: 12, B_Event_Rate: 8 }),
  profile(207, 'yellow', null, [greenW2, greenW3, yellowW2, yellowW1],
    { B_Ratio: 14, B_Event_Rate: 10 }),

  // ---- 黄色-红色走向 ----
  profile(103, 'yellow_red_trend', 'red', [greenW4, trendRW3, trendRW2, trendRW1],
    { B_Ratio: 15, B_Event_Rate: 10 }, [
    { id: 3, date: '2026-06-10', type: 'observation', content: '连续多日课间独坐，不参与同学交流', author: '王老师', authorRole: 'teacher' },
    { id: 4, date: '2026-06-13', type: 'communication', content: '家长反馈近期不愿谈论学校生活', author: '王老师', authorRole: 'teacher' },
    { id: 5, date: '2026-06-15', type: 'activity', content: '安排参加学校心理社团活动', author: '李老师', authorRole: 'counselor' },
  ], 'worsened'),

  // ---- 红色 ----
  profile(108, 'red', null, [redW4, redW3, redW2, redW1],
    { B_Ratio: 18, B_Event_Rate: 12 }, [
    { id: 6, date: '2026-06-08', type: 'observation', content: '上课频繁走神，作业完成率明显下降', author: '王老师', authorRole: 'teacher' },
    { id: 7, date: '2026-06-11', type: 'communication', content: '与家长面谈，建议关注孩子情绪变化', author: '王老师', authorRole: 'teacher' },
    { id: 8, date: '2026-06-14', type: 'referral', content: '转介心理老师进行初步评估', author: '李老师', authorRole: 'counselor' },
  ]),
  profile(204, 'red', null, [redW4, redW3, redW2, redW1],
    { B_Ratio: 16, B_Event_Rate: 11 }, [
    { id: 9, date: '2026-06-09', type: 'communication', content: '家长反映学业压力大，睡眠质量下降', author: '陈老师', authorRole: 'teacher' },
  ]),

  // ---- 黑色 ----
  profile(208, 'black', null, [blackW4, blackW3, blackW2, blackW1],
    { B_Ratio: 20, B_Event_Rate: 15 }, [
    { id: 10, date: '2026-06-07', type: 'observation', content: '连续5天异常日，课堂完全脱离状态', author: '陈老师', authorRole: 'teacher' },
    { id: 11, date: '2026-06-10', type: 'communication', content: '紧急约谈家长，建议立即进行专业评估', author: '陈老师', authorRole: 'teacher' },
    { id: 12, date: '2026-06-12', type: 'referral', content: '转介至合作心理咨询机构进行深度评估', author: '李老师', authorRole: 'counselor' },
    { id: 13, date: '2026-06-16', type: 'referral', content: '建议转介至儿童专科医院进一步诊断', author: '李老师', authorRole: 'counselor' },
  ]),
]

// ============================================================
// 班级风险分布
// ============================================================

export const CLASS_DISTRIBUTIONS: ClassRiskDistribution[] = [
  { className: '初一(1)班', totalStudents: 8, green: 3, greenYellowTrend: 1, yellow: 2, yellowRedTrend: 1, red: 1, black: 0 },
  { className: '初一(2)班', totalStudents: 8, green: 2, greenYellowTrend: 1, yellow: 1, yellowRedTrend: 0, red: 1, black: 1 },
]

// ============================================================
// 预警通知
// ============================================================

export const ALERTS: AlertItem[] = [
  {
    id: 1, studentId: 208, studentName: '罗天佑', className: '初一(2)班',
    level: 'black',
    description: '连续5天异常日，W_Ratio=56%，异常状态已在一周内成为主导状态',
    suggestedAction: '立即进入高风险预警流程，建议家长带往专业机构进行心理评估',
    detectedAt: '2026-06-15',
  },
  {
    id: 2, studentId: 108, studentName: '周昊然', className: '初一(1)班',
    level: 'red',
    description: 'W_Ratio=45.2%，连续3天异常日，较上周继续上升',
    suggestedAction: '启动高强度第二阶段验证，通知家长，准备专业转介资源',
    detectedAt: '2026-06-15',
  },
  {
    id: 3, studentId: 204, studentName: '黄俊杰', className: '初一(2)班',
    level: 'red',
    description: 'W_Ratio=38.1%，连续3天异常日，需重点关注',
    suggestedAction: '家长需收到明确提示，学校心理老师介入判断',
    detectedAt: '2026-06-15',
  },
  {
    id: 4, studentId: 103, studentName: '王雨桐', className: '初一(1)班',
    level: 'yellow_red_trend',
    description: '本周W_Ratio=35.8%，较个体基线上升12个百分点，呈持续上升趋势',
    suggestedAction: '比黄色阶段更密集地观察，建立周反馈机制',
    detectedAt: '2026-06-15',
  },
  {
    id: 5, studentId: 104, studentName: '赵子轩', className: '初一(1)班',
    level: 'yellow',
    description: 'W_Ratio=22.8%，连续2天异常日，轻度但持续波动',
    suggestedAction: '建议家长陪孩子进行轻量活动释放，心理老师同步观察',
    detectedAt: '2026-06-15',
  },
  {
    id: 6, studentId: 107, studentName: '孙雅琪', className: '初一(1)班',
    level: 'green_yellow_trend',
    description: '本周W_Ratio=17.4%，略高于个体基线，存在轻微上升趋势',
    suggestedAction: '家长增加陪伴与观察，注意作息和社交变化',
    detectedAt: '2026-06-15',
  },
]

// ============================================================
// 全校汇总统计
// ============================================================

export const SCHOOL_STATS = {
  totalStudents: 16,
  currentWeekLabels: ['第22周', '第23周', '第24周', '第25周'],
  schoolRiskDistribution: {
    green: 6,
    greenYellowTrend: 2,
    yellow: 3,
    yellowRedTrend: 1,
    red: 2,
    black: 1,
  },
  weeklyGlobalRatios: [12.5, 14.8, 16.2, 18.5], // 全校周异常占比趋势
}

// ============================================================
// 家长数据映射（家长只看自己孩子）
// ============================================================

export const PARENT_CHILDREN: Record<string, number[]> = {
  '张明悦家长': [101],      // 张明悦 - 绿色
  '周昊然家长': [108],      // 周昊然 - 红色（高风险示例）
}
