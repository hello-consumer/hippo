var state = {
    out: 0,
    added: 1,
    suggested: 2
};
// main data
function ItemData() {
    "use strict";
}

ItemData.prototype.item_list = ["corn", "chocolate", "andy", "aramame", "beans"];
ItemData.prototype.item_matrix = [
    [0, 0, 0, 0, 0],
    [1, 4, 5, 6, 2],
    [2, 4, 4, 5, 6],
    [5, 3, 2, 4, 4],
    [4, 2, 5, 2, 5]
];
ItemData.prototype.get_score = function (item_ids) {
    "use strict";
    var id_arr, i, k, id, sd_tmp, avg, sd;
    if (item_ids.length < 2) {
        return {
            scored_items: [],
            avg: 0,
            sd: 0
        };
    }

    
    id_arr = [];
    for (i = 0; i < item_ids.length; i += 1) {
        id = item_ids[i];
        id_arr.push(id);
    }
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
        scored_items: item_ids,
        avg: avg / item_ids.length,
        sd: sd / item_ids.length
    };
};

function Item(id, name, state) {
    "use strict";
    return {
        id: id,
        name: name,
        state: state
    };
}


function ItemCollection(itemData) {
    "use strict";
    if (itemData) {
        this.item_data = itemData;
    } else {
        this.item_data = new ItemData();
    }
}
ItemCollection.prototype.data = [];
ItemCollection.prototype.suggested = [];

ItemCollection.prototype.added = [];

ItemCollection.prototype.diff = [];
ItemCollection.prototype.item_data = new ItemData();
ItemCollection.prototype.request_item = function (item_name) {
    "use strict";
    var id;
    id = this.item_data.item_list.indexOf(item_name);
    return new Item(id, item_name, state.out);
};
ItemCollection.prototype.get_item = function (item_name) {
    "use strict";
    var i, item;
    for (i = 0; i < this.length; i += 1) {
        if (this[i].name === item_name) {
            return this[i];
        }
    }
    item = this.request_item(item_name);
    this.data.push(item);
    return item;
};
ItemCollection.prototype.valid_item = function (item_name) {
    "use strict";
    if ($.inArray(item_name, this.item_data.item_list) === -1) {
        return false;
    } else {
        return true;
    }
};

ItemCollection.prototype.add_item = function (item_name) {
    "use strict";
    var item;
    item = this.get_item(item_name);
    item.kind = state.added;
};

ItemCollection.prototype.suggest_item = function (item_name) {
    "use strict";
    var id;
    id = this.item_data.item_list.indexOf(item_name);
    if (this.suggested.indexOf(id) === -1) {
        return;
    }
    this.suggested.push(id);
};

var item_collection = new ItemCollection();



// Harmony Button
$(function () {
    "use strict";
    $("#harmony").click(function (event) {
        // event
    });
});
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
(function () {
    "use strict";
    function add_button(item_id) {
        var button;
        button = $("<button class='item_button'>");
        button.attr({
            item_id: item_id
        });
        button.text(item_collection.get_item[item_id]);
        button.click(remove_item);
        $(".items").append(button);
    }

    function reload_buttons() {
        var buttons, i, button_id, item_id, id, button_ids;
        buttons = $(".item_button");
        button_ids = [];
        for (i = 0; i < item_collection.data.length; i += 1) {
            item_collection.diff.push(item_collection.data[i].item_id);
        }
        for (i = 0; i < buttons.length; i += 1) {
            button_id = buttons[i].item_id;
            if (item_collection.diff.indexOf(button_id) !== -1) {
                item_collection.diff.remove(button_id);
            }
        }
        for (i = 0; i < item_collection.added.length; i += 1) {
            item_id = item_collection.added[i];
            if (button_ids.indexOf(item_id) === -1) {
                add_button(item_id);
            }
        }
        for (i = 0; i < item_collection.suggested.length; i += 1) {
            item_id = item_collection.suggested[i];
        }
        for (i = 0; i < buttons.length; i += 1) {
            id = buttons[i].item_id;
            if (item_collection.added.indexOf(id) === -1) {
                buttons[i].remove();
            }
        }
    }

    function remove_item(e) {
        var item_id, index;
        item_id = e.target.getAttribute("item_id");
        index = item_collection.added.indexOf(item_id);
        item_collection.added.splice(index, 1);
        item_collection.suggested.splice(index, 1);
        reload_buttons();
        reload_score();
    }


    function reload_score() {
        var score, harmony, novelty;
        score = item_data.get_score(item_collection.added);
        harmony = score.avg === 0 ? 0 : 100 - score.avg;
        novelty = score.sd === 0 ? 0 : score.sd * 100;
        harmony = float_round(harmony, 0);
        novelty = float_round(novelty, 0);
        $('#novelty_score').text(novelty);
        $('#harmony_score').text(harmony);
        $('#sum_score').text(novelty + harmony);
    }

    function sort_rule(a, b) {
        if (a.value > b.value) {
            return 0;
        } else {
            return 1;
        }
    }

    function reload_all() {
        reload_buttons();
        reload_list();
        reload_score();
    }
    //item list
    function reload_list() {
        var input_text, tbody, valued_items, i, item_name, match, tr, id_td, item_td, dst_td;
        input_text = $("#item_input").val();
        tbody = $("#item_list");
        tbody.empty();
        valued_items = [];
        for (i = 0; i < item_data.item_list.length; i += 1) {
            item_name = item_data.item_list[i];
            match = first_match(item_name, input_text);
            valued_items.push({
                id: i,
                name: item_name,
                value: match
            });
        }
        valued_items.sort(sort_rule);
        for (i = 0; i < valued_items.length; i += 1) {
            tr = $("<tr>");
            id_td = $("<td>");
            item_td = $("<td>");
            dst_td = $("<td>");
            id_td.text(valued_items[i].id);
            item_td.text(valued_items[i].name);
            dst_td.text(valued_items[i].value);
            tr.append(id_td);
            tr.append(item_td);
            tr.append(dst_td);
            tbody.append(tr);
        }
    }

    function suggest_item() {
        var input_text, valued_items, i, item_name, match, limit, id;
        input_text = $("#item_input").val();
        valued_items = [];
        for (i = 0; i < item_collection.item_data.item_list.length; i += 1) {
            item_name = item_collection.item_data.item_list[i];
            match = first_match(item_name, input_text);
            valued_items.push({
                id: i,
                name: item_name,
                value: match
            });
        }
        valued_items.sort(sort_rule);
        limit = 3;
        item_collection.suggested = [];
        for (i = 0; i < limit; i += 1) {
            id = valued_items[i].id;
            item_collection.suggested.push(id);
        }
    }
    // Ajax input
    $(function () {
        $("#item_input").keypress(function (e) {
            if (e.which === 13) {
                var item_name = this.value;
                if (valid_item(item_name)) {
                    add_item(item_name);
                    reload_buttons();
                    reload_score();
                    this.value = '';
                }
            }
        });
    });
    $(function () {
        $("#item_input").keyup(function (e) {
            var item_name = this.value;
            suggest_item(item_name);
            reload_buttons();
        });
    });
}())