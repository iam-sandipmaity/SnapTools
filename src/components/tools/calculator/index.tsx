import { lazy } from 'react';

const calculatorTools = {
  "basic-calculator": lazy(() => import("./BasicCalculator")),
  "scientific-calculator": lazy(() => import("./ScientificCalculator")),
  "bmi-calculator": lazy(() => import("./BMICalculator")),
  "age-calculator": lazy(() => import("./AgeCalculator")),
};

export default calculatorTools;
