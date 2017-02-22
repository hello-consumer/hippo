angular.module("hippo", ["ui.bootstrap"]);

angular.module("hippo").controller("ItemController", ["$scope", function($scope){
    $scope.basket = []
    $scope.novelty = 0.0;
    $scope.harmony = 0.0;
    $scope.addIngredient = function(){
        var newItem = {
            id: $scope.suggestions.indexOf($scope.newingredient),
            name: $scope.newingredient,
            hoge: 0
        }
        $scope.basket.push(newItem);
        if(!$scope.suggestions.includes($scope.newingredient)){
            $scope.suggestions.push($scope.newingredient);
            //TODO: Persist this to long-term storage
        }
        $scope.newingredient = undefined;


    }
    $scope.remove = function(item){
        $scope.basket.splice($scope.basket.indexOf(item), 1);
        $scope.harmonize();
    }

    $scope.harmonize = function(){
        var result = $scope.ItemData.reload_score($scope.basket);
        $scope.harmony = result.harmony;
        $scope.novelty = result.novelty;
    }

    $scope.ItemData = new ItemData();

  $scope.suggestions = ["corn", "chocolate", "andy", "aramame", "beans"];

}])

// Mock Data
// TODO: Move this to use a long term store
function ItemData() {
    "use strict";
}

ItemData.prototype.item_matrix = [
    [0, 0, 0, 0, 0],
    [1, 4, 5, 6, 2],
    [2, 4, 4, 5, 6],
    [5, 3, 2, 4, 4],
    [4, 2, 5, 2, 5]
];
ItemData.prototype.get_score = function (items) {
    "use strict";
    var id_arr, i, k, id, sd_tmp, avg, sd;
    if (items.length < 2) {
        return {
            scored_items: [],
            avg: 0,
            sd: 0
        };
    }

    
    id_arr = [];
    items.forEach(function(item){ id_arr.push(item.id) })
    sd_tmp = [];
    for (i = 0; i < id_arr.length; i += 1) {
        for (k = i + 1; k < id_arr.length; k += 1) {
            sd_tmp.push(this.item_matrix[i][k]);
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
};

ItemData.prototype.reload_score = function(items) {
        var score, harmony, novelty;
        score = this.get_score(items);
        harmony = score.avg === 0 ? 0 : 100 - score.avg;
        novelty = score.sd === 0 ? 0 : score.sd * 100;
        harmony = float_round(harmony, 0);
        novelty = float_round(novelty, 0);
        return { novelty: novelty, harmony: harmony}
    }

// Utility
function float_round(num, float_cnt) {
    "use strict";
    var tmp;
    if (float_cnt < 1) {
        return Math.floor(num);
    }
    tmp = num * Math.pow(10, float_cnt);
    tmp = Math.floor(tmp);
    return tmp / Math.pow(10, float_cnt);
}
