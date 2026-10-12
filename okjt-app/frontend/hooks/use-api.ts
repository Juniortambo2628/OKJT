"use client"

import useSWR from 'swr'
import api from '@/lib/api'

const fetcher = (url: string) => api.get(url).then(res => {
  return res.data?.data !== undefined ? res.data.data : res.data;
})

interface UseApiOptions<T> {
  fallbackData?: T
}

// NOTE: `options` must stay optional with no default value. A default of `{}`
// gives TypeScript an inference site for T, which collapses every untyped call
// site down to `useApi<{}>` instead of the declared `unknown` default.
export function useApi<T = unknown>(url: string | null, options?: UseApiOptions<T>) {
  const { data, error, isLoading, mutate } = useSWR<T>(url, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 2000,
    keepPreviousData: true,
    fallbackData: options?.fallbackData,
  })

  return {
    data,
    isLoading,
    isError: error,
    mutate
  }
}

