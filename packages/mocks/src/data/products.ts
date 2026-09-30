import { faker } from "@faker-js/faker";
import { createMockDb } from "../createMockDb";

export interface ProductRecord {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 0 | 1;
  createdAt: string;
}

const CATEGORIES = ["3C配件", "居家生活", "辦公用品", "戶外休閒", "美妝保養"];

function buildSeed(): ProductRecord[] {
  faker.seed(2002);
  return Array.from({ length: 28 }, (_, index) => ({
    id: `prod-${index + 1}`,
    name: faker.commerce.productName(),
    category: faker.helpers.arrayElement(CATEGORIES),
    price: Number(faker.commerce.price({ min: 100, max: 5000 })),
    stock: faker.number.int({ min: 0, max: 500 }),
    status: faker.helpers.arrayElement([1, 1, 1, 0]) as 0 | 1,
    createdAt: faker.date.past({ years: 2 }).toISOString().slice(0, 10),
  }));
}

export const productsDb = createMockDb<ProductRecord>(buildSeed(), {
  idPrefix: "prod",
  keywordFields: ["name", "category"],
  matchFields: ["category", "status"],
});
