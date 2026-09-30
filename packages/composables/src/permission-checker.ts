import { computed, type Ref } from "vue";
import type { PermissionNode } from "@monorepo/types";
import type { PermissionContext } from "./context/keys";

const SUB_ACTION_SEGMENTS = ["create", "edit"];

export function createPermissionChecker(
  accountMenus: Ref<PermissionNode[]>,
  role: Ref<"admin" | "user">,
): PermissionContext {
  const isAdmin = computed(() => role.value === "admin");

  function canAccessMenu(path: string): boolean {
    if (isAdmin.value) return true;
    // 尚未取得選單資料時預設放行，避免初始化完成前整批頁面被誤擋
    if (accountMenus.value.length === 0) return true;
    return accountMenus.value.some((menu) => {
      if (
        (menu.menuType !== "DIR" && menu.menuType !== "MENU") ||
        menu.status === 0 ||
        !menu.url
      ) {
        return false;
      }
      if (path === menu.url) return true;
      if (!path.startsWith(`${menu.url}/`)) return false;
      const nextSegment = path.slice(menu.url.length + 1).split("/")[0];
      return SUB_ACTION_SEGMENTS.includes(nextSegment);
    });
  }

  function canPerformAction(
    url: string,
    action: "create" | "update" | "delete",
  ): boolean {
    if (isAdmin.value) return true;
    if (accountMenus.value.length === 0) return true;
    const menu = accountMenus.value.find(
      (m) =>
        (m.menuType === "DIR" || m.menuType === "MENU") &&
        m.status !== 0 &&
        m.url === url,
    );
    if (!menu) return false;
    return accountMenus.value.some(
      (btn) =>
        btn.menuType === "BTN" &&
        btn.parentId === menu.id &&
        btn.action === action &&
        btn.status !== 0,
    );
  }

  return { role, isAdmin, canAccessMenu, canPerformAction };
}
