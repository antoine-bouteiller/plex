import '@/start/cron'
import '@/start/server'

if (process.env.NODE_ENV !== 'development') {
  void import('@/start/telegram')
}
