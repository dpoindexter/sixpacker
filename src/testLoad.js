#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    parser = require('esprima'),
    program = require('commander'),
    System = require('es6-module-loader').System;

var baseDir = process.cwd();

program
    .command('*')
    .description('Test ES6 Module Loader')
    .action(function (file) {

        var resolvedPath = path.resolve(baseDir, file);
        console.log(resolvedPath);

        System.import(path.resolve(baseDir, file))
            .then(function (module) {
                console.log(module);
            }, function (err) {
                console.log(err);
            });
    });

program.parse(process.argv);