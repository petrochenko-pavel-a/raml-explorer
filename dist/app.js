"use strict";
var workbench = require("./framework/workbench");
var RAMLTreeView = require("./treeView");
var RAMLDetailsView = require("./detailsView");
var RegistryView = require("./registryView");
var url = "";
var bu = "";
function setBackUrl(u) {
    bu = u;
}
exports.setBackUrl = setBackUrl;
exports.states = [];
function back() {
    if (exports.states.length > 0) {
        if (bu) {
            showApi(bu, function () {
                exports.ramlView.openNodeById(exports.states.pop());
            });
            bu = null;
        }
        else {
            exports.ramlView.openNodeById(exports.states.pop());
        }
    }
    else {
        init();
    }
}
exports.back = back;
var backAction = {
    title: "Back",
    run: function () {
        back();
    }
};
exports.ramlView = new RAMLTreeView("");
var details = new RAMLDetailsView("Details", "Details");
var regView = new RegistryView("API Registry");
details.getContextMenu().add(backAction);
exports.ramlView.getContextMenu().add(backAction);
exports.ramlView.addSelectionConsumer(details);
regView.addSelectionConsumer(exports.ramlView);
if (history && history.pushState) {
    window.onpopstate = function (event) {
        back();
    };
}
workbench.registerHandler(function (x) {
    if (history.pushState) {
        var node = exports.ramlView.getSelection();
        if (node && node.length > 0) {
            exports.states.push(node[0].id());
        }
        history.pushState({ page: x }, document.title, document.location.toString());
    }
    exports.ramlView.openNodeById(x);
    return true;
});
function init() {
    var page = new workbench.Page("rest");
    page.addView(details, "*", 100, workbench.Relation.LEFT);
    page.addView(regView, "Details", 15, workbench.Relation.LEFT);
    page.addView(exports.ramlView, "Details", 20, workbench.Relation.LEFT);
    function initSizes() {
        var h = document.getElementById("header").clientHeight + 40;
        document.getElementById("rest").setAttribute("style", "height:" + (window.innerHeight - h) + "px");
    }
    initSizes();
    window.onresize = initSizes;
    var w = window;
    w.openVersion = function (x) {
        exports.ramlView.setVersion(x);
    };
}
function showApi(url, cb) {
    var b = regView.setSelectedUrl(url);
    if (b) {
        exports.ramlView.cb = cb;
    }
    else {
        exports.ramlView.setUrl(url, cb);
    }
}
exports.showApi = showApi;
var h = document.location.hash;
if (h && h.length > 1) {
    url = h.substr(1);
    showApi(url);
}
else {
    init();
}
