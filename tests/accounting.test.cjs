const assert = require("node:assert/strict");
require("../src/accounting.js");
const A = globalThis.AlAbdeenAccounting;
const s = A.summarize({
  sales: [{ amount: 120.10, paid: 100, costTotal: 60 }, { amount: 79.90, paid: 79.90, costTotal: 20 }],
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
const profit = A.summarize({sales:[{amount:200,qty:2,unitCost:50,costTotal:100}],products:[{id:1,openingQty:4,cost:50}]});
assert.equal(profit.costOfGoodsSold,100);
assert.equal(profit.grossProfit,100);
assert.equal(profit.stockValueAtCost,200);
const stores = {
  products: [{ id: 7, openingQty: 10 }],
  purchases: [{ productId: 7, qty: 5 }],
  sales: [{ productId: 7, qty: 4 }],
  returns: [{ kind: "sale", productId: 7, qty: 2 }, { kind: "purchase", productId: 7, qty: 1 }]
};
assert.equal(A.stockOnHand(7, stores), 12);
assert.equal(A.partyBalance("عميل", "customer", { sales: [{ party: "عميل", amount: 100, paid: 40 }] }), 60);
assert.equal(A.money(0.1 + 0.2), 0.3);
const discountedInvoice = { amount: 90, subtotal: 100, discount: 10, paid: 50, party: "عميل الخصم" };
assert.equal(discountedInvoice.subtotal - discountedInvoice.discount, discountedInvoice.amount);
assert.equal(A.partyBalance("عميل الخصم", "customer", { sales: [discountedInvoice] }), 40);
const discountedSummary = A.summarize({ sales: [discountedInvoice], products: [] });
assert.equal(discountedSummary.saleTotal, 90);
assert.equal(discountedSummary.grossProfit, 90);
const afterReturns = A.summarize({ sales:[{amount:100,paid:100,party:"عميل"}], purchases:[{amount:60,paid:60,party:"مورد"}], returns:[{kind:"sale",amount:20,party:"عميل"},{kind:"purchase",amount:10,party:"مورد"}], expenses:[{amount:5,kind:"expense"}] });
assert.equal(afterReturns.saleTotal, 80);
assert.equal(afterReturns.purchaseTotal, 50);
assert.equal(afterReturns.operatingResult, 25);
assert.equal(A.partyBalance("عميل","customer",{sales:[{amount:100,paid:40,party:"عميل"}],returns:[{kind:"sale",amount:10,party:"عميل"}],payments:[{party:"عميل",partyType:"customer",amount:15}]}),35);
console.log("Accounting engine tests passed");

const adjustedStock = A.stockOnHand(7, {
  products: [{ id: 7, openingQty: 10 }],
  purchases: [{ productId: 7, qty: 5 }],
  sales: [{ productId: 7, qty: 4 }],
  returns: [{ kind: "sale", productId: 7, qty: 2 }, { kind: "purchase", productId: 7, qty: 1 }],
  inventoryAdjustments: [{ productId: 7, qtyDelta: 3 }, { productId: 7, qtyDelta: -2 }]
});
assert.equal(adjustedStock, 13);
