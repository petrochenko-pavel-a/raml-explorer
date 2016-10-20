"use strict";
var workbench = require("./workbench");
var rv = require("./ramlTreeView");
var page = new workbench.Page("rest");
var reg = require("./registryApp");
var url = "";
var h = document.location.hash;
reg.init();
if (h && h.length > 1) {
    url = h.substr(1);
    rv.showApi(url);
}
