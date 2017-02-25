/*jslint node: true */
(function () {
    "use strict";
    var restify, server, suggestions, item_matrix, config, HippoData, data;

    config = require('./config.js');  //This is excluded from source control to keep keys and passwords secure.

    restify = require('restify');
    HippoData = require('./data.js');

    data = new HippoData(config.postgres.user, config.postgres.database, config.postgres.host, config.postgres.password);

    server = restify.createServer();
    server.use(restify.bodyParser({ mapParams: true }));
    server.use(restify.queryParser());

    server.pre(restify.CORS());

    server.get(
        '/suggestions/',
        function (req, res, next) {
            data.findIngredient(req.params.fragment, function (result) {
                res.send(result);
            });
            next();
        }
    );

    server.put(
        '/suggestion/:ingredient',
        function (req, res, next) {
            data.createIngredient(req.params.ingredient, function (result) {
                res.send(201);
            });

            next();
        }
    );


    server.get(new RegExp('\/bootstrap\/?.*'), restify.serveStatic({
        directory: 'node_modules',
        'default': 'index.html'
    }));

    server.get(new RegExp('\/angular\/?.*'), restify.serveStatic({
        directory: 'node_modules',
        'default': 'index.html'
    }));

    server.get(new RegExp('\/jquery\/?.*'), restify.serveStatic({
        directory: 'node_modules',
        'default': 'index.html'
    }));

    server.get(new RegExp('\/angular-animate\/?.*'), restify.serveStatic({
        directory: 'node_modules',
        'default': 'index.html'
    }));

    server.get(new RegExp('\/angular-touch\/?.*'), restify.serveStatic({
        directory: 'node_modules',
        'default': 'index.html'
    }));

    server.get(new RegExp('\/angular-ui-bootstrap\/?.*'), restify.serveStatic({
        directory: 'node_modules',
        'default': 'index.html'
    }));

    server.get(new RegExp('\/?.*'), restify.serveStatic({
        directory: 'public',
        'default': 'index.html'
    }));



    item_matrix = [
        [0, 0, 0, 0, 0],
        [1, 4, 5, 6, 2],
        [2, 4, 4, 5, 6],
        [5, 3, 2, 4, 4],
        [4, 2, 5, 2, 5]
    ];

    function get_score(items) {
        var id_arr, i, k, id, sd_tmp, avg, sd;
        if (items.length < 2) {
            return {
                scored_items: [],
                avg: 0,
                sd: 0
            };
        }

        sd_tmp = [];
        for (i = 0; i < items.length; i += 1) {
            for (k = i + 1; k < items.length; k += 1) {
                sd_tmp.push(item_matrix[i][k]);
            }
        }

        avg = 0;
        sd = 0;
        for (i = 0; i < sd_tmp.length; i += 1) {
            avg += sd_tmp[i];
            for (k = i + 1; k < sd_tmp.length; k += 1) {
                sd += Math.abs(sd_tmp[i] - sd_tmp[k]);
            }
        }
        return {
            scored_items: items,
            avg: avg / items.length,
            sd: sd / items.length
        };
    }

    // Utility
    function float_round(num, float_cnt) {
        var tmp;
        if (float_cnt < 1) {
            return Math.floor(num);
        }
        tmp = num * Math.pow(10, float_cnt);
        tmp = Math.floor(tmp);
        return tmp / Math.pow(10, float_cnt);
    }


    server.post(
        '/harmonize/:basket',
        function (req, res, next) {
            var score, harmony, novelty;
            score = get_score(req.body);
            harmony = score.avg === 0 ? 0 : 100 - score.avg;
            novelty = score.sd === 0 ? 0 : score.sd * 100;
            harmony = float_round(harmony, 0);
            novelty = float_round(novelty, 0);
            res.send({ novelty: novelty, harmony: harmony});
            next();
        }
    );

    server.listen(8080, function () {
        console.log('%s listening at %s', server.name, server.url);
    });
}());
