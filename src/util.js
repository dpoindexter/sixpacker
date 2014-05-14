function isAbsolute (filepath) {
    return !!filepath && filepath[0] !== '.';
}

function moduleNameFromPath (filepath) {
    var parts = filepath.split('/');
    return parts[filepath.length - 1];
}

function addUnique (collection, toAdd) {
    if (!Array.isArray(toAdd)) toAdd = [ toAdd ];
    var uniqueItems = toAdd.filter(item => collection.indexOf(item) === -1);

    collection.push(...uniqueItems);

    return collection;
}

module.exports = {
    isAbsolute,
    moduleNameFromPath,
    addUnique
}