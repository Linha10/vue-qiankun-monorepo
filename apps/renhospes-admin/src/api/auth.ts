import request from './request'
import type { LoginParams, LoginResponse, CaptchaResponse } from '@/types/api-params'

type ChangeAccountPayload = {
  newPassword: string
  oldPassword: string
}

// TODO: 補上登入、登出、取得目前使用者資訊等 API
export const authApi = {
  // 密碼要轉成BASE64後再傳回後端
  login: (data: LoginParams) => request.post<LoginResponse>('/v1/accounts/login', data),

  // 無須攜帶TOKEN
  getCaptcha: () => request.get<CaptchaResponse>('/v1/accounts/captcha'),

  // 登出, 註銷refreshToken
  logout: (logoutParams: { accountId: string; refreshToken: string }) =>
    request.post('/v1/accounts/logout', logoutParams),

  // 更新accessToken
  getAccessToken: (params: { accountId: string; refreshToken: string }) =>
    request.post('/v1/accounts/refresh', params),

  changeAccountPassword: (payload: ChangeAccountPayload) => {
    return request.put('/v1/accounts/change-password', payload)
  },
}
