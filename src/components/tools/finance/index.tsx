import { lazy } from 'react';

const financeTools = {
  "percentage-calculator": lazy(() => import("./PercentageCalculator")),
  "loan-calculator": lazy(() => import("./LoanCalculator")),
  "mortgage-calculator": lazy(() => import("./MortgageCalculator")),
  "tip-calculator": lazy(() => import("./TipCalculator")),
  "discount-calculator": lazy(() => import("./DiscountCalculator")),
  "roi-calculator": lazy(() => import("./ROICalculator")),
  "tax-calculator": lazy(() => import("./TaxCalculator")),
  "bill-splitter": lazy(() => import("./BillSplitter")),
};

export default financeTools;
