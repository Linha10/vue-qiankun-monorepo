import request from './request'

export interface EmployeeItem {
  id: string
  name: string
  department: string
  title: string
  email: string
  phone: string
  status: 0 | 1
  hiredAt: string
}

export interface GetEmployeeListParams {
  page: number
  pageSize: number
  keyword?: string
  department?: string
  status?: 0 | 1
}

export interface EmployeeListResponse {
  list: EmployeeItem[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
}

export type EmployeePayload = Omit<EmployeeItem, 'id'>

export const employeeApi = {
  getList: (params: GetEmployeeListParams) => {
    return request.get<EmployeeListResponse>('/v1/employees', { params })
  },
  getById: (id: string) => {
    return request.get<EmployeeItem>(`/v1/employees/${id}`)
  },
  create: (data: EmployeePayload) => {
    return request.post('/v1/employees', data)
  },
  update: (id: string, data: Partial<EmployeePayload>) => {
    return request.put(`/v1/employees/${id}`, data)
  },
  delete: (id: string) => {
    return request.delete(`/v1/employees/${id}`)
  },
}
