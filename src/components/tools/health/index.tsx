import { lazy } from 'react';

const healthTools = {
    'calorie-calculator': lazy(() => import('./CalorieCalculator')),
    'macro-calculator': lazy(() => import('./MacroCalculator')),
    'water-intake': lazy(() => import('./WaterIntakeCalculator')),
    'body-fat': lazy(() => import('./BodyFatCalculator')),
    'ideal-weight': lazy(() => import('./IdealWeightCalculator')),
    'tdee-calculator': lazy(() => import('./TDEECalculator')),
};

export default healthTools;
