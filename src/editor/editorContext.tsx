import React, { useEffect, useMemo, useReducer, useRef } from "react";
import monacoForTypes, { editor } from "monaco-editor";
import { BaseMonacoEditor, ModelType } from "../types/monaco";
import { getCompilerVersions } from "../libs/browser-solc";

export interface EditorInitState {
  editor: editor.IStandaloneCodeEditor | undefined,
  monaco: typeof monacoForTypes | undefined,
  models: ModelType[] | undefined,
  modelIndex: number | undefined,
  consoleMessages: any[],
  compilerInfo: any,
  compilerLoading: boolean,
}

export interface EditorReducerActionType {
  type: "updateEditor" |
  "updateMonaco" |
  "updateModels" |
  "updateModelIndex" |
  "updateConsoleMessages" |
  "setCompilerInfo" |
  "updateCompilerLoading";
  payload: Partial<EditorInitState>;
}

export type EditorReducerAction = {
  updateEditor: (e: BaseMonacoEditor) => void;
  updateMonaco: (m: typeof monacoForTypes) => void;
  updateModels: (m: ModelType[]) => void;
  updateModelIndex: (m: number) => void;
  updateConsoleMessages: (m: any[]) => void;
  setCompilerInfo: (m: any) => void;
  updateCompilerLoading: (m: boolean) => void;
  cleanConsoleMessages: () => void;
  cleanModels: () => void;
}

export type EditorState = {
  state: EditorInitState;
  stateRef: React.MutableRefObject<EditorInitState>;
  dispatch: React.Dispatch<EditorReducerActionType>;
  actions: EditorReducerAction;
}

const EditorContext = React.createContext<EditorState | undefined>(undefined);

// Editor Reducer And State
const editorInitState: EditorInitState = {
  editor: undefined,
  monaco: undefined,
  models: [],
  modelIndex: 0,
  consoleMessages: [],
  compilerInfo: {},
  compilerLoading: false,
}

const editorReducer = (state: EditorInitState, action: EditorReducerActionType): EditorInitState => {
  switch (action.type) {
    case "updateEditor":
      return { ...state, editor: action.payload.editor }
    case "updateMonaco":
      return { ...state, monaco: action.payload.monaco }
    case "updateModels":
      return { ...state, models: action.payload.models }
    case "updateModelIndex":
      return { ...state, modelIndex: action.payload.modelIndex }
    case "updateConsoleMessages":
      return { ...state, consoleMessages: action.payload.consoleMessages || [] }
    case "setCompilerInfo":
      return { ...state, compilerInfo: action.payload.compilerInfo || [] }
    case "updateCompilerLoading":
      return { ...state, compilerLoading: action.payload.compilerLoading || false }
    default:
      return state;
  }
}

// Editor Provider
export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer<React.Reducer<EditorInitState, EditorReducerActionType>>(editorReducer, editorInitState);
  // some provider need to access the state directly
  const stateRef = useRef(state || {});

  const actions: EditorReducerAction = useMemo(() => {
    return {
      updateEditor: (editor: BaseMonacoEditor) => dispatch({ type: "updateEditor", payload: { editor } }),
      updateMonaco: (monaco: typeof monacoForTypes) => dispatch({ type: "updateMonaco", payload: { monaco } }),
      updateModels: (models: ModelType[]) => dispatch({ type: "updateModels", payload: { models } }),
      updateModelIndex: (modelIndex: number) => dispatch({ type: "updateModelIndex", payload: { modelIndex } }),
      updateConsoleMessages: (consoleMessages: any[]) => dispatch({ type: "updateConsoleMessages", payload: { consoleMessages } }),
      setCompilerInfo: (compilerInfo: any) => dispatch({ type: "setCompilerInfo", payload: { compilerInfo } }),
      updateCompilerLoading: (compilerLoading: boolean) => dispatch({ type: "updateCompilerLoading", payload: { compilerLoading } }),
      cleanModels: () => dispatch({ type: "updateModels", payload: { models: [] } }),
      cleanConsoleMessages: () => dispatch({ type: "updateConsoleMessages", payload: { consoleMessages: [] } }),
    }
  }, [])

  useEffect(() => {
    (async () => {
      actions.updateCompilerLoading(true);
      try {
        const compilerInfo = await getCompilerVersions();
        console.log(compilerInfo);
        
        actions.setCompilerInfo(compilerInfo);
      } catch (e) {
        // @ts-ignore
        console.error(e.message);
      }
      actions.updateCompilerLoading(false);
    })()
  }, [])

  useEffect(() => {
    stateRef.current = Object.assign(stateRef.current, state || {});
  }, [state]);

  return (
    <EditorContext.Provider value={{ state, dispatch, stateRef, actions }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = React.useContext(EditorContext);

  if (context === undefined) {
    throw new Error("useEditor must be used withing a provider");
  }

  return context;
}