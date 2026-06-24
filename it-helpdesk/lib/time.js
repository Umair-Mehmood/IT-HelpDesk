/** Current time as Excel serial (matches frontend dateUtils) */
export function nowExcelSerial() {
  const d = new Date()
  return 25569 + d.getTime() / (86400 * 1000)
}
