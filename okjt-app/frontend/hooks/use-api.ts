"use client"

import useSWR from 'swr'
import api from '@/lib/api'

const fetcher = (url: string) => api.get(url).then(res => res.data)

interface UseApiOptions<T> {
  fallbackData?: T
}

export function useApi<T = any>(url: string | null, options: UseApiOptions<T> = {}) {
  const { data, error, isLoading, mutate } = useSWR<T>(url, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 2000,
    keepPreviousData: true,
    fallbackData: options.fallbackData,
  })

  return {
    data,
    isLoading,
    isError: error,
    mutate
  }
}

