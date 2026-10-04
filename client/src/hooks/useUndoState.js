import { useCallback, useState } from 'react';

/** State with an undo stack (max 30 snapshots) for the workspace dataset. */
export default function useUndoState(initial) {
  const [state, setState] = useState(initial);
  const [past, setPast] = useState([]);
  const set = useCallback((next) => {
    setPast((p) => [...p.slice(-29), state]);
    setState(next);
  }, [state]);
  const undo = useCallback(() => {
    setPast((p) => {
      if (!p.length) return p;
      setState(p[p.length - 1]);
      return p.slice(0, -1);
    });
  }, []);
  const reset = useCallback((value) => { setState(value); setPast([]); }, []);
  return { state, set, undo, reset, canUndo: past.length > 0 };
}
