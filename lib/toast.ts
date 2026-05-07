import { toast } from 'sonner'

export const notify = {
  success: (msg: string) => toast.success(msg),
  error: (msg: string) => toast.error(msg),
  loading: (msg: string) => toast.loading(msg),
  promise: toast.promise,
  info: (msg: string) => toast.info(msg),
  warning: (msg: string) => toast.warning(msg),
}
