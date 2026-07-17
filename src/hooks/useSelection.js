import { useState, useCallback, useMemo, useEffect } from "react";

export function useSelection(visibleIds) {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setSelected((prev) => prev.filter((id) => visibleIds.includes(id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleIds.join("|")]);

  const toggle = useCallback((id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const allChecked = visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));
  const someChecked = selected.length > 0 && !allChecked;

  const toggleAll = useCallback(() => {
    setSelected((prev) => (allChecked ? prev.filter((id) => !visibleIds.includes(id)) : [...new Set([...prev, ...visibleIds])]));
  }, [allChecked, visibleIds]);

  const clear = useCallback(() => setSelected([]), []);

  return useMemo(
    () => ({ selected, toggle, toggleAll, clear, allChecked, someChecked, count: selected.length }),
    [selected, toggle, toggleAll, clear, allChecked, someChecked]
  );
}
