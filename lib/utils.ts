import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toString()
}

export function isSchoolEmail(email: string): boolean {
  return email.endsWith('@student.smktelkom-mlg.sch.id')
}
