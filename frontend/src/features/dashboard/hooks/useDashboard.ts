import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboardService";
import { useAuthStore } from "@/stores/authStore";

export function useDailyDashboard(date?: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["dashboard", "daily", date],
    queryFn: () =>
      dashboardService.getDaily(date).then((r) => r.data?.data ?? r.data),
    enabled: !!token,
  });
}

export function useWeeklyDashboard(weekStart?: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["dashboard", "weekly", weekStart],
    queryFn: () =>
      dashboardService.getWeekly(weekStart).then((r) => r.data?.data ?? r.data),
    enabled: !!token,
  });
}

export function useMonthlyDashboard(year: number, month: number) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["dashboard", "monthly", year, month],
    queryFn: () =>
      dashboardService
        .getMonthly(year, month)
        .then((r) => r.data?.data ?? r.data),
    enabled: !!token,
  });
}
