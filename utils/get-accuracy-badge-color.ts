/**
 * Returns the appropriate Tailwind CSS class for coloring badges based on accuracy value
 * @param accuracy The accuracy percentage (0-100)
 * @returns Tailwind CSS class string for badge coloring
 */
export function getAccuracyBadgeColor(accuracy: number): string {
  if (accuracy >= 80) return "bg-green-500 hover:bg-green-600";
  if (accuracy >= 70) return "bg-blue-500 hover:bg-blue-600";
  if (accuracy >= 60)
    return "bg-yellow-500 hover:bg-yellow-600 text-yellow-900";
  return "bg-red-500 hover:bg-red-600";
}
