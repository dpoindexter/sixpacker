var fs = require('fs'),
    path = require('path'),
    Compiler = require('es6-module-transpiler').Compiler,
    GlobalsCompiler = require('es6-module-transpiler').GlobalsCompiler,
    globalsCompilerOverrides = require('./globalsCompilerOverrides');

var baseDir = process.cwd();

var defaultGlobalsCompilerMethods = {
    buildPrefix: GlobalsCompiler.prototype.buildPrefix,
    buildSuffix: GlobalsCompiler.prototype.buildSuffix
};

function ModuleBundler (file) {
    this.entryFile = path.resolve(baseDir, file);
    this.dependencies = [];
    this.internalModules = [];
    this._transpilationStack = [];
    this._processingQueueCount = 0;
}

ModuleBundler.prototype.getDependencies = function () {
    this._buildDependencyGraph(this.entryFile);
};

ModuleBundler.prototype.isExternalDependency = function (dependency) {
    return dependency.type === 'ModuleDeclaration' || 
        isAbsolute(dependency.source.value);
};

ModuleBundler.prototype._buildDependencyGraph = function (reference) {
    this._processingQueueCount++;

    if (this.internalModules.indexOf(reference) > -1) {
        this._finishedProcessingFile();
        return;
    }

    fs.readFile(reference, 'utf8', this._processFile.bind(this, reference));
};

ModuleBundler.prototype._processFile = function (reference, err, fileContents) {
    if (err) throw err;

    var pathsRelativeTo = path.dirname(reference),
        isExternalDependency = this.isExternalDependency.bind(this);

    var parsed = new Compiler(fileContents, moduleNameFromPath(reference));
    parsed.parse();

    var dependencies = parsed.imports
        .filter(isExternalDependency)
        .map(function (dep) { return dep.source.value; });

    var internalModules = parsed.imports
        .filter(function (dep) {
            return !isExternalDependency(dep);
        })
        .map(function (dep) {
            return path.resolve(pathsRelativeTo, dep.source.value + '.js');
        });

    addUnique(this.dependencies, dependencies);
    addUnique(this.internalModules, [ reference ]);

    this._transpilationStack.push(parsed);

    internalModules.forEach(this._buildDependencyGraph.bind(this));

    return this._finishedProcessingFile();
};

ModuleBundler.prototype._finishedProcessingFile = function () {
    if (--this._processingQueueCount) return;

    console.log(JSON.stringify({ 
        dependencies: this.dependencies, 
        internalModules: this.internalModules }, null, 2));
    
    process.exit(1);
};

function isAbsolute (filepath) {
    return !!filepath && filepath[0] !== '.';
}

function moduleNameFromPath (filepath) {
    var parts = filepath.split('/');
    return parts[filepath.length - 1];
}

function transpile (fileData, moduleName, globalName, imports) {
    GlobalsCompiler.prototype.buildSuffix = globalsCompilerOverrides.buildSuffix;

    var compiler = new Compiler(fileData, moduleName, {
        imports: imports,
        global: globalName,
        into: moduleName
    });

    return compiler.toGlobals();
}

function addUnique (collection, toAdd) {
    var uniqueItems = toAdd.filter(function (item) {
        return collection.indexOf(item) === -1;
    });

    Array.prototype.push.apply(collection, uniqueItems);

    return collection;
}

module.exports = ModuleBundler;