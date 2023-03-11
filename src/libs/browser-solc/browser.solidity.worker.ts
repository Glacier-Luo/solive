declare global {
    interface Worker {
        Module: any;
    }
}


function browserSolidityCompiler() {
    const ctx: Worker = self as any;
    const importVersions: any[] = [];

    ctx.addEventListener('message', ({ data }) => {
        if (data === 'fetch-compiler-versions') {
            fetch('https://binaries.soliditylang.org/bin/list.json').then(response => response.json()).then(result => {
                // @ts-ignore    
                postMessage(result)
            })
        } else {
            // version find in https://github.com/ethereum/solc-bin/tree/gh-pages/bin
            importScripts(data.version);
            const soljson = ctx.Module;

            if ('_solidity_compile' in soljson) {
                if (!importVersions.includes(data.version)) {
                    importVersions.push(data.version);
                }
                const compile = soljson.cwrap('solidity_compile', 'string', ['string', 'number']);
                const output = JSON.parse(compile(data.input))
                // @ts-ignore    
                postMessage(output)
            }
        }
    });
}

function importScripts(_arg0: string) {
    throw new Error('Function not implemented.');
}

if (window !== self) {
    browserSolidityCompiler();
}

export { browserSolidityCompiler }