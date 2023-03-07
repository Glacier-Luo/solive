import { EditorApi, ModelType, SupportLanguage } from "../../types/monaco";
import { EditorInitState } from "../editorContext";
import { solidityCompiler, getCompilerVersions } from "../../libs/browser-solc";
import { EVMVersion, Source } from "../../libs/compiler/types";
import { urlFromVersion } from "../../libs/compiler/compilerUtils";
import { makeCompilerInput } from "../../libs/compiler";
import { Language } from "../../libs/compiler/types";
import ParserVersion from "./parserVersion";


class CodeParserCompiler {
    editorApi: EditorApi;
    editorState: EditorInitState;
    compiler: any;
    parseVersion: ParserVersion;

    constructor(
        editorApi: EditorApi,
        editorState: EditorInitState,
        parseVersion: ParserVersion,
    ) {
        this.editorApi = editorApi;
        this.editorState = editorState;
        this.parseVersion = parseVersion;
    }

    compile(version: string) {
        const currentModel = this.editorState.models![this.editorState.modelIndex!];
        const { compilerInfo } = this.editorState;
        // console.log(currentModel);

        const codeVersion = this.parseVersion.resolveCodeVersion(currentModel.model.getValue());
        const versionUrl = this.parseVersion.getVersionUri(codeVersion);
        const imports = this.resolveImports(currentModel);
        const sources = Object.assign({
            [currentModel.filename]: {
                content: currentModel.model.getValue(),
            }
        }, this.resolveSource(imports));

        // wasm compiler use string config
        const compilerConfig = makeCompilerInput(sources, {
            optimize: true,
            runs: 200,
            language: 'Solidity' as Language,
        })
        // console.log(this.resolveImports(currentModel));
        solidityCompiler({
            version: `https://binaries.soliditylang.org/bin/${versionUrl}`,
            input: compilerConfig,
        }).then((result: any) => {
            console.log(result);
        })
    }


    resolveImports(model: ModelType) {
        const code = model.model.getValue();
        const importRegex = /^\s*import\s+["']([^"']+\.(sol))["']/gm;
        const importHints: string[] = [];
        let match;
        while ((match = importRegex.exec(code)) !== null) {
            let importFilePath = match[1];
            if (importFilePath.startsWith('./')) {
                const path: RegExpExecArray | null = /(.*\/).*/.exec(model.filename)
                importFilePath = path ? importFilePath.replace('./', path[1]) : importFilePath.slice(2)
            }
            if (!importHints.includes(importFilePath)) importHints.push(importFilePath)
        }

        return importHints;
    }

    resolveSource(imports: string[]): Source {
        const monaco = this.editorState.monaco;

        const find = (value: string): ModelType['model'] => {
            const uri = monaco?.Uri.parse(value);
            return monaco?.editor.getModels()
                .find(model => model.uri.toString() === uri?.toString())!;
        }

        let sources = {};
        imports.forEach((im: string) => {
            Object.assign(sources, {
                [im]: { content: find(im).getValue() }
            })
        })

        return sources;
    }

    resolveVersion(code: string) {
        const { compilerInfo } = this.editorState;
        const {releases} = compilerInfo;

        
    }
}

export default CodeParserCompiler;