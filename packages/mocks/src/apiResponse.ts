import { HttpResponse } from 'msw'

export function ok<T>(data: T, message = 'ok') {
  return HttpResponse.json({ code: 0, message, data })
}

export function fail(message: string, code = 1) {
  return HttpResponse.json({ code, message, data: null })
}
