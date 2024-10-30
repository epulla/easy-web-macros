import { type StepStrategyKeys } from "./strategies";

export interface Step {
  id: string;
  strategy: (typeof StepStrategyKeys)[number];
  visibility: "visible" | "hidden";
  status: "success" | "error" | "running" | "idle";
  xpath?: string;
  label?: string;
  value?: string;
  error?: string; // any error message
}

export const getStepValueFromKey = (key: string, step: Step) => {
  if (!Object.keys(step).includes(key)) {
    throw new Error(`Invalid key: ${key}`);
  }
  return step[key as keyof Step];
};
