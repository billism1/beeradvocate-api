var request = require('request'),
    cheerio = require('cheerio');

exports.beerSearch = function(query, callback) {

    var url = "http://beeradvocate.com/search/?q=" + encodeURIComponent(query) + "&qt=beer";

    request(url, function (error, response, html) {

        if (!error && response.statusCode == 200) {

            var $ = cheerio.load(html);

            var beers = [];

            $('#ba-content ul li').each(function(beer) {

                // One beer listing
                var li = $(this);

                // Beer details
                var beer = li.children('a').eq(0),
                    beer_name = beer.text(),
                    beer_url = beer.attr('href');

                // Brewery details
                var brewery = li.children('a').eq(1),
                    brewery_name = brewery.text(),
                    brewery_url = brewery.attr('href'),
                    brewery_location = brewery.next().text();

                // Retired?
                var retired = false;
                if (beer.prev().text() === "Retired - ") {
                    var retired = true;
                }

                // Data to return
                var data = {
                    beer_name: beer_name,
                    beer_url: beer_url,
                    brewery_name: brewery_name,
                    brewery_location: brewery_location.slice(2),
                    brewery_url: brewery_url,
                    retired: retired
                };

                // Add to beer array
                beers.push(data);

            });

            callback(JSON.stringify(beers));

        }

    });

}

exports.beerPage = function(url, callback) {

    var url = "http://beeradvocate.com" + url;

    request(url, function (error, response, html) {

        if (!error && response.statusCode == 200) {

            var $ = cheerio.load(html);

            var beer = [];

            // Beer & brewery name
            var title = $('h1').text().split(" | "),
                beer_name = title[0],
                brewery_name = title[1];

            // ABV
            var beer_abv_chunk = $('#ba-content > div:nth-child(4) > div:nth-child(2)').text(),
                beer_abv_start = $('#ba-content > div:nth-child(4) > div:nth-child(2)').text().indexOf("(ABV)"),
                beer_abv_end = $('#ba-content > div:nth-child(4) > div:nth-child(2)').text().indexOf("%"),
                beer_abv = beer_abv_chunk.substring(beer_abv_start+"(ABV): ".length, beer_abv_end+1);

            // Brewery details
            var brewery_state = $('#ba-content > div:nth-child(4) > div:nth-child(2) > a:nth-child(9)').text(),
                brewery_country = $('#ba-content > div:nth-child(4) > div:nth-child(2) > a:nth-child(10)').text();
                // beer_style = links.eq(4).text();

            var beerStyleSelection = $('#ba-content > div:nth-child(4) > div:nth-child(2) > a:nth-child(16) > b');
            var beer_style = beerStyleSelection.text();

            // Beer Advocate scores
            var ba_info = $('.BAscore_big').eq(0),
                ba_score = ba_info.text(),
                ba_rating = ba_info.next().next().text();

            var bros_info = $('.BAscore_big').eq(1),
                bros_score = bros_info.text(),
                bros_rating = bros_info.next().next().text();

            // More stats
            var stats = $('#ba-content > div:nth-child(4) > div:nth-child(3)').text(),
                ratings_index = stats.indexOf("Ratings:"),
                reviews_index = stats.indexOf("Reviews:"),
                avg_index = stats.indexOf("Avg:"),
                pdev_index = stats.indexOf("pDev:"),
                wants_index = stats.indexOf("Wants:"),
                ratings = stats.substring(ratings_index+"Ratings:".length, reviews_index).trim().replace(/\s/g, '').replace(":", ": "),
                reviews = stats.substring(reviews_index+"Reviews:".length, avg_index).trim().replace(/\s/g, '').replace(":", ": "),
                avg = stats.substring(avg_index+"Avg:".length, pdev_index).trim().replace(/\s/g, '').replace(":", ": "),
                pDev = stats.substring(pdev_index+"pDev:".length, wants_index).trim().replace(/\s/g, '').replace(":", ": ");


            // Data to return
            var data = {
                beer_name: beer_name,
                beer_style: beer_style,
                beer_abv: beer_abv,
                brewery_name: brewery_name,
                brewery_state: brewery_state,
                brewery_country: brewery_country,
                ba_score: ba_score,
                ba_rating: ba_rating,
                bros_score: bros_score,
                bros_rating: bros_rating,
                ratings: ratings,
                reviews: reviews,
                avg: avg,
                pDev: pDev
            };

            // Add to beer array
            beer.push(data);

            callback(JSON.stringify(beer));

        }

    });

}
