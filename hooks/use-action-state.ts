// lib/use-action-state.ts
import { useState } from "react";

export function useActionState<T, P>(
  action: (payload: P) => Promise<T>,
  initialState: T
) {
  const [state, setState] = useState<T>(initialState);
  const [isPending, setIsPending] = useState(false);

  async function dispatch(payload: P): Promise<T> {
    setIsPending(true);
    try {
      const result = await action(payload);
      setState(result);
      return result;
      // eslint-disable-next-line no-useless-catch
    } catch (err) {
      throw err;
    } finally {
      setIsPending(false);
    }
  }

  return [state, dispatch, isPending] as const;
}
