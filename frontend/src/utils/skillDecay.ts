export function isSkillStale(lastUpdated: string, thresholdDays = 75): boolean {
  if (!lastUpdated) return false;
  const daysSince = (Date.now() - new Date(lastUpdated).getTime()) / 86400000;
  return daysSince > thresholdDays;
}
