var util = require('./util'),
    Promise = require('bluebird'),
    InternalCompiler = require('./InternalGlobalsCompiler');

class FileToProcess {

    constructor (reference) {
        this.reference = reference;
        this.resolver = Promise.defer();
    }

    readFile (err, contents) {
        if (err) {
            this.resolver.reject(err);
            return;
        }

        this.fileContents = contents;
        this.process();
    }

    process () {
        var ref = this.reference,
            file = this.fileContents,
            pathsRelativeTo = path.dirname(ref);

        this.compiler = new InternalCompiler(file, util.moduleNameFromPath(ref));
        this.compiler.parse();

        this.dependencies = this.compiler.imports
            .filter(dep => this.isExternalDependency(dep))
            .map(dep => dep.source.value);

        this.internalModules = parsed.imports
            .filter(dep => !this.isExternalDependency(dep))
            .map(dep => path.resolve(pathsRelativeTo, dep.source.value + '.js')); 

        this.completeProcessing();
        return this.internalModules;
    }

    isExternalDependency (dependency) {
        return dependency.type === 'ModuleDeclaration' || 
            util.isAbsolute(dependency.source.value);
    }

    completeProcessing () {
        this.resolver.resolve(this);
    }

    getPromise () {
        return this.resolver.promise;
    }

}

module.exports = FileToProcess;