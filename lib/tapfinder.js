var _ = require('underscore');
var cheerio = require('cheerio');
var superagent = require('superagent');
var Promise = require('promise');

function Tapfinder(baseUrl) {
  this.baseUrl = baseUrl;
}

Tapfinder.prototype.search = function (term) {
  var searchData = {
    class: 'Search',
    process: 'searchAll',
    searchTerm: term
  };

  return post(this.baseUrl + '/wp-content/plugins/phillytapfinder/', searchData).then(
    function(response) {
      return JSON.parse(response);
    }
  );
}

Tapfinder.prototype.loadBeer = function (beer) {
  return get(this.baseUrl + beer.link).then(
    function(response) {
      var $ = cheerio.load(response);
      return beerAsJson($);
    }
  );
}

module.exports = new Tapfinder('http://www.phillytapfinder.com');

function get(url) {
  return new Promise(
    function(resolve, reject) {
      superagent.get(url).end(
        function(error, response) {
          if (error) {
            reject(error);
          }
          else {
            resolve(response.text);
          }
        }
      );
    }
  );
}

function post(url, data) {
  return new Promise(
    function(resolve, reject) {
      superagent.post(url).type('form').send(data).end(
        function(error, response) {
          if (error) {
            reject(error);
          }
          else {
            resolve(response.text);
          }
        }
      );
    }
  );
}

function beerAsJson($) {
  return {
    name: $('#tap-detail .tap-list .tap-list-name').text(),
    origin: $('#tap-detail .tap-list .origin > strong').text(),
    style: $('#tap-detail .tap-list .origin strong:first-child').text(),
    bars: _.map(
      $('#tap-detail .tap-list .grid-list > li').not('.events-panel'),
      formatBarFromBeer.bind(undefined, $)
    ),
    events: _.map(
      $('#tap-detail .tap-list .grid-list .events-panel'),
      formatEventFromBeer.bind(undefined, $)
    ),
  };
}

function formatBarFromBeer($, bar) {
  var $bar = $(bar);
  return {
    name: $bar.find('h4 a[href^="/bar"]').text(),
    address: $bar.find('li:nth-child(2) p').text(),
    updated_at: $bar.find('.updated').text().replace(/Last Updated:\s+/,'')
  };
}

function formatEventFromBeer($, event) {
  var $event = $(event);
  return {
    name: $event.find('h4 a[href^="/event"]').text(),
    bar: $event.find('h4 a[href^="/bar"]').text(),
    date: $event.find('li:nth-child(3) p').text(),
    address: $event.find('li:nth-child(4) p').text()
  };
}