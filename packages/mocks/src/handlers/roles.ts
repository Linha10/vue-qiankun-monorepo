import { http } from "msw";
import { ok, fail } from "../apiResponse";
import {
  rolesDb,
  roleMenuAssignments,
  persistRoleMenuAssignments,
  type RoleRecord,
} from "../data/roles";

function toRole(record: RoleRecord) {
  return { ...record, id: Number(record.id) };
}

// 產生下一個「純數字字串」id（如 "4"），模擬真實後端的自增整數主鍵。
// 不可以沿用 createMockDb 預設的 `${idPrefix}-${n}-${timestamp}` 格式，
// 否則 toRole() 的 Number(record.id) 轉型會變成 NaN，導致新建立的角色
// 在列表／編輯頁都對不到正確的 id。
function nextNumericRoleId(): string {
  const maxId = rolesDb
    .all()
    .reduce((max, record) => Math.max(max, Number(record.id) || 0), 0);
  return String(maxId + 1);
}

export const roleHandlers = [
  http.get("*/v1/roles", ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 10);
    const search = url.searchParams.get("search") ?? undefined;
    const status = url.searchParams.get("status") ?? undefined;
    const result = rolesDb.list({ page, pageSize, keyword: search, status });
    return ok({
      list: result.list.map(toRole),
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / result.pageSize)),
      },
    });
  }),

  http.post("*/v1/roles", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const now = new Date().toISOString();
    const created = rolesDb.create({
      id: nextNumericRoleId(),
      roleName: (body.roleName as string) ?? "",
      roleKey: (body.roleKey as string) ?? "",
      sort: Number(body.sort ?? 0),
      status: (body.status as 0 | 1) ?? 1,
      createdAt: now,
      updateAt: now,
    });
    return ok(toRole(created), "新增成功");
  }),

  http.get("*/v1/roles/:roleId", ({ params }) => {
    const record = rolesDb.getById(String(params.roleId));
    if (!record) return ok(null);
    const menuIds = roleMenuAssignments.get(String(params.roleId)) ?? [];
    return ok({
      ...toRole(record),
      menus: menuIds.map((id) => ({ id })),
    });
  }),

  http.put("*/v1/roles/:roleId", async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const updated = rolesDb.update(String(params.roleId), {
      roleName: body.roleName as string | undefined,
      roleKey: body.roleKey as string | undefined,
      sort: body.sort as number | undefined,
      status: body.status as 0 | 1 | undefined,
      updateAt: new Date().toISOString(),
    });
    return ok(updated ? toRole(updated) : null, "更新成功");
  }),

  http.delete("*/v1/roles/:roleId", ({ params }) => {
    const record = rolesDb.getById(String(params.roleId));
    // 系統管理員角色是保護角色，後端也擋一次，避免繞過前端 disabled 的刪除按鈕直接打 API。
    if (record?.roleKey === "admin") {
      return fail("系統保護角色，無法刪除", 1);
    }
    rolesDb.remove(String(params.roleId));
    roleMenuAssignments.delete(String(params.roleId));
    persistRoleMenuAssignments();
    return ok(null, "刪除成功");
  }),

  // 取得角色可用權限（menu id 清單）
  http.get("*/v1/role-menus/:roleId", ({ params }) => {
    const menuIds = roleMenuAssignments.get(String(params.roleId)) ?? [];
    return ok(menuIds);
  }),

  // 更新角色可用權限
  http.put("*/v1/role-menus/:roleId", async ({ params, request }) => {
    const body = (await request.json()) as { menuIds?: number[] };
    roleMenuAssignments.set(String(params.roleId), body.menuIds ?? []);
    persistRoleMenuAssignments();
    return ok(null, "更新成功");
  }),
];

