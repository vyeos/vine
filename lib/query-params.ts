'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function useQueryParam(key: string, defaultValue?: string) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const value = searchParams.get(key) || defaultValue || '';

  const setValue = useCallback(
    (newValue: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newValue === null || newValue === '') {
        params.delete(key);
      } else {
        params.set(key, newValue);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [key, pathname, router, searchParams],
  );

  return [value, setValue] as const;
}

export function useQueryParamValue(key: string, defaultValue?: string): string {
  const searchParams = useSearchParams();
  return searchParams.get(key) || defaultValue || '';
}

export function useSetQueryParam(key: string) {
  const [, setValue] = useQueryParam(key);
  return setValue;
}
