export function randomMockData(
  lastValue: number,
  min: number,
  max: number,
  maxStep: number
) {
  if (maxStep <= 0) {
    throw new Error("maxStep must be greater than 0");
  }

  const lowerBound = Math.max(min, lastValue - maxStep);
  const upperBound = Math.min(max, lastValue + maxStep);

  const nextValue = Math.random() * (upperBound - lowerBound) + lowerBound;

  return nextValue;
}
