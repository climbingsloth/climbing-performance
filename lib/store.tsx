"use client";

import {
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  createContext,
  type ReactNode,
} from "react";
import type { Athlete, Measurement, WellnessEntry } from "./types";
import { demoAthletes, demoMeasurements, demoWellness } from "./mock-data";

const STORAGE_KEY = "climbing-performance-v2";

interface StoreState {
  athletes: Athlete[];
  measurements: Measurement[];
  wellness: WellnessEntry[];
}

interface StoreContextValue extends StoreState {
  addAthlete: (athlete: Omit<Athlete, "id" | "createdAt">) => void;
  addMeasurement: (measurement: Omit<Measurement, "id">) => void;
  addWellness: (entry: Omit<WellnessEntry, "id">) => void;
  removeAthlete: (id: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function demoState(): StoreState {
  return {
    athletes: demoAthletes,
    measurements: demoMeasurements,
    wellness: demoWellness,
  };
}

function readStored(): StoreState {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return demoState();
  try {
    const parsed = JSON.parse(raw) as Partial<StoreState>;
    if (Array.isArray(parsed.athletes) && Array.isArray(parsed.measurements)) {
      return {
        athletes: parsed.athletes,
        measurements: parsed.measurements,
        wellness: Array.isArray(parsed.wellness) ? parsed.wellness : [],
      };
    }
  } catch {
    // données illisibles : on retombe sur les données de démo
  }
  return demoState();
}

const listeners = new Set<() => void>();
const demoSnapshot: StoreState = demoState();
let cachedRaw: string | null = null;
let cachedState: StoreState = demoSnapshot;

function getSnapshot(): StoreState {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedState = raw ? readStored() : demoSnapshot;
  }
  return cachedState;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function persist(next: StoreState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  cachedRaw = window.localStorage.getItem(STORAGE_KEY);
  cachedState = next;
  listeners.forEach((l) => l());
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => demoSnapshot);

  const addAthlete = useCallback(
    (athlete: Omit<Athlete, "id" | "createdAt">) => {
      persist({
        ...getSnapshot(),
        athletes: [
          ...getSnapshot().athletes,
          {
            ...athlete,
            id: `ath-${Date.now()}`,
            createdAt: new Date().toISOString().slice(0, 10),
          },
        ],
      });
    },
    [],
  );

  const addMeasurement = useCallback((measurement: Omit<Measurement, "id">) => {
    const current = getSnapshot();
    persist({
      ...current,
      measurements: [
        ...current.measurements,
        { ...measurement, id: `m-${Date.now()}` },
      ],
    });
  }, []);

  const addWellness = useCallback((entry: Omit<WellnessEntry, "id">) => {
    const current = getSnapshot();
    persist({
      ...current,
      wellness: [...current.wellness, { ...entry, id: `w-${Date.now()}` }],
    });
  }, []);

  const removeAthlete = useCallback((id: string) => {
    const current = getSnapshot();
    persist({
      athletes: current.athletes.filter((a) => a.id !== id),
      measurements: current.measurements.filter((m) => m.athleteId !== id),
      wellness: current.wellness.filter((w) => w.athleteId !== id),
    });
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({ ...state, addAthlete, addMeasurement, addWellness, removeAthlete }),
    [state, addAthlete, addMeasurement, addWellness, removeAthlete],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore doit être utilisé dans StoreProvider");
  return ctx;
}
