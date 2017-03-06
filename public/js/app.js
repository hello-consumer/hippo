var angular;
angular.module("app", ["ui.bootstrap", "ngRoute", "hippocampus", "recipe", "ingredients", "login"]);
angular.module("app").config(function ($routeProvider, $locationProvider) {
    "use strict";
    $locationProvider.hashPrefix('!');
    $routeProvider.when("/", {
        templateUrl: "/templates/home.html"
    }).when('/item', {
        templateUrl: "/templates/hippocampus.html",
        controller: "HippoController"
    }).when("/recipes", {
        templateUrl: "/templates/recipes.html",
        controller: "RecipeController"
    }).when("/ingredients", {
        templateUrl: "/templates/ingredients.html",
        controller: "IngredientsController"
    }).when("/login", {
        templateUrl: "/templates/login.html",
        controller: "LoginController"
    }).otherwise({
        template: "<h1>404</h1><p>Not Found</p>"
    });
    // configure html5 to get links working on jsfiddle
    $locationProvider.html5Mode(false);
});