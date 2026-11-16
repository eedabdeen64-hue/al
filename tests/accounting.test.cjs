const assert = require("node:assert/strict");
require("../src/accounting.js");
const A = globalThis.AlAbdeenAccounting;
const s = A.summarize({
  sales: [{ amount: 120.10, paid: 100 }, { amount: 79.90, paid: 79.90 }],
  purchases: [{ amount: 80, paid: 50 }],
  expenses: [{ amount: 10, kind: "expense" }, { amount: 5, kind: "income" }],
  treasury: [{ amount: 25, direction: "in" }, { amount: 5, direction: "out" }],
  openingTreasury: 100,
  products: [{ qty: 3, cost: 20 }]
});
assert.equal(s.saleTotal, 200);
assert.equal(s.purchaseTotal, 80);
assert.equal(s.expenseTotal, 10);
assert.equal(s.otherIncome, 5);
assert.equal(s.operatingResult, 115);
assert.equal(s.treasuryBalance, 120);
assert.equal(s.stockValueAtCost, 60);
const stores = {
  products: [{ id: 7, openingQty: 10 }],
  purchases: [{ productId: 7, qty: 5 }],
  sales: [{ productId: 7, qty: 4 }],
  returns: [{ kind: "sale", productId: 7, qty: 2 }, { kind: "purchase", productId: 7, qty: 1 }]
};
assert.equal(A.stockOnHand(7, stores), 12);
assert.equal(A.partyBalance("عميل", "customer", { sales: [{ party: "عميل", amount: 100, paid: 40 }] }), 60);
assert.equal(A.money(0.1 + 0.2), 0.3);
console.log("Accounting engine tests passed");
