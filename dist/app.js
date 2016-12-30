"use strict";
var workbench = require("./framework/workbench");
var RAMLTreeView = require("./treeView");
var RAMLDetailsView = require("./detailsView");
var RegistryView = require("./registryView");
var workbench_1 = require("./framework/workbench");
var state = require("./state");
var RAMLOverlayView = require("./overlayView");
var tools = require("./core/tools");
var controls_1 = require("./framework/controls");
var AboutDialog = (function () {
    function AboutDialog() {
    }
    AboutDialog.prototype.title = function () {
        return "About";
    };
    AboutDialog.prototype.id = function () {
        return "about";
    };
    AboutDialog.prototype.render = function (e) {
        e.innerHTML =
            "This project is devoted to building machine readable data base of API specifications in RAML 1.0 Format.\n        <p>\n        <hr>\n        All API specs contributed to project by authors are covered by the CC01.0 license.\n        All API specs acquired from public sources under the Fair use principal.\n        </p>\n        <hr>\n        Some specs are taken from Open Source projects:\n        <ul>\n        <li>darklynx/swagger-api-collection - OpenAPI(aka Swagger) spec for Instagram API</li>\n        <li>Mermade/bbcparse - OpenAPI(aka Swagger) spec for BBC Nitro API</li>\n        <li>amardeshbd/medium-api-specification - OpenAPI (aka Swagger 2.0) spec for Medium API</li>\n        </ul>";
    };
    return AboutDialog;
}());
tools.V;
exports.ramlView = new RAMLTreeView("");
var details = new RAMLDetailsView("Details", "Details");
var regView = new RegistryView("API Registry");
var overlay = new RAMLOverlayView("Overlay", "Overlay");
details.getContextMenu().add(new workbench.BackAction());
exports.ramlView.getContextMenu().add(new workbench.BackAction());
exports.ramlView.addSelectionConsumer(details);
exports.ramlView.addSelectionConsumer(overlay);
var inExpansion = false;
workbench.registerHandler(function (x) {
    state.onState(x);
    return true;
});
state.addListener(function () {
    regView.updateFromState();
    exports.ramlView.updateFromState();
    if (inExpansion) {
        return;
    }
    if (state.getOptions()["fullScreen"] == "true") {
        if (app.currentPerspective() != fullSpecPerspective) {
            app.openPerspective(fullSpecPerspective);
        }
    }
    else {
        if (app.currentPerspective() != registryPerspective) {
            app.openPerspective(registryPerspective);
        }
    }
});
var registryPerspective = {
    title: "API Registry",
    actions: [
        new workbench.ShowDialogAction("About", new AboutDialog()),
        { title: "Add an API", link: "https://goo.gl/forms/SAr1zd6AuKi2EWbD2" }
    ],
    views: [
        { view: details, ref: "*", ratio: 100, relation: workbench.Relation.LEFT },
        { view: regView, ref: "Details", ratio: 15, relation: workbench.Relation.LEFT },
        { view: exports.ramlView, ref: "Details", ratio: 20, relation: workbench.Relation.LEFT },
    ]
};
var fullSpecPerspective = {
    title: "API Registry",
    actions: [
        new workbench.ShowDialogAction("About", new AboutDialog()),
        { title: "Add an API", link: "https://goo.gl/forms/SAr1zd6AuKi2EWbD2" }
    ],
    views: [
        { view: details, ref: "*", ratio: 100, relation: workbench.Relation.LEFT },
        { view: exports.ramlView, ref: "Details", ratio: 20, relation: workbench.Relation.LEFT },
    ],
    onOpen: function () {
    }
};
var overlayPerspective = {
    title: "API Registry",
    actions: [
        new workbench.ShowDialogAction("About", new AboutDialog()),
        { title: "Add an API", link: "https://goo.gl/forms/SAr1zd6AuKi2EWbD2" }
    ],
    views: [
        { view: details, ref: "*", ratio: 100, relation: workbench.Relation.LEFT },
        { view: exports.ramlView, ref: "Details", ratio: 20, relation: workbench.Relation.LEFT },
        { view: overlay, ref: "Details", ratio: 50, relation: workbench.Relation.BOTTOM }
    ],
    onOpen: function () {
    }
};
var p = registryPerspective;
if (state.getOptions()["fullScreen"] == "true") {
    p = fullSpecPerspective;
}
var app = new workbench_1.Application("API REGISTRY", registryPerspective, "app", p);
app.home = function () {
    inExpansion = false;
    state.clearOptions();
};
workbench.addCommand({
    id: "/commands/ramlExplorer/focusOnSpec",
    run: function () {
        fullSpecPerspective.title = exports.ramlView.getSpecTitle();
        state.setOption("fullScreen", "true");
    }
});
workbench.addCommand({
    id: "/commands/ramlExplorer/runTool/",
    run: function (tool) {
        state.registry().tools().forEach(function (x) {
            if (x.location == tool) {
                if (x.needsConfig) {
                    inExpansion = true;
                    overlay.setLib(x.libUrl);
                    overlay.tool = x;
                    app.openPerspective(overlayPerspective);
                    setTimeout(function () {
                        overlay.setInput(exports.ramlView.specRoot());
                    }, 200);
                    return;
                }
                if (x.codeToRun) {
                    x.codeToRun(exports.ramlView.specRoot());
                }
                else {
                    tools.execute(x, exports.ramlView.specRoot(), function (res) {
                        if (res.resultUrl) {
                            if (res.resultUrl.indexOf("http://") == 0 || res.resultUrl.indexOf("https://") == 0) {
                                document.location = res.resultUrl;
                                return;
                            }
                            var ll = x.location.indexOf('/', 7);
                            var loc = x.location.substring(0, ll);
                            loc += res.resultUrl;
                            document.location = loc;
                        }
                        else {
                            workbench.showInDialog("Result", new controls_1.Label(res.result));
                        }
                    });
                }
            }
        });
    }
});
workbench.addCommand({
    id: "/commands/ramlExplorer/overlayWithLib/",
    run: function (lib) {
        inExpansion = true;
        overlay.setLib(lib);
        app.openPerspective(overlayPerspective);
        setTimeout(function () {
            overlay.setInput(exports.ramlView.specRoot());
        }, 200);
    }
});
