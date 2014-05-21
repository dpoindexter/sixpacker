var fs = require('fs'),
    path = require('path'),
    FileToProcess = require('./FileToProcess');

var baseDir = process.cwd();

class ModuleBundler {

    constructor (file) {
        this.entryFile = path.resolve(baseDir, file);
        this.dependencies = [];
        this.internalModules = [];
    }

    getDependencies () {
        var walk = this.walkDependencyGraph(this.entryFile),
            files;

        while (!(flattenedGraph = walk.next()).done) {};

        for (var file of files) {
            console.log({
                reference: file.reference,
                internalModules: file.internalModules,
                dependencies: file.dependencies
            });
        }
        
        process.exit(1);
    }

    walkDependencyGraph *(reference, processedFiles) {
        if (!processedFiles) processedFiles = [];

        if (processedFiles.some(file => file.reference === reference)) return processedFiles;

        var fileToProcess = new FileToProcess(reference);

        var internalModules = fileToProcess.process(...yield readFile(reference, 'utf8'));
        //fs.readFile(reference, 'utf8', fileToProcess.readFile);

        processedFiles.push(fileToProcess);

        if (!internalModules.length) return processedFiles;

        for (var ref of internalModules) {
            yield* this.walkDependencyGraph(ref, processedFiles);
        }

        return processedFiles;
    }

}

module.exports = ModuleBundler;