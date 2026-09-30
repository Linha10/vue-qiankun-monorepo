import { createRequest } from '@monorepo/request'

const request = createRequest({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  loginRedirectPath: '/login',
})

export default request
