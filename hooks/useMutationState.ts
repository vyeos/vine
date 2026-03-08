'use client';

import { useMutation } from 'convex/react';
import { useState } from 'react';

type MutationOptions<TResult> = {
  onSuccess?: (result: TResult) => void;
  onError?: (error: unknown) => void;
};

export function useMutationState<TArgs, TResult>(
  mutationRef: Parameters<typeof useMutation>[0],
) {
  const mutateRaw = useMutation(mutationRef as never);
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (args: TArgs): Promise<TResult> => {
    setIsPending(true);
    try {
      return (await mutateRaw(args as never)) as TResult;
    } finally {
      setIsPending(false);
    }
  };

  const mutate = (args: TArgs, options?: MutationOptions<TResult>) => {
    void mutateAsync(args).then(options?.onSuccess).catch(options?.onError);
  };

  return {
    isPending,
    mutate,
    mutateAsync,
  };
}
