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
      return loadBeers(matches);
    }
  );
}

function loadBeers(matches) {
  var tasks = _.map(matches.beers, tapfinder.loadBeer.bind(tapfinder));
  return Promise.all(tasks).then(
    function (results) {
      return { beers: results };
    }
  );
}
