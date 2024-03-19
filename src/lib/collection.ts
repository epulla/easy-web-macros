import { type Step } from "./step";

export interface Collection {
  id: string;
  name: string;
  steps: Step[];
  delayBetweenSteps: number;
  numberOfRuns: number;
  doesLoopInfinitely: boolean;
}

export const getDefaultCollection = (
  id: string,
  name: string,
): Collection => {
  return {
    id,
    name,
    steps: [],
    delayBetweenSteps: 1000,
    numberOfRuns: 1,
    doesLoopInfinitely: false,
  };
};
