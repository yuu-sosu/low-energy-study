import { NavigatorScreenParams } from '@react-navigation/native';
import { FocusDraft, SessionResult } from '../types';

export type HomeStackParamList = {
  Home: undefined;
  FocusTimer: { draft: FocusDraft };
  Record: {
    draft: FocusDraft;
    elapsedSeconds: number;
    initialResult: SessionResult;
  };
  Break: {
    recommendedSeconds: number;
    previousDraft: FocusDraft;
  };
  TodaySummary: undefined;
};

export type RootTabParamList = {
  HomeStack: NavigatorScreenParams<HomeStackParamList>;
  Stats: undefined;
  Settings: undefined;
};
