export function typedDiff<T>(
  oldObj: T,
  newObj: T,
  keys: (keyof T)[],
): Partial<Record<keyof T, { old: T[keyof T]; new: T[keyof T] }>> {
  const changes: Partial<
    Record<keyof T, { old: T[keyof T]; new: T[keyof T] }>
  > = {};

  for (const key of keys) {
    if (oldObj[key] !== newObj[key]) {
      changes[key] = { old: oldObj[key], new: newObj[key] };
    }
  }

  return changes;
}
