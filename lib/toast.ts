import { toast } from "sonner"

export const notify = {
  success: (message: string, description?: string) =>
    toast.success(message, description ? { description } : undefined),
  error: (message: string, description?: string) =>
    toast.error(message, description ? { description } : undefined),
  warning: (message: string, description?: string) =>
    toast.warning(message, description ? { description } : undefined),
}

export { toast }
