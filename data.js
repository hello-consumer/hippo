/*jslint node: true */
(function () {
    "use strict";
    var Sequelize, database, User, Ingredient;

    function HippoData(username, database, host, password) {
        Sequelize = require('sequelize');
        database = new Sequelize(database, username, password, {
            host: host,
            dialect: 'postgres',
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            }
        });
        User = database.define('user', {
            username: Sequelize.STRING,
            birthday: Sequelize.DATE
        });
        Ingredient = database.define('ingredient', {
            name: Sequelize.STRING,
            approved: Sequelize.BOOLEAN
        });

        database.sync();
    }

    //shared object for requests
    HippoData.prototype.createUser = function (username, birthday, next) {
        var result;
        if (!(birthday instanceof Date)) {
            birthday = Date.parse(birthday);
        }
        User.create({
            username: username,
            birthday: birthday
        }).success(function (result) {
            result.createdUser = result;
        }).done(function () {
            if (next) {
                next(result);
            }
        });
    };

    HippoData.prototype.createIngredient = function (name, next) {

        Ingredient.findOrCreate({
            where: {
                name: name.trim()
            },
            defaults: { // set the default properties if it doesn't exist
                name: name.trim()
            }
        }).then(function (r) {
            next(r);
        });

    };

    HippoData.prototype.findIngredient = function (name, next) {
        Ingredient.findAll({
            where: {
                name: {
                    $like: "%" + name + "%"
                },
                approved: true
            }
        }).then(function (r) {
            next(r.map(function (e) {
                return e.name;
            }));
        });
    };



    module.exports = HippoData;
}());
