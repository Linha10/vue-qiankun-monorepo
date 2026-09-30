import { authHandlers } from "./auth";
import { menuHandlers } from "./menu";
import { accountHandlers } from "./accounts";
import { roleHandlers } from "./roles";
import { logHandlers } from "./logs";
import { employeeHandlers } from "./employees";
import { productHandlers } from "./products";

// 順序很重要：越明確（字面）路徑要排在越前面，避免被後面帶 :param 的通用路由攔截。
export const handlers = [
  ...authHandlers,
  ...menuHandlers,
  ...accountHandlers,
  ...roleHandlers,
  ...logHandlers,
  ...employeeHandlers,
  ...productHandlers,
];
