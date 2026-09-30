import { http } from "msw";
import { ok } from "../apiResponse";
import { actionLogsDb, loginLogsDb } from "../data/logs";

function toPagination(page: number, pageSize: number, total: number) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export const logHandlers = [
  http.get("*/v1/account-action-logs", ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 10);
    const search = url.searchParams.get("search") ?? undefined;
    const accountId = url.searchParams.get("accountId") ?? undefined;
    const requestMethod = url.searchParams.get("requestMethod") ?? undefined;
    const result = actionLogsDb.list({
      page,
      pageSize,
      keyword: search,
      accountId,
      requestMethod,
    });
    return ok({
      list: result.list,
      pagination: toPagination(page, pageSize, result.total),
    });
  }),

  http.get("*/v1/auth-login-logs", ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 10);
    const provider = url.searchParams.get("provider") ?? undefined;
    const action = url.searchParams.get("action") ?? undefined;
    const result = loginLogsDb.list({ page, pageSize, provider, action });
    return ok({
      list: result.list,
      pagination: toPagination(page, pageSize, result.total),
    });
  }),
];
