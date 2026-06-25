import type {
  Student, StudentRiskProfile, WeeklyMetrics, IndividualBaseline,
  ClassRiskDistribution, AlertItem, Teacher,
  Camera, DetectionEvent, AIPipelineStage, DailySample, EmotionScores, GradeClassNode,
} from '@/types'

// ============================================================
// 学校组织架构
// ============================================================

export const GRADE_TREE: GradeClassNode[] = [
  {
    name: '初一年级',
    classes: [
      { name: '初一(1)班', total: 8, enrolled: 8 },
      { name: '初一(2)班', total: 8, enrolled: 7 },
      { name: '初一(3)班', total: 8, enrolled: 6 },
      { name: '初一(4)班', total: 6, enrolled: 5 },
    ],
  },
  {
    name: '初二年级',
    classes: [
      { name: '初二(1)班', total: 6, enrolled: 6 },
      { name: '初二(2)班', total: 6, enrolled: 5 },
      { name: '初二(3)班', total: 6, enrolled: 6 },
    ],
  },
  {
    name: '初三年级',
    classes: [
      { name: '初三(1)班', total: 6, enrolled: 6 },
      { name: '初三(2)班', total: 6, enrolled: 4 },
    ],
  },
]

// ============================================================
// 教师数据
// ============================================================

export const TEACHERS: Teacher[] = [
  // 初一年级班主任
  { id: 1,  name: '王建国', role: 'head_teacher',    grade: '初一年级', className: '初一(1)班' },
  { id: 2,  name: '陈美玲', role: 'head_teacher',    grade: '初一年级', className: '初一(2)班' },
  { id: 3,  name: '张伟',   role: 'head_teacher',    grade: '初一年级', className: '初一(3)班' },
  { id: 4,  name: '李芳',   role: 'head_teacher',    grade: '初一年级', className: '初一(4)班' },
  // 初二年级班主任
  { id: 5,  name: '刘强',   role: 'head_teacher',    grade: '初二年级', className: '初二(1)班' },
  { id: 6,  name: '赵敏',   role: 'head_teacher',    grade: '初二年级', className: '初二(2)班' },
  { id: 7,  name: '孙磊',   role: 'head_teacher',    grade: '初二年级', className: '初二(3)班' },
  // 初三年级班主任
  { id: 8,  name: '周丽华', role: 'head_teacher',    grade: '初三年级', className: '初三(1)班' },
  { id: 9,  name: '吴志明', role: 'head_teacher',    grade: '初三年级', className: '初三(2)班' },
  // 心理老师
  { id: 10, name: '李心怡', role: 'counselor',       grade: '全校' },
  { id: 11, name: '徐静',   role: 'counselor',       grade: '初一年级' },
  // 校领导
  { id: 12, name: '杨志远', role: 'school_manager',  grade: '全校' },
  { id: 13, name: '刘慧',   role: 'school_manager',  grade: '全校' },
  // 任课教师
  { id: 14, name: '黄磊',   role: 'subject_teacher', grade: '初一年级', subjects: ['语文', '历史'] },
  { id: 15, name: '林小燕', role: 'subject_teacher', grade: '初一年级', subjects: ['数学'] },
  { id: 16, name: '何志强', role: 'subject_teacher', grade: '初三年级', subjects: ['英语'] },
]

// ============================================================
// 学生信息生成
// ============================================================

const SURNAMES = '张李王赵陈刘杨黄吴周徐郑孙何罗林马高梁宋'
const FEMALE_GIVEN = ['悦', '涵', '欣', '雅', '萱', '怡', '婷', '琪', '雨', '瑶', '雪', '蕾', '梦', '思', '嘉']
const MALE_GIVEN   = ['浩', '明', '宇', '轩', '睿', '泽', '杰', '豪', '鹏', '晨', '晨', '博', '文', '昊', '子']

const CLASS_INFO: { name: string; grade: string }[] = [
  { name: '初一(1)班', grade: '初一年级' },
  { name: '初一(2)班', grade: '初一年级' },
  { name: '初一(3)班', grade: '初一年级' },
  { name: '初一(4)班', grade: '初一年级' },
  { name: '初二(1)班', grade: '初二年级' },
  { name: '初二(2)班', grade: '初二年级' },
  { name: '初二(3)班', grade: '初二年级' },
  { name: '初三(1)班', grade: '初三年级' },
  { name: '初三(2)班', grade: '初三年级' },
]

let sid = 1
let si = 0

function pick<T>(arr: T[]): T { return arr[(si++ * 7 + 3) % arr.length] }

function genStudent(className: string, grade: string): Student {
  const isFemale = (sid + grade.length) % 3 !== 0
  const surname = pick(SURNAMES)
  const given = pick(isFemale ? FEMALE_GIVEN : MALE_GIVEN)
  const name = surname + given + (si % 5 === 0 ? '文' : '')
  return { id: sid++, name, gender: isFemale ? 'female' : 'male', className, grade }
}

export const STUDENTS: Student[] = []
const STUDENT_CLASS_MAP: Record<number, string> = {}
const CLASS_STUDENT_COUNTS: Record<string, number> = {}

for (const cls of CLASS_INFO) {
  const count = GRADE_TREE.find(g => g.name === cls.grade)?.classes.find(c => c.name === cls.name)?.total ?? 6
  for (let i = 0; i < count; i++) {
    const s = genStudent(cls.name, cls.grade)
    STUDENTS.push(s)
    STUDENT_CLASS_MAP[s.id] = cls.name
    CLASS_STUDENT_COUNTS[cls.name] = (CLASS_STUDENT_COUNTS[cls.name] || 0) + 1
  }
}

// ============================================================
// 周级数据生成辅助
// ============================================================

function week(date: string, label: string, data: Partial<WeeklyMetrics> & { total: number; abnormal: number; events: number }): WeeklyMetrics {
  const W_Total = data.total
  const W_Abnormal_2 = data.abnormal
  const W_Event_1 = data.events
  const W_Good = data.W_Good ?? Math.round((W_Total - W_Abnormal_2) * 0.45)
  const W_Neutral = W_Total - W_Abnormal_2 - W_Good
  return {
    weekStart: date, weekEnd: '', weekLabel: label,
    W_Total, W_Abnormal_2, W_Good, W_Neutral,
    W_Ratio: Math.round((W_Abnormal_2 / W_Total) * 10000) / 100,
    W_Event_1, W_Event_Rate: Math.round((W_Event_1 / W_Total) * 10000) / 100,
    Consecutive_Days: data.Consecutive_Days ?? 0,
    Peak_Day_Flag: data.Peak_Day_Flag ?? false,
  }
}

/** 生成普通绿色学生周数据 */
function greenWeeks(baseTotal = 2400, abnormalRate = 0.07): WeeklyMetrics[] {
  const r = () => Math.round(abnormalRate * baseTotal * (0.8 + Math.random() * 0.4))
  const e = () => Math.round(r() * 0.1)
  return ['第22周', '第23周', '第24周', '第25周'].map((l, i) =>
    week('', l, { total: baseTotal - i * 50 + Math.round(Math.random() * 200), abnormal: r(), events: e() })
  )
}

// ============================================================
// 详细风险学生数据（核心16人）
// ============================================================

const gW = (t: number, a: number, e: number, cd = 0, pf = false) => week('', '', { total: t, abnormal: a, events: e, Consecutive_Days: cd, Peak_Day_Flag: pf })

function profile(studentId: number, level: string, trend: string | null, weeks: WeeklyMetrics[], bl?: Partial<IndividualBaseline>, records?: any[], reassessment?: string | null): StudentRiskProfile {
  const last = weeks[weeks.length - 1]
  return {
    student: STUDENTS.find(s => s.id === studentId)!,
    currentLevel: level as any,
    trend: trend as any,
    metrics: last,
    baseline: { B_Ratio: bl?.B_Ratio ?? 12, B_Event_Rate: bl?.B_Event_Rate ?? 8, B_Day_Ratio: bl?.B_Day_Ratio ?? 15, isValid: bl?.isValid ?? true },
    weeklyHistory: weeks,
    interventionRecords: (records ?? []) as any,
    reassessmentResult: (reassessment ?? null) as any,
  }
}

/** 生成普通绿色学生画像 */
function greenProfile(sid: number, bl?: number): StudentRiskProfile {
  const w = greenWeeks(2400 + (sid % 5) * 100, 0.06 + (sid % 10) * 0.005)
  return profile(sid, 'green', null, w, { B_Ratio: bl ?? 8 + (sid % 5) })
}

// ============================================================
// 完整学生风险画像
// ============================================================

export const STUDENT_PROFILES: StudentRiskProfile[] = [
  // ======= 初一年级 详细风险数据 =======
  // 初一(1)班
  profile( findId('初一(1)班', 0), 'green', null, [gW(2380,165,18), gW(2520,145,15), gW(2400,155,20), gW(2450,180,22)], { B_Ratio: 8, B_Event_Rate: 5 }),
  profile( findId('初一(1)班', 1), 'green', null, [gW(2400,150,16), gW(2480,140,14), gW(2380,148,18), gW(2420,175,20)], { B_Ratio: 7, B_Event_Rate: 4 }),
  profile( findId('初一(1)班', 2), 'green', null, [gW(2350,160,20), gW(2450,155,17), gW(2500,160,19), gW(2400,170,21)], { B_Ratio: 10, B_Event_Rate: 6 }),
  profile( findId('初一(1)班', 3), 'yellow', null, [gW(2400,380,42), gW(2300,420,48), gW(2350,480,50), gW(2280,520,55)], { B_Ratio: 13, B_Event_Rate: 9 }, [
    { id: 1, date: '2026-06-12', type: 'communication', content: '与家长电话沟通，建议增加户外活动时间', author: '王建国', authorRole: 'teacher' },
  ]),
  profile( findId('初一(1)班', 4), 'yellow_red_trend', 'red', [gW(2380,500,52), gW(2300,650,65), gW(2250,820,80), gW(2100,950,95)], { B_Ratio: 15, B_Event_Rate: 10 }, [
    { id: 3, date: '2026-06-10', type: 'observation', content: '连续多日课间独坐，不参与同学交流', author: '王建国', authorRole: 'teacher' },
    { id: 4, date: '2026-06-15', type: 'activity', content: '安排参加学校心理社团活动', author: '李心怡', authorRole: 'counselor' },
  ]),
  profile( findId('初一(1)班', 5), 'green_yellow_trend', 'yellow', [gW(2400,200,22), gW(2450,250,28), gW(2350,280,30), gW(2350,410,42)], { B_Ratio: 11, B_Event_Rate: 8 }),
  profile( findId('初一(1)班', 6), 'red', null, [gW(2380,500,52), gW(2300,650,65), gW(2150,820,80), gW(2100,950,95)], { B_Ratio: 18, B_Event_Rate: 12 }, [
    { id: 6, date: '2026-06-08', type: 'observation', content: '上课频繁走神，作业完成率明显下降', author: '王建国', authorRole: 'teacher' },
    { id: 8, date: '2026-06-14', type: 'referral', content: '转介心理老师进行初步评估', author: '李心怡', authorRole: 'counselor' },
  ]),
  profile( findId('初一(1)班', 7), 'green', null, [gW(2400,145,14), gW(2450,160,18), gW(2500,150,16), gW(2380,165,17)]),

  // 初一(2)班
  profile( findId('初一(2)班', 0), 'green', null, [gW(2420,160,18), gW(2480,150,16), gW(2400,158,19), gW(2450,175,21)]),
  profile( findId('初一(2)班', 1), 'yellow', null, [gW(2380,350,38), gW(2400,420,45), gW(2320,480,50), gW(2250,520,55)], { B_Ratio: 12, B_Event_Rate: 8 }),
  profile( findId('初一(2)班', 2), 'green_yellow_trend', 'yellow', [gW(2400,190,20), gW(2420,230,26), gW(2380,270,30), gW(2360,400,40)]),
  profile( findId('初一(2)班', 3), 'green', null, [gW(2450,150,15), gW(2500,145,14), gW(2420,155,18), gW(2480,170,20)]),
  profile( findId('初一(2)班', 4), 'red', null, [gW(2400,480,50), gW(2350,620,62), gW(2200,800,78), gW(2150,920,92)], { B_Ratio: 16, B_Event_Rate: 11 }, [
    { id: 9, date: '2026-06-09', type: 'communication', content: '家长反映学业压力大，睡眠质量下降', author: '陈美玲', authorRole: 'teacher' },
  ]),
  profile( findId('初一(2)班', 5), 'yellow', null, [gW(2400,320,35), gW(2380,400,42), gW(2350,460,48), gW(2300,500,52)]),
  profile( findId('初一(2)班', 6), 'black', null, [gW(2250,720,75), gW(2100,880,92), gW(2050,1050,115), gW(2000,1120,120)], { B_Ratio: 20, B_Event_Rate: 15 }, [
    { id: 10, date: '2026-06-07', type: 'observation', content: '连续5天异常日，课堂完全脱离状态', author: '陈美玲', authorRole: 'teacher' },
    { id: 11, date: '2026-06-12', type: 'referral', content: '转介至合作心理咨询机构进行深度评估', author: '李心怡', authorRole: 'counselor' },
  ]),
  // 初一(2)班 第7个学生用绿色填充
  ...Array.from({ length: 1 }, (_, i) => greenProfile(findId('初一(2)班', 7 + i))),

  // ======= 其他班级：自动生成绿色学生 =======
  ...STUDENTS.filter(s =>
    !['初一(1)班', '初一(2)班'].includes(s.className)
  ).map((s, i) => greenProfile(s.id, 7 + (i % 5))),
]

// ---- 辅助：按班级顺序找学生ID ----
function findId(className: string, nth: number): number {
  const ids = STUDENTS.filter(s => s.className === className).map(s => s.id)
  return ids[nth] ?? ids[ids.length - 1]
}

// ============================================================
// 班级风险分布（自动计算）
// ============================================================

function calcDistribution(className: string): ClassRiskDistribution {
  const profiles = STUDENT_PROFILES.filter(p => p.student.className === className)
  const count = (level: string) => profiles.filter(p => p.currentLevel === level || p.trend === level).length
  return {
    className,
    totalStudents: profiles.length,
    green: profiles.filter(p => p.currentLevel === 'green' && !p.trend).length,
    greenYellowTrend: count('green_yellow_trend'),
    yellow: profiles.filter(p => p.currentLevel === 'yellow' && p.trend !== 'red').length,
    yellowRedTrend: profiles.filter(p => p.currentLevel === 'yellow_red_trend' || p.trend === 'red').length,
    red: profiles.filter(p => p.currentLevel === 'red').length,
    black: profiles.filter(p => p.currentLevel === 'black').length,
  }
}

export const CLASS_DISTRIBUTIONS: ClassRiskDistribution[] = CLASS_INFO.map(c => calcDistribution(c.name))

// ============================================================
// 预警通知
// ============================================================

export const ALERTS: AlertItem[] = [
  {
    id: 1, studentId: findId('初一(2)班', 6), studentName: STUDENTS.find(s => s.id === findId('初一(2)班', 6))?.name ?? '', className: '初一(2)班',
    level: 'black',
    description: '连续5天异常日，W_Ratio=56%，异常状态已在一周内成为主导状态',
    suggestedAction: '立即进入高风险预警流程，建议家长带往专业机构进行心理评估',
    detectedAt: '2026-06-15',
  },
  {
    id: 2, studentId: findId('初一(1)班', 6), studentName: STUDENTS.find(s => s.id === findId('初一(1)班', 6))?.name ?? '', className: '初一(1)班',
    level: 'red',
    description: 'W_Ratio=45.2%，连续3天异常日，较上周继续上升',
    suggestedAction: '启动高强度第二阶段验证，通知家长，准备专业转介资源',
    detectedAt: '2026-06-15',
  },
  {
    id: 3, studentId: findId('初一(2)班', 4), studentName: STUDENTS.find(s => s.id === findId('初一(2)班', 4))?.name ?? '', className: '初一(2)班',
    level: 'red',
    description: 'W_Ratio=42.8%，异常占比持续升高，需重点关注',
    suggestedAction: '家长需收到明确提示，学校心理老师介入判断',
    detectedAt: '2026-06-15',
  },
  {
    id: 4, studentId: findId('初一(1)班', 4), studentName: STUDENTS.find(s => s.id === findId('初一(1)班', 4))?.name ?? '', className: '初一(1)班',
    level: 'yellow_red_trend',
    description: '本周W_Ratio=35.8%，较个体基线上升12个百分点，呈持续上升趋势',
    suggestedAction: '比黄色阶段更密集地观察，建立周反馈机制',
    detectedAt: '2026-06-15',
  },
  {
    id: 5, studentId: findId('初一(1)班', 3), studentName: STUDENTS.find(s => s.id === findId('初一(1)班', 3))?.name ?? '', className: '初一(1)班',
    level: 'yellow',
    description: 'W_Ratio=22.8%，连续2天异常日，轻度但持续波动',
    suggestedAction: '建议家长陪孩子进行轻量活动释放，心理老师同步观察',
    detectedAt: '2026-06-15',
  },
  {
    id: 6, studentId: findId('初一(1)班', 5), studentName: STUDENTS.find(s => s.id === findId('初一(1)班', 5))?.name ?? '', className: '初一(1)班',
    level: 'green_yellow_trend',
    description: '本周W_Ratio=17.4%，略高于个体基线，存在轻微上升趋势',
    suggestedAction: '家长增加陪伴与观察，注意作息和社交变化',
    detectedAt: '2026-06-15',
  },
]

// ============================================================
// 全校汇总统计
// ============================================================

const sd = () => {
  const r: Record<string, number> = { green: 0, greenYellowTrend: 0, yellow: 0, yellowRedTrend: 0, red: 0, black: 0 }
  STUDENT_PROFILES.forEach(p => {
    const lv = p.currentLevel
    if (lv === 'green' && !p.trend) r.green++
    else if (lv === 'green_yellow_trend' || (lv === 'green' && p.trend)) r.greenYellowTrend++
    else if (lv === 'yellow' && p.trend !== 'red' && p.currentLevel !== 'yellow_red_trend') r.yellow++
    else if (lv === 'yellow_red_trend' || p.trend === 'red') r.yellowRedTrend++
    else if (lv === 'red') r.red++
    else if (lv === 'black') r.black++
    else r.green++
  })
  return r
}

export const SCHOOL_STATS = {
  totalStudents: STUDENTS.length,
  currentWeekLabels: ['第22周', '第23周', '第24周', '第25周'],
  schoolRiskDistribution: sd(),
  weeklyGlobalRatios: [12.5, 14.8, 16.2, 18.5],
}

// ============================================================
// 家长映射
// ============================================================

export const PARENT_CHILDREN: Record<string, number[]> = {
  '张明悦家长': [101],
  '周昊然家长': [108],
}

// ============================================================
// IPC 摄像头
// ============================================================

export const CAMERAS: Camera[] = [
  { id: 1,  name: '初一(1)班 讲台主摄', classroom: '初一(1)班', ip: '192.168.1.101', status: 'online',  scene: 'classroom', resolution: '1920×1080', fps: 25, lastSeen: '2026-06-25T17:28:00', todayDetections: 12450, todayFaces: 285 },
  { id: 2,  name: '初一(2)班 讲台主摄', classroom: '初一(2)班', ip: '192.168.1.102', status: 'online',  scene: 'classroom', resolution: '1920×1080', fps: 25, lastSeen: '2026-06-25T17:28:00', todayDetections: 13100, todayFaces: 302 },
  { id: 3,  name: '初一(3)班 讲台主摄', classroom: '初一(3)班', ip: '192.168.1.103', status: 'online',  scene: 'classroom', resolution: '1920×1080', fps: 25, lastSeen: '2026-06-25T17:27:55', todayDetections: 11800, todayFaces: 268 },
  { id: 4,  name: '初一(4)班 讲台主摄', classroom: '初一(4)班', ip: '192.168.1.104', status: 'online',  scene: 'classroom', resolution: '1920×1080', fps: 25, lastSeen: '2026-06-25T17:27:50', todayDetections: 10500, todayFaces: 240 },
  { id: 5,  name: '初二(1)班 讲台主摄', classroom: '初二(1)班', ip: '192.168.2.101', status: 'online',  scene: 'classroom', resolution: '1920×1080', fps: 25, lastSeen: '2026-06-25T17:28:00', todayDetections: 11200, todayFaces: 255 },
  { id: 6,  name: '初二(2)班 讲台主摄', classroom: '初二(2)班', ip: '192.168.2.102', status: 'online',  scene: 'classroom', resolution: '1920×1080', fps: 25, lastSeen: '2026-06-25T17:27:58', todayDetections: 10800, todayFaces: 248 },
  { id: 7,  name: '初二(3)班 讲台主摄', classroom: '初二(3)班', ip: '192.168.2.103', status: 'online',  scene: 'classroom', resolution: '1920×1080', fps: 25, lastSeen: '2026-06-25T17:27:56', todayDetections: 11500, todayFaces: 262 },
  { id: 8,  name: '初三(1)班 讲台主摄', classroom: '初三(1)班', ip: '192.168.3.101', status: 'online',  scene: 'classroom', resolution: '1920×1080', fps: 25, lastSeen: '2026-06-25T17:28:00', todayDetections: 9800,  todayFaces: 220 },
  { id: 9,  name: '初三(2)班 讲台主摄', classroom: '初三(2)班', ip: '192.168.3.102', status: 'online',  scene: 'classroom', resolution: '1920×1080', fps: 25, lastSeen: '2026-06-25T17:27:52', todayDetections: 10200, todayFaces: 235 },
  { id: 10, name: '食堂入口',           classroom: '',           ip: '192.168.5.201', status: 'standby', scene: 'canteen',   resolution: '2560×1440', fps: 10, lastSeen: '2026-06-25T17:20:00', todayDetections: 0, todayFaces: 0 },
  { id: 11, name: '学校大门',           classroom: '',           ip: '192.168.5.202', status: 'standby', scene: 'gate',      resolution: '2560×1440', fps: 15, lastSeen: '2026-06-25T17:20:00', todayDetections: 0, todayFaces: 0 },
]

// ============================================================
// AI 推理流水线
// ============================================================

export const PIPELINE_STAGES: AIPipelineStage[] = [
  { key: 'capture',    label: '采集',       status: 'ok',       latency: 8,   processed: 12450 },
  { key: 'preprocess', label: '预处理',     status: 'ok',       latency: 12,  processed: 12450 },
  { key: 'detect',     label: '检测',       status: 'ok',       latency: 18,  processed: 12380 },
  { key: 'emotion',    label: '情绪识别',   status: 'ok',       latency: 5,   processed: 12100 },
  { key: 'map',        label: '状态映射',   status: 'ok',       latency: 1,   processed: 12100 },
  { key: 'write',      label: '数据写入',   status: 'ok',       latency: 3,   processed: 12100 },
  { key: 'insight',    label: '生成洞察',   status: 'degraded', latency: 45,  processed: 1850 },
]

// ============================================================
// 实时检测日志
// ============================================================

function randomEmotions(base: 'good' | 'neutral' | 'abnormal'): EmotionScores {
  if (base === 'good') return { happy: 0.45, neutral: 0.35, surprise: 0.08, sad: 0.04, angry: 0.03, disgust: 0.02, fear: 0.03 }
  if (base === 'abnormal') return { happy: 0.05, neutral: 0.25, surprise: 0.08, sad: 0.30, angry: 0.15, disgust: 0.10, fear: 0.07 }
  return { happy: 0.10, neutral: 0.55, surprise: 0.12, sad: 0.08, angry: 0.05, disgust: 0.04, fear: 0.06 }
}

function logStudent(className: string): { studentId: number | null; name: string | null } {
  const ids = STUDENTS.filter(s => s.className === className).map(s => s.id)
  const id = ids[Math.floor(Math.random() * ids.length)]
  return { studentId: id, name: STUDENTS.find(s => s.id === id)?.name ?? null }
}

const SAMPLE_BASES: Array<{ key: string; base: 'good' | 'neutral' | 'abnormal'; sys: 1 | 2 }> = [
  { key: '初一(1)班', base: 'good', sys: 2 },
  { key: '初一(1)班', base: 'neutral', sys: 2 },
  { key: '初一(2)班', base: 'abnormal', sys: 2 },
  { key: '初一(1)班', base: 'neutral', sys: 1 },
  { key: '初一(2)班', base: 'good', sys: 2 },
  { key: '初一(2)班', base: 'abnormal', sys: 2 },
  { key: '初一(1)班', base: 'abnormal', sys: 1 },
  { key: '初一(3)班', base: 'neutral', sys: 2 },
  { key: '初一(3)班', base: 'good', sys: 2 },
  { key: '初二(1)班', base: 'neutral', sys: 2 },
  { key: '初二(1)班', base: 'good', sys: 2 },
  { key: '初一(1)班', base: 'abnormal', sys: 2 },
  { key: '初一(2)班', base: 'neutral', sys: 1 },
  { key: '初二(2)班', base: 'neutral', sys: 2 },
  { key: '初一(1)班', base: 'good', sys: 2 },
  { key: '初一(2)班', base: 'abnormal', sys: 2 },
]

const CLASS_CAMERA: Record<string, number> = {
  '初一(1)班': 1, '初一(2)班': 2, '初一(3)班': 3, '初一(4)班': 4,
  '初二(1)班': 5, '初二(2)班': 6, '初二(3)班': 7,
  '初三(1)班': 8, '初三(2)班': 9,
}

export const DETECTION_LOG: DetectionEvent[] = SAMPLE_BASES.map((b, i) => {
  const l = logStudent(b.key)
  const emotions = randomEmotions(b.base)
  const topState = emotions.happy >= 0.33 ? 'engaged' as const
    : emotions.surprise >= 0.18 ? 'confused' as const
    : (emotions.sad + emotions.angry + emotions.fear + emotions.disgust) >= 0.25 ? 'withdrawn' as const
    : 'engaged' as const

  return {
    id: 2000 + i,
    timestamp: `2026-06-25T17:${String(20 + i * 2).padStart(2, '0')}:${String(10 + (i % 3) * 15).padStart(2, '0')}`,
    cameraId: CLASS_CAMERA[b.key] ?? 1,
    studentId: l.studentId,
    studentName: l.name,
    confidence: 0.82 + Math.random() * 0.16,
    emotions,
    state: topState,
    faceBox: { x: 120 + i * 10, y: 80 + i * 5, w: 60, h: 75 },
    faceQuality: 0.7 + Math.random() * 0.25,
    cameraSystem: b.sys,
  }
})

// ============================================================
// 日采样数据
// ============================================================

const EMOTION_KEYS: (keyof EmotionScores)[] = ['happy', 'neutral', 'surprise', 'sad', 'angry', 'disgust', 'fear']

function genDaySamples(date: string, cameraId: number, total: number, abnormalRate: number): DailySample {
  const abnormal = Math.round(total * abnormalRate)
  const normal = total - abnormal
  const base: EmotionScores = { happy: 0, neutral: 0, surprise: 0, sad: 0, angry: 0, disgust: 0, fear: 0 }
  for (const k of EMOTION_KEYS) base[k] = +(Math.random() * 0.2 + (k === 'neutral' ? 0.3 : 0.05)).toFixed(3)
  const sum = EMOTION_KEYS.reduce((s, k) => s + base[k], 0)
  for (const k of EMOTION_KEYS) base[k] = +(base[k] / sum).toFixed(4)

  return {
    date, cameraId,
    totalSamples: Math.round(total * 1.15),
    validSamples: total,
    stateDistribution: {
      engaged: Math.round(normal * 0.40),
      confused: Math.round(normal * 0.35),
      withdrawn: abnormal,
      unknown: Math.max(0, normal - Math.round(normal * 0.40) - Math.round(normal * 0.35)),
    },
    emotionDistribution: base,
    abnormalEvents: Math.round(abnormalRate * 12),
    peakHour: 9 + Math.floor(Math.random() * 7),
  }
}

const ALL_CAMERA_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
export const DAILY_SAMPLES: DailySample[] = []
const DATES = ['2026-06-19', '2026-06-20', '2026-06-21', '2026-06-22', '2026-06-23', '2026-06-24', '2026-06-25']
for (const date of DATES) {
  for (const cid of ALL_CAMERA_IDS) {
    const rate = 0.08 + (cid % 5) * 0.02 + (DATES.indexOf(date) * 0.005)
    DAILY_SAMPLES.push(genDaySamples(date, cid, 350 + (cid * 10) + Math.round(Math.random() * 80), rate))
  }
}

// ============================================================
// 系统汇总统计
// ============================================================

export const AI_SYSTEM_STATS = {
  todayTotalDetections: DETECTION_LOG.length * 780,
  todayRecognizedFaces: 285,
  avgConfidence: 0.91,
  p95Latency: 38,
  queueDepth: 127,
  pipelineUptime: 99.8,
  system1EventCount: 86,
  system2SampleCount: 2450,
}

// ============================================================
// 学生人脸注册数据
// ============================================================

export const FACE_ENROLLMENT: Record<number, { registered: boolean; quality: number; lastUpdated: string }> = {}
for (const s of STUDENTS) {
  const cls = GRADE_TREE.flatMap(g => g.classes).find(c => c.name === s.className)
  const countForClass = STUDENTS.filter(ss => ss.className === s.className).indexOf(s)
  const registered = cls ? countForClass < cls.enrolled : true
  FACE_ENROLLMENT[s.id] = {
    registered,
    quality: registered ? 0.78 + Math.random() * 0.18 : 0,
    lastUpdated: registered ? '2026-06-' + String(15 + (s.id % 10)).padStart(2, '0') : '',
  }
}
