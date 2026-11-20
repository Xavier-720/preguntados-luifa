import { useQuery } from '@tanstack/react-query'
import { api } from './client'

export function useConfig() {
  return useQuery({
    queryKey: ['config'],
    queryFn: api.getConfig,
    staleTime: 15_000,
    retry: 1,
  })
}

export function useAdminSettings(pin: string | null) {
  return useQuery({
    queryKey: ['admin', 'settings', pin],
    queryFn: () => api.getAdminSettings(pin as string),
    enabled: Boolean(pin),
    retry: false,
  })
}

export function useAdminStats(pin: string | null) {
  return useQuery({
    queryKey: ['admin', 'stats', pin],
    queryFn: () => api.getAdminStats(pin as string),
    enabled: Boolean(pin),
    retry: false,
  })
}
