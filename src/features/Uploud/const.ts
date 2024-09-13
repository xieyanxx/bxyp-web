export enum UploadAccept {
  img = 'image/*',
  video = 'video/*',
  audio = 'audio/*',
  mp3 = 'audio/mpeg',
  wav = 'audio/vnd.wave',
  aif = 'audio/x-aiff',
  ogg = 'application/ogg',
  /**
   * @description 实际上浏览器不识别，相当于没限制
   */
  aac = 'audio/x-aac',
  png = 'image/png',
  jpg = 'image/jpeg',
  gif = 'image/gif',
  bmp = 'image/bmp',
  webp = 'image/webp',
  ico = 'image/x-icon',
  svg = 'image/svg+xml',
  csv = 'application/vnd.ms-excel',
  xlsx = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip = 'application/zip',
  json = 'application/json',
}
