import { browserSolidityCompiler } from './browser.solidity.worker'
import { CompilerInput } from './types';

const worker = new Worker(URL.createObjectURL(new Blob([`(${browserSolidityCompiler})()`], { type: 'module' })));

export const solidityCompiler = async ({
    version,
    input
}: { version: string; input: any}
) => {
    return new Promise((resolve, reject) => {
        worker.postMessage({ input: JSON.stringify(input), version })
        worker.onmessage = function ({ data }) {
            resolve(data);
        };
        worker.onerror = reject;
    });
}

export const getCompilerVersions = async () => {
    return new Promise((resolve, reject) => {
        worker.postMessage('fetch-compiler-versions')
        worker.onmessage = function ({ data }) {
            resolve(data);
        };
        worker.onerror = reject;
    });
}