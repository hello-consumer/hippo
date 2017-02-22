(function () {
    "use strict";
    var pg, pool, config;

    pg = require('pg');


    config = {
        user: '',
        database: '',
        password: '',
        host: '',
        port: 5432,
        max: 10,
        idleTimeoutMillis: 30000
    };


    pool = new pg.Pool(config);

    pool.connect(function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }

        client.query('SELECT $1::int AS number', ['1'], function (err, result) {
            done();
            if (err) {
                return console.error('error running query', err);
            }
            console.log("Database connected successfully");
        });

        client.query('CREATE TABLE IF NOT EXISTS Ingredient (id integer)', function (err, result) {
            done();
            if (err) {
                return console.error('error running query', err);
            }
            console.log("Ingredient table created");
        });



    });

    pool.on('error', function (err, client) {
        console.error('idle client error', err.message, err.stack);
    });
}());
