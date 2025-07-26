import '@/start/cron'
import '@/start/server'

if ('development' !== process.env.NODE_ENV) {
  void import('@/start/telegram')
}
