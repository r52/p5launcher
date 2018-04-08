var websocket = null;

var msg = {
    widget: qWidgetName,
    type: "launcher"
};

var item = '<div class="item"><div class="bg1"></div><div class="bg2"></div></div>';

$.fn.random = function() {
    var ret = $();

    if (this.length > 0)
        ret = ret.add(this[Math.floor(Math.random() * this.length)]);

    return ret;
};

function launch(app) {
    msg["app"] = app;
    websocket.send(JSON.stringify(msg));
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function create_item(name) {
    var $e = $(item);

    var $a = $("<a></a>", {
        id: name.toLowerCase(),
        href: "#" + name.toLowerCase(),
        text: name.toUpperCase()
    });

    $a.lettering();
    $a.children().random().addClass("box");
    $a.children().each(function() {
        var rotate = getRandomInt(-5, 5);
        $(this).css("--rot", rotate + "deg");
    });

    $e.append($a);

    return $e;
}

function randomize_arrows() {
    $(".bg2").each(function() {
        var randy = getRandomInt(0, 1);
        $(this).css("--arrowy", (randy ? 30 : -15) + "px");
    });
}

function rotate_column(items, right) {
    if (items.length > 0) {
        var angle_inc = Math.ceil(120.0 / (items.length + 1));
        var inc = 1;

        items.each(function() {
            var rotate = (60 - (inc * angle_inc)) * (right ? -1 : 1);
            $(this).css("--rot", rotate + "deg");
            inc++;
        });
    }
}

function generate_items() {
    for (var i = 0; i < left_apps.length; i++) {
        $(".left").append(create_item(left_apps[i]));
    }

    for (var i = 0; i < right_apps.length; i++) {
        $(".right").append(create_item(right_apps[i]));
    }

    randomize_arrows();
    rotate_column($(".left .item"), false);
    rotate_column($(".right .item"), true);
}

$(function() {
    generate_items();

    try {
        if (websocket && websocket.readyState == 1)
            websocket.close();
        websocket = new WebSocket(qWsServerUrl);
        websocket.onerror = function(evt) {
            console.log('ERROR: ' + evt.data);
        };
    } catch (exception) {
        console.log('Exception: ' + exception);
    }

    $("a").click(function() {
        launch(this.id);
    });
});
