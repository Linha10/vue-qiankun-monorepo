import { faker } from "@faker-js/faker";
import { createMockDb } from "../createMockDb";
import { DEMO_ROLE_ID } from "./roles";

export interface AccountRecord {
  id: string;
  code: string;
  accountName: string;
  email: string;
  phone: string;
  status: 0 | 1;
  loginAt: string;
  loginIp: string;
}

// 固定的 demo 帳號 id，前端畫面與各處 mock 資料都用這個 id 關聯 demo 帳號。
// demo 帳號的權限改以「Demo」角色驅動（見下面的 accountRoleAssignments），
// 不再寫死放進 admin 白名單略過檢查，詳見 apps/project-admin/src/api/permission.ts 的註解。
export const DEMO_ACCOUNT_ID = "3f2abaa9-5cc2-441e-92a3-548a211b6482";

function buildSeed(): AccountRecord[] {
  faker.seed(3003);
  const demo: AccountRecord = {
    id: DEMO_ACCOUNT_ID,
    code: "A0001",
    accountName: "demo",
    email: "demo@example.com",
    phone: "0912345678",
    status: 1,
    loginAt: new Date().toISOString(),
    loginIp: "127.0.0.1",
  };
  const others = Array.from({ length: 11 }, (_, index) => ({
    id: `acc-${index + 2}`,
    code: `A${String(index + 2).padStart(4, "0")}`,
    accountName: faker.internet.username().toLowerCase(),
    email: faker.internet.email().toLowerCase(),
    phone: faker.phone.number({ style: "international" }),
    status: faker.helpers.arrayElement([1, 1, 1, 0]) as 0 | 1,
    loginAt: faker.date.recent({ days: 30 }).toISOString(),
    loginIp: faker.internet.ipv4(),
  }));
  return [demo, ...others];
}

export const accountsDb = createMockDb<AccountRecord>(buildSeed(), {
  idPrefix: "acc",
  keywordFields: ["accountName", "email", "code"],
  matchFields: ["status"],
});

// accountId -> 已指派的角色 id 清單。
// demo 帳號指派「Demo」角色（見 ./roles.ts 的 DEMO_ROLE_ID），而不是系統管理員，
// 這樣使用者才能透過角色管理調整 Demo 角色的權限，實際體驗 demo 帳號被擋頁面 /
// create-update-delete 按鈕被 disable 的效果（見 apps/project-admin 的
// api/permission.ts：demo 帳號已不在寫死的 admin 白名單內，改吃這份角色權限資料）。
export const accountRoleAssignments = new Map<string, number[]>([
  [DEMO_ACCOUNT_ID, [Number(DEMO_ROLE_ID)]],
]);
