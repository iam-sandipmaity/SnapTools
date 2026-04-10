import { lazy } from 'react';

const dateTimeTools = {
  "date-difference-calculator": lazy(() => import("./DateDifferenceCalculator")),
  "date-formatter": lazy(() => import("./DateFormatter")),
  "business-days-calculator": lazy(() => import("./BusinessDaysCalculator")),
  "time-duration-calculator": lazy(() => import("./TimeDurationCalculator")),
  "date-range-generator": lazy(() => import("./DateRangeGenerator")),
  "week-number-calculator": lazy(() => import("./WeekNumberCalculator")),
};

export default dateTimeTools;
