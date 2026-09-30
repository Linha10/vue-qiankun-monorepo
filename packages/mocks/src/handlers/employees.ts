import { http } from "msw";
import { ok } from "../apiResponse";
import { employeesDb } from "../data/employees";

function toPagination(page: number, pageSize: number, total: number) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export const employeeHandlers = [
  http.get("*/v1/employees", ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 10);
    const keyword = url.searchParams.get("keyword") ?? undefined;
    const department = url.searchParams.get("department") ?? undefined;
    const status = url.searchParams.get("status") ?? undefined;
    const result = employeesDb.list({
      page,
      pageSize,
      keyword,
      department,
      status,
    });
    return ok({
      list: result.list,
      pagination: toPagination(page, pageSize, result.total),
    });
  }),

  http.post("*/v1/employees", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const created = employeesDb.create({
      name: (body.name as string | undefined) ?? "",
      department: (body.department as string | undefined) ?? "",
      title: (body.title as string | undefined) ?? "",
      email: (body.email as string | undefined) ?? "",
      phone: (body.phone as string | undefined) ?? "",
      status: (body.status as 0 | 1 | undefined) ?? 1,
      hiredAt:
        (body.hiredAt as string | undefined) ??
        new Date().toISOString().slice(0, 10),
    });
    return ok(created, "新增成功");
  }),

  http.get("*/v1/employees/:id", ({ params }) => {
    const employee = employeesDb.getById(String(params.id));
    return ok(employee ?? null);
  }),

  http.put("*/v1/employees/:id", async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const updated = employeesDb.update(String(params.id), {
      name: body.name as string | undefined,
      department: body.department as string | undefined,
      title: body.title as string | undefined,
      email: body.email as string | undefined,
      phone: body.phone as string | undefined,
      status: body.status as 0 | 1 | undefined,
      hiredAt: body.hiredAt as string | undefined,
    });
    return ok(updated ?? null, "更新成功");
  }),

  http.delete("*/v1/employees/:id", ({ params }) => {
    employeesDb.remove(String(params.id));
    return ok(null, "刪除成功");
  }),
];
