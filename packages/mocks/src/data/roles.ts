import { createMockDb } from "../createMockDb";

// Role.id 在型別上是 number，但共用的 createMockDb 要求 id 為 string，
// 這裡內部用字串儲存，交給 handlers 在組回應時 Number(id) 轉型即可。
// 重要：id 必須是「純數字字串」（如 "4"），handlers 那邊的 Number() 轉型才不會變成 NaN。
export interface RoleRecord {
  id: string;
  roleName: string;
  roleKey: string;
  sort: number;
  status: 0 | 1;
  createdAt: string;
  updateAt: string;
}

const now = new Date().toISOString();

// 固定的 demo 角色 id，讓 demo 帳號的權限改以「真的角色資料」驅動，
// 而不是寫死的 admin 白名單：使用者可以在角色管理裡調整這個角色的權限，
// 重新登入 demo 帳號後就能體驗頁面被擋 / 按鈕被 disable 的效果。
export const DEMO_ROLE_ID = "4";

// 完整權限（涵蓋所有選單 / 按鈕 id），見 ../data/menu.ts 的 menuTree。
const ALL_MENU_PERMISSION_IDS = [
  100, 1011, 1012, 1013, 200, 2011, 2012, 2013, 300, 301, 3011, 3012, 3013,
  3014, 302, 303, 304, 3041, 3042, 3043,
];

const seed: RoleRecord[] = [
  {
    id: "1",
    roleName: "系統管理員",
    roleKey: "admin",
    sort: 1,
    status: 1,
    createdAt: now,
    updateAt: now,
  },
  {
    id: "2",
    roleName: "一般使用者",
    roleKey: "user",
    sort: 2,
    status: 1,
    createdAt: now,
    updateAt: now,
  },
  {
    id: "3",
    roleName: "訪客",
    roleKey: "guest",
    sort: 3,
    status: 0,
    createdAt: now,
    updateAt: now,
  },
  {
    id: DEMO_ROLE_ID,
    roleName: "Demo",
    roleKey: "demo",
    sort: 4,
    status: 1,
    createdAt: now,
    updateAt: now,
  },
];

// 真實後端建立角色時會先產生角色 id，前端再用這個 id 去綁定權限選單，是兩個分開的請求。
// 這裡用 persistKey 讓新建立的角色（以及下面的權限綁定）在重新整理頁面後仍然存在、
// 擁有固定的 id，編輯頁才能正確用這個 id 查回角色資料與已勾選的權限；
// 只有關閉分頁或手動清除 session storage 才會重置回種子資料。
// 之後若要移除這個模擬行為（例如換成真實後端），拿掉 persistKey 這個 option 即可。
export const rolesDb = createMockDb<RoleRecord>(seed, {
  idPrefix: "role",
  keywordFields: ["roleName", "roleKey"],
  matchFields: ["status"],
  persistKey: "mock:roles-db",
});

const ROLE_MENU_ASSIGNMENTS_STORAGE_KEY = "mock:role-menu-assignments";

function loadRoleMenuAssignments(): Map<string, number[]> {
  const seedAssignments: [string, number[]][] = [
    ["1", [...ALL_MENU_PERMISSION_IDS]],
    ["2", [100, 200]],
    ["3", [100]],
    // demo 角色預設開啟全部權限，方便使用者先看到完整功能，
    // 再自己到角色管理裡調整、體驗權限被收回的效果。
    [DEMO_ROLE_ID, [...ALL_MENU_PERMISSION_IDS]],
  ];
  try {
    const raw = sessionStorage.getItem(ROLE_MENU_ASSIGNMENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, number[]>;
      return new Map(Object.entries(parsed));
    }
  } catch {
    // sessionStorage 不可用或資料損毀時，退回種子資料即可
  }
  return new Map(seedAssignments);
}

// roleId(字串) -> 已勾選的選單/按鈕 id 清單。
// 跟 rolesDb 一樣用 sessionStorage 持久化，確保新建立角色綁定的權限在重新整理頁面後
// 仍能被編輯頁正確讀回；呼叫 persistRoleMenuAssignments() 的時機見 handlers/roles.ts。
export const roleMenuAssignments = loadRoleMenuAssignments();

export function persistRoleMenuAssignments(): void {
  try {
    sessionStorage.setItem(
      ROLE_MENU_ASSIGNMENTS_STORAGE_KEY,
      JSON.stringify(Object.fromEntries(roleMenuAssignments)),
    );
  } catch {
    // 寫入失敗不影響記憶體內的操作結果，純粹是這次重新整理後不會還原
  }
}


