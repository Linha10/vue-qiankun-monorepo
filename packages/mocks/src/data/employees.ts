import { faker } from "@faker-js/faker";
import { createMockDb } from "../createMockDb";

export interface EmployeeRecord {
  id: string;
  name: string;
  department: string;
  title: string;
  email: string;
  phone: string;
  status: 0 | 1;
  hiredAt: string;
}

const DEPARTMENTS = [
  "工程部",
  "產品部",
  "設計部",
  "行銷部",
  "客服部",
  "人資部",
];
const TITLES = ["專員", "資深專員", "副理", "經理", "總監"];

function buildSeed(): EmployeeRecord[] {
  faker.seed(1001);
  return Array.from({ length: 42 }, (_, index) => {
    const name = faker.person.fullName();
    return {
      id: `emp-${index + 1}`,
      name,
      department: faker.helpers.arrayElement(DEPARTMENTS),
      title: faker.helpers.arrayElement(TITLES),
      email: faker.internet
        .email({ firstName: name.split(" ")[0] })
        .toLowerCase(),
      phone: faker.phone.number({ style: "international" }),
      status: faker.helpers.arrayElement([1, 1, 1, 0]) as 0 | 1,
      hiredAt: faker.date.past({ years: 5 }).toISOString().slice(0, 10),
    };
  });
}

export const employeesDb = createMockDb<EmployeeRecord>(buildSeed(), {
  idPrefix: "emp",
  keywordFields: ["name", "email", "department", "title"],
  matchFields: ["department", "status"],
});
