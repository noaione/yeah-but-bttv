function isNone(value) {
    return value === undefined || value === null;
}

function traverse(dataset, paths) {
    const allPaths = paths.split(".")
    for (let i = 0; i < allPaths.length; i++) {
        if (isNone(dataset)) {
            return null;
        }
        const p = allPaths[i];
        if (!isNaN(parseInt(p))) {
            dataset = dataset[parseInt(p)]
        } else {
            dataset = dataset[p]
        }
    }
    return dataset;
}

exports.isNone = isNone;
exports.traverse = traverse;