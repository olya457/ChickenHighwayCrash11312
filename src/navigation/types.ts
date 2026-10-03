import { RunSummary } from '../state/progress';
export type RootStackParams = {
  Main: undefined;
  Game: undefined;
  Result: { run: RunSummary };
};
export type TabParams = {
  Home: undefined;
  Challenges: undefined;
  Boosts: undefined;
  Customize: undefined;
};
