import React, { useEffect, useRef } from 'react';
import { useEditor } from "./editorContext";
import BaseMonaco from 'monaco-editor';
import ReactBaseMonacoEditor, { Monaco } from "@monaco-editor/react";
import { BaseMonacoEditor, EditorApi, ModelInfoType } from '../types/monaco';
import {
  initTheme,
  registerLangs,
  initModels,
  registerCommandsAndActions,
  registerListeners,
} from './mountFunctions';
import TopBar from './components/topBar';
import CodeParser from './codeParser';
import { ErrorMarker, MarkerSeverity } from '../libs/compiler/types';
import { findModel } from './utils/model';

interface Props {
  modelInfos: ModelInfoType[];
  id: string;
}

function App({
  modelInfos,
  id
}: Props) {
  const { stateRef, dispatch, actions } = useEditor();
  const editorRef = useRef<BaseMonacoEditor>();
  const monacoRef = useRef<Monaco>();
  const editorApiRef = useRef<EditorApi>({} as EditorApi);

  async function handleEditorDidMount(editor: BaseMonacoEditor, monaco: Monaco) {
    editorRef.current = editor;
    actions.updateMonaco(monaco);
    actions.updateEditor(editor);
    actions.updateCodeParserLoading(true);

    initTheme(monaco);
    initModels(monaco, editor, modelInfos, dispatch);

    const codeParser = new CodeParser(editorApiRef.current, stateRef.current);
    await codeParser.parseVersion.init();
    actions.setCodeParser(codeParser);
    actions.updateCodeParserLoading(false);

    registerCommandsAndActions(monaco, editor);
    registerListeners(editor, editorApiRef.current, stateRef.current);
  }

  function handleEditorBeforeMount(monaco: Monaco) {
    monacoRef.current = monaco;
    registerLangs(monaco, stateRef.current);
  }

  useEffect(() => {
    editorApiRef.current.addErrorMarker = (errors: ErrorMarker[], from = id) => {
      const allMarkersPerfile: Record<string, Array<BaseMonaco.editor.IMarkerData>> = {}

      for (const error of errors) {
        let filePath = error.file

        if (!filePath) return
        const model = findModel(stateRef.current.models || [], filePath);
        const errorServerityMap = {
          'error': MarkerSeverity.Error,
          'warning': MarkerSeverity.Warning,
          'info': MarkerSeverity.Info
        }
        if (model) {
          const markerData: BaseMonaco.editor.IMarkerData = {
            severity: (typeof error.severity === 'string') ? errorServerityMap[error.severity] : error.severity,
            startLineNumber: ((error.position.start && error.position.start.line) || 0),
            startColumn: ((error.position.start && error.position.start.column) || 0),
            endLineNumber: ((error.position.end && error.position.end.line) || 0),
            endColumn: ((error.position.end && error.position.end.column) || 0),
            message: error.message,
          }
          if (!allMarkersPerfile[filePath]) {
            allMarkersPerfile[filePath] = []
          }
          allMarkersPerfile[filePath].push(markerData)
        }
      }
      for (const filePath in allMarkersPerfile) {
        const model = findModel(stateRef.current.models || [], filePath);
        if (model) {
          monacoRef.current?.editor.setModelMarkers(model.model, from, allMarkersPerfile[filePath])
        }
      }
    }
  }, [])

  return (
    <>
      <TopBar modelInfos={modelInfos} />
      <ReactBaseMonacoEditor
        height="90vh"
        onMount={handleEditorDidMount}
        beforeMount={handleEditorBeforeMount}
        defaultLanguage="solidity"
        defaultValue="// some comment"
      />
    </>
  )
}

export default App;
