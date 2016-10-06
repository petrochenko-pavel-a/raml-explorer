"use strict";
var workbench = require("./workbench");
var page = new workbench.Page("rest");
var reg = require("./registryApp");
var url = "";
var h = document.location.hash;
if (h && h.length > 1) {
    url = h.substr(1);
    reg.showApi(url);
}
else {
    reg.init();
}
