// 簡單的 in-memory 驗證碼儲存，captchaId -> 明文驗證碼字串。
// demo 用途：圖片用內嵌 SVG 直接畫出文字，不做真的圖形扭曲/OCR 防護。
const store = new Map<string, string>()

const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

// demo 用途，不涉及任何實際安全防護，仍優先用 crypto API 取亂數以符合一般靜態掃描建議。
function randomInt(max: number): number {
  const buffer = new Uint32Array(1)
  crypto.getRandomValues(buffer)
  return buffer[0] % max
}

export function generateCaptcha(): { captchaId: string; captchaValue: string; picPath: string } {
  const captchaId = `captcha-${Date.now()}-${randomInt(1_000_000)}`
  const captchaValue = Array.from({ length: 4 }, () => CHARS[randomInt(CHARS.length)]).join('')

  store.set(captchaId, captchaValue)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="44">
    <rect width="120" height="44" fill="#f1f5f9"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
      font-family="monospace" font-size="22" letter-spacing="4" fill="#1e293b">${captchaValue}</text>
  </svg>`
  const picPath = `data:image/svg+xml;base64,${btoa(svg)}`

  return { captchaId, captchaValue, picPath }
}

export function verifyCaptcha(captchaId: string, value: string): boolean {
  const expected = store.get(captchaId)
  if (!expected) return false
  return expected.toLowerCase() === value?.toLowerCase()
}
