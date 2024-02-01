export interface IAsistenciaResult {
  tipo: string
  numero: string
  descripcion: string
  fecha: string
  url: string
  codigo_sesion: string
  status: string
}

export enum EAsistenciaStatus {
  UNPROCESSED = 'UNPROCESSED',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
}
