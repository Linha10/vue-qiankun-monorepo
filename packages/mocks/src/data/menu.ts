import type { Menu } from "@monorepo/types";

// demo 用固定選單樹，供帳號選單、角色權限樹共用。
// 對應到 project-admin 的示範路由 /employees、/products，以及 system-settings 的帳號/角色管理。
//
// 權限設計原則：單一頁面的模組（員工管理、商品管理）本身就是 MENU，直接掛自己的 CRUD 按鈕，
// 不另外包一層 DIR + 子選單；只有像「系統設定」這種底下真的有多個獨立子頁面（帳號管理 /
// 操作紀錄 / 登入紀錄 / 角色管理）的情況，才需要 DIR（只控「檢視」）+ 多個 MENU（各自有
// 自己的 CRUD）這種兩層結構。
const TS = "2024-01-01T00:00:00.000Z";

function btn(
  id: number,
  parentId: number,
  title: string,
  action: string,
  sort: number,
): Menu {
  return {
    id,
    parentId,
    title,
    menuName: title,
    menuType: "BTN",
    action,
    icon: "",
    level: 3,
    parent: "",
    path: "",
    permission: `${action}`,
    sort,
    status: 1,
    url: "",
    updatedAt: TS,
    createdAt: TS,
  };
}

export const menuTree: Menu[] = [
  {
    id: 100,
    parentId: null,
    title: "員工管理",
    menuName: "員工管理",
    menuType: "MENU",
    action: "view",
    icon: "solar:users-group-rounded-bold-duotone",
    level: 1,
    parent: "",
    path: "/employees",
    permission: "employees:view",
    sort: 1,
    status: 1,
    url: "/employees",
    updatedAt: TS,
    createdAt: TS,
    children: [
      btn(1011, 100, "新增", "create", 1),
      btn(1012, 100, "編輯", "update", 2),
      btn(1013, 100, "刪除", "delete", 3),
    ],
  },
  {
    id: 200,
    parentId: null,
    title: "商品管理",
    menuName: "商品管理",
    menuType: "MENU",
    action: "view",
    icon: "solar:box-bold-duotone",
    level: 1,
    parent: "",
    path: "/products",
    permission: "products:view",
    sort: 2,
    status: 1,
    url: "/products",
    updatedAt: TS,
    createdAt: TS,
    children: [
      btn(2011, 200, "新增", "create", 1),
      btn(2012, 200, "編輯", "update", 2),
      btn(2013, 200, "刪除", "delete", 3),
    ],
  },
  {
    id: 300,
    parentId: null,
    title: "系統設定",
    menuName: "系統設定",
    menuType: "DIR",
    action: "view",
    icon: "solar:settings-bold-duotone",
    level: 1,
    parent: "",
    path: "/system-settings",
    permission: "",
    sort: 3,
    status: 1,
    url: "",
    updatedAt: TS,
    createdAt: TS,
    children: [
      {
        id: 301,
        parentId: 300,
        title: "帳號管理",
        menuName: "帳號管理",
        menuType: "MENU",
        action: "view",
        icon: "solar:user-circle-bold-duotone",
        level: 2,
        parent: "系統設定",
        path: "/account-management",
        permission: "accounts:view",
        sort: 1,
        status: 1,
        url: "/account-management",
        updatedAt: TS,
        createdAt: TS,
        children: [
          btn(3011, 301, "新增", "create", 1),
          btn(3012, 301, "編輯", "update", 2),
          btn(3013, 301, "刪除", "delete", 3),
          btn(3014, 301, "重設密碼", "reset-password", 4),
        ],
      },
      {
        id: 302,
        parentId: 300,
        title: "操作紀錄",
        menuName: "操作紀錄",
        menuType: "MENU",
        action: "view",
        icon: "solar:document-text-bold-duotone",
        level: 2,
        parent: "系統設定",
        path: "/account-management/action-logs",
        permission: "action-logs:view",
        sort: 2,
        status: 1,
        url: "/account-management/action-logs",
        updatedAt: TS,
        createdAt: TS,
      },
      {
        id: 303,
        parentId: 300,
        title: "登入紀錄",
        menuName: "登入紀錄",
        menuType: "MENU",
        action: "view",
        icon: "solar:login-3-bold-duotone",
        level: 2,
        parent: "系統設定",
        path: "/account-management/login-logs",
        permission: "login-logs:view",
        sort: 3,
        status: 1,
        url: "/account-management/login-logs",
        updatedAt: TS,
        createdAt: TS,
      },
      {
        id: 304,
        parentId: 300,
        title: "角色管理",
        menuName: "角色管理",
        menuType: "MENU",
        action: "view",
        icon: "solar:shield-user-bold-duotone",
        level: 2,
        parent: "系統設定",
        path: "/role-management",
        permission: "roles:view",
        sort: 4,
        status: 1,
        url: "/role-management",
        updatedAt: TS,
        createdAt: TS,
        children: [
          btn(3041, 304, "新增", "create", 1),
          btn(3042, 304, "編輯", "update", 2),
          btn(3043, 304, "刪除", "delete", 3),
        ],
      },
    ],
  },
];

export function flattenMenuNodes(nodes: Menu[]): Menu[] {
  const result: Menu[] = [];
  const visit = (node: Menu) => {
    result.push(node);
    node.children?.forEach(visit);
  };
  nodes.forEach(visit);
  return result;
}

export const flatMenuList = flattenMenuNodes(menuTree);
