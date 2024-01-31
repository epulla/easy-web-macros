import { type StepStrategyKeys } from "./strategies";
import { v4 as uuidv4 } from 'uuid';

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

export const getDefaultInitialStep = (initialDefaultPage: string): Step => {
  return {
    id: uuidv4(),
    strategy: "Goto",
    value: initialDefaultPage,
    status: "idle",
    visibility: "visible",
    xpath: "",
    label: "",
  };
};

export const getStepValueFromKey = (key: string, step: Step) => {
  if (!Object.keys(step).includes(key)) {
    throw new Error(`Invalid key: ${key}`);
  }
  return step[key as keyof Step];
};
