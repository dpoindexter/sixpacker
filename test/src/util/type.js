import { forEach } from './collection';
import { toPascalCase, test as testing, foo } from './string';

function toType (obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

var identity = (function () {
    var fns = {};

    var types = [
        'array',
        'string',
        'number',
        'object'
    ];

    forEach(types, function (type) {
        fns['is' + toPascalCase(type)] = function (val) {
            toType(val) === type;
        };
    });

    return fns;
})();

identity.toType = toType;

export default identity;

