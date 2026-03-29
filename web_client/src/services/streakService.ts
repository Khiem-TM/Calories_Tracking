import api from './axios'
import type { ApiResponse, StreakData } from '@/types'

export async function getStreaks(): Promise<StreakData[]> {
  const resp = await api.get<ApiResponse<StreakData[]>>('/streaks')
  return resp.data.data
}
