"use strict";
var workbench = require("./framework/workbench");
var rv = require("./ramlTreeView");
var page = new workbench.Page("rest");
var y = require("./registryApp");
var url = "";
var h = document.location.hash;
y.init();
if (h && h.length > 1) {
    url = h.substr(1);
    rv.showApi(url);
}
