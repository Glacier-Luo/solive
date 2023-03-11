import { getCompilerVersions } from "../../libs/browser-solc";
import { EditorApi } from "../../types/monaco";
import { CompilerInfo } from "../../types/solidity";
import { EditorInitState } from "../editorContext";
import { cache, getCache } from "../utils/cache";
import semver from 'semver';

const COMPILER_INFO_KEY = 'compiler_info';

class ParserVersion {
    editorApi: EditorApi;
    editorState: EditorInitState;
    allVersions: string[] = [];
    latestVersion: string = '';
    compilerInfo?: CompilerInfo;

    constructor(
        editorApi: EditorApi,
        editorState: EditorInitState,
    ) {
        this.editorApi = editorApi;
        this.editorState = editorState;
    }

    async init() {
        // TODO: 考虑加载失败的问题
        await this.getCompilerInfo();
    }

    resolveCodeVersion(code: string) {
        const pattern = /pragma solidity\s+(\^|~)?(\d+\.\d+\.\d+)/;
        const match = pattern.exec(code) as RegExpExecArray;
        const version = match[2];
        const symbol = match[1];
        return symbol ? symbol + version : version;
    }

    getVersionUri(version: string) {
        const matchVersion = this.matchVersion(version);

        return this.compilerInfo?.releases[matchVersion];
    }

    matchVersion(version: string) {
        const latestVersion = semver.maxSatisfying(this.allVersions, version);

        if (!latestVersion) {
            throw new Error("No suitable version was found.");
        }

        return latestVersion;
    }

    async getCompilerInfo() {
        const { value: oldCompilerInfo, expired } = getCache<CompilerInfo>(COMPILER_INFO_KEY);
        let curCompiler = oldCompilerInfo as CompilerInfo;

        if (!oldCompilerInfo || expired) {
            curCompiler = await getCompilerVersions() as CompilerInfo;
            cache(COMPILER_INFO_KEY, curCompiler, { cacheTime: 1000 * 60 * 60 * 24 });
        }

        this.compilerInfo = curCompiler;
        this.allVersions = Object.keys(curCompiler.releases);
        this.latestVersion = curCompiler.latestRelease;

        return curCompiler;
    }

    setVersion() { }

}

export default ParserVersion;