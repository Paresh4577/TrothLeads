import { createFeatureSelector } from "@ngrx/store";
import { IAppUIState } from "../models/appUiState.interface";

export const uiStateSelector = createFeatureSelector<IAppUIState>('uiState');
