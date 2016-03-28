var _ = require('underscore');
var async = require('async');
var Promise = require('promise');
var tapfinder = require('./lib/tapfinder');

exports.handler = function (event, context) {
  console.log(event);
  getTapfinderSearchResults(event, context).then(
    function(results) {
      context.succeed(results);
    }
  ).catch(
    function(error) {
      console.error(error);
      context.fail();
    }
  );
};

function getTapfinderSearchResults(event, context) {
  return tapfinder.search(event.term).then(
    function(matches) {
      var resultsPromises = [];

      event.types.forEach(
        function(type) {
          resultsPromises.push(loadResults(type, matches));
        }
      );

      return Promise.all(resultsPromises).then(
        function (resultsPerType) {
          return resultsPerType.reduce(
            function(object, value) {
              object[value[0]] = value[1];
              return object;
            }, {}
          );
        }
      );
    }
  );
}

function loadResults(type, matches) {
  var matchesForType = matches[type];
  var matchLoader = tapfinderLoaderForType(type);
  var tasks = _.map(matchesForType, matchLoader);
  return(Promise.all(tasks)).then(
    function (results) {
      return [type, results];
    }
  );
}

function tapfinderLoaderForType(type) {
  switch(type) {
    case "beers":
      return tapfinder.loadBeer.bind(tapfinder);
    case "bars":
      return tapfinder.loadBar.bind(tapfinder);
    default:
      throw "Could not determine loader for type " + type;
  }
}
