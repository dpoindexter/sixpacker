(function(__exports__, __dependency1__, __dependency2__) {
  "use strict";
  var forEach = __dependency1__.forEach;

  var toPascalCase = __dependency2__.toPascalCase;
  var testing = __dependency2__.test;
  var foo = __dependency2__.foo;

  
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
  
  __exports__.toPascalCase = __dependency2__.toPascalCase;
  __exports__.test = __dependency2__.test;
  __exports__.foo = __dependency2__.foo;
})(window, window../collection, window../string);