"use strict";
var workbench = require("./workbench");
var rv = require("./ramlTreeView");
var page = new workbench.Page("rest");
var details = new rv.RAMLDetailsView("Details", "Details");
var url = document.location + "test1.raml";
var h = document.location.hash;
if (h && h.length > 1) {
    url = h.substr(1);
}
var ramlView = new rv.RAMLTreeView(url);
page.addView(details, "*", 100, workbench.Relation.LEFT);
page.addView(ramlView, "Details", 20, workbench.Relation.LEFT);
var states = [];
if (history && history.pushState) {
    window.onpopstate = function (event) {
        if (states.length > 0) {
            ramlView.openNodeById(states.pop());
        }
    };
}
workbench.registerHandler(function (x) {
    if (history.pushState) {
        var node = ramlView.getSelection();
        if (node && node.length > 0) {
            states.push(node[0].id());
        }
        history.pushState({ page: x }, document.title, document.location.toString());
    }
    ramlView.openNodeById(x);
    return true;
});
function initSizes() {
    var h = document.getElementById("header").clientHeight + 50;
    document.getElementById("rest").setAttribute("style", "height:" + (window.innerHeight - h) + "px");
}
initSizes();
ramlView.addSelectionListener({
    selectionChanged: function (v) {
        if (v.length > 0) {
            details.setSelection(v[0]);
        }
        else {
            details.setSelection(null);
        }
    }
});
window.onresize = initSizes;
