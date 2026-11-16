// محرك حسابات مستقل عن أي أنظمة كاش أو فوري.
// تُخزن القيم المالية كأرقام عشرية بالجنيه، وتُحوّل إلى قروش قبل الجمع لتجنب أخطاء الكسور.
(function (root) {
  "use strict";
  const cents = value => Math.round((Number(value) || 0) * 100);
  const money = value => cents(value) / 100;
  const sum = (rows, field = "amount") => rows.reduce((n, row) => n + cents(row[field]), 0) / 100;
  const validAmount = value => Number.isFinite(Number(value)) && Number(value) >= 0;
  function summarize(stores) {
    const sales = stores.sales || [];
    const purchases = stores.purchases || [];
    const expenses = stores.expenses || [];
    const income = expenses.filter(x => x.kind === "income");
    const costs = expenses.filter(x => x.kind !== "income");
    const saleTotal = sum(sales);
    const purchaseTotal = sum(purchases);
    const expenseTotal = sum(costs);
    const otherIncome = sum(income);
    const cashIn = sales.reduce((n, x) => n + cents(x.paid ?? x.amount), 0) / 100 + otherIncome;
    const cashOut = purchases.reduce((n, x) => n + cents(x.paid ?? x.amount), 0) / 100 + expenseTotal;
    const treasuryEntries = stores.treasury || [];
    const treasuryNet = treasuryEntries.reduce((n, x) => n + (x.direction === "out" ? -cents(x.amount) : cents(x.amount)), 0) / 100;
    const opening = Number(stores.openingTreasury || 0);
    const stock = (stores.products || []).reduce((n, p) => n + cents((Number(p.qty) || 0) * (Number(p.cost) || 0)), 0) / 100;
    return {
      saleTotal: money(saleTotal), purchaseTotal: money(purchaseTotal),
      expenseTotal: money(expenseTotal), otherIncome: money(otherIncome),
      grossMovement: money(saleTotal - purchaseTotal),
      operatingResult: money(saleTotal + otherIncome - purchaseTotal - expenseTotal),
      cashIn: money(cashIn), cashOut: money(cashOut),
      treasuryBalance: money(opening + treasuryNet),
      stockValueAtCost: money(stock),
      counts: { sales: sales.length, purchases: purchases.length, products: (stores.products || []).length, customers: (stores.customers || []).length, suppliers: (stores.suppliers || []).length }
    };
  }
  function stockOnHand(productId, stores) {
    const product = (stores.products || []).find(p => String(p.id) === String(productId));
    if (!product) return 0;
    const bought = (stores.purchases || []).filter(x => String(x.productId) === String(productId)).reduce((n, x) => n + (Number(x.qty) || 0), 0);
    const sold = (stores.sales || []).filter(x => String(x.productId) === String(productId)).reduce((n, x) => n + (Number(x.qty) || 0), 0);
    const returnedFromCustomer = (stores.returns || []).filter(x => x.kind === "sale" && String(x.productId) === String(productId)).reduce((n, x) => n + (Number(x.qty) || 0), 0);
    const returnedToSupplier = (stores.returns || []).filter(x => x.kind === "purchase" && String(x.productId) === String(productId)).reduce((n, x) => n + (Number(x.qty) || 0), 0);
    return (Number(product.openingQty) || 0) + bought - sold + returnedFromCustomer - returnedToSupplier;
  }
  function partyBalance(partyName, type, stores) {
    const source = type === "customer" ? (stores.sales || []) : (stores.purchases || []);
    const paidField = row => cents(row.paid ?? row.amount);
    return source.filter(x => x.party === partyName).reduce((n, x) => n + cents(x.amount) - paidField(x), 0) / 100;
  }
  root.AlAbdeenAccounting = { cents, money, sum, validAmount, summarize, stockOnHand, partyBalance };
})(typeof window !== "undefined" ? window : globalThis);
