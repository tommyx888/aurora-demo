// ============================================
// CORE TYPES — Digital Evolution Demo
// ============================================

export type Theme = 'mint' | 'coral' | 'navy' | 'custom' | 'editorial';

export interface BrandingState {
  isActive: boolean;
  companyName: string;
  logoDataUrl: string | null;
  primary: string;
  secondary: string;
  rawColors: string[];
}
export type UserRole = 'employee' | 'admin' | 'both';

export type Page =
  | 'landing'
  | 'role-picker'
  | 'onboarding'
  | 'employee-dashboard'
  | 'admin-dashboard'
  | 'skill-matrix'
  | 'recruiting'
  | 'requests'
  | 'orgchart'
  | 'surveys'
  | 'newsletter'
  | 'events'
  | 'time-off'
  | 'performance'
  | 'ai-office'
  | 'cv-screener';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar: string;
  startDate: string;
  birthday: string;
  manager?: string;
  skills: Record<string, number>;
  location: string;
  isOnLeave?: boolean;
}

export interface Skill {
  name: string;
  category: string;
  description: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  stage: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  appliedDate: string;
  source: string;
  rating: number;
  notes: string;
  avatar: string;
  matchScore?: number; // AI match score 0-100
  phone?: string;
  linkedin?: string;
  activity?: ActivityEntry[];
  interviewDate?: string;
}

export interface ActivityEntry {
  id: string;
  timestamp: number;
  type: 'stage-change' | 'note-added' | 'rating-changed' | 'email-sent' | 'interview-scheduled' | 'created';
  description: string;
}

export interface Request {
  id: string;
  type: 'leave' | 'equipment' | 'training' | 'travel' | 'other';
  title: string;
  requester: string;
  requesterAvatar: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
  amount?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  emoji: string;
  reactions: { emoji: string; count: number }[];
}

export interface Event {
  id: string;
  title: string;
  date: string;
  type: 'birthday' | 'anniversary' | 'meeting' | 'holiday' | 'company';
  description: string;
  participants?: string[];
}

export interface Survey {
  id: string;
  title: string;
  question: string;
  type: 'pulse' | 'enps' | 'feedback';
  responses: number;
  total: number;
  averageScore: number;
  date: string;
}

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  type: 'welcome' | 'profile' | 'team' | 'tools' | 'training' | 'complete';
  completed: boolean;
  duration: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface OrgNode {
  id: string;
  name: string;
  role: string;
  avatar: string;
  department: string;
  children?: OrgNode[];
}

// ============================================
// NEW: Time-off / Dovolenky
// ============================================
export interface TimeOffEntry {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  type: 'vacation' | 'sick' | 'personal' | 'parental' | 'other';
  status: 'approved' | 'pending' | 'rejected';
  note?: string;
}

// ============================================
// NEW: Performance Reviews
// ============================================
export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  period: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  scheduledDate: string;
  overallScore?: number;
  strengths?: string[];
  improvements?: string[];
  goals?: PerformanceGoal[];
  feedback360?: Feedback360[];
}

export interface PerformanceGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  dueDate: string;
  status: 'on-track' | 'at-risk' | 'off-track' | 'achieved';
}

export interface Feedback360 {
  fromId: string;
  fromRole: 'peer' | 'manager' | 'report' | 'self';
  rating: number;
  comment?: string;
  anonymous: boolean;
}

// ============================================
// NEW: AI Office Generator templates
// ============================================
export type AIDocTemplate =
  | 'employment-contract'
  | 'job-posting'
  | 'exit-interview'
  | 'review-draft'
  | 'offer-letter'
  | 'warning-letter';

export interface GeneratedDoc {
  template: AIDocTemplate;
  title: string;
  content: string;
  generatedAt: number;
}

// ============================================
// NEW: CV Screening
// ============================================
export interface CVAnalysis {
  candidateName: string;
  position: string;
  matchScore: number;
  skillMatch: number;
  experienceMatch: number;
  cultureMatch: number;
  extractedSkills: string[];
  yearsExperience: number;
  redFlags: string[];
  highlights: string[];
  recommendation: 'strong-fit' | 'good-fit' | 'maybe' | 'not-fit';
  summary: string;
}

// ============================================
// NEW: Training / Skoleinia
// ============================================
export type TrainingType = 'online-course' | 'internal-workshop' | 'mentor' | 'external-course' | 'conference';

export interface Training {
  id: string;
  skillName: string;
  participantIds: string[];
  startDate: string;
  durationDays: number;
  type: TrainingType;
  provider?: string;
  budget: number;
  targetLevel: number; // 1-5
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: number;
}
