export type UserRole = 'admin' | 'guru' | 'siswa'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  class_id?: string
  is_verified: boolean
  verified_by?: string
  created_at: string
}

export interface Class {
  id: string
  name: string
  teacher_id?: string
  mata_pelajaran_id?: string
  tahun_ajaran?: string
  jurusan?: string
  mata_pelajaran?: MataPelajaran
}

export interface MataPelajaran {
  id: string
  nama: string
  kode?: string
}

export interface Project {
  id: string
  title: string
  description: string
  created_by: string
}

export interface StudentProject {
  id: string
  student_id: string
  project_id: string
  status: 'draft' | 'in_progress' | 'submitted' | 'approved' | 'rejected'
  final_score?: number
  is_published: boolean
  published_at?: string
  beneficiary_name?: string
  beneficiary_type?: string
  location_name?: string
  demo_url?: string
  github_url?: string
  views: number
  likes_count: number
  mata_pelajaran_id?: string
  class_id?: string
  rejection_note?: string
  submitted_at?: string
  approved_at?: string
  approved_by?: string
  // joined
  student?: User
  project?: Project
  screenshots?: ProjectScreenshot[]
  mata_pelajaran?: MataPelajaran
  class?: Class
}

export interface ProjectScreenshot {
  id: string
  student_project_id: string
  url: string
  is_primary: boolean
}

export interface ProjectLike {
  id: string
  project_id: string
  user_id?: string
  ip_address?: string
  created_at: string
}

export interface ProgressLog {
  id: string
  student_project_id: string
  title: string
  description: string
  progress_percent: number
  created_at: string
  feedbacks?: Feedback[]
}

export interface Feedback {
  id: string
  progress_id: string
  teacher_id: string
  comment: string
  status: 'pending' | 'approved' | 'revision'
}

export interface Rubric {
  id: string
  project_id: string
  name: string
  weight: number
}

export interface Score {
  id: string
  student_project_id: string
  rubric_id: string
  score: number
  comment?: string
}
