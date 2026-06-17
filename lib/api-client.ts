import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  isAxiosError,
} from "axios"

import { deepTrim } from "@/lib/utils"

export type ApiResult<T> =
  | { data: T; error?: never }
  | {
      data?: never
      error: {
        message: string
        status: number
        details?: Record<string, unknown>
      }
    }

const client = axios.create({
  baseURL: "/api",
  withCredentials: true,
})

export class ApiClient {
  static async request<T>(
    config: AxiosRequestConfig,
    returnHeaders = false
  ): Promise<ApiResult<T> & { headers?: Record<string, string> }> {
    try {
      const isFormData = config.data instanceof FormData

      if (config.data && !isFormData) {
        config.data = deepTrim(config.data)
      }
      if (config.params) {
        config.params = deepTrim(config.params)
      }

      const response: AxiosResponse<T> = await client.request({
        ...config,
        headers: {
          ...(config.data && !isFormData
            ? { "Content-Type": "application/json" }
            : {}),
          ...config.headers,
        },
      })

      return {
        data: response.data,
        ...(returnHeaders && {
          headers: response.headers as Record<string, string>,
        }),
      }
    } catch (err) {
      if (isAxiosError(err)) {
        let message = "An unknown error occurred"
        let details: Record<string, unknown> | undefined

        if (err.response?.data instanceof Blob) {
          try {
            const data = JSON.parse(await err.response.data.text())
            message = data.error ?? data.message ?? message
            details = data.issues ?? data.details
          } catch {
            message = err.response?.statusText ?? message
          }
        } else {
          // Our API routes return { error } (400 also returns { issues }).
          const data = err.response?.data as
            | { error?: string; message?: string; issues?: unknown }
            | undefined
          message = data?.error ?? data?.message ?? message
          details = (data?.issues ?? undefined) as
            | Record<string, unknown>
            | undefined
        }

        return {
          error: {
            message,
            status: err.response?.status ?? 500,
            details,
          },
        }
      }
    }

    return {
      error: { message: "An unknown error occurred", status: 500 },
    }
  }

  static async get<T>(
    url: string,
    params?: Record<string, unknown>
  ): Promise<ApiResult<T>> {
    return this.request<T>({ method: "GET", url, params })
  }

  static async post<T, D = unknown>(
    url: string,
    data?: D
  ): Promise<ApiResult<T>> {
    return this.request<T>({ method: "POST", url, data })
  }

  static async put<T, D = unknown>(
    url: string,
    data?: D
  ): Promise<ApiResult<T>> {
    return this.request<T>({ method: "PUT", url, data })
  }

  static async patch<T, D = unknown>(
    url: string,
    data?: D
  ): Promise<ApiResult<T>> {
    return this.request<T>({ method: "PATCH", url, data })
  }

  static async delete<T>(
    url: string,
    params?: Record<string, unknown>
  ): Promise<ApiResult<T>> {
    return this.request<T>({ method: "DELETE", url, params })
  }

  static async getBlob<T>(
    url: string,
    params?: Record<string, unknown>
  ): Promise<ApiResult<T>> {
    return this.request<T>({ method: "GET", url, params, responseType: "blob" })
  }
}
