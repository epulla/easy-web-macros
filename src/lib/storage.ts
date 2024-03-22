import { getDefaultCollection, type Collection } from "./collection";
import { log } from "./log";
import type { Step } from "./step";

import { v4 as uuidv4 } from "uuid";

export type IStorage = {
  collections: { [key: string]: Collection }; // Record<string, Collection>;
  activeCollectionId: string;
  isRecording: boolean;
  playStatus: "playing" | "idle" | "pending" | "stopped";
  stepIndex: number;
  skipIdSearch: boolean;
  count: number;
};

export const defaultStorage: IStorage = {
  collections: {},
  activeCollectionId: "",
  isRecording: false,
  playStatus: "idle",
  stepIndex: 0,
  skipIdSearch: true,
  count: 0,
};

export const storage = {
  get: (
    keys?:
      | string
      | string[]
      | {
          [key: string]: any;
        }
  ): Promise<IStorage> => chrome.storage.local.get(keys) as Promise<IStorage>,
  set: (value: IStorage): Promise<void> => {
    log("storage.set", value);
    return chrome.storage.local.set(value);
  },
  update: (value: Partial<IStorage>): Promise<void> => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get((data) => {
        chrome.storage.local.set({ ...data, ...value }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            log("error storage.update", chrome.runtime.lastError)
          } else {
            resolve();
            chrome.storage.local
              .get()
              .then(() => log("storage.updated", value));
          }
        });
      });
    });
  },
  isUndefined: async (): Promise<boolean> => {
    const storageData = await storage.get();
    return Object.keys(storageData).length === 0;
  },
  // Collections functions
  hasNoCollections: async (): Promise<boolean> => {
    const storageData = await storage.get();
    return Object.keys(storageData.collections).length === 0;
  },
  setActiveCollectionId: async (id: string): Promise<void> => {
    await storage.update({ activeCollectionId: id });
  },
  hasNoActiveCollection: async (): Promise<boolean> => {
    const storageData = await storage.get();
    return storageData.activeCollectionId === "";
  },
  getCollections: async (): Promise<{ [key: string]: Collection }> => {
    const storageData = await storage.get();
    return storageData.collections;
  },
  getCollection: async (id: string): Promise<Collection | undefined> => {
    const collections = await storage.getCollections();
    if (!Object.keys(collections).includes(id)) {
      return undefined;
    }
    return collections[id];
  },
  addDefaultCollection: async (): Promise<string> => {
    const newId = uuidv4();
    await storage.update({
      collections: {
        ...(await storage.getCollections()),
        [newId]: getDefaultCollection(
          newId,
          `New Collection ${
            Object.keys(await storage.getCollections()).length + 1
          }`
        ),
      },
    });
    return newId;
  },
  updateDelayBetweenSteps: async (id: string, delay: number) => {
    const { collections } = await storage.get();
    const collection = collections[id];
    await storage.update({
      collections: {
        ...collections,
        [id]: {
          ...collection,
          delayBetweenSteps: delay,
        },
      },
    });
  },
  updateNumberOfRuns: async (id: string, runs: number) => {
    const { collections } = await storage.get();
    const collection = collections[id];
    await storage.update({
      collections: {
        ...collections,
        [id]: {
          ...collection,
          numberOfRuns: runs,
        },
      },
    });
  },
  updateDoesLoopInfinitely: async (id: string, doesLoop: boolean) => {
    const { collections } = await storage.get();
    const collection = collections[id];
    await storage.update({
      collections: {
        ...collections,
        [id]: {
          ...collection,
          doesLoopInfinitely: doesLoop,
        },
      },
    });
  },
  // Step functions
  insertStepToCollection: async (id: string, step: Step, index: number) => {
    const { collections } = await storage.get();
    const collection = collections[id];
    if (!collection) {
      await storage.update({
        collections: {
          ...collections,
          [id]: {
            id,
            name: "New Collection",
            steps: [step],
            delayBetweenSteps: 1000,
            numberOfRuns: 1,
            doesLoopInfinitely: false,
          },
        },
      });
    } else {
      const steps = [...collection.steps];
      steps.splice(index, 0, step);
      await storage.update({
        collections: {
          ...collections,
          [id]: {
            ...collection,
            steps,
          },
        },
      });
    }
  },
  /**
   *
   * @param id UUID of the collection
   * @param step Step to add to the collection
   * @param replaceLastStep If true, then replace the last step in the collection with the new step (specially when dealing with input change events)
   */
  appendStepToCollection: async (
    id: string,
    step: Step,
    replaceLastStep: boolean = false
  ) => {
    const { collections } = await storage.get();
    const collection = collections[id];
    if (!collection) {
      await storage.update({
        collections: {
          ...collections,
          [id]: {
            id,
            name: "New Collection",
            steps: [step],
            delayBetweenSteps: 1000,
            numberOfRuns: 1,
            doesLoopInfinitely: false,
          },
        },
      });
    } else if (
      replaceLastStep &&
      collection.steps[collection.steps.length - 1].xpath === step.xpath
    ) {
      const rep = collection.steps.slice(0, collection.steps.length - 1);
      await storage.update({
        collections: {
          ...collections,
          [id]: {
            ...collection,
            steps: [...rep, step],
          },
        },
      });
    } else {
      await storage.update({
        collections: {
          ...collections,
          [id]: {
            ...collection,
            steps: [...collection.steps, step],
          },
        },
      });
    }
  },
  updateStepStatus: async (
    status: Step["status"],
    collectionId: string,
    stepId: string,
    error?: Error
  ) => {
    const { collections } = await storage.get();
    const collection = collections[collectionId];
    await storage.update({
      collections: {
        ...collections,
        [collection.id]: {
          ...collection,
          steps: collection.steps.map((step) =>
            step.id === stepId
              ? { ...step, status, error: error && error.message }
              : step
          ),
        },
      },
    });
  },
  duplicateStep: async (stepIndex: number, collectionId: string) => {
    const collections = await storage.getCollections();
    const collection = collections[collectionId];
    const newId = uuidv4();
    await storage.update({
      collections: {
        ...collections,
        [collection.id]: {
          ...collection,
          steps: [
            ...collection.steps.slice(0, stepIndex + 1),
            {
              ...collection.steps[stepIndex],
              id: newId,
            },
            ...collection.steps.slice(stepIndex + 1),
          ],
        },
      },
    });
  },
  duplicateStepToBottom: async (stepId: string, collectionId: string) => {
    const collections = await storage.getCollections();
    const collection = collections[collectionId];
    const newId = uuidv4();
    await storage.update({
      collections: {
        ...collections,
        [collection.id]: {
          ...collection,
          steps: [
            ...collection.steps,
            {
              ...collection.steps.find((step) => step.id === stepId)!,
              id: newId,
            },
          ],
        },
      },
    });
  },
  editStep: async (step: Step, stepIndex: number, collectionId: string) => {
    const collections = await storage.getCollections();
    const collection = collections[collectionId];
    // replace step at index
    await storage.update({
      collections: {
        ...collections,
        [collection.id]: {
          ...collection,
          steps: [
            ...collection.steps.slice(0, stepIndex),
            step,
            ...collection.steps.slice(stepIndex + 1),
          ],
        },
      },
    });
  },
  moveStepUp: async (stepIndex: number, collectionId: string) => {
    const collections = await storage.getCollections();
    const collection = collections[collectionId];
    if (stepIndex === 0) return;
    await storage.update({
      collections: {
        ...collections,
        [collection.id]: {
          ...collection,
          steps: [
            ...collection.steps.slice(0, stepIndex - 1),
            collection.steps[stepIndex],
            collection.steps[stepIndex - 1],
            ...collection.steps.slice(stepIndex + 1),
          ],
        },
      },
    });
  },
  moveStepDown: async (stepIndex: number, collectionId: string) => {
    const collections = await storage.getCollections();
    const collection = collections[collectionId];
    if (stepIndex === collection.steps.length - 1) return;
    await storage.update({
      collections: {
        ...collections,
        [collection.id]: {
          ...collection,
          steps: [
            ...collection.steps.slice(0, stepIndex),
            collection.steps[stepIndex + 1],
            collection.steps[stepIndex],
            ...collection.steps.slice(stepIndex + 2),
          ],
        },
      },
    });
  },
  deleteStep: async (stepId: string, collectionId: string) => {
    const collections = await storage.getCollections();
    const collection = collections[collectionId];
    await storage.update({
      collections: {
        ...collections,
        [collection.id]: {
          ...collection,
          steps: collection.steps.filter((step) => step.id !== stepId),
        },
      },
    });
  },
  // Active Collection functions
  getActiveCollectionId: async (): Promise<string> => {
    const storageData = await storage.get();
    return storageData.activeCollectionId;
  },
  resetActiveCollectionSteps: async (): Promise<void> => {
    const activeCollectionId = await storage.getActiveCollectionId();
    const collection = await storage.getCollection(activeCollectionId);
    await storage.update({
      collections: {
        ...(await storage.getCollections()),
        [activeCollectionId]: {
          ...collection!,
          steps: [],
        },
      },
    });
  },
};
