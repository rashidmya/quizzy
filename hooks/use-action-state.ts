// lib/use-action-state.ts
import { startTransition, useState } from "react";

export function useActionState<T, P>(
  action: (payload: P) => Promise<T>,
  initialState: T
) {
  const [state, setState] = useState<T>(initialState);
  const [isPending, setIsPending] = useState(false);

  async function dispatch(payload: P): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      startTransition(async () => {
        setIsPending(true);
        try {
          const result = await action(payload);
          setState(result);
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          setIsPending(false);
        }
      });
    });
  }

  return [state, dispatch, isPending] as const;
}
