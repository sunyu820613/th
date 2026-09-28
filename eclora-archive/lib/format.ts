export function formatJPY(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}
