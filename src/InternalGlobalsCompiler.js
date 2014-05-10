var GlobalsCompiler = require('es6-module-transpiler').GlobalsCompiler;

class InternalGlobalsCompiler extends GlobalsCompiler {

    buildSuffix () {
        var dependencyNames = this.dependencyNames;

        var out = '(';

        if (this.exports.length > 0) {
            if (this.options.into) {
                out += (this.options.global + '.' + this.options.into);
            } else {
                out += this.options.global;
            }
            
            if (this.dependencyNames.length > 0) {
                out += ', ';
            }
        }

        for (var idx = 0; idx < dependencyNames.length; idx++) {

            var name = this.options.imports[name] || dependencyNames[idx],
                nameParts = name.split('/');

            out += (this.options.global + '.' + nameParts[nameParts.length - 1]);
            if (!(idx === dependencyNames.length - 1)) out += ', ';
        }

        out += ')';
        return out;
    }

}

module.exports = { InternalGlobalsCompiler };