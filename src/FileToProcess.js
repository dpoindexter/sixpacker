var util = require('./util'),
    path = require('path'),
    fs = Promise.promisifyAll(require('fs')),
    InternalCompiler = require('./InternalGlobalsCompiler');

class FileToProcess {

    constructor (reference) {
        this.reference = reference;
        this.compiler = undefined;
        this.dependencies = [];
        this.internalModules = [];
    }

    process () {
        return fs.readFile(this.reference, 'utf8')
            .then(data => this.parse(data));
            //.catch(err => throw err);
    }

    parse (fileData) {
        var ref = this.reference,
            pathsRelativeTo = path.dirname(ref);

        this.compiler = new InternalCompiler(fileData, util.moduleNameFromPath(ref));
        this.compiler.parse();

        this.dependencies = this.compiler.imports
            .filter(dep => this.isExternalDependency(dep))
            .map(dep => dep.source.value);

        this.internalModules = parsed.imports
            .filter(dep => !this.isExternalDependency(dep))
            .map(dep => path.resolve(pathsRelativeTo, dep.source.value + '.js')); 

        return this;
    }

    isExternalDependency (dependency) {
        return dependency.type === 'ModuleDeclaration' || 
            util.isAbsolute(dependency.source.value);
    }

}

module.exports = FileToProcess;