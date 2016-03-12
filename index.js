console.log('Loading function');
var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var superagent = require('superagent');

var tapfinderBaseUrl = 'http://www.phillytapfinder.com';

exports.handler = function searchTapfinder(event, context) {
  console.log("Searching for " + event.text);
  superagent.post(tapfinderBaseUrl + '/wp-content/plugins/phillytapfinder/')
    .type('form').send({ "class": 'Search', "process": 'searchAll', "searchTerm": event.text })
    .end(function(error, response) {
      var responseAsJson = JSON.parse(response.text);
      var tasks = _.map(responseAsJson.beers, loadBeer);
      async.parallel(tasks, function(err, results) {
        context.succeed({ beers: results });
      });
    });
}

function loadBeer(beer) {
  return function(callback) {
    superagent.get(tapfinderBaseUrl + beer.link).end(function(error, response) {
      var $ = cheerio.load(response.text),
          beerAsJson = {
            name: $('#tap-detail .tap-list .tap-list-name').text(),
            origin: $('#tap-detail .tap-list .origin > strong').text(),
            style: $('#tap-detail .tap-list .origin strong:first-child').text(),
            bars: _.map($('#tap-detail .tap-list .grid-list > li').not('.events-panel'), function(bar) {
              var $bar = $(bar);
              return {
                name: $bar.find('h4 a[href^="/bar"]').text(),
                address: $bar.find('li:nth-child(2) p').text(),
                updated_at: $bar.find('.updated').text().replace(/Last Updated:\s+/,'')
              };
            }),
            events: _.map($('#tap-detail .tap-list .grid-list .events-panel'), function(event) {
              var $event = $(event);
              return {
                name: $event.find('h4 a[href^="/event"]').text(),
                bar: $event.find('h4 a[href^="/bar"]').text(),
                date: $event.find('li:nth-child(3) p').text(),
                address: $event.find('li:nth-child(4) p').text()
              };
            }),
          };

          callback(null, beerAsJson);
    });
  }
}
