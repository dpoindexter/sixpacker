var fs = require('fs'),
    path = require('path'),
    parser = require('esprima'),
    Compiler = require('es6-module-transpiler').Compiler,
    GlobalsCompiler = require('es6-module-transpiler').GlobalsCompiler,
    globalsCompilerOverrides = require('./globalsCompilerOverrides');

var baseDir = process.cwd(),
    externalFile = { content: '', references: [] };

var referenceNodes = {
    ImportDeclaration: 'bundle',
    ModuleDeclaration : 'external'
};

function ModuleBundler (file, opts) {
    this.files = {};
    this.processingQueueCount = 0;
    this.entryReference = { path: path.resolve(baseDir, file) };
}

ModuleBundler.prototype.getDependencies = function () {
    this.buildDependencyGraph(this.entryReference);
};

ModuleBundler.prototype.buildDependencyGraph = function (reference) {
    this.processingQueueCount++;

    if (this.files.hasOwnProperty(reference.path)) {
        return this.hasFinishedProcessing();
    }

    if (referenceNodes[reference.type] === 'external') {
        this.files[reference.path] = externalFile;
        return this.hasFinishedProcessing();
    }

    fs.readFile(reference.path, 'utf8', this.processFileContents.bind(this));
};

ModuleBundler.prototype.processFileContents = function (err, data) {
    if (err) throw err;

    var parsed = this.parseForReferences(data, path.dirname(reference.path));

    this.files[reference.path] = {
        ast: parsed.ast,
        references: parsed.references.map(function (r) {
            return r.path;
        })
    };

    parsed.references.forEach(function (ref) {
        this.buildDependencyGraph(ref);
    });

    return this.hasFinishedProcessing();
};

ModuleBundler.prototype.parseForReferences = function (file, relativeTo) {
    var ast = parser.parse(file);

    var references = ast.body
        .filter(function(item) {
            return referenceNodes.hasOwnProperty(item.type);
        })
        .map(function(item) {
            console.log(item.specifiers.length > 1 && item.specifiers);
            return {
                path: resolveReferencePath(item.source.value + '.js', relativeTo),
                type: item.type
            };
        });

    return { ast: ast, references: references };
};

ModuleBundler.prototype.hasFinishedProcessing = function () {
    if (--this.processingQueueCount) return;

    var output = {};

    for (var file in this.files) {
        output[file] = {
            references: this.files[file].references
        };
    }

    console.log(JSON.stringify(output, null, 2));
    process.exit(1);
};

function resolveReferencePath (filepath, relativeTo) {
    if (isAbsolute(filepath)) relativeTo = path.resolve(baseDir, program.libdir);
    return path.resolve(relativeTo, filepath);
}

function isAbsolute (filepath) {
    if (!filepath) return false;
    if (filepath[0] != '.') return true;
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

module.exports.ModuleBundler = ModuleBundler;