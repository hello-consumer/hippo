var domain, angular;

domain = '//localhost:8080';

angular.module("hippo", ["ui.bootstrap"]);

angular.module("hippo").controller("ItemController", ["$scope", "$http", function ($scope, $http) {
    "use strict";
    $scope.basket = [];
    $scope.novelty = 0.0;
    $scope.harmony = 0.0;
    $scope.addIngredient = function () {
        $scope.basket.push($scope.newingredient);
        if ($scope.noResults) {
            $http.put(domain + '/suggestion/', {
                ingredient: $scope.newingredient
            });
        }
        $scope.newingredient = undefined;
    };
    $scope.remove = function (item) {
        $scope.basket.splice($scope.basket.indexOf(item), 1);
        $scope.harmonize();
    };

    $scope.harmonize = function () {
        $http.post(domain + "/harmonize/", $scope.basket).then(function (response) {
            $scope.harmony = response.data.harmony;
            $scope.novelty = response.data.novelty;
        });
    };

    $scope.getSuggestion = function (val) {
        return $http.get(domain + '/suggestions', {
            params: {
                fragment: val
            }
        }).then(function (response) {
            return response.data;
        });
    };
}]);
