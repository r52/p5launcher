let websocket = null;

const item =
  '<div class="item"><div class="bg1"></div><div class="bg2"></div></div>';

$.fn.random = function () {
  let ret = $();

  if (this.length > 0)
    ret = ret.add(this[Math.floor(Math.random() * this.length)]);

  return ret;
};

function launcher_cmd(cmd, arg) {
  let msg = {
    method: "query",
    params: {
      topics: [`applauncher/${cmd}`],
    },
  };

  if (arg) {
    msg.params["args"] = arg;
  }

  websocket.send(JSON.stringify(msg));
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function create_item(name) {
  let $e = $(item);

  let $a = $("<a></a>", {
    id: name.toLowerCase(),
    href: "#" + name.toLowerCase(),
    text: name.toUpperCase(),
  });

  $a.lettering();
  $a.children().random().addClass("box");
  $a.children().each(function () {
    let rotate = getRandomInt(-5, 5);
    $(this).css("--rot", rotate + "deg");
  });

  $e.append($a);

  return $e;
}

function randomize_arrows() {
  $(".bg2").each(function () {
    let randy = getRandomInt(0, 1);
    $(this).css("--arrowy", (randy ? 30 : -15) + "px");
  });
}

function rotate_column(items, right) {
  if (items.length > 0) {
    let angle_inc = Math.ceil(120.0 / (items.length + 1));
    let inc = 1;

    items.each(function () {
      let rotate = (60 - inc * angle_inc) * (right ? -1 : 1);
      $(this).css("--rot", rotate + "deg");
      inc++;
    });
  }
}

function generate_custom_items() {
  for (let i = 0; i < left_apps.length; i++) {
    $(".left").append(create_item(left_apps[i]));
  }

  for (let i = 0; i < right_apps.length; i++) {
    $(".right").append(create_item(right_apps[i]));
  }

  randomize_arrows();
  rotate_column($(".left .item"), false);
  rotate_column($(".right .item"), true);

  $("a").click(function () {
    launcher_cmd("launch", this.id);
  });
}

function create_launcher(data) {
  let entries = data["applauncher/list"];

  if (entries.length > 0) {
    entries.forEach(function (e, i) {
      let t = create_item(e.command);
      $(i % 2 ? ".right" : ".left").append(t);
    });

    randomize_arrows();
    rotate_column($(".left .item"), false);
    rotate_column($(".right .item"), true);

    $("a").click(function () {
      launcher_cmd("launch", this.id);
    });
  }
}

function parse_msg(msg) {
  let data = JSON.parse(msg);

  if ("applauncher/list" in data) {
    create_launcher(data);
  }
}

$(function () {
  try {
    if (websocket && websocket.readyState == 1) websocket.close();
    websocket = quasar_create_websocket();
    websocket.onopen = function (evt) {
      quasar_authenticate(websocket);
      if (autoPopulate) {
        launcher_cmd("list");
      } else {
        generate_custom_items();
      }
    };
    websocket.onmessage = function (evt) {
      parse_msg(evt.data);
    };
    websocket.onerror = function (evt) {
      console.warn("p5launcher (ERROR): " + evt.data);
    };
  } catch (exception) {
    console.warn("p5launcher (Exception): " + exception);
  }
});
