import { getDefaultInitialStep, type Step } from "./step";

export interface Collection {
  id: string;
  name: string;
  steps: Step[];
  delayBetweenSteps: number;
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
  };
};
