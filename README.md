sixpacker
=========

Bundle browser code written with ES6 module syntax

This code doesn't do any bundling yet. I'm still figuring out node file paths. Right now, it just builds up a JSON dependency graph from a single entry file, unless you use a path that I haven't properly accounted for yet, which is most of them.

It turns out that the ES6 spec defines the semantics of a loader which recursively loads and links dependencies. So this project will a) implement a file system-based loader, and b) set up the proper configuration of the provided hooks to produce bundled output.

It's possible that the [es6-module-loader polyfill project](https://github.com/ModuleLoader/es6-module-loader) will support a). If not, I might need to look at producing my own implementation.

It should operated a lot like Browserify, except using ES6 module syntax instead of require(). Roadmap is something along these lines:

- Parse import and module references in a file ([Esprima Harmony branch](https://github.com/ariya/esprima/tree/harmony))\
- Call module loader impl with references and parse returned module objects
- Copy contents from all import-referenced files into a single file, rewriting import and module statements to exclude duplicates and place them at the top of the new file ([escodegen](https://github.com/Constellation/escodegen))
- By default, treat module references as external to the bundled file. Think about ways to provide conventions or overrides for this behavior
- Parse bundled file into ES5 using window/globals, passing in external references to the IIFE ([es6-module-transpiler](https://github.com/square/es6-module-transpiler))
- Generate a manifest.json that includes a list of bundled files and a list of external references, that other tools can use to insert script tags in reference order (inspired by [Cassette](https://github.com/andrewdavey/cassette) here)
