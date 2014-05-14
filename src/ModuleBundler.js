var fs = require('fs'),
    path = require('path'),
    Promise = require('bluebird'),
    FileToProcess = require('./FileToProcess');

var baseDir = process.cwd();

var defaultGlobalsCompilerMethods = {
    buildPrefix: GlobalsCompiler.prototype.buildPrefix,
    buildSuffix: GlobalsCompiler.prototype.buildSuffix
};

class ModuleBundler {

    constructor (file) {
        this.entryFile = path.resolve(baseDir, file);
        this.dependencies = [];
        this.internalModules = [];
        this._transpilationStack = [];
        this._processingQueueCount = 0;
        this._processedFiles = [];
    }

    getDependencies () {
        this._buildDependencyGraph(this.entryFile);
    }

    isExternalDependency (dependency) {
        return dependency.type === 'ModuleDeclaration' || 
            isAbsolute(dependency.source.value);
    }

    _buildDependencyGraph (reference) {
        if (this._processedFiles.some(file => file.reference === reference)) return;

        var fileToProcess = new FileToProcess(reference);

        fs.readFile(reference, 'utf8', fileToProcess.readFile);

        this._processedFiles.push(fileToProcess);
    }

    _processFile (reference, err, fileContents) {
        if (err) throw err;

        var pathsRelativeTo = path.dirname(reference);

        var parsed = new InternalCompiler(fileContents, moduleNameFromPath(reference));
        parsed.parse();

        var dependencies = parsed.imports
            .filter(dep => this.isExternalDependency(dep))
            .map(dep => dep.source.value);

        var internalModules = parsed.imports
            .filter(dep => !this.isExternalDependency)
            .map(dep => path.resolve(pathsRelativeTo, dep.source.value + '.js'));

        addUnique(this.dependencies, dependencies);
        addUnique(this.internalModules, [ reference ]);

        this._transpilationStack.push(parsed);

        internalModules.forEach(module => this._buildDependencyGraph(module));

        return this._finishedProcessingFile();
    }

    _finishedProcessingFile () {
        if (--this._processingQueueCount) return;

        var output = { 
            dependencies: this.dependencies, 
            internalModules: this.internalModules 
        };

        console.log(JSON.stringify(output, null, 2));
        
        process.exit(1);
    }

}

function transpile (fileData, moduleName, globalName, imports) {

    var compiler = new InternalCompiler(fileData, moduleName, {
        imports,
        global: globalName,
        into: moduleName
    });

    return compiler.toGlobals();
}

module.exports = ModuleBundler;