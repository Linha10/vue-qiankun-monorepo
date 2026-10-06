import { http } from "msw";
import { ok } from "../apiResponse";
import { menuTree, flatMenuList } from "../data/menu";
import { accountRoleAssignments } from "../data/accounts";
import { roleMenuAssignments } from "../data/roles";
import type { Menu } from "@monorepo/types";

// 依帳號已指派的角色，彙整出「真正被授權」的選單/按鈕 id 集合，
// 讓 demo 帳號可以透過調整角色管理裡的「Demo」角色權限，實際影響自己能看到/操作什麼。
function resolveAllowedMenuIds(accountId: string): Set<number> {
  const roleIds = accountRoleAssignments.get(accountId) ?? [];
  const allowed = new Set<number>();
  for (const roleId of roleIds) {
    const menuIds = roleMenuAssignments.get(String(roleId)) ?? [];
    menuIds.forEach((id) => allowed.add(id));
  }
  return allowed;
}

// 回傳一份「依權限遮罩過」的選單樹：節點本身的 status 若已經是停用（0），
// 或是不在這個帳號被授權的 id 集合內，一律視為 0（停用），
// 其餘維持原本資料（DIR/MENU/BTN 結構、path、permission 等都不變）。
function maskMenuTree(nodes: Menu[], allowedIds: Set<number>): Menu[] {
  return nodes.map((node) => ({
    ...node,
    status: node.status === 1 && allowedIds.has(node.id) ? 1 : 0,
    children: node.children
      ? maskMenuTree(node.children, allowedIds)
      : node.children,
  }));
}

export const menuHandlers = [
  // 依帳號取得可用選單樹：依帳號指派的角色彙整權限，沒帶 accountId 時（例如舊呼叫方式）
  // 向後相容回傳完整樹，避免意外把所有人都擋住。
  http.get("*/v1/menus/account-tree", ({ request }) => {
    const url = new URL(request.url);
    const accountId = url.searchParams.get("accountId");
    if (!accountId) return ok(menuTree);
    const allowedIds = resolveAllowedMenuIds(accountId);
    return ok(maskMenuTree(menuTree, allowedIds));
  }),

  // 依角色取得可用選單樹
  http.get("*/v1/menus/role-tree", () => ok(menuTree)),

  // 完整樹狀選單（供角色管理頁勾選權限用，固定回傳完整目錄，不受任何帳號/角色權限影響）
  http.get("*/v1/menus/tree", () => ok(menuTree)),

  // 扁平選單列表
  http.get("*/v1/menus", ({ request }) => {
    const url = new URL(request.url);
    const menuType = url.searchParams.get("menuType");
    const status = url.searchParams.get("status");
    let list = flatMenuList.map(({ children, parent, ...rest }) => rest);
    if (menuType) list = list.filter((item) => item.menuType === menuType);
    if (status !== null && status !== "")
      list = list.filter((item) => String(item.status) === status);
    return ok(list);
  }),

  // 單一選單內容
  http.get("*/v1/menus/:menuId", ({ params }) => {
    const menu = flatMenuList.find((item) => String(item.id) === params.menuId);
    return ok(menu ?? null);
  }),

  // demo 環境不提供選單建立/編輯（system-settings 目前也沒有選單管理頁面）
  http.post("*/v1/menus", () => ok(null, "示範環境不支援此操作")),
  http.put("*/v1/menus/:menuId", () => ok(null, "示範環境不支援此操作")),
];

