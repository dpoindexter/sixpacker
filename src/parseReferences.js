#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    parser = require('esprima'),
    program = require('commander');

var files = {},
    processingQueue = 0,
    baseDir = process.cwd(),
    externalFile = { content: '', references: [] };

var referenceNodes = {
    ImportDeclaration: 'bundle',
    ModuleDeclaration : 'external'
};

program
    .option('-l --libdir <path>', 'Set the directory used to resolve absolute links (like node_modules)', path.resolve(baseDir, 'lib'))
    .option('--external-modules', 'Do not bundle files referenced with the `module` syntax', true);

program
    .command('*')
    .description('Recursively bundle module references into the given file')
    .action(function (file) {
        buildDependencyGraph({ path: path.resolve(baseDir, file) });
    });

program.parse(process.argv);

function buildDependencyGraph (reference) {
    processingQueue++;

    if (files.hasOwnProperty(reference.path)) return hasFinishedProcessing();

    if (referenceNodes[reference.type] === 'external') {
        files[reference.path] = externalFile;
        return hasFinishedProcessing();
    }

    fs.readFile(reference.path, 'utf8', function (err, data) {
        if (err) throw err;

        var references = parseForReferences(data, path.dirname(reference.path));

        files[reference.path] = {
            content: data,
            references: references.map(function (r) {
                return r.path;
            })
        };

        references.forEach(function (ref) {
            buildDependencyGraph(ref);
        });

        return hasFinishedProcessing();
    });
}

function parseForReferences (file, relativeTo) {
    var ast = parser.parse(file);

    return ast.body
        .filter(function(item) {
            return referenceNodes.hasOwnProperty(item.type);
        })
        .map(function(item) {
            return {
                path: resolveReferencePath(item.source.value + '.js', relativeTo),
                type: item.type
            };
        });
}

function hasFinishedProcessing () {
    if (--processingQueue) return;
    var output = {};
    for (var file in files) {
        output[file] = {
            references: files[file].references
        };
    }

    console.log(JSON.stringify(output, null, 2));
    process.exit(1);
}

function resolveReferencePath (filepath, relativeTo) {
    if (isAbsolute(filepath)) relativeTo = path.resolve(baseDir, program.libdir);
    return path.resolve(relativeTo, filepath);
}

function isAbsolute (filepath) {
    if (!filepath) return false;
    if (filepath[0] != '.') return true;
}