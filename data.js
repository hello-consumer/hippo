/*jslint node: true */
(function () {
    "use strict";
    var Sequelize, database, User, Ingredient, Recipe, RecipeIngredient, Bcrypt;

    function HippoData(username, database, host, password) {
        Sequelize = require('sequelize');
        Bcrypt = require("bcrypt");
        
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
            password: Sequelize.STRING
        });
        Ingredient = database.define('ingredient', {
            name: Sequelize.STRING,
            approved: Sequelize.BOOLEAN
        });
        Recipe = database.define('recipe', {
            name: Sequelize.STRING,
            source: Sequelize.STRING,
            URL: Sequelize.STRING
        });
        RecipeIngredient = database.define('recipeIngredient', {});
        
        RecipeIngredient.belongsTo(Recipe);
        RecipeIngredient.belongsTo(Ingredient);
        
        

        database.sync();
    }

    //shared object for requests
    HippoData.prototype.createUser = function (username, password, next) {
        var result = {};
        
        User.findOne({ where: {username: username} }).then(function (user) {
            if (user) {
                result.error = "User already exists";
                next(result);
            } else {
                Bcrypt.hash(password, 10, function (err, hash) {
                    User.create({
                        username: username,
                        password: hash
                    }).then(function (result) {
                        result.createdUser = result;
                        next(result);
                    });
                });
            }
        })
        
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
    
    HippoData.prototype.createRecipe = function (recipe, next) {
        
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
