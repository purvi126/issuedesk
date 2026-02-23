export function makeIssueNumber(date = new Date(), seq4: number) {
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const tail = String(seq4).padStart(4, "0");
  return `${yy}${mm}${dd}${tail}`; // 2602220001
}