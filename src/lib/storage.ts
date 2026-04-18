export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  const already = await navigator.storage.persisted?.();
  if (already) return true;
  try {
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

export async function getStorageEstimate(): Promise<{
  usage: number;
  quota: number;
  persisted: boolean;
} | null> {
  if (!navigator.storage?.estimate) return null;
  const est = await navigator.storage.estimate();
  const persisted = (await navigator.storage.persisted?.()) ?? false;
  return {
    usage: est.usage ?? 0,
    quota: est.quota ?? 0,
    persisted,
  };
}
