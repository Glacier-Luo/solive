import React, { Dispatch, SetStateAction } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
// import dynamic from "next/dynamic";
// let MonacoEditor = dynamic(() => import("./monacoEditor"), { ssr: false });
import { EditorProvider } from './editorContext';
import { ModelInfoType } from '../types/monaco';
import MonacoEditor from './monacoEditor';

export type EditorProps = {
  id: string;
  modelInfos: ModelInfoType[];
  onSuccess?: Dispatch<SetStateAction<number>>;
  onFailure?: Function;
  submissionCount?: number;
};

export default function Editor({
  modelInfos
}: EditorProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <EditorProvider>
        <MonacoEditor modelInfos={modelInfos} />
      </EditorProvider>
    </DndProvider>
  );
}
