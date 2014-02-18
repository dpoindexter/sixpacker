#!/usr/bin/env node

var path = require('path'),
    program = require('commander'),
    ModuleBundler = require('./ModuleBundler');

var baseDir = process.cwd();

program
    .option('-l --libdir <path>', 'Set the directory used to resolve absolute links (like node_modules)', path.resolve(baseDir, 'lib'))
    .option('--external-modules', 'Do not bundle files referenced with the `module` syntax', true);

program
    .command('*')
    .description('Recursively bundle module references into the given file')
    .action(function (filePath) {
        var moduleBundler = new ModuleBundler(filePath);
        moduleBundler.getDependencies();
    });

program.parse(process.argv);