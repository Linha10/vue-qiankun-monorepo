import { faker } from '@faker-js/faker'
import { createMockDb } from '../createMockDb'

export interface AccountRecord {
  id: string
  code: string
  accountName: string
  email: string
  phone: string
  status: 0 | 1
  loginAt: string
  loginIp: string
}

// 固定的 demo 帳號 id，與 apps/renhospes-admin/src/api/permission.ts 的 admin 清單一致，
// 讓 demo 帳號登入後自動被判定為 admin，略過所有選單/按鈕權限檢查。
export const DEMO_ACCOUNT_ID = '3f2abaa9-5cc2-441e-92a3-548a211b6482'

function buildSeed(): AccountRecord[] {
  faker.seed(3003)
  const demo: AccountRecord = {
    id: DEMO_ACCOUNT_ID,
    code: 'A0001',
    accountName: 'demo',
    email: 'demo@example.com',
    phone: '0912345678',
    status: 1,
    loginAt: new Date().toISOString(),
    loginIp: '127.0.0.1',
  }
  const others = Array.from({ length: 11 }, (_, index) => ({
    id: `acc-${index + 2}`,
    code: `A${String(index + 2).padStart(4, '0')}`,
    accountName: faker.internet.username().toLowerCase(),
    email: faker.internet.email().toLowerCase(),
    phone: faker.phone.number({ style: 'international' }),
    status: faker.helpers.arrayElement([1, 1, 1, 0]) as 0 | 1,
    loginAt: faker.date.recent({ days: 30 }).toISOString(),
    loginIp: faker.internet.ipv4(),
  }))
  return [demo, ...others]
}

export const accountsDb = createMockDb<AccountRecord>(buildSeed(), {
  idPrefix: 'acc',
  keywordFields: ['accountName', 'email', 'code'],
  matchFields: ['status'],
})

// accountId -> 已指派的角色 id 清單
export const accountRoleAssignments = new Map<string, number[]>([[DEMO_ACCOUNT_ID, [1]]])
