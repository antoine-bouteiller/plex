export interface QueueItem {
  id: number
  errorMessage?: string
  status: string
  title: string
  trackedDownloadStatus?: string
}

export interface QueueResponse {
  records: QueueItem[]
  totalRecords: number
}
