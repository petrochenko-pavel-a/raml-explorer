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
var RAMLDetailsView = (function (_super) {
    __extends(RAMLDetailsView, _super);
    function RAMLDetailsView() {
        _super.apply(this, arguments);
    }
    RAMLDetailsView.prototype.setSelection = function (v) {
        this._element = v;
        this.refresh();
    };
    RAMLDetailsView.prototype.innerRender = function (e) {
        e.style.overflow = "auto";
        if (this._element) {
            if (this._element.property().nameId() == "types" || this._element.property().nameId() == "annotationTypes") {
                var cnt = new tr.TypeRenderer().render(this._element);
            }
            else {
                if (this._element.property().nameId() == "resources") {
                    var cnt = new rr.ResourceRenderer().render(this._element);
                }
                if (this._element.property().nameId() == "methods") {
                    var cnt = new rr.MethodRenderer().render(this._element);
                }
            }
            new controls_1.Label(this._element.name(), cnt).render(e);
        }
        else {
            e.innerHTML = "";
        }
    };
    return RAMLDetailsView;
}(workbench.ViewPart));
exports.RAMLDetailsView = RAMLDetailsView;
var RAMLTreeProvider = (function () {
    function RAMLTreeProvider() {
    }
    RAMLTreeProvider.prototype.children = function (x) {
        if (x instanceof hl.ProxyNode) {
            var pn = x;
            return pn.children();
        }
        if (x.property().nameId() == "resources") {
            return x.elements();
        }
        return [];
    };
    RAMLTreeProvider.prototype.elements = function (x) {
        return x;
    };
    return RAMLTreeProvider;
}());
exports.RAMLTreeProvider = RAMLTreeProvider;
var RAMLTreeView = (function (_super) {
    __extends(RAMLTreeView, _super);
    function RAMLTreeView(path) {
        _super.call(this, "Overview");
        this.path = path;
        this.trees = [];
    }
    RAMLTreeView.prototype.customize = function (tree) {
        tree.setContentProvider(new RAMLTreeProvider());
        tree.setLabelProvider({
            label: function (x) {
                return "" + x.name();
            },
            icon: function (x) {
                if (x instanceof hl.ProxyNode) {
                    return "glyphicon glyphicon-tasks";
                }
                if (x.property().nameId() == "resources") {
                    return "glyphicon glyphicon-link";
                }
                return "glyphicon glyphicon-pencil";
            }
        });
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
        var overview = nr.renderNodes(this.api.attrs());
        if (overview.length > 0) {
            a.add(new controls_1.Label("Generic Info", overview));
        }
        var groups = hl.elementGroups(this.api);
        this.renderArraySection("annotationTypes", "Annotation Types", groups, libs);
        this.renderArraySection("types", "Types", groups, libs);
        this.renderArraySection("resources", "Resources", groups, libs);
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
