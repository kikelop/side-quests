import { drawQuest } from "./draw";
import type { DrawContext } from "./draw";
import type { Quest, TodayScale, UserState } from "./types";

export type Action =
  | { type: "hydrate"; state: UserState }
  | { type: "toggleSaved"; id: string }
  | { type: "markDone"; id: string; date: string }
  | { type: "undoDone"; id: string }
  | { type: "removeSaved"; id: string }
  | { type: "skipToday"; ctx: DrawContext }
  | { type: "ensureToday"; ctx: DrawContext }
  | { type: "setTodayScale"; scale: TodayScale; ctx: DrawContext }
  | { type: "resetDismissed" }
  | { type: "resetAll" };

function withoutId<T extends { id: string }>(list: T[], id: string): T[] {
  return list.filter((x) => x.id !== id);
}

function pin(state: UserState, quest: Quest | null, today: string): UserState {
  return { ...state, today: quest ? { id: quest.id, date: today } : null };
}

/**
 * The card pinned for today stays put across reloads. It is redrawn only
 * when the date changes, when the pinned quest stops being eligible, or
 * when the scale filter no longer matches it.
 */
function ensureToday(quests: Quest[], byId: Map<string, Quest>, state: UserState, ctx: DrawContext): UserState {
  const current = state.today ? byId.get(state.today.id) : undefined;
  const scale = state.prefs.todayScale;
  const stillValid =
    current &&
    state.today?.date === ctx.today &&
    !current.retired &&
    (scale === "any" || current.scale === scale) &&
    !state.done.some((d) => d.id === current.id) &&
    !state.saved.includes(current.id);
  if (stillValid) return state;
  return pin(state, drawQuest(quests, state, scale, ctx), ctx.today);
}

export function createReducer(quests: Quest[]) {
  const byId = new Map(quests.map((q) => [q.id, q]));

  return function reducer(state: UserState, action: Action): UserState {
    switch (action.type) {
      case "hydrate":
        return action.state;

      case "toggleSaved": {
        const saved = state.saved.includes(action.id)
          ? state.saved.filter((id) => id !== action.id)
          : [...state.saved, action.id];
        return { ...state, saved, dismissed: withoutId(state.dismissed, action.id) };
      }

      case "removeSaved":
        return { ...state, saved: state.saved.filter((id) => id !== action.id) };

      case "markDone": {
        if (state.done.some((d) => d.id === action.id)) return state;
        return {
          ...state,
          done: [...state.done, { id: action.id, date: action.date }],
          saved: state.saved.filter((id) => id !== action.id),
          dismissed: withoutId(state.dismissed, action.id),
        };
      }

      case "undoDone":
        return { ...state, done: withoutId(state.done, action.id) };

      case "ensureToday":
        return ensureToday(quests, byId, state, action.ctx);

      case "skipToday": {
        if (!state.today) return ensureToday(quests, byId, state, action.ctx);
        const skipped = state.today.id;
        const next: UserState = {
          ...state,
          dismissed: [...withoutId(state.dismissed, skipped), { id: skipped, date: action.ctx.today }],
        };
        return pin(next, drawQuest(quests, next, next.prefs.todayScale, action.ctx, skipped), action.ctx.today);
      }

      case "setTodayScale": {
        const next = { ...state, prefs: { ...state.prefs, todayScale: action.scale } };
        return ensureToday(quests, byId, next, action.ctx);
      }

      case "resetDismissed":
        return { ...state, dismissed: [] };

      case "resetAll":
        return { version: 1, saved: [], done: [], dismissed: [], today: null, prefs: { todayScale: "any" } };
    }
  };
}
