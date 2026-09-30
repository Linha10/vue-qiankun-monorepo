import type { PermissionNode } from "@monorepo/types";
export { HcMessageBox } from "./hcMessageBox";

export interface PermissionMenuRow {
  menu: PermissionNode;
  btns: PermissionNode[];
}

export interface PermissionGroup {
  // null 代表沒有 DIR 群組包裹的獨立頁面
  dir: PermissionNode | null;
  menus: PermissionMenuRow[];
}

export function flattenMenuTree(raw: unknown): PermissionNode[] {
  const result: PermissionNode[] = [];

  function visit(node: unknown, fallbackParentId: number) {
    if (!node || typeof node !== "object") return;
    const record = node as Record<string, unknown>;
    const id = Number(record.id);
    if (Number.isNaN(id)) return;

    const parentId =
      record.parentId !== undefined && record.parentId !== null
        ? Number(record.parentId)
        : fallbackParentId;

    const titleRaw = record.title ?? record.menuName;
    const menuTypeRaw = record.menuType;
    const actionRaw = record.action;
    const urlRaw = record.url;

    result.push({
      id,
      parentId,
      title: typeof titleRaw === "string" ? titleRaw : String(id),
      menuType: typeof menuTypeRaw === "string" ? menuTypeRaw : "MENU",
      action: typeof actionRaw === "string" ? actionRaw : "view",
      sort: Number(record.sort ?? 0),
      url: typeof urlRaw === "string" ? urlRaw : "",
      status: Number(record.status ?? 1),
    });

    const children = record.children;
    if (Array.isArray(children)) {
      for (const child of children) {
        if (child && typeof child === "object") {
          visit(child, id);
        }
      }
    }
  }

  const list = Array.isArray(raw) ? raw : [];
  for (const node of list) {
    visit(node, 0);
  }

  // 巢狀展開與扁平資料可能重複描述同一節點，以 id 去重取最後一筆
  const uniqueMap = new Map<number, PermissionNode>();
  for (const item of result) {
    uniqueMap.set(item.id, item);
  }
  return [...uniqueMap.values()];
}

export function buildPermissionGroups(
  nodes: PermissionNode[],
): PermissionGroup[] {
  const byParent = new Map<number, PermissionNode[]>();
  for (const node of nodes) {
    const arr = byParent.get(node.parentId) ?? [];
    arr.push(node);
    byParent.set(node.parentId, arr);
  }
  for (const arr of byParent.values()) {
    arr.sort((a, b) => a.sort - b.sort);
  }

  const roots = byParent.get(0) ?? [];
  const groups: PermissionGroup[] = [];

  for (const root of roots) {
    if (root.menuType === "DIR") {
      const children = byParent.get(root.id) ?? [];
      const menus = children
        .filter((c) => c.menuType === "MENU")
        .map((menu) => ({
          menu,
          btns: (byParent.get(menu.id) ?? []).filter(
            (b) => b.menuType === "BTN",
          ),
        }));
      groups.push({ dir: root, menus });
    } else if (root.menuType === "MENU") {
      const btns = (byParent.get(root.id) ?? []).filter(
        (b) => b.menuType === "BTN",
      );
      groups.push({ dir: null, menus: [{ menu: root, btns }] });
    }
  }

  return groups;
}
