#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    parser = require('esprima'),
    optimist = require('optimist');

var files = {},
    processingQueue = 0,
    baseDir = process.cwd(),
    externalFile = { content: '', references: [] };

var referenceNodes = {
    ImportDeclaration: 'bundle',
    ModuleDeclaration : 'external'
};

var argv = optimist.argv;

if (!argv.entry) throw new Error('You must specify an entry point file');

buildDependencyGraph({ path: argv.entry });

function buildDependencyGraph (fileReference, dir) {
    processingQueue++;
    dir || (dir = baseDir);
    var filePath = path.resolve(dir + '\\' + fileReference.path);
    console.log('Path: ' + fileReference.path);
    console.log('File: ' + filePath);
    console.log('Type: ' + fileReference.type);

    if (files.hasOwnProperty(filePath)) return hasFinishedProcessing();

    if (referenceNodes[fileReference.type] === 'external') {
        files[filePath] = externalFile;
        return hasFinishedProcessing();
    }

    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) throw err;

        var references = parseForReferences(data);

        files[fileReference.path] = {
            content: data,
            references: references.map(function (r) {
                return r.path;
            })
        };

        references.forEach(function (ref) {
            buildDependencyGraph(ref, path.dirname(filePath));
        });

        return hasFinishedProcessing();
    });
}

function parseForReferences (file) {
    var ast = parser.parse(file);

    return ast.body
        .filter(function(item) {
            return referenceNodes.hasOwnProperty(item.type);
        })
        .map(function(item) {
            return {
                path: item.source.value + '.js',
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

