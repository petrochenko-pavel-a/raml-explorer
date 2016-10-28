"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var workbench = require("./workbench");
var controls_1 = require("./controls");
var hl = require("./hl");
var tr = require("./typeRender");
var rr = require("./resourceRender");
var nr = require("./nodeRender");
var rrend = require("./registryRender");
exports.states = [];
function back() {
    if (exports.states.length > 0) {
        exports.ramlView.openNodeById(exports.states.pop());
    }
    else {
        init();
    }
}
exports.back = back;
var RAMLDetailsView = (function (_super) {
    __extends(RAMLDetailsView, _super);
    function RAMLDetailsView() {
        _super.apply(this, arguments);
    }
    RAMLDetailsView.prototype.setSelection = function (v) {
        this._element = v;
        this.refresh();
    };
    RAMLDetailsView.prototype.init = function (holder) {
        holder.setContextMenu({
            items: [
                {
                    title: "Back",
                    run: function () {
                        back();
                    }
                }
            ]
        });
        return _super.prototype.init.call(this, holder);
    };
    RAMLDetailsView.prototype.innerRender = function (e) {
        e.style.overflow = "auto";
        if (this._element && this._element.property) {
            if (this._element.property().nameId() == "types" || this._element.property().nameId() == "annotationTypes") {
                var cnt = new tr.TypeRenderer(null, false).render(this._element);
            }
            else {
                if (this._element.property().nameId() == "resources") {
                    var cnt = new rr.ResourceRenderer().render(this._element);
                }
                if (this._element.property().nameId() == "methods") {
                    var cnt = new rr.MethodRenderer(true, true, false, true).render(this._element);
                }
            }
            new controls_1.Label(this._element.name(), cnt).render(e);
        }
        else {
            e.innerHTML = "";
        }
        $('[data-toggle="tooltip"]').tooltip();
    };
    return RAMLDetailsView;
}(workbench.ViewPart));
exports.RAMLDetailsView = RAMLDetailsView;
var RAMLTreeProvider = (function () {
    function RAMLTreeProvider() {
    }
    RAMLTreeProvider.prototype.children = function (x) {
        if (x instanceof hl.TreeLike) {
            var c = x;
            return c.allChildren();
        }
        if (x instanceof hl.ProxyNode) {
            var pn = x;
            return pn.children();
        }
        if (x.property().nameId() == "resources") {
            return x.elements().filter(function (x) { return x.property().nameId() == "resources"; });
        }
        return [];
    };
    RAMLTreeProvider.prototype.elements = function (x) {
        return x;
    };
    return RAMLTreeProvider;
}());
exports.RAMLTreeProvider = RAMLTreeProvider;
var colors = {
    get: "#0f6ab4",
    post: "#10a54a",
    put: "#c5862b",
    patch: "#c5862b",
    delete: "#a41e22"
};
function methodKey(name) {
    var color = "#10a54a";
    color = colors[name];
    return "<span style=\"border: solid;border-radius: 1px; width:16px;height: 16px; border-width: 1px;margin-right: 5px;background-color: " + color + ";font-size: small;padding: 3px\"> </span>";
}
var RAMLTreeView = (function (_super) {
    __extends(RAMLTreeView, _super);
    function RAMLTreeView(path, title) {
        if (title === void 0) { title = "Overview"; }
        _super.call(this, title);
        this.path = path;
        this.searchable = true;
        this.trees = [];
    }
    RAMLTreeView.prototype.setKnownVersions = function (r) {
        this.versions = r;
    };
    RAMLTreeView.prototype.setVersion = function (ver) {
        var _this = this;
        this.versions.versions.forEach(function (x) {
            if (x.version == ver) {
                _this.setUrl(x.location);
            }
        });
    };
    RAMLTreeView.prototype.setUrl = function (url) {
        this.path = url;
        this.node = null;
        this.api = null;
        this.refresh();
    };
    RAMLTreeView.prototype.customize = function (tree) {
        tree.setContentProvider(new RAMLTreeProvider());
        tree.setLabelProvider({
            label: function (x) {
                if (x instanceof hl.TreeLike) {
                    var t = x;
                    return t.id;
                }
                var result = "";
                var pr = x.property ? x.property() : null;
                var isMethod = pr && pr.nameId() == "methods";
                var isType = pr && pr.nameId() == "types";
                var isAType = pr && pr.nameId() == "annotationTypes";
                result = hl.label(x);
                if (isMethod) {
                    result = methodKey(x.name()) + result;
                }
                if (isType) {
                    result = "<img src='typedef_obj.gif'/> " + result;
                }
                if (isAType) {
                    result = "<img src='annotation_obj.gif'/>" + result;
                }
                return result;
            },
            icon: function (x) {
                if (x instanceof hl.TreeLike) {
                    var t = x;
                    return "glyphicon glyphicon-cloud";
                }
                if (x instanceof hl.ProxyNode) {
                    return "glyphicon glyphicon-tasks";
                }
                if (x.property().nameId() == "resources") {
                    return "glyphicon glyphicon-link";
                }
                return "";
            }
        });
    };
    RAMLTreeView.prototype.innerRender = function (e) {
        if (this.path == "") {
            e.innerHTML = "<div style=\"display: flex;flex: 1 1 0; flex-direction: column;justify-content: center;\"><div style=\"display: flex;flex-direction: row;justify-content: center\"><div><div>Please select API or Library</div></div></div></div>";
        }
        else {
            _super.prototype.innerRender.call(this, e);
        }
    };
    RAMLTreeView.prototype.renderArraySection = function (id, label, groups, libs) {
        var toRender = [];
        libs.forEach(function (x) {
            var childrenOfKind = x.children().filter(function (y) { return y.property().nameId() == id; });
            if (childrenOfKind.length > 0) {
                toRender.push(new hl.ProxyNode(x.name(), x, childrenOfKind));
            }
        });
        if (groups[id]) {
            toRender = toRender.concat(groups[id]);
        }
        if (toRender.length > 0) {
            var at = toRender;
            var types = this.createTree(label);
            types.setInput(at);
            this.control.add(types);
            this.trees.push(types);
        }
        ;
    };
    RAMLTreeView.prototype.openNodeById = function (id) {
        var node = hl.findById(id);
        if (node) {
            this.setSelection(node);
        }
    };
    RAMLTreeView.prototype.customizeAccordition = function (a, node) {
        var x = this.api.elements();
        var libs = hl.getUsedLibraries(this.api);
        var overview = nr.renderNodesOverview(this.api.attrs(), this.versions);
        if (overview.length > 0) {
            a.add(new controls_1.Label("Generic Info", "<div style='min-height: 200px'>" + overview + "</div>"));
        }
        if (!this.devMode) {
            libs = [];
        }
        var groups = hl.elementGroups(this.api);
        var methods = [];
        var ts = hl.gatherMethods(this.api, methods);
        var mgroups = hl.groupMethods(methods);
        var groupedMethods = mgroups.allChildren();
        if (methods != null) {
            groups["methods"] = groupedMethods;
        }
        if (this.devMode || this.api.definition().nameId() == "Library") {
            this.renderArraySection("annotationTypes", "Annotation Types", groups, libs);
        }
        this.renderArraySection("methods", "Operations", groups, libs);
        this.renderArraySection("types", "Data Types", groups, libs);
        if (this.devMode) {
            this.renderArraySection("resources", "API Paths", groups, libs);
        }
        var lt = null;
    };
    RAMLTreeView.prototype.load = function () {
        var _this = this;
        hl.loadApi(this.path, function (api) {
            _this.api = api;
            _this.node = api;
            _this.refresh();
            showTitle(_this.api);
        });
    };
    RAMLTreeView.prototype.init = function (holder) {
        holder.setContextMenu({
            items: [
                {
                    title: "Back",
                    run: function () {
                        back();
                    }
                }
            ]
        });
        var v = this;
        holder.setToolbar({
            items: [
                {
                    title: "",
                    image: "glyphicon glyphicon-asterisk",
                    checked: this.devMode,
                    run: function () {
                        v.devMode = !v.devMode;
                        v.refresh();
                        v.init(v.holder);
                    }
                }
            ]
        });
        return _super.prototype.init.call(this, holder);
    };
    return RAMLTreeView;
}(workbench.AccorditionTreeView));
exports.RAMLTreeView = RAMLTreeView;
function showTitle(api) {
    hl.prepareNodes(api.attrs()).forEach(function (x) {
        if (x.name() == "(Title)" || x.name() == "title") {
            document.getElementById("title").innerHTML = x.value();
        }
    });
}
exports.ramlView = new RAMLTreeView("");
var details = new RAMLDetailsView("Details", "Details");
var regView = new rrend.RegistryView("API Registry");
function init() {
    var page = new workbench.Page("rest");
    page.addView(details, "*", 100, workbench.Relation.LEFT);
    page.addView(regView, "Details", 15, workbench.Relation.LEFT);
    page.addView(exports.ramlView, "Details", 20, workbench.Relation.LEFT);
    regView.addSelectionListener({
        selectionChanged: function (v) {
            if (v.length > 0) {
                if (v[0] instanceof rrend.ApiWithVersions) {
                    var aw = v[0];
                    var sel = aw.versions[aw.versions.length - 1];
                    exports.ramlView.setKnownVersions(aw);
                    exports.ramlView.setUrl(sel.location);
                }
                else {
                    if (v[0].location) {
                        exports.ramlView.setUrl(v[0].location);
                    }
                }
            }
            else {
                details.setSelection(null);
            }
        }
    });
    function initSizes() {
        var h = document.getElementById("header").clientHeight + 50;
        document.getElementById("rest").setAttribute("style", "height:" + (window.innerHeight - h) + "px");
    }
    initSizes();
    window.onresize = initSizes;
    var w = window;
    w.openVersion = function (x) {
        exports.ramlView.setVersion(x);
    };
}
exports.init = init;
exports.ramlView.addSelectionListener({
    selectionChanged: function (v) {
        if (v.length > 0) {
            details.setSelection(v[0]);
        }
        else {
            details.setSelection(null);
        }
    }
});
function showApi(url) {
    exports.ramlView.setUrl(url);
    regView.setSelectedUrl(url);
}
exports.showApi = showApi;
