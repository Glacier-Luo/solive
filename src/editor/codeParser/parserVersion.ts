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
        const latestVersion = semver.maxSatisfying(Object.keys(this.allVersions), version);

        if (!latestVersion) {
            throw new Error("No suitable version was found.");
        }

        return latestVersion;
    }

    async getCompilerInfo() {
        const { value: curCompilerInfo, expired } = getCache<CompilerInfo>(COMPILER_INFO_KEY);

        if (!curCompilerInfo || expired) {
            const compilerInfo = await getCompilerVersions() as CompilerInfo;
            this.compilerInfo = compilerInfo;
            this.allVersions = Object.keys(compilerInfo.releases);
            this.latestVersion = compilerInfo.latestRelease;
            cache(COMPILER_INFO_KEY, compilerInfo, { cacheTime: 1000 * 60 * 60 * 24 });
            return compilerInfo;
        }

        return curCompilerInfo;
    }

    setVersion() { }

}

export default ParserVersion;