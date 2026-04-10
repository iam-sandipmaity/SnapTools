import { lazy } from 'react';

const randomTools = {
    "random-number-generator": lazy(() => import("./RandomNumberGenerator")),
    "dice-roller": lazy(() => import("./DiceRoller")),
    "coin-flipper": lazy(() => import("./CoinFlipper")),
    "yes-no-decision-maker": lazy(() => import("./YesNoDecisionMaker")),
    "random-picker": lazy(() => import("./RandomPicker")),
    "random-color-generator": lazy(() => import("./ColorGenerator")),
};

export default randomTools;
