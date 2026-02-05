import DateDifferenceCalculator from "./DateDifferenceCalculator";
import DateFormatter from "./DateFormatter";
import BusinessDaysCalculator from "./BusinessDaysCalculator";
import TimeDurationCalculator from "./TimeDurationCalculator";
import DateRangeGenerator from "./DateRangeGenerator";
import WeekNumberCalculator from "./WeekNumberCalculator";

const dateTimeTools = {
  "date-difference-calculator": DateDifferenceCalculator,
  "date-formatter": DateFormatter,
  "business-days-calculator": BusinessDaysCalculator,
  "time-duration-calculator": TimeDurationCalculator,
  "date-range-generator": DateRangeGenerator,
  "week-number-calculator": WeekNumberCalculator,
};

export default dateTimeTools;
