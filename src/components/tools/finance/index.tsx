import PercentageCalculator from "./PercentageCalculator";
import LoanCalculator from "./LoanCalculator";
import MortgageCalculator from "./MortgageCalculator";
import TipCalculator from "./TipCalculator";
import DiscountCalculator from "./DiscountCalculator";
import ROICalculator from "./ROICalculator";
import TaxCalculator from "./TaxCalculator";
import BillSplitter from "./BillSplitter";

const financeTools = {
  "percentage-calculator": PercentageCalculator,
  "loan-calculator": LoanCalculator,
  "mortgage-calculator": MortgageCalculator,
  "tip-calculator": TipCalculator,
  "discount-calculator": DiscountCalculator,
  "roi-calculator": ROICalculator,
  "tax-calculator": TaxCalculator,
  "bill-splitter": BillSplitter,
};

export default financeTools;
