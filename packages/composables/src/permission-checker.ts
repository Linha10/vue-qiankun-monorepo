import { computed, type Ref } from "vue";
import type { PermissionNode } from "@monorepo/types";
import type { PermissionContext } from "./context/keys";

export function createPermissionChecker(
  accountMenus: Ref<PermissionNode[]>,
  role: Ref<"admin" | "user">,
): PermissionContext {
  const isAdmin = computed(() => role.value === "admin");

  function canAccessMenu(path: string): boolean {
    if (isAdmin.value) return true;
    // 尚未取得選單資料時預設放行，避免初始化完成前整批頁面被誤擋
    if (accountMenus.value.length === 0) return true;
    // 先收集「所有」已知的 DIR/MENU url（不論有沒有被授權），用來判斷某個子路徑
    // 是不是另一個獨立選單項目（例如 /account-management/action-logs 是跟
    // /account-management 平行的獨立頁面），避免被母層的「檢視」權限誤判放行。
    const knownMenuUrls = new Set(
      accountMenus.value
        .filter(
          (menu) =>
            (menu.menuType === "DIR" || menu.menuType === "MENU") &&
            menu.url,
        )
        .map((menu) => menu.url),
    );
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
      // 排除掉本身就是另一個獨立選單項目的路徑；其餘視為這個選單底下的子頁面
      // （詳情、新增、編輯等，不論實際路徑長什麼樣子），只要有這個選單的檢視權限就放行。
      return !knownMenuUrls.has(path);
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

