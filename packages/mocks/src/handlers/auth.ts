import { http } from 'msw'
import { ok, fail } from '../apiResponse'
import { generateCaptcha, verifyCaptcha } from '../data/captcha'
import { DEMO_ACCOUNT_ID, accountsDb } from '../data/accounts'

const DEMO_ACCOUNT_NAME = 'demo'
const DEMO_PASSWORD = 'demo123'

export const authHandlers = [
  // 取得驗證碼
  http.get('*/v1/accounts/captcha', () => {
    const { captchaId, captchaValue, picPath } = generateCaptcha()
    return ok({
      captchaId,
      captchaLength: captchaValue.length,
      captchaValue,
      expiredTime: new Date(Date.now() + 5 * 60_000).toISOString(),
      picPath,
    })
  }),

  // 登入：僅 demo/demo123 成功，其餘一律回傳業務錯誤（code!==0），不用 401，
  // 避免被 axios 攔截器判定為 token 過期而導向「登入已過期」的誤導訊息。
  http.post('*/v1/accounts/login', async ({ request }) => {
    const body = (await request.json()) as {
      accountName?: string
      password?: string
      captcha?: string
      captchaId?: string
    }

    if (!verifyCaptcha(body.captchaId ?? '', body.captcha ?? '')) {
      return fail('驗證碼錯誤，請重新輸入', 40)
    }

    let decodedPassword = ''
    try {
      decodedPassword = atob(body.password ?? '')
    } catch {
      decodedPassword = ''
    }

    if (body.accountName !== DEMO_ACCOUNT_NAME || decodedPassword !== DEMO_PASSWORD) {
      return fail('帳號或密碼錯誤', 41)
    }

    const account = accountsDb.getById(DEMO_ACCOUNT_ID)

    return ok({
      accessExpiresIn: 3600,
      accessToken: `demo-access-token-${Date.now()}`,
      refreshExpiresIn: 86400,
      refreshToken: `demo-refresh-token-${Date.now()}`,
      tokenType: 'Bearer',
      user: {
        accountName: account?.accountName ?? DEMO_ACCOUNT_NAME,
        code: account?.code ?? 'A0001',
        id: DEMO_ACCOUNT_ID,
        role: 'admin',
      },
    })
  }),

  // 登出：demo 環境不需真的註銷任何東西
  http.post('*/v1/accounts/logout', () => ok(null, '登出成功')),

  // 更新 accessToken：demo 環境固定回傳新 token，不做真的過期判斷
  http.post('*/v1/accounts/refresh', () =>
    ok({
      accessExpiresIn: 3600,
      accessToken: `demo-access-token-${Date.now()}`,
      refreshExpiresIn: 86400,
      refreshToken: `demo-refresh-token-${Date.now()}`,
      tokenType: 'Bearer',
    })
  ),
]
