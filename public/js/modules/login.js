var domain, angular;

angular.module("login", []);

angular.module("login").controller("LoginController", ["$scope", "$http", function ($scope, $http) {
    "use strict";
    
    $scope.login = function(){
        $http.post("/user/login", { email: $scope.loginEmail, password: $scope.loginPassword }).then(function(result){
            console.log("logged in!");
        }, function(result){
            console.log("Error");
        })
    };
    
    $scope.register = function(){
        $http.post("/user/register", { email: $scope.registrationEmail, password: $scope.registrationPassword }).then(function(result){
            console.log("logged in!");
        }, function(result){
            console.log("Error");
        })
    }
    
}]);
