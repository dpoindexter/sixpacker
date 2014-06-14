var Promise = require('bluebird'),
    co = require('co'),
    path = require('path'),
    FileToProcess = require('./FileToProcess');

var baseDir = process.cwd();

class ModuleBundler {

    constructor (file) {
        this.entryFile = path.resolve(baseDir, file);
        this.dependencies = [];
        this.internalModules = [];
        this.walker;
    }

    getDependencies () {
        co(function *() {
            var files = yield this.walkDependencyGraph(this.entryFile);

            var output = files.map(file => {
                return {
                    reference: file.reference,
                    internalModules: file.internalModules,
                    dependencies: file.dependencies
                };
            });

            console.log(output);
            
            process.exit(0);
        });
    }

    *walkDependencyGraph (reference, processedFiles) {
        if (!processedFiles) processedFiles = [];

        if (processedFiles.some(file => file.reference === reference)) return processedFiles;

        var processedFile = yield new FileToProcess(reference).process();

        processedFiles.push(processedFile);

        if (!processedFile.internalModules.length) return processedFiles;

        for (var ref of processedFile.internalModules) {
            yield* this.walkDependencyGraph(ref, processedFiles);
        }

        return processedFiles;
    }

}

module.exports = ModuleBundler;