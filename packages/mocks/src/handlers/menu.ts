import { http } from "msw";
import { ok } from "../apiResponse";
import { menuTree, flatMenuList } from "../data/menu";

export const menuHandlers = [
  // 依帳號取得可用選單樹（demo 環境固定回傳完整樹，實際顯示與否交由前端 role===admin 判斷放行）
  http.get("*/v1/menus/account-tree", () => ok(menuTree)),

  // 依角色取得可用選單樹
  http.get("*/v1/menus/role-tree", () => ok(menuTree)),

  // 完整樹狀選單（供角色管理頁勾選權限用）
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
