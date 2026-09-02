"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { todayISO } from "./dates";
import { loadState, saveState } from "./persistence";
import { QUESTS, QUEST_IDS } from "./quests";
import { createReducer, type Action } from "./reducer";
import { EMPTY_STATE, type UserState } from "./types";

interface QuestsContextValue {
  state: UserState;
  hydrated: boolean;
  dispatch: (action: Action) => void;
}

const QuestsContext = createContext<QuestsContextValue | null>(null);
const reducer = createReducer(QUESTS);

type Wrapped = { state: UserState; hydrated: boolean };

function wrappedReducer(w: Wrapped, action: Action): Wrapped {
  if (action.type === "hydrate") return { state: action.state, hydrated: true };
  // Ignore writes before hydration so the empty initial state can never
  // overwrite what the user already has in storage.
  if (!w.hydrated) return w;
  return { state: reducer(w.state, action), hydrated: true };
}

export function QuestsProvider({ children }: { children: React.ReactNode }) {
  const [w, dispatch] = useReducer(wrappedReducer, { state: EMPTY_STATE, hydrated: false });
  const lastSaved = useRef<UserState | null>(null);

  useEffect(() => {
    const loaded = loadState(QUEST_IDS, todayISO());
    lastSaved.current = loaded;
    dispatch({ type: "hydrate", state: loaded });
  }, []);

  useEffect(() => {
    if (!w.hydrated || w.state === lastSaved.current) return;
    lastSaved.current = w.state;
    saveState(w.state);
  }, [w]);

  const value = useMemo(() => ({ state: w.state, hydrated: w.hydrated, dispatch }), [w]);
  return <QuestsContext.Provider value={value}>{children}</QuestsContext.Provider>;
}

export function useQuests(): QuestsContextValue {
  const ctx = useContext(QuestsContext);
  if (!ctx) throw new Error("useQuests must be used inside <QuestsProvider>");
  return ctx;
}
