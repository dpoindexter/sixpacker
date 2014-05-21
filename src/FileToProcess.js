var util = require('./util'),
    InternalCompiler = require('./InternalGlobalsCompiler');

class FileToProcess {

    constructor (reference) {
        this.reference = reference;
        this.compiler = undefined;
        this.dependencies = [];
        this.internalModules = [];
    }

    process (err, file) {
        if (err) throw err;

        var ref = this.reference,
            pathsRelativeTo = path.dirname(ref);

        this.compiler = new InternalCompiler(file, util.moduleNameFromPath(ref));
        this.compiler.parse();

        this.dependencies = this.compiler.imports
            .filter(dep => this.isExternalDependency(dep))
            .map(dep => dep.source.value);

        this.internalModules = parsed.imports
            .filter(dep => !this.isExternalDependency(dep))
            .map(dep => path.resolve(pathsRelativeTo, dep.source.value + '.js')); 

        return this.internalModules;
    }

    isExternalDependency (dependency) {
        return dependency.type === 'ModuleDeclaration' || 
            util.isAbsolute(dependency.source.value);
    }

}

module.exports = FileToProcess;