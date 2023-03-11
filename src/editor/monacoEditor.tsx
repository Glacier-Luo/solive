import React, { useEffect, useRef } from 'react';
import { useEditor } from "./editorContext";
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

interface Props {
  modelInfos: ModelInfoType[]
}

function App({
  modelInfos
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
    editorApiRef.current.addErrorMarker = () => {}
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
