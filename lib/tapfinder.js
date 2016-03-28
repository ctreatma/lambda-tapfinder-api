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

Tapfinder.prototype.loadBar = function (bar) {
  return get(this.baseUrl + bar.link).then(
    function(response) {
      var $ = cheerio.load(response);
      return barAsJson($);
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

function barAsJson($) {
  return {
    name: $('#bar-detail .tap-list .tap-list-name').text(),
    updated_at: $('#bar-detail .tap-list .bar-data .red').text().replace(/Updated:\s+/,''),
    beers: _.map(
      $('#bar-detail .tap-list .grid-list .panel'),
      formatBeerFromBar.bind(undefined, $)
    )
  };
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

function formatBeerFromBar($, beer) {
  var $beer = $(beer);
  return {
    style: $beer.find('.beer-meta h5:first-child').text().replace(/Style:\s+/,''),
    origin: $beer.find('.beer-meta h5:nth-child(2)').text().replace(/Origin:\s+/,''),
    name: $beer.find('h4 a[href^="/beer"]').text()
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