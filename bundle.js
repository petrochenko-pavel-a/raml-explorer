(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
    init();
    showApi(url);
}
else {
    init();
}

},{"./detailsView":5,"./framework/workbench":7,"./registryView":8,"./treeView":14}],2:[function(require,module,exports){
"use strict";
var keywords = require("./keywords");
var keywords_1 = require("./keywords");
var root;
var libs;
function findById(id) {
    var n = root.findById(id);
    if (n) {
        return n;
    }
    var nodes = [];
    getUsedLibraries(root).forEach(function (x) {
        var rs = x.findById(id);
        if (rs != null) {
            nodes.push(rs);
        }
    });
    if (nodes.length > 0) {
        return nodes[0];
    }
}
exports.findById = findById;
function getDeclaration(n, escP) {
    if (escP === void 0) { escP = true; }
    if (!n.adapters || n.adapters.length == 0) {
        return null;
    }
    var ns = n.adapters[0].getDeclaringNode();
    if (ns) {
        if (escP && ns.property() && (ns.property().nameId() === "properties" || ns.property().nameId() === "facets")) {
            return null;
        }
    }
    root.children().forEach(function (x) {
        if (x.property().nameId() == "types") {
            if (x.name() == n.nameId()) {
                return x;
            }
        }
    });
    var libs = getUsedLibraries(root);
    var options = [];
    libs.forEach(function (t) {
        t.children().forEach(function (x) {
            if (x.property().nameId() == "types") {
                if (x.name() == n.nameId()) {
                    options.push(x);
                }
            }
        });
    });
    if (options.length > 0) {
        return options[0];
    }
    return ns;
}
exports.getDeclaration = getDeclaration;
var usageProps = {
    "queryParameters": 1,
    "uriParameters": 1,
    "types": 1,
    "properties": 1,
    "additionalProperties": 1,
    "items": 1,
    "headers": 1,
    "body": 1,
};
var rootProps = {
    "queryParameters": 1,
    "uriParameters": 1,
    "headers": 1,
    "body": 1,
};
var rootable = {
    "resources": 1,
    "methods": 1,
    "types": 1,
    "annotationTypes": 1
};
function findUsagesRoot(h) {
    while (h.property() != null) {
        if (rootable[h.property().nameId()]) {
            return h;
        }
        h = h.parent();
    }
    return h;
}
exports.findUsagesRoot = findUsagesRoot;
function isRAML08(x) {
    if (x.definition().universe().version() == "RAML08") {
        return true;
    }
    return false;
}
exports.isRAML08 = isRAML08;
function findUsages(h, n, results) {
    h.elements().forEach(function (x) {
        findUsages(x, n, results);
    });
    if (h.property()) {
        if (usageProps[h.property().nameId()]) {
            var lt = h.localType();
            if (trackType(lt, n)) {
                results.push(h);
            }
        }
    }
}
exports.findUsages = findUsages;
function allUsedTypes(h) {
    var res = {};
    allUsages(h, res);
    return res;
}
exports.allUsedTypes = allUsedTypes;
function allUsages(h, nm) {
    h.elements().forEach(function (x) {
        allUsages(x, nm);
    });
    if (h.property()) {
        if (rootProps[h.property().nameId()]) {
            var lt = h.localType();
            usedTypes(lt, nm);
        }
    }
}
function usedTypes(lt, nm) {
    var rs = false;
    lt.superTypes().forEach(function (t) {
        nm[t.nameId()] = 1;
    });
    if (rs) {
        return true;
    }
    if (lt.isArray()) {
        var ct = lt.componentType();
        nm[ct.nameId()] = 1;
        ct.superTypes().forEach(function (t) {
            nm[t.nameId()] = 1;
        });
        return false;
    }
    if (lt.isUnion()) {
        return usedTypes(lt.union().leftType(), nm) || usedTypes(lt.union().rightType(), nm);
    }
    return false;
}
exports.usedTypes = usedTypes;
function trackType(lt, n) {
    var rs = false;
    lt.superTypes().forEach(function (t) {
        if (t.nameId() == n.nameId()) {
            rs = true;
        }
    });
    if (rs) {
        return true;
    }
    if (lt.isArray()) {
        var ct = lt.componentType();
        if (ct.nameId() == n.nameId()) {
            return true;
        }
        ct.superTypes().forEach(function (t) {
            if (t.nameId() == n.nameId()) {
                return true;
            }
        });
        return false;
    }
    if (lt.isUnion()) {
        return trackType(lt.union().leftType(), n) || trackType(lt.union().rightType(), n);
    }
    return false;
}
exports.trackType = trackType;
function getUsedLibrary(usesNode) {
    var path = usesNode.attr("value");
    if (path) {
        var u = usesNode.lowLevel().unit();
        var ast = u.resolve(path.value()).highLevel();
        return new ProxyNode(usesNode.name(), ast, ast.children());
    }
    return null;
}
exports.getUsedLibrary = getUsedLibrary;
function getUsedLibraries(root) {
    if (libs) {
        return libs;
    }
    var nodes = [];
    root.children().forEach(function (x) {
        if (x.property().nameId() == "uses") {
            nodes.push(getUsedLibrary(x));
        }
    });
    libs = nodes;
    return nodes;
}
exports.getUsedLibraries = getUsedLibraries;
var ProxyNode = (function () {
    function ProxyNode(_name, original, _children) {
        this._name = _name;
        this.original = original;
        this._children = _children;
    }
    ProxyNode.prototype.parent = function () {
        return this.original.parent();
    };
    ProxyNode.prototype.definition = function () {
        return this.original.definition();
    };
    ProxyNode.prototype.name = function () {
        return this._name;
    };
    ProxyNode.prototype.property = function () {
        return this.original.property();
    };
    ProxyNode.prototype.children = function () {
        return this._children;
    };
    ProxyNode.prototype.elements = function () {
        return this._children;
    };
    ProxyNode.prototype.attrs = function () {
        return [];
    };
    ProxyNode.prototype.attr = function (name) {
        return this.original.attr(name);
    };
    ProxyNode.prototype.value = function () {
        return null;
    };
    ProxyNode.prototype.lowLevel = function () {
        return this.original.lowLevel();
    };
    ProxyNode.prototype.isAttr = function () {
        return false;
    };
    ProxyNode.prototype.id = function () {
        return null;
    };
    ProxyNode.prototype.root = function () {
        return this.original;
    };
    ProxyNode.prototype.findById = function (id) {
        return this.original.findById(id);
    };
    ProxyNode.prototype.localType = function () {
        return null;
    };
    return ProxyNode;
}());
exports.ProxyNode = ProxyNode;
function description(n) {
    var h = getDeclaration(n, false);
    if (h) {
        var d = h.attr("description");
        if (d) {
            return "" + d.value();
        }
    }
    return "";
}
exports.description = description;
function asObject(vl) {
    var r = vl.lowLevel().dumpToObject();
    return r;
}
exports.asObject = asObject;
function elementGroups(hl) {
    var groups = {};
    hl.elements().forEach(function (x) {
        var z = groups[x.property().nameId()];
        if (!z) {
            z = [];
            groups[x.property().nameId()] = z;
        }
        z.push(x);
    });
    return groups;
}
exports.elementGroups = elementGroups;
function loadApi(path, f, setRoot) {
    if (setRoot === void 0) { setRoot = true; }
    RAML.Parser.loadApi(path).then(function (api) {
        var hl = api.highLevel();
        var res = null;
        var tr = hl.elements().filter(function (x) { return x.property().nameId() == "traits" || x.property().nameId() == "resourceTypes"; });
        if (tr.length > 0) {
            res = api.expand ? api.expand().highLevel() : api.highLevel();
            if (setRoot) {
                root = res;
            }
        }
        else {
            res = hl;
            if (setRoot) {
                root = hl;
            }
        }
        libs = null;
        f(res);
    });
}
exports.loadApi = loadApi;
function allOps(x) {
    var mn = [];
    gatherMethods(x, mn);
    var result = {};
    mn.forEach(function (x) {
        result[resourceUrl(x.parent(), false) + "." + x.name()] = x;
    });
    return result;
}
exports.allOps = allOps;
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
exports.methodKey = methodKey;
function subTypes(t) {
    var n = getDeclaration(t);
    var result = [];
    function extracted(cr) {
        cr.elements().forEach(function (x) {
            if (x.property().nameId() == "types") {
                x.localType().superTypes().forEach(function (y) {
                    var rs = getDeclaration(y);
                    if (rs == n) {
                        if (result.indexOf(x.localType()) == -1) {
                            result.push(x.localType());
                        }
                    }
                });
            }
        });
    }
    if (n) {
        var cr = n.root();
        extracted(cr);
        extracted(root);
        getUsedLibraries(root).forEach(function (l) {
            extracted(l);
        });
    }
    return result;
}
exports.subTypes = subTypes;
var FakeNode = (function () {
    function FakeNode(t, _name) {
        this.t = t;
        this._name = _name;
    }
    FakeNode.prototype.localType = function () {
        return this.t;
    };
    FakeNode.prototype.root = function () {
        return null;
    };
    FakeNode.prototype.id = function () {
        return this._name;
    };
    FakeNode.prototype.findById = function () {
        return null;
    };
    FakeNode.prototype.parent = function () {
        return null;
    };
    FakeNode.prototype.definition = function () {
        return this.t;
    };
    FakeNode.prototype.name = function () {
        return this._name;
    };
    FakeNode.prototype.property = function () {
        return null;
    };
    FakeNode.prototype.children = function () {
        return [];
    };
    FakeNode.prototype.elements = function () {
        return [];
    };
    FakeNode.prototype.attrs = function () {
        return [];
    };
    FakeNode.prototype.attr = function (name) {
        return null;
    };
    FakeNode.prototype.value = function () {
        return null;
    };
    FakeNode.prototype.lowLevel = function () {
        return [];
    };
    FakeNode.prototype.isAttr = function () {
        return true;
    };
    return FakeNode;
}());
exports.FakeNode = FakeNode;
var MergedNode = (function () {
    function MergedNode(p, t, vl, _name) {
        this.p = p;
        this.t = t;
        this.vl = vl;
        this._name = _name;
    }
    MergedNode.prototype.localType = function () {
        return null;
    };
    MergedNode.prototype.root = function () {
        return null;
    };
    MergedNode.prototype.id = function () {
        return "";
    };
    MergedNode.prototype.findById = function () {
        return null;
    };
    MergedNode.prototype.parent = function () {
        return null;
    };
    MergedNode.prototype.definition = function () {
        return this.t;
    };
    MergedNode.prototype.name = function () {
        return this._name;
    };
    MergedNode.prototype.property = function () {
        return this.p;
    };
    MergedNode.prototype.children = function () {
        return [];
    };
    MergedNode.prototype.elements = function () {
        return [];
    };
    MergedNode.prototype.attrs = function () {
        return [];
    };
    MergedNode.prototype.attr = function (name) {
        return null;
    };
    MergedNode.prototype.value = function () {
        return this.vl;
    };
    MergedNode.prototype.lowLevel = function () {
        var x = this;
        return {
            dumpToObject: function () {
                return x.vl[0];
            }
        };
    };
    MergedNode.prototype.isAttr = function () {
        return true;
    };
    return MergedNode;
}());
exports.MergedNode = MergedNode;
function isJoinable(n) {
    if (!n.isAttr()) {
        return false;
    }
    var p = n.property();
    return p.nameId() != "annotations";
}
exports.isJoinable = isJoinable;
var Locals = {
    "Id": -1,
    "Title": 1,
    "Version": -1,
    "NextLinkBasedPagination": 200,
    "TokenBasePagination": 200
};
var PLocals = {
    "usage": 2,
    "description": 150,
    "securedBy": -2
};
function group(n) {
    if (n.definition && n.definition()) {
        if (Locals[n.definition().nameId()]) {
            return Locals[n.definition().nameId()];
        }
    }
    if (n.property && n.property()) {
        if (PLocals[n.property().nameId()]) {
            return PLocals[n.property().nameId()];
        }
    }
    return 10;
}
exports.group = group;
function resourceUrl(h, skipSint) {
    if (skipSint === void 0) { skipSint = true; }
    var result = "";
    var o = h;
    while (h != null && h.property() != null) {
        result = h.name() + result;
        h = h.parent();
    }
    var up = uriParameters(o);
    for (var i = 0; i < up.length; i++) {
        if (skipSint && isSyntetic(up[i])) {
            var nm = up[i].name();
            if (nm.charAt(nm.length - 1) == "?") {
                nm = nm.substr(0, nm.length - 1);
            }
            result = result.replace("{" + nm + "}", "");
        }
    }
    return result;
}
exports.resourceUrl = resourceUrl;
function isSyntetic(x) {
    var attrs = prepareNodes(x.attrs());
    for (var i = 0; i < attrs.length; i++) {
        var d = attrs[i].definition();
        if (d && d.nameId() == "syntetic") {
            return true;
        }
    }
    return false;
}
exports.isSyntetic = isSyntetic;
function logicalStructure(x) {
    var attrs = prepareNodes(x.attrs());
    for (var i = 0; i < attrs.length; i++) {
        var d = attrs[i].definition();
        if (d && (d.nameId() == "LogicalStructure")) {
            var obj = asObject(attrs[i]);
            return obj[Object.keys(obj)[0]];
        }
    }
    return [];
}
exports.logicalStructure = logicalStructure;
function enumDescriptions(x) {
    var attrs = prepareNodes(x.attrs());
    for (var i = 0; i < attrs.length; i++) {
        var d = attrs[i].definition();
        if (d && (d.nameId() == "EnumDescriptions")) {
            var obj = asObject(attrs[i]);
            return obj[Object.keys(obj)[0]];
        }
    }
    return null;
}
exports.enumDescriptions = enumDescriptions;
function scopeDescriptionsofApi(a, name) {
    if (a.scopeDesc) {
        return a.scopeDesc[name];
    }
    var defs = {};
    var ss = a.elements().filter(function (x) { return x.property().nameId() == "securitySchemes"; });
    for (var i = 0; i < ss.length; i++) {
        var descs = scopeDescriptions(ss[i]);
        defs[ss[i].name()] = descs;
    }
    a.scopeDesc = defs;
    return a.scopeDesc[name];
}
exports.scopeDescriptionsofApi = scopeDescriptionsofApi;
function scopeDescriptions(x) {
    var attrs = prepareNodes(x.attrs());
    for (var i = 0; i < attrs.length; i++) {
        var d = attrs[i].definition();
        if (d && (d.nameId() == "OathScopeDescriptions")) {
            var obj = asObject(attrs[i]);
            return obj[Object.keys(obj)[0]];
        }
    }
    return null;
}
exports.scopeDescriptions = scopeDescriptions;
function uriParameters(h) {
    var result = [];
    while (h != null && h.property() != null) {
        var nm = h.name();
        var names = [];
        while (true) {
            var ind = nm.indexOf('{');
            if (ind != -1) {
                nm = nm.substr(ind + 1);
                var end = nm.indexOf('}');
                if (end == -1) {
                    break;
                }
                var upn = nm.substr(0, end);
                names.push(upn);
                nm = nm.substr(end);
            }
            else {
                break;
            }
        }
        names.forEach(function (x) {
            var up = h.elements().filter(function (y) { return y.property().nameId() == "uriParameters" && y.name() == x || (y.name()) == (x + '?'); });
            if (up.length > 0) {
                var m = up[0];
                result.push(up[0]);
            }
            else {
                result.push(new FakeNode({
                    nameId: function () {
                        return "string";
                    },
                    examples: function () { return []; },
                    properties: function () { return []; },
                    facets: function () { return []; },
                    allProperties: function () { return []; },
                    isObject: function () { return false; },
                    isArray: function () { return false; },
                    isBoolean: function () { return false; },
                    isBuiltIn: function () { return false; },
                    hasExternalInHierarchy: function () { return false; },
                    isString: function () { return false; },
                    isNumber: function () { return false; },
                    isUnion: function () { return false; },
                    componentType: function () { return null; },
                    union: function () { return null; },
                    isRequired: function () { return true; },
                    leftType: function () { return null; },
                    rightType: function () { return null; },
                    superTypes: function () { return []; },
                    adapters: [],
                    universe: function () {
                        return h.definition().universe();
                    }
                }, x));
            }
        });
        h = h.parent();
    }
    return result;
}
exports.uriParameters = uriParameters;
function gatherMethods(h, result) {
    h.elements().forEach(function (x) {
        var p = x.property();
        if (p) {
            if (p.nameId() == "resources") {
                gatherMethods(x, result);
            }
            if (p.nameId() == "methods") {
                result.push(x);
            }
        }
    });
}
exports.gatherMethods = gatherMethods;
var TreeLike = (function () {
    function TreeLike(id) {
        this.children = {};
        this.values = [];
        this.id = id;
    }
    TreeLike.prototype.addItem = function (items, position, i) {
        if (position >= items.length) {
            this.values.push(i);
            return;
        }
        var name = items[position];
        var ch = this.children[name];
        if (!ch) {
            ch = new TreeLike(name);
            this.children[name] = ch;
        }
        ch.addItem(items, position + 1, i);
    };
    TreeLike.prototype.allChildren = function () {
        var _this = this;
        var result = [];
        result = result.concat(this.values);
        Object.keys(this.children).forEach(function (x) {
            var c = _this.children[x];
            result.push(c);
        });
        return result;
    };
    TreeLike.prototype.optimizeStructure = function () {
        var _this = this;
        var c = Object.keys(this.children);
        Object.keys(this.children).forEach(function (x) {
            var c = _this.children[x];
            c.optimizeStructure();
            var k = Object.keys(c.children);
            if (k.length == 0 && c.values.length == 1) {
                delete _this.children[x];
                c.values.forEach(function (x) {
                    if (x.$name) {
                        x.$name = c.id + " " + x.$name;
                    }
                    else
                        x.$name = c.id;
                    _this.values.push(x);
                });
            }
        });
        if (this.values.length > 12) {
            this.values = collapseValues(this.values);
        }
        optimizeLabels(this.values);
    };
    return TreeLike;
}());
exports.TreeLike = TreeLike;
function collapseValues(v) {
    var labelToMethods = {};
    v.forEach(function (m) {
        var lab = label(m);
        if (lab == "Get your deposits history") {
            console.log("A");
        }
        var words = keywords.keywords(lab);
        words.forEach(function (x) {
            if (x.length <= 3) {
                return;
            }
            x = x.toLowerCase();
            var r = labelToMethods[x];
            if (!r) {
                r = [];
                labelToMethods[x] = r;
            }
            r.push(m);
        });
    });
    keywords.tryMergeToPlurals(labelToMethods);
    keywords.removeZombieGroups(labelToMethods);
    keywords.removeHighlyIntersectedGroups(labelToMethods);
    var sorted = Object.keys(labelToMethods).sort(function (x, y) {
        return labelToMethods[x].length - labelToMethods[y].length;
    });
    var q = new Map();
    var result = [];
    for (var i = sorted.length - 1; i >= 0; i--) {
        var key = sorted[i];
        var values = labelToMethods[key];
        if (values.length <= 2) {
            continue;
        }
        if (values.length < v.length - 2) {
            var t = new TreeLike(key);
            values.forEach(function (x) {
                t.values.push(x);
                q.set(x, 1);
            });
            result.push(t);
        }
    }
    v.forEach(function (x) {
        if (!q.has(x)) {
            result.push(x);
        }
    });
    return result;
}
exports.collapseValues = collapseValues;
function label(x) {
    var a = x.attrs();
    var b = null;
    var result = "";
    var pr = x.property();
    var mm = x;
    if (mm.label) {
        return mm.label;
    }
    var isMethod = pr && pr.nameId() == "methods";
    for (var i = 0; i < a.length; i++) {
        if (a[i].name() == "displayName") {
            var v = a[i].value();
            if (x.$name) {
                result = v + " " + x.$name;
                break;
            }
            else {
                result = v;
                break;
            }
        }
        if (isMethod && a[i].name() == "description") {
            b = a[i].value();
        }
    }
    if (!result) {
        if (x.$name) {
            return b + " " + x.$name;
        }
        result = b;
    }
    if (!result) {
        if (isMethod) {
            result = resourceUrl(x.parent());
        }
        else {
            result = x.name();
        }
    }
    if (isMethod && result.indexOf(' ') == -1) {
        if (b) {
            var tr = keywords_1.trimDesc(b);
            if (tr.indexOf("...") == -1 && tr.indexOf(' ') != -1) {
                result = tr;
            }
        }
    }
    result = keywords.trimDesc(result);
    mm.label = result;
    return result;
}
exports.label = label;
function groupTypes(types) {
    var root = new TreeLike("");
    types.forEach(function (x) {
        var structure = [];
        var ld = x.localType();
        if (ld.isUnion()) {
            structure.push("!!union");
        }
        else if (ld.isObject()) {
            structure.push("!!object");
        }
        else if (ld.isArray()) {
            structure.push("!!array");
        }
        else {
            structure.push("!!scalar");
        }
        root.addItem(structure, 0, x);
    });
    if (root.values.length == 0) {
        if (Object.keys(root.children).length == 1) {
            return root.children[Object.keys(root.children)[0]];
        }
    }
    return root;
}
exports.groupTypes = groupTypes;
function groupMethods(methods) {
    var root = new TreeLike("");
    methods.forEach(function (x) {
        var structure = logicalStructure(x);
        root.addItem(structure, 0, x);
    });
    root.optimizeStructure();
    return root;
}
exports.groupMethods = groupMethods;
function optimizeLabels(methods) {
    var mtl = {};
    methods.forEach(function (x) {
        if (x instanceof TreeLike) {
            return;
        }
        var lab = label(x);
        var rs = mtl[lab];
        if (!rs) {
            rs = [];
            mtl[lab] = rs;
        }
        rs.push(x);
    });
    Object.keys(mtl).forEach(function (k) {
        var s = mtl[k];
        if (s.length > 1) {
            s.forEach(function (v) { return addUrlToLabel(v); });
        }
    });
}
exports.optimizeLabels = optimizeLabels;
function addUrlToLabel(h) {
    var url = resourceUrl(h.parent());
    if (h.label.indexOf(url) == -1) {
        h.label = h.label + " " + url;
    }
}
function prepareNodes(nodes) {
    var nodesToRender = [];
    nodes.forEach(function (v) {
        if (v.property && v.property() && v.property().nameId() == "annotations") {
            var node = v.value().toHighLevel();
            if (node != null) {
                nodesToRender.push(node);
            }
        }
        else {
            nodesToRender.push(v);
        }
    });
    nodesToRender.sort(function (x, y) {
        var g1 = group(x);
        var g2 = group(y);
        if (g1 != g2) {
            return g1 - g2;
        }
        return x.name().toLowerCase().localeCompare(y.name().toLowerCase());
    });
    return exports.collapseScalarArrays(nodesToRender);
}
exports.prepareNodes = prepareNodes;
exports.collapseScalarArrays = function (nodesToRender) {
    var resultNodes = [];
    var mp = null;
    for (var i = 0; i < nodesToRender.length; i++) {
        var n = nodesToRender[i];
        if (n.property && n.property() && n.property().isKey()) {
            continue;
        }
        if (mp) {
            var merged = false;
            if (mp.property() === n.property() && isJoinable(n)) {
                if (!(mp instanceof MergedNode)) {
                    if (typeof mp.value() === "string" && typeof n.value() === "string") {
                        var mn = new MergedNode(mp.property(), mp.definition(), [mp.value(), n.value()], mp.name());
                        mp = mn;
                        merged = true;
                    }
                }
                else {
                    if (typeof n.value() == "string") {
                        mp.vl.push(n.value());
                        merged = true;
                    }
                }
            }
            if (!merged) {
                resultNodes.push(mp);
                mp = n;
            }
        }
        else {
            mp = n;
        }
    }
    if (mp != null) {
        resultNodes.push(mp);
    }
    return resultNodes;
};

},{"./keywords":3}],3:[function(require,module,exports){
"use strict";
function isLetter(c) {
    return c.toLowerCase() != c.toUpperCase();
}
var digits = {
    "0": true,
    "1": true,
    "2": true,
    "3": true,
    "4": true,
    "5": true,
    "6": true,
    "7": true,
    "8": true,
    "9": true,
};
var blackList = {};
function isDigit(c) {
    return digits[c];
}
var list = ["that",
    "with",
    "they",
    "have",
    "this",
    "from",
    "what",
    "some",
    "other",
    "were",
    "there",
    "when",
    "your",
    "said",
    "each",
    "which",
    "their",
    "will",
    "about",
    "many",
    "then",
    "them",
    "would",
    "these",
    "thing",
    "more",
    "could",
    "come",
    "most",
    "over",
    "know",
    "than",
    "been",
    "where",
    "after",
    "back",
    "every",
    "good",
    "under",
    "very",
    "through",
    "before",
    "also"];
list.forEach(function (x) {
    blackList[x] = 1;
});
function keywords(s, ignoreFirst) {
    if (ignoreFirst === void 0) { ignoreFirst = true; }
    var words = [];
    var cword = null;
    for (var i = 0; i < s.length; i++) {
        var c = s.charAt(i);
        if (isLetter(c) || isDigit(c) || ((c != ' ' && c != '\r' && c != '\n') && cword != null && i < s.length - 1 && (isLetter(s.charAt(i + 1) || isDigit(s.charAt(i + 1)))))) {
            if (cword == null) {
                cword = [];
            }
            cword.push(c);
        }
        else {
            if (cword != null) {
                if (ignoreFirst) {
                    ignoreFirst = false;
                }
                else {
                    var cwordString = cword.join("");
                    if (cword.length > 3) {
                        if (!blackList[cwordString]) {
                            words.push(cwordString);
                            if (words.length > 5) {
                                break;
                            }
                        }
                    }
                }
            }
            cword = null;
        }
    }
    if (cword != null) {
        var cwordString = cword.join("");
        if (cword.length > 3) {
            if (!blackList[cwordString]) {
                words.push(cwordString);
            }
        }
    }
    return words;
}
exports.keywords = keywords;
function removeZombieGroups(labelToMethods) {
    Object.keys(labelToMethods).forEach(function (x) {
        if (labelToMethods[x].length <= 2) {
            delete labelToMethods[x];
        }
    });
}
exports.removeZombieGroups = removeZombieGroups;
var methodToKeyWords = function (labelToMethods) {
    var methodToKeywords = new Map();
    Object.keys(labelToMethods).forEach(function (x) {
        labelToMethods[x].forEach(function (m) {
            if (methodToKeywords.has(m)) {
                methodToKeywords.get(m).push(x);
            }
            else {
                var s = [x];
                methodToKeywords.set(m, s);
            }
        });
    });
    return methodToKeywords;
};
function removeHighlyIntersectedGroups(labelToMethods) {
    var keys = Object.keys(labelToMethods);
    var methodToKeywords = methodToKeyWords(labelToMethods);
    var changed = false;
    keys.forEach(function (x) {
        var methods = labelToMethods[x];
        var ks = null;
        methods.forEach(function (m) {
            var keywords = methodToKeywords.get(m);
            if (ks == null) {
                ks = keywords;
            }
            else {
                ks = ks.filter(function (x) { return keywords.indexOf(x) != -1; });
            }
        });
        ks = ks.filter(function (w) { return w != x; });
        if (ks.length > 0) {
            var maxGroup = null;
            ks.forEach(function (g) {
                var gm = labelToMethods[g];
                if (!gm) {
                    return;
                }
                if (maxGroup == null) {
                    maxGroup = g;
                }
                else if (labelToMethods[maxGroup].length < gm.length) {
                    maxGroup = g;
                }
            });
            if (maxGroup) {
                var ms = labelToMethods[maxGroup];
                if (ms.length == methods.length) {
                }
                delete labelToMethods[x];
                changed = true;
            }
        }
    });
    if (changed) {
        methodToKeywords = methodToKeyWords(labelToMethods);
    }
    var sorted = Object.keys(labelToMethods).sort(function (x, y) {
        return labelToMethods[x].length - labelToMethods[y].length;
    });
    sorted.forEach(function (x) {
        var intersectionCount = 0;
        var methods = labelToMethods[x];
        if (!methods) {
            return;
        }
        methods.forEach(function (m) {
            var kv = methodToKeywords.get(m);
            if (kv.length > 1) {
                intersectionCount++;
            }
        });
        var total = methods.length;
        var remove = 0;
        var stat;
        if (total < 4) {
            stat = intersectionCount / total >= 0.55;
        }
        else {
            stat = intersectionCount / total > 0.84;
        }
        if (stat) {
            delete labelToMethods[x];
            methodToKeywords = methodToKeyWords(labelToMethods);
        }
    });
}
exports.removeHighlyIntersectedGroups = removeHighlyIntersectedGroups;
function tryMergeToPlurals(val) {
    Object.keys(val).forEach(function (x) {
        if (x.charAt(x.length - 1) == 's') {
            var op1 = x.substring(0, x.length - 1);
            if (val[op1]) {
                val[x] = val[x].concat(val[op1]);
                delete val[op1];
                return;
            }
            if (op1.charAt(op1.length - 1) == "'") {
                var sm = x.substring(0, op1.length - 1) + "s";
                if (val[sm]) {
                    val[sm] = val[sm].concat(val[x]);
                    delete val[x];
                    return;
                }
            }
            if (op1.charAt(op1.length - 1) == 'e') {
                op1 = x.substring(0, op1.length - 1);
            }
            if (val[op1]) {
                val[x] = val[x].concat(val[op1]);
                delete val[op1];
                return;
            }
            if (op1.charAt(op1.length - 1) == 'i') {
                op1 = x.substring(0, op1.length - 1) + "y";
            }
            if (val[op1]) {
                val[x] = val[x].concat(val[op1]);
                delete val[op1];
            }
        }
    });
}
exports.tryMergeToPlurals = tryMergeToPlurals;
function trimDesc(s) {
    var words = [];
    var cword = null;
    if (s.charAt(0) == '[') {
        var ll = s.indexOf(']');
        if (ll != -1) {
            return s.substring(1, ll);
        }
    }
    for (var i = 0; i < s.length; i++) {
        var c = s.charAt(i);
        if (isLetter(c) || isDigit(c)) {
            if (cword == null) {
                cword = [];
            }
            cword.push(c);
        }
        else {
            if (cword != null) {
                var cwordString = cword.join("");
                if (cword.length > 3) {
                    if (!blackList[cwordString]) {
                        words.push(cwordString);
                    }
                }
            }
            cword = null;
            if (c == '(') {
                if (words.length >= 3) {
                    return s.substring(0, i);
                }
            }
            if (c == '.' || c == ';' || c == '\n' || c == '\r' || c == "<") {
                if (c == '.') {
                    if (i < s.length - 1) {
                        var q = c.charAt(i + 1);
                        if (isDigit(q) || isLetter(c)) {
                            continue;
                        }
                    }
                }
                if (words.length >= 2) {
                    return s.substring(0, i);
                }
            }
            if (i > 100) {
                return s.substring(0, i) + "...";
            }
        }
    }
    return s;
}
exports.trimDesc = trimDesc;

},{}],4:[function(require,module,exports){
"use strict";
exports.usages = {
    usageRegistry: null
};
var locationToItem = {};
function reportData(n) {
    n.apis.forEach(function (x) {
        locationToItem[x.location] = x;
    });
    n.libraries.forEach(function (x) {
        locationToItem[x.location] = x;
    });
}
var numToFile = {};
function loadedUsageData(d) {
    exports.usages.usageRegistry = d;
    Object.keys(exports.usages.usageRegistry.fileToNum).forEach(function (x) {
        numToFile[exports.usages.usageRegistry.fileToNum[x]] = x;
    });
}
var gurl = null;
function setUrl(url) {
    console.log(url);
    gurl = url;
}
exports.setUrl = setUrl;
function getUsages(isType, name) {
    var iN = (isType ? "T" : "A") + name;
    var num = exports.usages.usageRegistry.fileToNum[gurl];
    if (num) {
        var entry = exports.usages.usageRegistry.usages[num];
        if (entry) {
            var result = entry.usages[iN];
            if (result) {
                var aRes = {};
                Object.keys(result.usage).forEach(function (x) {
                    aRes[numToFile[x]] = result.usage[x];
                });
                return aRes;
            }
        }
    }
    return null;
}
exports.getUsages = getUsages;
function getTitle(url) {
    if (locationToItem[url]) {
        var ver = locationToItem[url].version;
        return locationToItem[url].name + (ver ? (("(") + ver + ")") : "");
    }
    return url;
}
exports.getTitle = getTitle;
function loadData(url, c) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4)
            return;
        var data = JSON.parse(xhr.responseText);
        c(data, xhr.status);
    };
}
var GroupNode = (function () {
    function GroupNode() {
    }
    return GroupNode;
}());
exports.GroupNode = GroupNode;
var ApiWithVersions = (function () {
    function ApiWithVersions() {
    }
    return ApiWithVersions;
}());
exports.ApiWithVersions = ApiWithVersions;
function groupBy(els, f) {
    var result = {};
    els.forEach(function (x) {
        var group = f(x);
        if (result[group]) {
            result[group].push(x);
        }
        else {
            result[group] = [];
            result[group].push(x);
        }
    });
    return result;
}
var LoadedRegistry = (function () {
    function LoadedRegistry(registry) {
        this.registry = registry;
    }
    LoadedRegistry.prototype.findNodeWithUrl = function (url) {
        if (!this._apis) {
            this.apis();
        }
        var apis = this._apis;
        if (!apis) {
            this.apis();
        }
        var f = this.find(apis, url);
        if (f) {
            return f;
        }
        var f = this.find(this.libraries(), url);
        return f;
    };
    LoadedRegistry.prototype.find = function (apis, url) {
        for (var i = 0; i < apis.length; i++) {
            if (apis[i] instanceof ApiWithVersions) {
                var w = apis[i];
                for (var j = 0; j < w.versions.length; j++) {
                    if (w.versions[j].location == url) {
                        return w;
                    }
                }
            }
            else {
                var gn = apis[i];
                var res = this.find(gn.children, url);
                if (res) {
                    return res;
                }
            }
        }
    };
    LoadedRegistry.prototype.mergeVersions = function (els, merge) {
        var _this = this;
        var groups = groupBy(els, function (x) { return x.name; });
        var groupNodes = [];
        Object.keys(groups).forEach(function (gr) {
            var g = new ApiWithVersions();
            if (merge) {
                _this._apiCount++;
            }
            g.name = gr;
            g.versions = groups[gr];
            g.icon = g.versions[0].icon;
            groupNodes.push(g);
        });
        return groupNodes;
    };
    LoadedRegistry.prototype.libraries = function () {
        if (this._libs) {
            return this._libs;
        }
        var els = this.registry.libraries;
        this._libs = this.group(els, false);
        return this._libs;
    };
    LoadedRegistry.prototype.apis = function () {
        if (this._apis) {
            return this._apis;
        }
        this._apiCount = 0;
        var els = this.registry.apis;
        this._apis = this.group(els, true);
        return this._apis;
    };
    LoadedRegistry.prototype.group = function (els, merge) {
        var _this = this;
        var groups = groupBy(els, function (x) { return x.org ? x.org : x.name; });
        var groupNodes = [];
        Object.keys(groups).forEach(function (gr) {
            var g = new GroupNode();
            g.name = gr;
            g.children = _this.mergeVersions(groups[gr], merge);
            groupNodes.push(g);
        });
        var result = [];
        groupNodes.forEach(function (x) {
            if (x.children.length == 1) {
                result.push(x.children[0]);
            }
            else {
                result.push(x);
                var v = x.children[0];
                x.icon = v.icon;
            }
        });
        return result;
    };
    LoadedRegistry.prototype.apiCount = function () {
        return this._apiCount;
    };
    LoadedRegistry.prototype.specCount = function () {
        return this.registry.apis.length + this.registry.libraries.length;
    };
    return LoadedRegistry;
}());
exports.LoadedRegistry = LoadedRegistry;
function getInstance(url, f) {
    var usageUrl = url.substr(0, url.lastIndexOf('/')) + "/registry-usages.json";
    loadData(url, function (d, s) {
        reportData(d);
        var lr = new LoadedRegistry(d);
        f(lr, s);
    });
    loadData(usageUrl, function (data, s) {
        loadedUsageData(data);
    });
}
exports.getInstance = getInstance;

},{}],5:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var workbench = require("./framework/workbench");
var controls_1 = require("./framework/controls");
var tr = require("./rendering/typeRender");
var rr = require("./rendering/resourceRender");
var rc = require("./core/registryCore");
var RAMLDetailsView = (function (_super) {
    __extends(RAMLDetailsView, _super);
    function RAMLDetailsView(id, title) {
        _super.call(this, id, title);
        this.compact = true;
        var v = this;
        this.toolbar.add({
            title: "",
            image: "glyphicon glyphicon-asterisk",
            checked: this.compact,
            run: function () {
                v.compact = !v.compact;
                v.refresh();
                v.init(v.holder);
            }
        });
    }
    RAMLDetailsView.prototype.setInput = function (v) {
        this._element = v;
        this.refresh();
    };
    RAMLDetailsView.prototype.innerRender = function (e) {
        e.style.overflow = "auto";
        if (this._element && this._element.property) {
            if (this._element.property().nameId() == "types" || this._element.property().nameId() == "annotationTypes") {
                var rnd = new tr.TypeRenderer(this.compact, null, false, this._element.property().nameId() == "annotationTypes");
                rnd.setGlobal(true);
                rnd.setUsages(rc.getUsages(this._element.property().nameId() == "types", this._element.name()));
                var cnt = rnd.render(this._element);
            }
            else {
                if (this._element.property().nameId() == "resources") {
                    var cnt = new rr.ResourceRenderer(this.compact).render(this._element);
                }
                if (this._element.property().nameId() == "methods") {
                    var cnt = new rr.MethodRenderer(this.compact, true, true, false, true).render(this._element);
                }
            }
            new controls_1.Label(this._element.name(), cnt).render(e);
        }
        else {
            e.innerHTML = "";
        }
        $('[data-toggle="tooltip"]').tooltip();
        $('pre code').each(function (i, block) {
            hljs.highlightBlock(block);
        });
    };
    return RAMLDetailsView;
}(workbench.ViewPart));
module.exports = RAMLDetailsView;

},{"./core/registryCore":4,"./framework/controls":6,"./framework/workbench":7,"./rendering/resourceRender":11,"./rendering/typeRender":13}],6:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ToolbarRenderer = (function () {
    function ToolbarRenderer(menu) {
        this.menu = menu;
    }
    ToolbarRenderer.prototype.render = function (host) {
        this.menu.items.forEach(function (x) {
            var button = document.createElement("button");
            button.classList.add("btn");
            button.classList.add("btn-xs");
            if (x.checked) {
                button.classList.add("btn-success");
            }
            else {
                button.classList.add("btn-primary");
            }
            button.textContent = x.title;
            if (x.image) {
                button.innerHTML = "<span class=\"" + x.image + "\">" + x.title + "</span>";
            }
            if (x.run) {
                button.onclick = x.run;
            }
            host.appendChild(button);
        });
    };
    return ToolbarRenderer;
}());
exports.ToolbarRenderer = ToolbarRenderer;
var DrowpdownMenu = (function () {
    function DrowpdownMenu(menu) {
        this.menu = menu;
    }
    DrowpdownMenu.prototype.render = function (host) {
        this.menu.items.forEach(function (x) {
            var li = document.createElement("li");
            li.setAttribute("role", "presentation");
            if (x.disabled) {
                li.classList.add("disabled");
            }
            var a = document.createElement("a");
            a.setAttribute("role", "menuitem");
            if ((x).run) {
                a.onclick = (x).run;
            }
            if (x.checked) {
                a.innerHTML = x.title + "<span class='glyphicon glyphicon-ok' style='float: right'></span>";
            }
            else {
                a.innerHTML = x.title;
            }
            li.appendChild(a);
            host.appendChild(li);
        });
    };
    return DrowpdownMenu;
}());
exports.DrowpdownMenu = DrowpdownMenu;
var Context = (function () {
    function Context(menu) {
        this.menu = menu;
    }
    Context.prototype.render = function (host) {
        this.menu.items.forEach(function (x) {
            var li = document.createElement("li");
            if (x.disabled) {
                li.classList.add("disabled");
            }
            var a = document.createElement("a");
            if ((x).run) {
                a.onclick = (x).run;
            }
            a.innerHTML = x.title;
            li.appendChild(a);
            host.appendChild(li);
        });
    };
    return Context;
}());
exports.Context = Context;
var Composite = (function () {
    function Composite() {
        this.children = [];
    }
    Composite.prototype.render = function (e) {
        this._element = e;
        this.innerRender(e);
    };
    Composite.prototype.refresh = function () {
        if (this._element) {
            this.innerRender(this._element);
        }
    };
    Composite.prototype.add = function (c) {
        this.children.push(c);
        this.refresh();
    };
    Composite.prototype.remove = function (c) {
        this.children = this.children.filter(function (x) { return x != c; });
        this.refresh();
    };
    Composite.prototype.dispose = function () {
        this._element = null;
        this.children.forEach(function (x) {
            if (x.dispose) {
                x.dispose();
            }
        });
    };
    Composite.prototype.setTitle = function (title) {
        this._title = title;
    };
    Composite.prototype.title = function () {
        return this._title;
    };
    return Composite;
}());
exports.Composite = Composite;
var globalId = 0;
function nextId() {
    return "el" + (globalId++);
}
var Loading = (function (_super) {
    __extends(Loading, _super);
    function Loading() {
        _super.apply(this, arguments);
    }
    Loading.prototype.innerRender = function (e) {
        e.innerHTML = "<div style=\"display: flex;flex: 1 1 0; flex-direction: column;justify-content: center;\"><div style=\"display: flex;flex-direction: row;justify-content: center\"><div><div>Loading...</div><img src='./lib/progress.gif'/></div></div></div>";
    };
    return Loading;
}(Composite));
exports.Loading = Loading;
var Label = (function (_super) {
    __extends(Label, _super);
    function Label(title, content) {
        _super.call(this);
        this.content = content;
        this.setTitle(title);
    }
    Label.prototype.innerRender = function (e) {
        if (this.content) {
            e.innerHTML = "<span style=\"padding: 5px;overflow: auto\">" + this.content + "</span>";
        }
        else {
            e.innerHTML = "<span>" + this.title() + "</span>";
        }
    };
    return Label;
}(Composite));
exports.Label = Label;
var Accordition = (function (_super) {
    __extends(Accordition, _super);
    function Accordition() {
        _super.apply(this, arguments);
        this.disabled = {};
    }
    Accordition.prototype.expand = function (c) {
        var index = this.children.indexOf(c);
        this.expandIndex(index);
    };
    Accordition.prototype.getSelectedIndex = function () {
        return this.selectedIndex;
    };
    Accordition.prototype.getSelectedTitle = function () {
        if (this.selectedIndex != undefined) {
            return this.children[this.selectedIndex].title();
        }
    };
    Accordition.prototype.getSelectedTitleId = function () {
        if (this.selectedIndex != undefined) {
            var c = this.children[this.selectedIndex];
            return c.controlId ? c.controlId : c.title();
        }
    };
    Accordition.prototype.expandIndex = function (index) {
        var bids = this.bids;
        var gids = this.gids;
        this.selectedIndex = index;
        for (var j = 0; j < bids.length; j++) {
            if (j != index) {
                document.getElementById(bids[j]).style.display = "none";
                document.getElementById(gids[j]).style.flex = null;
            }
            else {
                document.getElementById(bids[j]).style.display = "flex";
                document.getElementById(gids[j]).style.flex = "1 1 0";
                document.getElementById(gids[j]).style.display = "flex";
            }
        }
    };
    Accordition.prototype.getHeader = function (c) {
        var positon = this.children.indexOf(c);
        if (positon = -1) {
            return null;
        }
        return document.getElementById(this.headings[positon]);
    };
    Accordition.prototype.disable = function (c) {
        var positon = this.children.indexOf(c);
        if (positon == -1) {
            return null;
        }
        document.getElementById(this.headings[positon]).style.color = "gray";
        this.disabled[this.headings[positon]] = true;
    };
    Accordition.prototype.enable = function (c) {
        var positon = this.children.indexOf(c);
        if (positon == -1) {
            return null;
        }
        delete this.disabled[this.headings[positon]];
        document.getElementById(this.headings[positon]).style.color = "black";
    };
    Accordition.prototype.innerRender = function (e) {
        var _this = this;
        var topId = nextId();
        var templates = [];
        var headings = [];
        this.headings = headings;
        var bids = [];
        var gids = [];
        for (var i = 0; i < this.children.length; i++) {
            var elId = nextId();
            var hId = nextId();
            var bid = nextId();
            var gid = nextId();
            bids.push(elId);
            headings.push(hId);
            gids.push(gid);
            var styleExpanded = i == 0 ? "flex: 1 1 0" : "display: none";
            var expanded = i == 0;
            var s = "<div id=\"" + gid + "\" class=\"panel panel-default\" style=\"margin: 0px;" + styleExpanded + "; display: flex;flex-direction: column\">\n               <div class=\"panel-heading\" id=\"" + hId + "\">\n                <h4 class=\"panel-title\" style=\"display: inline\"><a>" + this.children[i].title() + "</a></h4>\n                <div style=\"float: right\" id=\"" + ("T" + hId) + "\"></div>\n            </div>\n            <div id=\"" + elId + "\"  style=\"flex: 1 1 auto;display: flex;flex-direction: column;" + styleExpanded + "\">\n            <div class=\"panel-body\" style=\"background: red;flex: 1 1\"><div id=\"" + bid + "\" style=\"background: green;\"></div></div>\n            </div>\n           </div>";
            templates.push(s);
        }
        var content = "<div class=\"panel-group\" id=\"" + topId + "\" style=\"margin: 0;padding: 0;display: flex;flex-direction: column;flex: 1 1 auto; height: 100%\">\n             " + templates.join('') + "       \n        </div>";
        e.innerHTML = content;
        for (var i = 0; i < this.children.length; i++) {
            var el = document.getElementById(bids[i]);
            this.children[i].render(el);
        }
        var i = 0;
        this.bids = bids;
        this.gids = gids;
        headings.forEach(function (x) {
            var panelId = bids[i];
            var containerId = gids[i];
            var k = i;
            if (_this.children[i].contextActions) {
                var tH = document.getElementById("T" + x);
                new ToolbarRenderer({ items: _this.children[i].contextActions }).render(tH);
            }
            document.getElementById(x).onclick = function () {
                if (!_this.disabled[x]) {
                    _this.expandIndex(k);
                }
            };
            i++;
        });
    };
    return Accordition;
}(Composite));
exports.Accordition = Accordition;

},{}],7:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var controls = require("./controls");
var globalId = 0;
function nextId() {
    return "split" + (globalId++);
}
exports.ToolbarRenderer = controls.ToolbarRenderer;
exports.Context = controls.Context;
exports.DrowpdownMenu = controls.DrowpdownMenu;
var LayoutPart = (function () {
    function LayoutPart(_el) {
        this._el = _el;
    }
    LayoutPart.prototype.splitHorizontal = function (sizes) {
        var fid = nextId();
        var nid = nextId();
        var content = "<div style=\"height: 100%\"><div  id=\"" + fid + "\" class=\"split split-horizontal\" style=\"height: 100%\"></div><div id=\"" + nid + "\" class=\"split split-horizontal\" style=\"height: 100%\"></div></div>";
        this._el.innerHTML = content;
        var r1 = new LayoutPart(document.getElementById(fid));
        var r2 = new LayoutPart(document.getElementById(nid));
        Split(["#" + fid, "#" + nid], {
            gutterSize: 8,
            cursor: 'col-resize',
            sizes: sizes
        });
        return [r1, r2];
    };
    LayoutPart.prototype.splitVertical = function (sizes) {
        var fid = nextId();
        var nid = nextId();
        var content = "<div id=\"" + fid + "\"  class=\"split\" ></div><div  id=\"" + nid + "\" class=\"split\"></div>";
        this._el.innerHTML = content;
        var r1 = new LayoutPart(document.getElementById(fid));
        var r2 = new LayoutPart(document.getElementById(nid));
        Split(["#" + fid, "#" + nid], {
            gutterSize: 8,
            sizes: sizes,
            direction: 'vertical',
            cursor: 'row-resize'
        });
        return [r1, r2];
    };
    LayoutPart.prototype.element = function () {
        return this._el;
    };
    return LayoutPart;
}());
exports.LayoutPart = LayoutPart;
var Pane = (function () {
    function Pane(_part) {
        this._part = _part;
    }
    Pane.prototype.setContextMenu = function (m) {
        this.contextMenuElement.innerHTML = "";
        new exports.DrowpdownMenu(m).render(this.contextMenuElement);
    };
    Pane.prototype.setViewMenu = function (m) {
        this.menuContentElement.innerHTML = "";
        if (m.items.length == 0) {
            this.viewMenuButton.setAttribute("style", "display:none");
        }
        else {
            this.viewMenuButton.setAttribute("style", "display:inherit");
        }
        new exports.DrowpdownMenu(m).render(this.menuContentElement);
    };
    Pane.prototype.setToolbar = function (m) {
        this.toolbarContentElement.innerHTML = "";
        new exports.ToolbarRenderer(m).render(this.toolbarContentElement);
    };
    Pane.prototype.addPart = function (v) {
        this._v = v;
        this.render();
    };
    Pane.prototype.render = function () {
        var hid = nextId();
        var bid = nextId();
        var mid = nextId();
        var menuId = nextId();
        var cmenuId = nextId();
        var cmenuInnerId = nextId();
        var tid = nextId();
        var searchId = nextId();
        var cmenu = "<div id='" + cmenuId + "'><ul class=\"dropdown-menu\"  id=\"" + cmenuInnerId + "\"role=\"menu\"  aria-labelledby=\"" + mid + "\"></ul></div>";
        var cnt = "<div style='display: flex;flex-direction: column;height: 100%;width: 99.9%;margin-bottom:0px;overflow: hidden' class=\"panel panel-primary\"><div id=\"" + hid + "\" class=\"panel-heading\" style=\"flex: 0 0 auto;display: flex\"></div>\n        <div class=\"panel-body\"  data-toggle=\"context\" data-target=\"#" + cmenuId + "\" style=\"flex: 1 1 auto;display: flex;overflow: hidden;margin: 0;padding: 0\" ><div style=\"width: 100%\" id=\"" + bid + "\"></div>" + cmenu + "</div></div>";
        this._part.element().innerHTML = cnt;
        var hel = document.getElementById(hid);
        var headerHtml = "<div style=\"display: flex;flex-direction: row;width: 100%\"><div style=\"flex:1 1 auto\">" + this._v.title() + "</div>";
        var searchHtml = "<input type=\"text\"style=\"color: black;border-radius: 3px;height: 23px;margin-right: 4px\" id=\"" + searchId + "\"/>";
        if (!this._v.searchable) {
            searchHtml = "";
        }
        var th = "<span id=\"" + tid + "\"></span>";
        var dropMenu = "<div class=\"dropdown\" style=\"flex: 0 0 auto\"/><button class=\"btn btn-primary dropdown-toggle btn-xs\" style=\"display: none\" type=\"button\" id=\"" + mid + "\" data-toggle=\"dropdown\">\n  <span class=\"caret\"></span></button>\n  <ul class=\"dropdown-menu dropdown-menu-left\" style=\"right: 0;left: auto\" role=\"menu\" id='" + menuId + "' aria-labelledby=\"" + mid + "\"/></div>";
        headerHtml = headerHtml + searchHtml + th + dropMenu + "</div>";
        hel.innerHTML = headerHtml;
        this.menuContentElement = document.getElementById(menuId);
        this.toolbarContentElement = document.getElementById(tid);
        this.contextMenuElement = document.getElementById(cmenuInnerId);
        this.viewMenuButton = document.getElementById(mid);
        var bel = document.getElementById(bid);
        if (this._v) {
            this._v.render(bel);
        }
        if (this._v.init) {
            this._v.init(this);
        }
        var pe = this._part.element();
        function handleResize() {
            var h = hel.getBoundingClientRect().height;
            bel.style.minHeight = "50px";
            bel.style.display = "flex";
            bel.style.flexDirection = "column";
        }
        pe.addEventListener("resize", handleResize);
        if (this._v.searchable) {
            var ie = document.getElementById(searchId);
            var view = this._v;
            ie.onkeyup = function () {
                setTimeout(function () {
                    view.onSearch(ie.value);
                }, 200);
            };
        }
        handleResize();
    };
    return Pane;
}());
var ContributionManager = (function () {
    function ContributionManager(onChange) {
        this.onChange = onChange;
        this.menu = { items: [] };
    }
    ContributionManager.prototype.add = function (item) {
        this.menu.items.push(item);
        this.onChange(this.menu);
    };
    ContributionManager.prototype.remove = function (item) {
        this.menu.items = this.menu.items.filter(function (x) { return x != item; });
        this.onChange(this.menu);
    };
    return ContributionManager;
}());
exports.ContributionManager = ContributionManager;
var nh = {
    setViewMenu: function (m) { },
    setToolbar: function (m) { },
    setContextMenu: function (m) { }
};
var ViewPart = (function () {
    function ViewPart(_id, _title) {
        var _this = this;
        this._id = _id;
        this._title = _title;
        this.holder = nh;
        this.selection = [];
        this.selectionListeners = [];
        this.contextMenu = new ContributionManager(function (m) { return _this.holder.setContextMenu(m); });
        this.toolbar = new ContributionManager(function (m) { return _this.holder.setToolbar(m); });
        this.viewMenu = new ContributionManager(function (m) { return _this.holder.setViewMenu(m); });
    }
    ViewPart.prototype.addSelectionConsumer = function (t) {
        this.addSelectionListener({
            selectionChanged: function (v) {
                if (v.length > 0) {
                    t.setInput(v[0]);
                }
                else {
                    t.setInput(null);
                }
            }
        });
    };
    ViewPart.prototype.getContextMenu = function () {
        return this.contextMenu;
    };
    ViewPart.prototype.getToolbar = function () {
        return this.toolbar;
    };
    ViewPart.prototype.getViewMenu = function () {
        return this.viewMenu;
    };
    ViewPart.prototype.getHolder = function () {
        return this.holder;
    };
    ViewPart.prototype.addSelectionListener = function (l) {
        this.selectionListeners.push(l);
    };
    ViewPart.prototype.removeSelectionListener = function (l) {
        this.selectionListeners = this.selectionListeners.filter(function (x) { return x != l; });
    };
    ViewPart.prototype.getSelection = function () {
        return this.selection;
    };
    ViewPart.prototype.onSelection = function (v) {
        this.selection = v;
        this.selectionListeners.forEach(function (x) { return x.selectionChanged(v); });
    };
    ViewPart.prototype.title = function () {
        return this._title;
    };
    ViewPart.prototype.id = function () {
        return this._id;
    };
    ViewPart.prototype.init = function (holder) {
        this.holder = holder;
        this.holder.setViewMenu(this.viewMenu.menu);
        this.holder.setToolbar(this.toolbar.menu);
        this.holder.setContextMenu(this.contextMenu.menu);
    };
    ViewPart.prototype.render = function (e) {
        this.contentElement = e;
        this.innerRender(e);
    };
    ViewPart.prototype.refresh = function () {
        if (this.contentElement) {
            this.innerRender(this.contentElement);
        }
    };
    ViewPart.prototype.dispose = function () {
        this.contentElement = null;
    };
    return ViewPart;
}());
exports.ViewPart = ViewPart;
function buildTreeNode(x, t, l, selection) {
    var nodes = t.children(x).map(function (n) { return buildTreeNode(n, t, l, selection); });
    if (nodes.length == 0) {
        nodes = undefined;
    }
    var icon = undefined;
    if (l.icon) {
        icon = l.icon(x);
    }
    var selected = selection.indexOf(x) != -1;
    return {
        original: x,
        text: l.label(x),
        icon: icon,
        nodes: nodes,
        state: {
            selected: selected
        }
    };
}
var ArrayContentProvider = (function () {
    function ArrayContentProvider() {
    }
    ArrayContentProvider.prototype.children = function (x) {
        return [];
    };
    ArrayContentProvider.prototype.elements = function (x) {
        return x;
    };
    return ArrayContentProvider;
}());
exports.ArrayContentProvider = ArrayContentProvider;
var ContentProviderProxy = (function () {
    function ContentProviderProxy(_inner) {
        this._inner = _inner;
        this.filters = [];
    }
    ContentProviderProxy.prototype.elements = function (x) {
        var _this = this;
        var rs = this._inner.elements(x).filter(function (x) {
            var accept = true;
            _this.filters.forEach(function (x) { return accept = accept && x.accept(x); });
            return accept;
        });
        if (this.sorter) {
            return rs.sort(function (x, y) { return _this.sorter.compare(x, y); });
        }
        return rs;
    };
    ContentProviderProxy.prototype.children = function (x) {
        var _this = this;
        var rs = this._inner.children(x).filter(function (x) {
            var accept = true;
            _this.filters.forEach(function (x) { return accept = accept && x.accept(x); });
            return accept;
        });
        if (this.sorter) {
            return rs.sort(function (x, y) { return _this.sorter.compare(x, y); });
        }
        return rs;
    };
    return ContentProviderProxy;
}());
exports.ContentProviderProxy = ContentProviderProxy;
var BasicSorter = (function () {
    function BasicSorter() {
    }
    BasicSorter.prototype.init = function (v) {
        this._labelProvider = v.labelProvider;
    };
    BasicSorter.prototype.compare = function (a, b) {
        var l1 = this._labelProvider.label(a);
        var l2 = this._labelProvider.label(b);
        return l1.localeCompare(l2);
    };
    return BasicSorter;
}());
exports.BasicSorter = BasicSorter;
function findNodeNoRecursion(nodes, v) {
    for (var i = 0; i < nodes.length; i++) {
        var ch = nodes[i];
        if (ch.original === v) {
            return ch;
        }
    }
    return null;
}
function findNode(nodes, v) {
    for (var i = 0; i < nodes.length; i++) {
        var ch = nodes[i];
        if (ch.original === v) {
            return ch;
        }
        if (ch.nodes) {
            var n = findNode(ch.nodes, v);
            if (n) {
                return n;
            }
        }
    }
    return null;
}
var TreeView = (function (_super) {
    __extends(TreeView, _super);
    function TreeView() {
        _super.apply(this, arguments);
        this.searchable = true;
    }
    TreeView.prototype.setSorter = function (s) {
        this.contentProvider.sorter = s;
        s.init(this);
        this.refresh();
    };
    TreeView.prototype.addFilter = function (f) {
        this.contentProvider.filters.push(f);
        this.refresh();
    };
    TreeView.prototype.removeFilter = function (f) {
        this.contentProvider.filters = this.contentProvider.filters.filter(function (x) { return x != f; });
        this.refresh();
    };
    TreeView.prototype.select = function (model) {
        var vs = $('#' + this.treeId).treeview(true);
        var n = findNode(vs.all(), model);
        if (n) {
            this.selection = [model];
            this.refresh();
            $('#' + this.treeId).treeview("revealNode", n);
        }
    };
    TreeView.prototype.hasModel = function (model) {
        if (!this.treeNodes) {
            this.getTree();
        }
        if (findNode(this.treeNodes, model)) {
            return true;
        }
        return false;
    };
    TreeView.prototype.onSearch = function (s) {
        if (!this.treeId) {
            return false;
        }
        this.pattern = s;
        $('#' + this.treeId).treeview("search", s, { revealResults: true });
        return this.afterSearch(s);
    };
    TreeView.prototype.afterSearch = function (s) {
        var lst = document.getElementById(this.treeId).getElementsByTagName("li");
        var parents = {};
        var found = false;
        for (var i = 0; i < lst.length; i++) {
            var el = lst.item(i);
            if (el.classList.contains("search-result")) {
                el.style.display = "inherit";
                found = true;
                var id = el.attributes.getNamedItem("data-nodeid").value;
                var rs = $('#' + this.treeId).treeview("getParent", parseInt(id));
                parents[rs.nodeId] = true;
                while (rs.parentId !== undefined) {
                    parents[rs.parentId] = true;
                    rs = $('#' + this.treeId).treeview("getParent", rs.parentId);
                    parents[rs.nodeId] = true;
                }
            }
            else {
                el.style.display = s.length == 0 ? "inherit" : "none";
            }
        }
        for (var i = 0; i < lst.length; i++) {
            var el = lst.item(i);
            var id = el.attributes.getNamedItem("data-nodeid").value;
            if (parents[parseInt(id)]) {
                el.style.display = "inherit";
            }
        }
        return found;
    };
    TreeView.prototype.setContentProvider = function (i) {
        this.contentProvider = new ContentProviderProxy(i);
        this.refresh();
    };
    TreeView.prototype.setLabelProvider = function (l) {
        this.labelProvider = l;
        this.refresh();
    };
    TreeView.prototype.getInput = function () {
        return this.input;
    };
    TreeView.prototype.setInput = function (x) {
        this.input = x;
        this.refresh();
    };
    TreeView.prototype.innerRender = function (e) {
        var treeId = nextId();
        this.treeId = treeId;
        var view = this;
        e.innerHTML = "<div id='" + treeId + "' style='width:100%;overflow: auto;flex: 1 1 0; min-height: 50px;display: block'></div>";
        $('#' + treeId).treeview({ data: this.getTree(), expandIcon: "glyphicon glyphicon-chevron-right",
            onNodeSelected: function (x) {
                var sel = $('#' + treeId).treeview("getSelected");
                view.onSelection(sel.map(function (x) { return x.original; }));
            },
            onNodeExpanded: function (x) {
                var sel = $('#' + treeId).treeview("getSelected");
                if (view.pattern) {
                    view.afterSearch(view.pattern);
                }
            },
            collapseIcon: "glyphicon glyphicon-chevron-down", borderColor: "0xFFFFFF", levels: 0 });
        var sel = $('#' + treeId).treeview("getSelected");
        view.onSelection(sel.map(function (x) { return x.original; }));
    };
    TreeView.prototype.getTree = function () {
        var _this = this;
        if (this.input && this.contentProvider && this.labelProvider) {
            var els = this.contentProvider.elements(this.input);
            var nodes = els.map(function (x) { return buildTreeNode(x, _this.contentProvider, _this.labelProvider, _this.selection); });
            this.treeNodes = nodes;
            return nodes;
        }
        return [];
    };
    return TreeView;
}(ViewPart));
exports.TreeView = TreeView;
(function (Relation) {
    Relation[Relation["LEFT"] = 0] = "LEFT";
    Relation[Relation["RIGHT"] = 1] = "RIGHT";
    Relation[Relation["BOTTOM"] = 2] = "BOTTOM";
    Relation[Relation["TOP"] = 3] = "TOP";
    Relation[Relation["STACk"] = 4] = "STACk";
})(exports.Relation || (exports.Relation = {}));
var Relation = exports.Relation;
var Page = (function () {
    function Page(r) {
        this.panes = [];
        this.root = new LayoutPart(document.getElementById(r));
    }
    Page.prototype.addView = function (v, relatedTo, ratio, r) {
        var p = this.createPane(relatedTo, ratio, r);
        p.addPart(v);
    };
    Page.prototype.createPane = function (relatedTo, ratio, r) {
        if (this.panes.length == 0) {
            var p = new Pane(this.root);
            this.panes.push(p);
            return p;
        }
        var p = this.findPane(relatedTo);
        var newPart = null;
        var oldPart = null;
        if (r == Relation.LEFT) {
            var newParts = p._part.splitHorizontal([ratio, 100 - ratio]);
            newPart = newParts[0];
            oldPart = newParts[1];
        }
        if (r == Relation.RIGHT) {
            var newParts = p._part.splitHorizontal([100 - ratio, ratio]);
            newPart = newParts[1];
            oldPart = newParts[0];
        }
        if (r == Relation.BOTTOM) {
            var newParts = p._part.splitVertical([100 - ratio, ratio]);
            newPart = newParts[1];
            oldPart = newParts[0];
        }
        if (r == Relation.TOP) {
            var newParts = p._part.splitHorizontal([ratio, 100 - ratio]);
            newPart = newParts[0];
            oldPart = newParts[1];
        }
        p._part = oldPart;
        p.render();
        var newPane = new Pane(newPart);
        this.panes.push(newPane);
        return newPane;
    };
    Page.prototype.findPane = function (s) {
        for (var i = 0; i < this.panes.length; i++) {
            if (this.panes[i]._v) {
                if (this.panes[i]._v.id() == s) {
                    return this.panes[i];
                }
            }
        }
        return null;
    };
    return Page;
}());
exports.Page = Page;
var w = window;
var handlers = [];
function registerHandler(f) {
    handlers.push(f);
}
exports.registerHandler = registerHandler;
function unregisterHandler(f) {
    handlers = handlers.filter(function (x) { return x !== f; });
}
exports.unregisterHandler = unregisterHandler;
w.Workbench = {
    open: function (url) {
        for (var i = 0; i < handlers.length; i++) {
            if (handlers[i](url)) {
                return;
            }
        }
    }
};
var AccorditionTreeView = (function (_super) {
    __extends(AccorditionTreeView, _super);
    function AccorditionTreeView(title) {
        _super.call(this, title, title);
        this.seachable = true;
        this.trees = [];
    }
    AccorditionTreeView.prototype.createTree = function (name) {
        var tree = new TreeView(name, name);
        this.customize(tree);
        var view = this;
        tree.addSelectionListener({
            selectionChanged: function (z) {
                view.onSelection(z);
            }
        });
        return tree;
    };
    AccorditionTreeView.prototype.addTree = function (label, at) {
        var types = this.createTree(label);
        types.setInput(at);
        this.control.add(types);
        this.trees.push(types);
    };
    AccorditionTreeView.prototype.onSearch = function (searchStr) {
        var _this = this;
        var num = 0;
        var index = -1;
        var selectedIndexIsOk = false;
        this.control.children.forEach(function (x) {
            if (x instanceof TreeView) {
                var has = x.onSearch(searchStr);
                if (searchStr.length > 0) {
                    if (!has) {
                        _this.control.disable(x);
                    }
                    else {
                        _this.control.enable(x);
                        if (num == _this.control.getSelectedIndex()) {
                            selectedIndexIsOk = true;
                        }
                        index = num;
                    }
                }
                else {
                    _this.control.enable(x);
                }
            }
            num++;
        });
        if (searchStr.length > 0) {
            if (!selectedIndexIsOk && index != -1) {
                this.control.expandIndex(index);
            }
        }
    };
    AccorditionTreeView.prototype.setSelection = function (o) {
        for (var i = 0; i < this.trees.length; i++) {
            if (this.trees[i].hasModel(o)) {
                this.control.expand(this.trees[i]);
                this.trees[i].select(o);
            }
        }
    };
    AccorditionTreeView.prototype.innerRender = function (e) {
        if (!this.node) {
            new controls.Loading().render(e);
            this.load();
        }
        else {
            var title = null;
            if (this.control) {
                title = this.control.getSelectedTitleId();
            }
            var a = new controls.Accordition();
            this.control = a;
            this.trees = [];
            this.customizeAccordition(a, this.node);
            a.render(e);
            if (title) {
                for (var i = 0; i < this.control.children.length; i++) {
                    if (this.control.children[i].title() == title || this.control.children[i].controlId == title) {
                        this.control.expandIndex(i);
                    }
                }
            }
        }
    };
    return AccorditionTreeView;
}(ViewPart));
exports.AccorditionTreeView = AccorditionTreeView;

},{"./controls":6}],8:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var workbench = require("./framework/workbench");
var rc = require("./core/registryCore");
var GroupNode = rc.GroupNode;
var RegistryContentProvider = (function () {
    function RegistryContentProvider() {
    }
    RegistryContentProvider.prototype.elements = function (i) {
        return i;
    };
    RegistryContentProvider.prototype.children = function (i) {
        if (i instanceof GroupNode) {
            return i.children;
        }
        return [];
    };
    return RegistryContentProvider;
}());
var RegistryView = (function (_super) {
    __extends(RegistryView, _super);
    function RegistryView() {
        _super.apply(this, arguments);
        this.searchable = true;
    }
    RegistryView.prototype.load = function () {
        var _this = this;
        rc.getInstance("https://raw.githubusercontent.com/apiregistry/registry/gh-pages/registry-resolved.json", function (data, s) {
            _this.node = data;
            _this.registry = data;
            _this.refresh();
            if (_this.url) {
                var n = _this.registry.findNodeWithUrl(_this.url);
                if (n) {
                    _this.setSelection(n);
                }
            }
        });
    };
    RegistryView.prototype.setSelectedUrl = function (url) {
        this.url = url;
        if (!this.node) {
            return;
        }
        var n = this.registry.findNodeWithUrl(url);
        if (n) {
            this.setSelection(n);
            return true;
        }
        return false;
    };
    RegistryView.prototype.customizeAccordition = function (root, node) {
        this.addTree("Apis", node.apis());
        this.addTree("Libraries", node.libraries());
        var v = this;
        document.getElementById("stat").innerHTML = node.apiCount() + " apis, " + node.specCount() + " unique specifications, and counting.";
    };
    RegistryView.prototype.customize = function (tree) {
        tree.setContentProvider(new RegistryContentProvider());
        tree.setLabelProvider({
            label: function (e) {
                if (e.name) {
                    if (e.icon) {
                        return "<img src='" + e.icon + "' /> " + e.name + "";
                    }
                    return "" + e.name + "";
                }
            }
        });
    };
    return RegistryView;
}(workbench.AccorditionTreeView));
module.exports = RegistryView;

},{"./core/registryCore":4,"./framework/workbench":7}],9:[function(require,module,exports){
"use strict";
var or = require("./objectRender");
var hl = require("../core/hl");
function renderNodes(nodes) {
    var result = [];
    var obj = {};
    nodes = hl.prepareNodes(nodes);
    nodes.forEach(function (x) { return result.push(renderNode(x)); });
    return result.join("");
}
exports.renderNodes = renderNodes;
function renderVersionsSwitch(h) {
    return "<h5>Version: <div class=\"btn-group\">\n                  <button class=\"btn btn-default btn-xs dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">\n                    " + h.version + " <span class=\"caret\"></span>\n                  </button>\n                  <ul class=\"dropdown-menu\">\n                    " + h.versions.versions.map(function (x) { return ("<li><a onclick=\"openVersion('" + x.version + "')\">" + x.version + "</a></li>"); }).join("") + "\n                  </ul>\n    </div></h5>";
}
;
var HeaderRenderer = (function () {
    function HeaderRenderer(versions) {
        this.versions = versions;
    }
    HeaderRenderer.prototype.consume = function (nodes) {
        var _this = this;
        var result = [];
        nodes.forEach(function (x) {
            if (x.property().nameId() == "title") {
                _this.title = x.value();
                return;
            }
            if (x.property().nameId() == "version") {
                _this.version = x.value();
                return;
            }
            if (x.property().nameId() == "baseUri") {
                _this.baseUrl = x.value();
                return;
            }
            if (x.definition().nameId() === "Icons") {
                var obj = x.lowLevel().dumpToObject(true);
                obj = obj[Object.keys(obj)[0]];
                _this.iconUrl = obj[0].url;
                return;
            }
            result.push(x);
        });
        return result;
    };
    HeaderRenderer.prototype.render = function () {
        var result = [];
        if (this.iconUrl != null) {
            result.push("<img src='" + this.iconUrl + "'/>");
        }
        if (this.title != null) {
            result.push("<h4 style='display: inline'> " + this.title + "</h4>");
        }
        if (this.version != null) {
            if (this.versions && this.versions.versions.length > 1) {
                result.push(renderVersionsSwitch(this));
            }
            else {
                result.push(or.renderKeyValue("Version", this.version, false));
            }
        }
        if (this.baseUrl != null) {
            result.push(or.renderKeyValue("Base url", this.baseUrl, false));
        }
        return result.join("");
    };
    return HeaderRenderer;
}());
exports.HeaderRenderer = HeaderRenderer;
function renderNodesOverview(api, v, path) {
    var result = [];
    var nodes = api.attrs();
    var obj = {};
    var docs = api.elements().filter(function (x) { return x.property().nameId() == "documentation"; });
    nodes = hl.prepareNodes(nodes);
    var hr = new HeaderRenderer(v);
    nodes = hr.consume(nodes);
    result.push(hr.render());
    nodes.forEach(function (x) { return result.push(renderNode(x)); });
    docs.forEach(function (x) {
        var t = x.attr("title");
        if (t) {
            result.push("<h5 style='background-color: lightgray'>" + t.value() + "</h5>");
        }
        var c = x.attr("content");
        if (c) {
            result.push(marked(c.value()));
        }
    });
    if (path) {
        result.push("<hr/>");
        result.push("<a href='" + path + "'>Get RAML</a>");
    }
    return result.join("");
}
exports.renderNodesOverview = renderNodesOverview;
var ToSkip = { "LogicalStructure": 1, "EnumDescriptions": 1, "is": 1, "Id": 1, "displayName": 1 };
function renderNode(h, small) {
    if (small === void 0) { small = false; }
    if (h.definition && ToSkip[h.definition().nameId()]) {
        return "";
    }
    var vl = h.value ? h.value() : null;
    if (!h.definition) {
        var obj = h.lowLevel().dumpToObject();
        return or.renderObj(obj);
    }
    if (vl) {
        if (h.isAttr()) {
            var pname = h.property().nameId();
            if (ToSkip[pname]) {
                return "";
            }
            if (pname == "securedBy") {
                var v = hl.asObject(h);
                v = v[Object.keys(v)[0]];
                var result = [];
                if (Object.keys(v).length == 1) {
                    if (h.parent() && (h.parent().parent() != null)) {
                        var sd = h.root().elements().filter(function (x) { return x.property() && x.property().nameId() == "securitySchemes"; });
                        if (sd.length == 1) {
                            var toRend = v[Object.keys(v)[0]];
                            var descriptions = hl.scopeDescriptionsofApi(h.root(), Object.keys(v)[0]);
                            var rs = [];
                            Object.keys(toRend).forEach(function (x) {
                                if (x == "scopes" && descriptions) {
                                    var scopes = toRend[x];
                                    rs.push("scopes: ");
                                    for (var i = 0; i < scopes.length; i++) {
                                        if (descriptions[i]) {
                                            rs.push(" <span ><a>" + scopes[i] + "</a> </span>");
                                            rs.push("<span class='glyphicon glyphicon-question-sign' data-toggle='tooltip' title='" + descriptions[i] + "'></span>");
                                            if (i != scopes.length - 1) {
                                                rs.push(",");
                                            }
                                        }
                                        else {
                                            rs.push("<span ><a>" + scopes[i] + "</a> </span>" + (i == scopes.length - 1 ? "" : ", "));
                                        }
                                    }
                                    return;
                                }
                                rs.push(or.renderKeyValue(x, toRend[x]));
                            });
                            return "<div>" + rs.join("") + "</div>";
                        }
                    }
                }
            }
            if (typeof vl === "object") {
                if (!Array.isArray(vl)) {
                    var v = hl.asObject(h);
                    v = v[Object.keys(v)[0]];
                    vl = JSON.stringify(v, null, 2);
                    var svl = "" + vl;
                    svl = svl.replace(": null", "");
                    vl = svl.substr(1, svl.length - 2);
                }
                else {
                    vl = vl.join(", ");
                }
            }
            res = or.renderKeyValue(h.property().nameId(), vl, small);
        }
        else {
            if (vl.dumpNode) {
                var v = hl.asObject(h);
                v = v[Object.keys(v)[0]];
                vl = JSON.stringify(v, null, 2);
                var svl = "" + vl;
                svl = svl.replace(": null", "");
                vl = svl.substr(1, svl.length - 2);
            }
            var id = h.definition().nameId();
            if (id == "StringType") {
                id = h.name();
            }
            var res = or.renderKeyValue(id, vl, small);
        }
    }
    else {
        if (typeof vl === "string") {
            return;
        }
        if (h.isAttr()) {
            res = or.renderKeyValue(h.property().nameId(), vl, small);
            return res;
        }
        var id = h.definition().nameId();
        if (id == "StringType") {
            id = h.name();
            if (true) {
                var v = hl.asObject(h);
                v = v[Object.keys(v)[0]];
                vl = JSON.stringify(v, null, 2);
                var svl = "" + vl;
                svl = svl.replace(": null", "");
                vl = svl.substr(1, svl.length - 2);
            }
            var res = or.renderKeyValue(id, vl, true);
            return res;
        }
        var res = "<h5 style=\"background: gainsboro\">" + h.definition().nameId() + ":</h5>";
        var ch = h.children();
        res += renderNodes(ch);
    }
    return res;
}
exports.renderNode = renderNode;

},{"../core/hl":2,"./objectRender":10}],10:[function(require,module,exports){
"use strict";
function encode(r) {
    return r.replace(/[\x26\x0A\<>'"]/g, function (r) { return "&#" + r.charCodeAt(0) + ";"; });
}
exports.encode = encode;
var Link = (function () {
    function Link(target, _name) {
        this.target = target;
        this._name = _name;
    }
    Link.prototype.getUrl = function () {
        return this.target.id();
    };
    Link.prototype.render = function () {
        return "<a onclick=\"Workbench.open('" + this.getUrl() + "')\">" + this._name + "</a>";
    };
    return Link;
}());
exports.Link = Link;
var mm = 0;
var TableRenderer = (function () {
    function TableRenderer(_caption, props, st) {
        this._caption = _caption;
        this.props = props;
        this.st = st;
    }
    TableRenderer.prototype.render = function (hl) {
        var _this = this;
        var result = [];
        var fp = this.props.filter(function (p) {
            return hl.filter(function (x) { return p.render(x); }).length > 0;
        });
        hl.forEach(function (x) {
            var h = _this.st.hidden(x) ? "none" : "table-row";
            result.push("<tr id=\"" + ("tr" + mm) + "\" level=\"" + x.level() + "\" style=\"display: " + h + "\" onclick=\"toggleRow('" + ("tr" + mm) + "')\">");
            fp.forEach(function (p) {
                var pn = p.nowrap;
                var es = pn ? "white-space: nowrap" : "";
                result.push("<td style='" + es + "'>");
                result.push(p.render(x, "tr" + mm));
                result.push("</td>");
            });
            result.push("</tr>");
            mm = mm + 1;
        });
        var header = [];
        header.push("<tr>");
        fp.forEach(function (p) {
            var cw = p.width ? "width: " + p.width() : "";
            header.push("<th style='border-bottom: inherit;" + cw + "'>");
            header.push(p.caption());
            header.push("</th>");
        });
        header.push("</tr>");
        return "<div class=\"panel panel-default\">\n            <div class=\"panel-heading\">" + this._caption + "</div><div class=\"panel-body\" style=\"padding: 0px\"><div><table class=\"table table-hover\" style=\"margin: 0px\">\n            <caption style=\"height: 0px;display: none\"></caption>\n            <thead>" + header.join("") + "</thead>\n            " + result.join("") + "\n            </table>\n            </div></div></div>";
    };
    return TableRenderer;
}());
exports.TableRenderer = TableRenderer;
var w = window;
w.toggleRow = function (id) {
    var el = document.getElementById(id);
    var nm = el.parentElement.getElementsByTagName("tr");
    if (!document.getElementById("tricon" + id)) {
        return;
    }
    var vis = el.getAttribute("expanded");
    var style = "table-row";
    if (vis == "true") {
        style = "none";
        el.setAttribute("expanded", "false");
        document.getElementById("tricon" + id).classList.add("glyphicon-plus-sign");
        document.getElementById("tricon" + id).classList.remove("glyphicon-minus-sign");
    }
    else {
        el.setAttribute("expanded", "true");
        document.getElementById("tricon" + id).classList.remove("glyphicon-plus-sign");
        document.getElementById("tricon" + id).classList.add("glyphicon-minus-sign");
    }
    var tn = false;
    var ll = parseInt(el.getAttribute("level"));
    for (var i = 0; i < nm.length; i++) {
        var it = nm.item(i);
        if (it == el) {
            tn = true;
            continue;
        }
        if (tn) {
            var il = parseInt(it.getAttribute("level"));
            if (il <= ll) {
                tn = false;
            }
            else {
                if (il == ll + 1 || style == 'none') {
                    if (style == 'none') {
                        it.setAttribute("expanded", "false");
                    }
                    it.style.display = style;
                }
            }
        }
    }
};
function highlight(v) {
    v = encode(v);
    if (v.indexOf("http://") == 0 || v.indexOf("https://") == 0) {
        return "<a href=\"" + v + "\">" + v + "</a>";
    }
    if (!isNaN(parseFloat(v))) {
        return "<span style='color: purple'>" + v + "</span>";
    }
    if (!isNaN(parseInt(v))) {
        return "<span style='color: purple'>" + v + "</span>";
    }
    if (v == "true" || v == "false") {
        return "<span style='color: blue'>" + v + "</span>";
    }
    return "<span style='color: darkred'>" + v + "</span>";
}
exports.highlight = highlight;
function renderKeyValue(k, vl, small) {
    if (small === void 0) { small = false; }
    if (k == "description" || k == "usage") {
        if (typeof vl == "string") {
            vl = marked(vl);
        }
        var res = "<h5 style=\"background: gainsboro\">" + k + ": </h5><div>" + vl + "</div>";
        return res;
    }
    var str = "" + vl;
    vl = highlight(str);
    if (str.length > 70 && str.indexOf('\n') != -1 && !small) {
        var res = "<h5 style=\"background: gainsboro\">" + k + ": </h5><div>" + vl + "</div>";
        return res;
    }
    if (small) {
        return "<i>" + k + ": " + vl + "</i>";
    }
    return "<h5>" + k + ": " + vl + "</h5>";
}
exports.renderKeyValue = renderKeyValue;
function renderObj(v) {
    if (Array.isArray(v)) {
        var r = v;
        return r.map(function (x) { return renderObj(x); }).join("");
    }
    if (v["title"] && v['url']) {
        var role = v["role"];
        var img = "";
        if (role == "Tool Location") {
            img = "<image src='images/ApplicationElement.gif'/> ";
        }
        return "<div><a href=\"" + v['url'] + "\">" + img + v["title"] + "</a></div>";
    }
    if (typeof v === "string") {
        return v;
    }
    if (typeof v === "number") {
        return "" + v;
    }
    var result = [];
    Object.getOwnPropertyNames(v).forEach(function (p) {
        result.push(renderKeyValue(p, v[p]));
    });
    return result.join("");
}
exports.renderObj = renderObj;

},{}],11:[function(require,module,exports){
"use strict";
var hl = require("../core/hl");
var tr = require("./typeRender");
var nr = require("./nodeRender");
var ResourceRenderer = (function () {
    function ResourceRenderer(meta, isAnnotationType) {
        if (isAnnotationType === void 0) { isAnnotationType = false; }
        this.meta = meta;
        this.isAnnotationType = isAnnotationType;
    }
    ResourceRenderer.prototype.render = function (h) {
        var ms = h.elements().filter(function (x) { return x.property().nameId() == "methods"; });
        var result = [];
        var pn = hl.uriParameters(h);
        if (ms.length == 1) {
            var dn = ms[0].attr("displayName");
            if (dn && (dn.value())) {
                result.push("<h3>" + dn.value() + "</h3>");
                result.push("<h5>Resource: " + hl.resourceUrl(h) + " Method: " + ms[0].name() + "</h5>");
            }
            else {
                result.push("<h3>Resource: " + hl.resourceUrl(h) + " Method: " + ms[0].name() + "</h3>");
            }
            hl.prepareNodes(ms[0].attrs()).forEach(function (x) {
                result.push(nr.renderNode(x, false));
            });
            result.push("</hr>");
            tr.renderParameters("Uri Parameters", hl.uriParameters(h), result, this.meta);
            result.push(new MethodRenderer(false, false, false, false, this.meta).render(ms[0]));
        }
        else {
            result.push("<h3>Resource:" + hl.resourceUrl(h) + "</h3>");
            result.push("</hr>");
            hl.prepareNodes(h.attrs()).forEach(function (x) {
                result.push(nr.renderNode(x, false));
            });
            tr.renderParameters("Uri Parameters", hl.uriParameters(h), result, this.meta);
            if (ms.length > 0) {
                result.push(renderTabFolder("Methods", ms, new MethodRenderer(this.meta, false, ms.length == 1, false, true)));
            }
        }
        return result.join("");
    };
    return ResourceRenderer;
}());
exports.ResourceRenderer = ResourceRenderer;
var num = 0;
function renderTabFolder(caption, nodes, r) {
    if (nodes.length == 0) {
        return "";
    }
    if (nodes.length == 1) {
        return r.render(nodes[0]);
    }
    var result = [];
    if (caption) {
        result.push("<h3>" + caption + "</h3>");
    }
    result.push("<ul class=\"nav nav-tabs\">");
    var num = 0;
    nodes.forEach(function (x) { return result.push("<li class=\"" + (num++ == 0 ? "active" : "") + "\"><a data-toggle=\"tab\" href=\"#" + (escape(x.name()) + "Tab" + num) + "\">" + x.name() + "</a></li>"); });
    result.push("</ul>");
    num = 0;
    result.push("<div class=\"tab-content\">");
    nodes.forEach(function (x) { return result.push("<div class=\"tab-pane fade " + (num++ == 0 ? "in active" : "") + "\" id=\"" + (escape(x.name()) + "Tab" + num) + "\">" + r.render(x) + "</div>"); });
    result.push('</div>');
    num++;
    return result.join("");
}
exports.renderTabFolder = renderTabFolder;
function escape(n) {
    return n.replace("/", "_");
}
var MethodRenderer = (function () {
    function MethodRenderer(meta, topLevel, isSingle, isAnnotationType, renderAttrs) {
        if (isAnnotationType === void 0) { isAnnotationType = false; }
        this.meta = meta;
        this.topLevel = topLevel;
        this.isSingle = isSingle;
        this.isAnnotationType = isAnnotationType;
        this.renderAttrs = renderAttrs;
    }
    MethodRenderer.prototype.render = function (h) {
        var result = [];
        if (this.topLevel) {
            var dn = h.attr("displayName");
            if (dn) {
                result.push("<h3>" + dn.value() + "</h3>");
            }
            result.push("<h5>Resource: " + hl.resourceUrl(h.parent()) + " Method: " + h.name() + "</h5>");
        }
        else if (this.isSingle) {
            result.push("<h3>Method: " + h.name() + "</h3>");
        }
        if (this.renderAttrs) {
            hl.prepareNodes(h.attrs()).forEach(function (x) {
                if (x.name() == "displayName") {
                    return;
                }
                result.push(nr.renderNode(x, false));
            });
        }
        if (this.topLevel) {
            tr.renderParameters("Uri Parameters", hl.uriParameters(h.parent()), result, this.meta);
        }
        tr.renderParameters("Query Parameters", h.elements().filter(function (x) { return x.property().nameId() == "queryParameters"; }), result, this.meta);
        tr.renderParameters("Headers", h.elements().filter(function (x) { return x.property().nameId() == "headers"; }), result, this.meta);
        var rs = h.elements().filter(function (x) { return x.property().nameId() == "body"; });
        if (rs.length > 0) {
            result.push(renderTabFolder("Body", rs, new tr.TypeRenderer(this.meta, "Body", rs.length == 1)));
        }
        var rs = h.elements().filter(function (x) { return x.property().nameId() == "responses"; });
        if (rs.length > 0) {
            result.push(renderTabFolder("Responses", rs, new ResponseRenderer(this.meta, rs.length == 1)));
        }
        return result.join("");
    };
    return MethodRenderer;
}());
exports.MethodRenderer = MethodRenderer;
var ResponseRenderer = (function () {
    function ResponseRenderer(meta, isSingle, isAnnotationType) {
        if (isAnnotationType === void 0) { isAnnotationType = false; }
        this.meta = meta;
        this.isSingle = isSingle;
        this.isAnnotationType = isAnnotationType;
    }
    ResponseRenderer.prototype.render = function (h) {
        var result = [];
        var rs = h.elements().filter(function (x) { return x.property().nameId() == "body"; });
        if (this.isSingle && rs.length < 1) {
            result.push("<h3>Response: " + h.name() + "</h3>");
        }
        hl.prepareNodes(h.attrs()).forEach(function (x) {
            result.push(nr.renderNode(x, false));
        });
        tr.renderParameters("Headers", h.elements().filter(function (x) { return x.property().nameId() == "headers"; }), result, this.meta);
        result.push(renderTabFolder(null, rs, new tr.TypeRenderer(this.meta, rs.length == 1 && this.isSingle ? "Response(" + h.name() + ") payload" : "Payload", rs.length == 1)));
        return result.join("");
    };
    return ResponseRenderer;
}());
exports.ResponseRenderer = ResponseRenderer;

},{"../core/hl":2,"./nodeRender":9,"./typeRender":13}],12:[function(require,module,exports){
"use strict";
exports.OBJECT_IMAGE = "<img src='./images/object.gif'/> ";
exports.ARRAY_IMAGE = "<img src='./images/arraytype_obj.gif'/> ";
exports.STRING_IMAGE = "<img src='./images/string.gif'/> ";
exports.GENERIC_TYPE = "<img src='./images/typedef_obj.gif'/> ";
exports.ANNOTATION_TYPE = "<img src='./images/annotation_obj.gif'/>";
exports.BOOLEAN_TYPE = "<img src='./images/boolean.gif'/> ";
exports.NUMBER_TYPE = "<img src='./images/number.png'/> ";
exports.DATE_TYPE = "<img src='./images/date.gif'/> ";
exports.FILE_TYPE = "<img src='./images/file.gif'/> ";
exports.FOLDER_SPAN = "glyphicon glyphicon-cloud";
exports.LIBRARY_SPAN = "glyphicon glyphicon-tasks";
exports.RESOURCE_SPAN = "glyphicon glyphicon-link";
exports.COLLAPSE_LINK = "images/collapse.gif";
function EXPAND_IMG(id) {
    return "<img src='images/expand.gif' id='Expand" + id + "'/>";
}
exports.EXPAND_IMG = EXPAND_IMG;

},{}],13:[function(require,module,exports){
"use strict";
var hl = require("../core/hl");
var or = require("./objectRender");
var nr = require("./nodeRender");
var usages = require("../core/registryCore");
var rtv = require("../app");
var images = require("./styles");
function renderTypeList(t) {
    var result = [];
    t.forEach(function (x) {
        result.push(renderTypeLink(x));
    });
    return result;
}
exports.renderTypeList = renderTypeList;
function escapeBuiltIn(n) {
    if (n === "StringType") {
        n = "string";
    }
    if (n === "DateTimeType") {
        n = "date-time";
    }
    if (n === "BooleanType") {
        n = "boolean";
    }
    if (n === "NumberType") {
        n = "number";
    }
    if (n === "IntegerType") {
        n = "integer";
    }
    return n;
}
function renderTypeLink(x) {
    var result = [];
    if (x.isArray()) {
        var cp = x.componentType();
        var lnk = renderTypeLink(cp);
        if (cp.isUnion()) {
            lnk = "(" + lnk + ")";
        }
        return lnk + "[]";
    }
    if (x.isUnion()) {
        return renderTypeLink(x.union().leftType()) + " | " + renderTypeLink(x.union().rightType());
    }
    if (x.isBuiltIn()) {
    }
    var d = hl.getDeclaration(x);
    if (d) {
        var name = x.nameId();
        if (!name) {
            if (x.superTypes().length == 1) {
                name = x.superTypes()[0].nameId();
            }
        }
        name = escapeBuiltIn(name);
        result.push(new or.Link(d, name).render() + "");
    }
    else {
        var name = x.nameId();
        if (!name) {
            if (x.superTypes().length == 1) {
                name = x.superTypes()[0].nameId();
            }
        }
        name = escapeBuiltIn(name);
        result.push("<span>" + name + "</span> ");
    }
    return result.join("");
}
var NameColumn = (function () {
    function NameColumn() {
        this.nowrap = true;
    }
    NameColumn.prototype.id = function () { return "name"; };
    NameColumn.prototype.caption = function () { return "Name"; };
    NameColumn.prototype.width = function () { return "15em;"; };
    NameColumn.prototype.render = function (p, rowId) {
        var rs = p.nameId();
        var s = p.range();
        if (p.local || (!s.isBuiltIn() && !s.isArray() && !s.isUnion())) {
            while (s.superTypes().length == 1 && !s.isBuiltIn()) {
                s = s.superTypes()[0];
            }
        }
        if (p.range().isObject()) {
            rs = images.OBJECT_IMAGE + rs;
        }
        if (p.range().isArray()) {
            rs = images.ARRAY_IMAGE + rs;
        }
        else if (s.nameId() == "StringType") {
            rs = images.STRING_IMAGE + rs;
        }
        else if (s.nameId() == "BooleanType") {
            rs = images.BOOLEAN_TYPE + rs;
        }
        else if (s.nameId() == "NumberType") {
            rs = images.NUMBER_TYPE + rs;
        }
        else if (s.nameId() == "IntegerType") {
            rs = images.NUMBER_TYPE + rs;
        }
        else if (s.nameId().indexOf("Date") != -1) {
            rs = images.DATE_TYPE + rs;
        }
        else if (s.nameId().indexOf("File") != -1) {
            rs = images.FILE_TYPE + rs;
        }
        if (rs.length == 0) {
            rs = "additionalProperties";
        }
        if (p instanceof WProperty) {
            var wp = p;
            if (wp._children.length > 0) {
                rs = ("<span style=\"padding-left: " + wp.level() * 20 + "px\"></span><span id=\"" + ("tricon" + rowId) + "\" class=\"glyphicon glyphicon-plus-sign\" ></span> ") + rs;
            }
            else {
                rs = ("<span style=\"padding-left: " + (wp.level() * 20 + 15) + "px\"></span> ") + rs;
            }
        }
        if (p.isRequired()) {
            rs += " <small style='color: red'>(required)</small>";
        }
        return rs;
    };
    return NameColumn;
}());
var skipProps = {
    "description": true,
    "example": true,
    "examples": true,
    "type": true,
    "required": true,
    "items": true
};
var Facets = (function () {
    function Facets() {
    }
    Facets.prototype.id = function () { return "name"; };
    Facets.prototype.caption = function () { return "Facets &amp; Annotations"; };
    Facets.prototype.render = function (p) {
        var decl = hl.getDeclaration(p.range(), false);
        var rs = [];
        if (decl) {
            hl.prepareNodes(decl.attrs()).forEach(function (x) {
                if (skipProps[x.name()]) {
                    return;
                }
                if (x.property && x.property().nameId() == "enum") {
                    var descs = hl.enumDescriptions(decl);
                    if (descs) {
                        var vl = x.value();
                        rs.push("enum: ");
                        for (var i = 0; i < vl.length; i++) {
                            if (descs[i]) {
                                rs.push(" <span style='color: darkred'>" + vl[i] + " </span>");
                                rs.push("<span class='glyphicon glyphicon-question-sign' data-toggle='tooltip' title='" + descs[i] + "'></span>");
                                if (i != vl.length - 1) {
                                    rs.push(",");
                                }
                            }
                            else {
                                rs.push("<span style='color: darkred'>" + vl[i] + "</span>" + (i == vl.length - 1 ? "" : ", "));
                            }
                        }
                        return;
                    }
                }
                var nd = nr.renderNode(x, true);
                if (nd) {
                    rs.push(nd + "; ");
                }
            });
        }
        return rs.join("");
    };
    Facets.prototype.width = function () {
        return "20em";
    };
    return Facets;
}());
var Description = (function () {
    function Description() {
    }
    Description.prototype.id = function () { return "description"; };
    Description.prototype.caption = function () { return "Description"; };
    Description.prototype.render = function (p) {
        var desc = hl.description(p.range());
        var s = marked(desc, { gfm: true });
        while (true) {
            var q = s;
            s = s.replace("<h1", "<h4");
            s = s.replace("</h1", "</h4");
            s = s.replace("<h2", "<h4");
            s = s.replace("</h2", "</h4");
            if (q == s) {
                break;
            }
        }
        return s;
    };
    return Description;
}());
marked.Lexer.rules.gfm.heading = marked.Lexer.rules.normal.heading;
marked.Lexer.rules.tables.heading = marked.Lexer.rules.normal.heading;
var Type = (function () {
    function Type() {
    }
    Type.prototype.id = function () { return "type"; };
    Type.prototype.caption = function () { return "Type"; };
    Type.prototype.render = function (p) {
        var s = p.range();
        if (p.local || (!s.nameId() && !s.isArray() && !s.isUnion())) {
            if (s.superTypes().length == 1) {
                s = s.superTypes()[0];
            }
        }
        return "<span style='white-space: nowrap;'>" + renderTypeLink(s) + "</span>";
    };
    Type.prototype.width = function () {
        return "15em";
    };
    return Type;
}());
var Meta = (function () {
    function Meta() {
    }
    Meta.prototype.id = function () { return "meta"; };
    Meta.prototype.caption = function () { return "Type &amp; Meta"; };
    Meta.prototype.render = function (p) {
        var v = new Type().render(p);
        var f = new Facets().render(p);
        return v + (f ? '(' + f + ')' : "");
    };
    Meta.prototype.width = function () {
        return "15em";
    };
    return Meta;
}());
var WProperty = (function () {
    function WProperty(_orig, _o) {
        this._orig = _orig;
        this._o = _o;
        this._children = [];
        this.recursive = false;
        if (_orig instanceof WProperty) {
            _orig._children.push(_o);
        }
        if (_o.local) {
            this.local = true;
        }
    }
    WProperty.prototype.level = function () {
        if (this._orig) {
            if (this._orig instanceof WProperty) {
                var wp = this._orig;
                return wp.level() + 1;
            }
        }
        return 0;
    };
    WProperty.prototype.nameId = function () {
        return this._o.nameId();
    };
    WProperty.prototype.isKey = function () {
        return this._o.isKey();
    };
    WProperty.prototype.range = function () {
        return this._o.range();
    };
    WProperty.prototype.isRequired = function () {
        return this._o.isRequired();
    };
    return WProperty;
}());
var expandProps = function (ts, ps, parent) {
    var pm = [];
    ps.forEach(function (x) {
        x = new WProperty(parent, x);
        pm.push(x);
        var r = x.range();
        if (ts.indexOf(r) == -1) {
            ts.push(r);
            if (r.isObject()) {
                var ps = r.allProperties();
                if (ps.length > 0) {
                    expandProps(ts, ps, x).forEach(function (y) { return pm.push(y); });
                }
            }
            else if (x.range().isArray() && !x.range().nameId()) {
                if (x.range().isObject()) {
                    var as = x.range().componentType().allProperties();
                    if (as.length > 0) {
                        expandProps(ts, as, x).forEach(function (y) { return pm.push(y); });
                    }
                }
            }
            ts.pop();
        }
        else {
            x.recursive = true;
        }
    });
    return pm;
};
var usageIndex = 0;
var renderClicableLink = function (root, result, label) {
    if (root.property() && root.property().nameId() == "methods") {
        result.push("<div style='padding-left: 23px;padding-top: 2px' key='" + root.id() + "'>" + hl.methodKey(root.name()) + "<a onclick='Workbench.open(\"" + root.id() + "\")'>" + label + "(" + hl.resourceUrl(root.parent()) + ")" + "</a></div>");
    }
    else if (root.property() && root.property().nameId() == "types") {
        result.push("<div style='padding-left: 20px;padding-top: 2px' key='" + root.id() + "'>" + images.GENERIC_TYPE + "<a onclick='Workbench.open(\"" + root.id() + "\")'>" + label + "</a></div>");
    }
    else if (root.property() && root.property().nameId() == "annotationTypes") {
        result.push("<div style='padding-left: 20px;padding-top: 2px' key='" + root.id() + "'>" + images.ANNOTATION_TYPE + "<a onclick='Workbench.open(\"" + root.id() + "\")'>" + label + "</a></div>");
    }
};
var TypeRenderer = (function () {
    function TypeRenderer(meta, extraCaption, isSingle, isAnnotationType) {
        if (isAnnotationType === void 0) { isAnnotationType = false; }
        this.meta = meta;
        this.extraCaption = extraCaption;
        this.isSingle = isSingle;
        this.isAnnotationType = isAnnotationType;
    }
    TypeRenderer.prototype.setGlobal = function (b) {
        this.global = b;
    };
    TypeRenderer.prototype.setUsages = function (v) {
        this.usages = v;
    };
    TypeRenderer.prototype.render = function (h) {
        var _this = this;
        var at = h.localType();
        if (h.property().nameId() == "annotationTypes") {
            at = at.superTypes()[0];
        }
        var result = [];
        result.push("<h3>" + (this.extraCaption ? this.extraCaption + ": " : "") + at.nameId() + "</h3><hr>");
        if (at.hasExternalInHierarchy()) {
            var type = at;
            var content = "";
            while (type) {
                if (type.schemaString) {
                    content = type.schemaString.trim();
                }
                type = type.superTypes()[0];
            }
            if (at.superTypes().length == 1 && !at.superTypes()[0].isBuiltIn()) {
                result.push("<h5>Schema: " + renderTypeList(at.superTypes()) + "</h5>");
            }
            if (content) {
                result.push("<pre><code class=\"" + (content.charAt(0) == "<" ? '' : 'json') + "\">" + or.encode(content) + "</code></pre>");
            }
            return result.join("");
        }
        if (at.superTypes().length == 1 && h.children().length == 2) {
            result.push("<h5>Type: " + renderTypeList(at.superTypes()) + "</h5>");
        }
        else {
            result.push("<h5>Supertypes: " + renderTypeList(at.superTypes()) + "</h5>");
        }
        var desc = hl.description(at);
        if (desc) {
            result.push("<h5 style='display: inline'>Description: </h5><span style='color: darkred'>" + desc + "</span>");
        }
        hl.prepareNodes(h.attrs()).forEach(function (x) {
            if (skipProps[x.name()]) {
                return;
            }
            result.push(nr.renderNode(x, false));
        });
        if (!this.isAnnotationType) {
            var st = hl.subTypes(at);
            if (st.length > 0) {
                result.push("<h5>Direct known subtypes: " + renderTypeList(st));
            }
        }
        var ps = at.facets();
        var nm = "Facet declarations";
        if (ps.length > 0) {
            renderPropertyTable(nm, ps, result, at, this.meta);
        }
        if (at.isObject()) {
            ps = at.allProperties();
            if (ps.length == 0) {
                if (this.isAnnotationType) {
                    var ts = at.superTypes();
                    if (ts.length == 1) {
                        ps = ts[0].allProperties();
                    }
                }
            }
            renderPropertyTable("Properties", ps, result, at, this.meta);
        }
        if (at.isArray()) {
            var ct = at.componentType();
            if (ct) {
                result.push("<h5>Component type:");
                result.push(renderTypeList([ct]).join(""));
                result.push("</h5>");
                ps = ct.allProperties();
                if (ct.isObject()) {
                    renderPropertyTable("Component type properties", ps, result, ct, this.meta);
                }
            }
        }
        if (at.isUnion()) {
            result.push("Union options:");
            result.push(renderTypeList([at]).join(""));
        }
        at.examples();
        if (this.global) {
            var usage = [];
            hl.findUsages(h.root(), at, usage);
            if (usage.length > 0) {
                result.push("<h4>Usages:</h4>");
                var roots = {};
                usage.forEach(function (x) {
                    var root = hl.findUsagesRoot(x);
                    var label = hl.label(root);
                    if (roots[label]) {
                        return;
                    }
                    roots[label] = 1;
                    renderClicableLink(root, result, label);
                });
            }
        }
        if (this.usages) {
            result.push("<h4>External Usages:</h4>");
            Object.keys(this.usages).forEach(function (x) {
                result.push("<div id='usage" + (usageIndex++) + "' style='margin-right: 15px'><a id='ExpandLink" + (usageIndex - 1) + "' style='cursor: hand' onclick='expandUsage(" + (usageIndex - 1) + ")'>" + images.EXPAND_IMG("" + (usageIndex - 1)) + usages.getTitle(x) + "</a>");
                var v = _this.usages[x];
                result.push("<span style='display: none' url='" + x + "'>");
                if (v) {
                    v.forEach(function (y) {
                        result.push("<div>" + y + "</div>");
                    });
                }
                result.push("</span>");
                result.push("</div>");
            });
        }
        return result.join("");
    };
    return TypeRenderer;
}());
exports.TypeRenderer = TypeRenderer;
var w = window;
w.expandUsage = function (index) {
    var el = document.getElementById("usage" + index);
    var iel = document.getElementById("Expand" + index);
    var eel = document.getElementById("ExpandLink" + index);
    iel.src = images.COLLAPSE_LINK;
    var span = el.getElementsByTagName("span");
    var url = span.item(0).getAttribute("url");
    var sp = document.createElement("div");
    sp.innerText = "...";
    el.appendChild(sp);
    var rop = function (operation, result, rp) {
        var label = hl.label(operation);
        result.push("<div style='padding-left: 20px;' key='" + operation.id() + "'>" + hl.methodKey(operation.name()) + "<a>" + label + "(" + rp + ")" + "</a></div>");
        return label;
    };
    hl.loadApi(url, function (x, y) {
        el.removeChild(sp);
        var links = el.getElementsByTagName("div");
        var allOps = hl.allOps(x);
        var result = [];
        var dups = {};
        for (var i = 0; i < links.length; i++) {
            var link = links.item(i).innerText;
            if (dups[link]) {
                continue;
            }
            else {
                dups[link] = 1;
            }
            if (link.indexOf(";;R;") == 0) {
                var mi = link.indexOf(";M;");
                var rp = link.substring(";;R;".length, mi == -1 ? link.length : mi);
                if (mi != -1) {
                    var method = link.substr(mi + 3);
                    var pn = method.indexOf(";");
                    if (pn != -1) {
                        method = method.substr(0, pn);
                    }
                    var operation = allOps[rp + "." + method];
                    if (operation) {
                        var label = rop(operation, result, rp);
                    }
                }
                else {
                    rp = link.substring(";;R;".length);
                    var pn = rp.indexOf(";");
                    if (pn != -1) {
                        rp = rp.substr(0, pn);
                    }
                    Object.keys(allOps).forEach(function (x) {
                        if (x.indexOf(rp) == 0) {
                            var operation = allOps[x];
                            var label = rop(operation, result, rp);
                        }
                    });
                }
            }
            else if (link.indexOf(";;T;") == 0) {
                var rp = link.substring(";;T;".length);
                var lt = rp.indexOf(";");
                if (lt != -1) {
                    rp = rp.substr(0, lt);
                }
                var type = x.elements().filter(function (x) { return x.name() == rp; });
                if (type.length == 1) {
                    var label = hl.label(type[0]);
                    if (dups[label]) {
                        continue;
                    }
                    dups[label] = 1;
                    result.push("<div style='padding-left: 20px;' key='" + type[0].id() + "'>" + images.GENERIC_TYPE + "<a>" + label + "</a></div>");
                }
            }
            else {
                result.push("<div style='padding-left: 20px;'>" + "<a>Root</a></div>");
            }
        }
        sp = document.createElement("div");
        sp.innerHTML = result.join("");
        var children = sp.getElementsByTagName("div");
        for (var i = 0; i < children.length; i++) {
            var di = children.item(i);
            var linkE = di.getElementsByTagName("a");
            linkE.item(0).onclick = function (x) {
                var rs = x.target.parentElement.getAttribute("key");
                rtv.setBackUrl(rtv.ramlView.path);
                var sel = rtv.ramlView.getSelection()[0];
                rtv.states.push(sel.id());
                rtv.showApi(url, function () {
                    Workbench.open(rs);
                });
            };
        }
        el.appendChild(sp);
    }, false);
    eel.onclick = function () {
        el.removeChild(sp);
        iel.src = "./images/expand.gif";
        eel.onclick = function () {
            w.expandUsage(index);
        };
    };
};
function renderPropertyTable(name, ps, result, at, isMeta) {
    result.push("<div style='padding-top: 10px'>");
    var pm = expandProps([at], ps);
    if (isMeta) {
        result.push(new or.TableRenderer(name, [new NameColumn(), new Meta(), new Description()], {
            hidden: function (c) {
                return c.level() > 0;
            }
        }).render(pm));
    }
    else {
        result.push(new or.TableRenderer(name, [new NameColumn(), new Type(), new Facets(), new Description()], {
            hidden: function (c) {
                return c.level() > 0;
            }
        }).render(pm));
    }
    result.push("</div>");
}
exports.renderPropertyTable = renderPropertyTable;
function renderParameters(name, ps, result, isMeta) {
    ps = ps.filter(function (x) { return !hl.isSyntetic(x); });
    if (ps.length == 0) {
        return;
    }
    result.push("<div style='padding-top: 10px'>");
    var pr = [];
    ps.forEach(function (x) {
        pr.push({
            nameId: function () {
                if (x.name().charAt(x.name().length - 1) == "?") {
                    var r = x.attr("required");
                    if (!r) {
                        return x.name().substr(0, x.name().length - 1);
                    }
                }
                return x.name();
            },
            isKey: function () {
                return false;
            },
            local: true,
            range: function () {
                return x.localType();
            },
            isRequired: function () {
                var r = x.attr("required");
                if (r && r.value() === "false") {
                    return false;
                }
                if (r && r.value() == "true") {
                    return true;
                }
                if (hl.isRAML08(x)) {
                    if (!x.property() || x.property().nameId() == "uriParameters") {
                        return true;
                    }
                    return false;
                }
                return !(x.name().charAt(x.name().length - 1) == "?");
            }
        });
    });
    var pm = expandProps([], pr);
    if (isMeta) {
        result.push(new or.TableRenderer(name, [new NameColumn(), new Meta(), new Description()], {
            hidden: function (c) {
                return c.level() > 0;
            }
        }).render(pm));
    }
    else {
        result.push(new or.TableRenderer(name, [new NameColumn(), new Type(), new Facets(), new Description()], {
            hidden: function (c) {
                return c.level() > 0;
            }
        }).render(pm));
    }
    result.push("</div>");
}
exports.renderParameters = renderParameters;

},{"../app":1,"../core/hl":2,"../core/registryCore":4,"./nodeRender":9,"./objectRender":10,"./styles":12}],14:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var workbench = require("./framework/workbench");
var hl = require("./core/hl");
var nr = require("./rendering/nodeRender");
var controls_1 = require("./framework/controls");
var rrend = require("./core/registryCore");
var methodKey = hl.methodKey;
var images = require("./rendering/styles");
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
var RAMLTreeView = (function (_super) {
    __extends(RAMLTreeView, _super);
    function RAMLTreeView(path, title) {
        if (title === void 0) { title = "Overview"; }
        _super.call(this, title);
        this.path = path;
        this.searchable = true;
        this.operations = true;
        this.trees = [];
        this.showInternal = true;
        var v = this;
        this.getToolbar().add({
            title: "",
            image: "glyphicon glyphicon-asterisk",
            checked: this.devMode,
            run: function () {
                v.devMode = !v.devMode;
                v.refresh();
                v.init(v.holder);
            }
        });
    }
    RAMLTreeView.prototype.setKnownVersions = function (r) {
        this.versions = r;
    };
    RAMLTreeView.prototype.setInput = function (v) {
        if (v instanceof rrend.ApiWithVersions) {
            var aw = v;
            var sel = aw.versions[aw.versions.length - 1];
            this.setKnownVersions(aw);
            this.setUrl(sel.location);
        }
        else {
            if (v) {
                if (v.location) {
                    this.setUrl(v[0].location);
                }
            }
        }
    };
    RAMLTreeView.prototype.setVersion = function (ver) {
        var _this = this;
        this.versions.versions.forEach(function (x) {
            if (x.version == ver) {
                _this.setUrl(x.location);
            }
        });
    };
    RAMLTreeView.prototype.setUrl = function (url, cb) {
        this.path = url;
        this.node = null;
        this.api = null;
        this.refresh();
        this.cb = cb;
        rrend.setUrl(url);
    };
    RAMLTreeView.prototype.customize = function (tree) {
        tree.setContentProvider(new RAMLTreeProvider());
        tree.setLabelProvider({
            label: function (x) {
                if (x instanceof hl.TreeLike) {
                    var t = x;
                    if (t.id.indexOf("!!") == 0) {
                        var ss = t.id.substr(2);
                        if (ss == "object") {
                            return images.OBJECT_IMAGE + ss;
                        }
                        if (ss == "array") {
                            return images.ARRAY_IMAGE + ss;
                        }
                        if (ss == "scalar") {
                            return images.STRING_IMAGE + ss;
                        }
                        return images.OBJECT_IMAGE + ss;
                    }
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
                    result = images.GENERIC_TYPE + result;
                }
                if (isAType) {
                    result = images.ANNOTATION_TYPE + result;
                }
                return result;
            },
            icon: function (x) {
                if (x instanceof hl.TreeLike) {
                    var t = x;
                    if (t.id.indexOf("!!") == 0) {
                        return "";
                    }
                    return images.FOLDER_SPAN;
                }
                if (x instanceof hl.ProxyNode) {
                    return images.LIBRARY_SPAN;
                }
                if (x.property().nameId() == "resources") {
                    return images.RESOURCE_SPAN;
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
            if (this.cb) {
                var q = this.cb;
                setTimeout(q, 100);
                this.cb = null;
            }
        }
    };
    RAMLTreeView.prototype.renderArraySection = function (id, label, groups, libs, always) {
        if (always === void 0) { always = false; }
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
        var v = this;
        if (toRender.length > 0 || always) {
            var at = toRender;
            var types = this.createTree(label);
            if (id == "types" && this.api.definition().nameId() == "Api") {
                types.contextActions = [{
                        title: "Show Internal Types",
                        checked: v.showInternal,
                        run: function () {
                            v.showInternal = !v.showInternal;
                            v.refresh();
                        }
                    }];
            }
            if (id == "methods") {
                types.contextActions = [{
                        title: "Show Resources",
                        run: function () {
                            v.operations = false;
                            v.refresh();
                        }
                    }];
                types.controlId = "ops";
            }
            if (id == "resources") {
                types.contextActions = [{
                        title: "Show Operations",
                        run: function () {
                            v.operations = true;
                            v.refresh();
                        }
                    }];
                types.controlId = "ops";
            }
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
        var overview = nr.renderNodesOverview(this.api, this.versions, this.path);
        if (overview.length > 0) {
            a.add(new controls_1.Label("Generic Info", "<div style='min-height: 200px'>" + overview + "</div>"));
        }
        if (!this.devMode) {
            libs = [];
        }
        var groups = hl.elementGroups(this.api);
        var methods = [];
        var ts = hl.gatherMethods(this.api, methods);
        var groupedMethods = hl.groupMethods(methods).allChildren();
        if (methods != null) {
            groups["methods"] = groupedMethods;
        }
        var original = null;
        if (groups["types"]) {
            var tps = groups["types"];
            original = tps;
            if (!this.showInternal) {
                var used = hl.allUsedTypes(this.api);
                tps = tps.filter(function (x) { return used[x.name()]; });
            }
            var types = hl.groupTypes(tps);
            if (types) {
                groups["types"] = types.allChildren();
            }
        }
        if (this.devMode || this.api.definition().nameId() == "Library") {
            this.renderArraySection("annotationTypes", "Annotation Types", groups, libs);
        }
        if (this.operations) {
            this.renderArraySection("methods", "Operations", groups, libs);
        }
        else {
            this.renderArraySection("resources", "Resources", groups, libs);
        }
        this.renderArraySection("types", "Data Types", groups, libs, original && original.length > 0);
        var lt = null;
    };
    RAMLTreeView.prototype.load = function () {
        var _this = this;
        hl.loadApi(this.path, function (api) {
            _this.api = api;
            _this.node = api;
            _this.refresh();
        });
    };
    return RAMLTreeView;
}(workbench.AccorditionTreeView));
module.exports = RAMLTreeView;

},{"./core/hl":2,"./core/registryCore":4,"./framework/controls":6,"./framework/workbench":7,"./rendering/nodeRender":9,"./rendering/styles":12}]},{},[1]);
