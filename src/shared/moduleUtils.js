export function getExportedFunctions(exportedModule) {
    return Object.keys(exportedModule)
        .filter(k => typeof exportedModule[k] === 'function' && k !== 'default')
        .reduce((obj, name) => {
            obj[name] = exportedModule[name];
            return obj;
        }, {});
}
