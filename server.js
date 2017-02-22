(function () {
    "use strict";
    var restify, server, suggestions, item_matrix;
    restify = require('restify');

    require('./data.js');

    suggestions = ["corn", "chocolate", "andy", "aramame", "beans"];

    server = restify.createServer();
    server.use(restify.bodyParser({ mapParams: true }));
    server.use(restify.queryParser());

    server.pre(restify.CORS());

    server.get(
        '/suggestions/',
        function (req, res, next) {
            var filtered = suggestions.filter(function (value) {
                return value.indexOf(req.params.fragment) !== -1;
            });
            res.send(filtered);
            next();
        }
    );

    server.put(
        '/suggestion/:ingredient',
        function (req, res, next) {
            if (!suggestions.includes(req.params.ingredient)) {
                suggestions.push(req.params.ingredient);
            }
            res.send(201);
            next();
        }
    );


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
