import { faker } from "@faker-js/faker";
import { createMockDb } from "../createMockDb";
import { DEMO_ACCOUNT_ID } from "./accounts";

export interface ActionLogRecord {
  id: string;
  accountId: string;
  accountName: string;
  requestUrl: string;
  requestMethod: string;
  requestIp: string;
  requestLog: {
    action: { id: string; name: string };
    latency: string;
    referer: string;
    user_agent: string;
    request_body: string;
    response_msg: string;
    response_body: string;
    response_code: number;
  };
  errorCode: number;
  costTimeMs: number;
  createdAt: string;
}

export interface LoginLogRecord {
  id: string;
  loginId: string;
  loginName: string;
  action: "login" | "logout";
  provider: "backend" | "system";
  providerUid: string | null;
  loginIp: string;
  deviceInfo: string;
  createdAt: string;
}

const METHODS = ["GET", "POST", "PUT", "DELETE"] as const;
const URLS = [
  "/v1/accounts",
  "/v1/roles",
  "/v1/employees",
  "/v1/products",
  "/v1/menus/account-tree",
];

function buildActionLogSeed(): ActionLogRecord[] {
  faker.seed(4004);
  return Array.from({ length: 36 }, (_, index) => {
    const method = faker.helpers.arrayElement(METHODS);
    const success = faker.datatype.boolean({ probability: 0.85 });
    return {
      id: `log-${index + 1}`,
      accountId: DEMO_ACCOUNT_ID,
      accountName: "demo",
      requestUrl: faker.helpers.arrayElement(URLS),
      requestMethod: method,
      requestIp: faker.internet.ipv4(),
      requestLog: {
        action: { id: `action-${index + 1}`, name: `${method} 操作` },
        latency: `${faker.number.int({ min: 20, max: 800 })}ms`,
        referer: "https://vue-qiankun-monorepo.demo",
        user_agent: faker.internet.userAgent(),
        request_body: "{}",
        response_msg: success ? "ok" : "發生錯誤",
        response_body: success ? '{"code":0}' : '{"code":1}',
        response_code: success ? 0 : 1,
      },
      errorCode: success ? 0 : 1,
      costTimeMs: faker.number.int({ min: 20, max: 800 }),
      createdAt: faker.date.recent({ days: 30 }).toISOString(),
    };
  });
}

function buildLoginLogSeed(): LoginLogRecord[] {
  faker.seed(5005);
  return Array.from({ length: 24 }, (_, index) => ({
    id: `login-log-${index + 1}`,
    loginId: DEMO_ACCOUNT_ID,
    loginName: "demo",
    action: faker.helpers.arrayElement(["login", "logout"]) as
      "login" | "logout",
    provider: "system",
    providerUid: null,
    loginIp: faker.internet.ipv4(),
    deviceInfo: faker.internet.userAgent(),
    createdAt: faker.date.recent({ days: 30 }).toISOString(),
  }));
}

export const actionLogsDb = createMockDb<ActionLogRecord>(
  buildActionLogSeed(),
  {
    idPrefix: "log",
    keywordFields: ["accountName", "requestUrl"],
    matchFields: ["accountId", "requestMethod", "errorCode"],
  },
);

export const loginLogsDb = createMockDb<LoginLogRecord>(buildLoginLogSeed(), {
  idPrefix: "login-log",
  keywordFields: ["loginName"],
  matchFields: ["provider", "action"],
});
