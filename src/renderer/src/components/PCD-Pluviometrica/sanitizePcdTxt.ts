export function sanitizePcdTxtExport(content: string): string {
  return content
    .replace(/begin--/gi, '')
    .replace(/–end/g, '')
    .replace(/--end/gi, '')
    .replace(/PluviDB-IoT/gi, 'PCD Pluviométrica')
    .replace(/PluviDB/gi, 'PCD Pluviométrica')
}
