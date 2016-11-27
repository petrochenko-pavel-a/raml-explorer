"use strict";
var workbench = require("./framework/workbench");
var RAMLTreeView = require("./treeView");
var RAMLDetailsView = require("./detailsView");
var RegistryView = require("./registryView");
var workbench_1 = require("./framework/workbench");
var state = require("./state");
var AboutDialog = (function () {
    function AboutDialog() {
    }
    AboutDialog.prototype.title = function () {
        return "About";
    };
    AboutDialog.prototype.render = function (e) {
        e.innerHTML =
            "This project is devoted to building machine readable data base of API specifications in RAML 1.0 Format.\n        <p>\n        <hr>\n        All API specs contributed to project by authors are covered by the CC01.0 license.\n        All API specs acquired from public sources under the Fair use principal.\n        </p>\n        <hr>\n        Some specs are taken from Open Source projects:\n        <ul>\n        <li>darklynx/swagger-api-collection - OpenAPI(aka Swagger) spec for Instagram API</li>\n        <li>Mermade/bbcparse - OpenAPI(aka Swagger) spec for BBC Nitro API</li>\n        <li>amardeshbd/medium-api-specification - OpenAPI (aka Swagger 2.0) spec for Medium API</li>\n        </ul>";
    };
    return AboutDialog;
}());
exports.ramlView = new RAMLTreeView("");
var details = new RAMLDetailsView("Details", "Details");
var regView = new RegistryView("API Registry");
details.getContextMenu().add(new workbench.BackAction());
exports.ramlView.getContextMenu().add(new workbench.BackAction());
exports.ramlView.addSelectionConsumer(details);
workbench.registerHandler(function (x) {
    state.onState(x);
    return true;
});
state.addListener(function () {
    regView.updateFromState();
    exports.ramlView.updateFromState();
});
var perspective = {
    title: "API Registry",
    actions: [
        new workbench.ShowDialogAction("About", new AboutDialog()),
        { title: "Add an API", link: "https://goo.gl/forms/SAr1zd6AuKi2EWbD2" }
    ],
    views: [
        { view: details, ref: "*", ratio: 100, relation: workbench.Relation.LEFT },
        { view: regView, ref: "Details", ratio: 15, relation: workbench.Relation.LEFT },
        { view: exports.ramlView, ref: "Details", ratio: 20, relation: workbench.Relation.LEFT }
    ]
};
var app = new workbench_1.Application("API REGISTRY", perspective, "app");
