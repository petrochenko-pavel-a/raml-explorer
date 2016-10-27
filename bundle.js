(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./ramlTreeView":6,"./registryApp":7,"./workbench":11}],2:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
            var s = "<div id=\"" + gid + "\" class=\"panel panel-default\" style=\"margin: 0px;" + styleExpanded + "; display: flex;flex-direction: column\">\n               <div class=\"panel-heading\" id=\"" + hId + "\">\n                <h4 class=\"panel-title\"><a>" + this.children[i].title() + "</a></h4>\n            </div>\n            <div id=\"" + elId + "\"  style=\"flex: 1 1 auto;display: flex;flex-direction: column;" + styleExpanded + "\">\n            <div class=\"panel-body\" style=\"background: red;flex: 1 1\"><div id=\"" + bid + "\" style=\"background: green;\"></div></div>\n            </div>\n           </div>";
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

},{}],3:[function(require,module,exports){
"use strict";
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
function loadApi(path, f) {
    RAML.Parser.loadApi(path).then(function (api) {
        var hl = api.highLevel();
        var tr = hl.elements().filter(function (x) { return x.property().nameId() == "traits" || x.property().nameId() == "resourceTypes"; });
        if (tr.length > 0) {
            root = api.expand ? api.expand().highLevel() : api.highLevel();
        }
        else {
            root = hl;
        }
        libs = null;
        f(root);
    });
}
exports.loadApi = loadApi;
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
        return [];
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
function resourceUrl(h) {
    var result = "";
    var o = h;
    while (h != null && h.property() != null) {
        result = h.name() + result;
        h = h.parent();
    }
    var up = uriParameters(o);
    for (var i = 0; i < up.length; i++) {
        if (isSyntetic(up[i])) {
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
                    properties: function () { return []; },
                    facets: function () { return []; },
                    allProperties: function () { return []; },
                    isObject: function () { return false; },
                    isArray: function () { return false; },
                    isUnion: function () { return false; },
                    componentType: function () { return null; },
                    union: function () { return null; },
                    isRequired: function () { return true; },
                    leftType: function () { return null; },
                    rightType: function () { return null; },
                    superTypes: function () { return []; },
                    adapters: []
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
    };
    return TreeLike;
}());
exports.TreeLike = TreeLike;
function collapseValues(v) {
    var labelToMethods = {};
    v.forEach(function (m) {
        var lab = label(m);
        var words = lab.split(" ");
        var num = 0;
        words.forEach(function (x) {
            if (x.length <= 3) {
                return;
            }
            num++;
            if (num == 1) {
                return;
            }
            if (num > 7) {
                return;
            }
            x = x.toLowerCase();
            if (x.charAt(x.length - 1) == 's') {
                x = x.substr(0, x.length - 1);
            }
            var r = labelToMethods[x];
            if (!r) {
                r = [];
                labelToMethods[x] = r;
            }
            r.push(m);
        });
    });
    Object.keys(labelToMethods).forEach(function (x) {
        if (labelToMethods[x].length <= 1) {
            delete labelToMethods[x];
        }
    });
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
                if (!q.has(x)) {
                    t.values.push(x);
                    q.set(x, 1);
                }
            });
            if (t.values.length <= 2) {
                t.values.forEach(function (x) { q.delete(x); });
            }
            else {
                result.push(t);
            }
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
        result = x.name();
    }
    if (result.length > 60) {
        result = result.substr(0, 50) + "...";
    }
    mm.label = result;
    return result;
}
exports.label = label;
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

},{}],4:[function(require,module,exports){
"use strict";
var or = require("./objectRender");
var hl = require("./hl");
function renderNodes(nodes) {
    var result = [];
    var obj = {};
    nodes = hl.prepareNodes(nodes);
    nodes.forEach(function (x) { return result.push(renderNode(x)); });
    return result.join("");
}
exports.renderNodes = renderNodes;
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
            var mens = "";
            if (this.versions && this.versions.versions.length > 1) {
                mens = this.versions.versions.map(function (x) { return ("<li><a onclick=\"openVersion('" + x.version + "')\">" + x.version + "</a></li>"); }).join("");
                result.push("<h5>Version: <div class=\"btn-group\">\n                  <button class=\"btn btn-default btn-xs dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">\n                    " + this.version + " <span class=\"caret\"></span>\n                  </button>\n                  <ul class=\"dropdown-menu\">\n                    " + mens + "\n                  </ul>\n                </div></h5>");
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
function renderNodesOverview(nodes, v) {
    var result = [];
    var obj = {};
    nodes = hl.prepareNodes(nodes);
    var hr = new HeaderRenderer(v);
    nodes = hr.consume(nodes);
    result.push(hr.render());
    nodes.forEach(function (x) { return result.push(renderNode(x)); });
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
                            var rs = [];
                            Object.keys(toRend).forEach(function (x) {
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
            var res = or.renderKeyValue(h.definition().nameId(), vl, small);
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
        var res = "<h5 style=\"background: gainsboro\">" + h.definition().nameId() + ":</h5>";
        var ch = h.children();
        res += renderNodes(ch);
    }
    return res;
}
exports.renderNode = renderNode;
var AttrProperty = (function () {
    function AttrProperty(_id, _caption) {
        this._id = _id;
        this._caption = _caption;
    }
    AttrProperty.prototype.id = function () {
        return this._id;
    };
    AttrProperty.prototype.caption = function () {
        return this._caption;
    };
    AttrProperty.prototype.render = function (o) {
        var atr = o.attr(this._id);
        if (atr) {
            return or.renderObj(atr.value());
        }
        return "";
    };
    return AttrProperty;
}());
exports.AttrProperty = AttrProperty;

},{"./hl":3,"./objectRender":5}],5:[function(require,module,exports){
"use strict";
var RenderMode;
(function (RenderMode) {
    RenderMode[RenderMode["FULL_VIEW"] = 0] = "FULL_VIEW";
    RenderMode[RenderMode["ROW_VIEW"] = 1] = "ROW_VIEW";
    RenderMode[RenderMode["COMPACT_VIEW"] = 2] = "COMPACT_VIEW";
})(RenderMode || (RenderMode = {}));
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
                result.push("<td>");
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
    var str = "" + vl;
    vl = highlight(str);
    if (str.length > 70 && str.indexOf('\n') != -1) {
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

},{}],6:[function(require,module,exports){
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
                result = hl.label(x);
                if (isMethod) {
                    result = methodKey(x.name()) + result;
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

},{"./controls":2,"./hl":3,"./nodeRender":4,"./registryRender":8,"./resourceRender":9,"./typeRender":10,"./workbench":11}],7:[function(require,module,exports){
"use strict";
var workbench = require("./workbench");
var rv = require("./ramlTreeView");
if (history && history.pushState) {
    window.onpopstate = function (event) {
        rv.back();
    };
}
workbench.registerHandler(function (x) {
    if (history.pushState) {
        var node = rv.ramlView.getSelection();
        if (node && node.length > 0) {
            rv.states.push(node[0].id());
        }
        history.pushState({ page: x }, document.title, document.location.toString());
    }
    rv.ramlView.openNodeById(x);
    return true;
});
function init() {
    rv.init();
}
exports.init = init;
function showApi(s) {
    rv.showApi(s);
}
exports.showApi = showApi;

},{"./ramlTreeView":6,"./workbench":11}],8:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var workbench = require("./workbench");
var ra = require("./registryApp");
function loadData(url, c) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4)
            return;
        c(JSON.parse(xhr.responseText), xhr.status);
    };
}
var RegistryDetailsView = (function (_super) {
    __extends(RegistryDetailsView, _super);
    function RegistryDetailsView() {
        _super.apply(this, arguments);
    }
    RegistryDetailsView.prototype.innerRender = function (e) {
    };
    return RegistryDetailsView;
}(workbench.ViewPart));
exports.RegistryDetailsView = RegistryDetailsView;
var GroupNode = (function () {
    function GroupNode() {
    }
    return GroupNode;
}());
var ApiWithVersions = (function () {
    function ApiWithVersions() {
    }
    return ApiWithVersions;
}());
exports.ApiWithVersions = ApiWithVersions;
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
function buildRegistryGroups(els) {
    var groups = groupBy(els, function (x) { return x.org; });
    var groupNodes = [];
    Object.keys(groups).forEach(function (gr) {
        var g = new GroupNode();
        g.name = gr;
        g.children = mergeVersions(groups[gr]);
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
}
function mergeVersions(els) {
    var groups = groupBy(els, function (x) { return x.name; });
    var groupNodes = [];
    Object.keys(groups).forEach(function (gr) {
        var g = new ApiWithVersions();
        g.name = gr;
        g.versions = groups[gr];
        g.icon = g.versions[0].icon;
        groupNodes.push(g);
    });
    return groupNodes;
}
var RegistryView = (function (_super) {
    __extends(RegistryView, _super);
    function RegistryView() {
        _super.apply(this, arguments);
        this.searchable = true;
    }
    RegistryView.prototype.load = function () {
        var _this = this;
        loadData("https://raw.githubusercontent.com/apiregistry/registry/gh-pages/registry-resolved.json", function (data, s) {
            console.log(data);
            _this.node = data;
            _this.refresh();
        });
    };
    RegistryView.prototype.setSelectedUrl = function (url) {
        this.url = url;
    };
    RegistryView.prototype.customizeAccordition = function (root, node) {
        var _this = this;
        this.addTree("Libraries", node.libraries);
        this.addTree("Apis", buildRegistryGroups(node.apis));
        var v = this;
        this.getHolder().setContextMenu({
            items: [
                { title: "Open", run: function () {
                        var api = v.getSelection()[0];
                        ra.showApi(api.location);
                    } }
            ]
        });
        if (this.url != null) {
            var selection = null;
            node.libraries.forEach(function (x) {
                if (x.location == _this.url) {
                    selection = x;
                }
            });
            var view = this;
            if (selection) {
                setTimeout(function () {
                    view.setSelection(selection);
                }, 100);
            }
        }
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
                else {
                    var c = Object.keys(e)[0];
                    return c;
                }
            }
        });
    };
    return RegistryView;
}(workbench.AccorditionTreeView));
exports.RegistryView = RegistryView;

},{"./registryApp":7,"./workbench":11}],9:[function(require,module,exports){
"use strict";
var hl = require("./hl");
var tr = require("./typeRender");
var nr = require("./nodeRender");
var ResourceRenderer = (function () {
    function ResourceRenderer(isAnnotationType) {
        if (isAnnotationType === void 0) { isAnnotationType = false; }
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
            tr.renderParameters("Uri Parameters", hl.uriParameters(h), result);
            result.push(new MethodRenderer(false, false, false, false).render(ms[0]));
        }
        else {
            result.push("<h3>Resource:" + hl.resourceUrl(h) + "</h3>");
            result.push("</hr>");
            hl.prepareNodes(h.attrs()).forEach(function (x) {
                result.push(nr.renderNode(x, false));
            });
            tr.renderParameters("Uri Parameters", hl.uriParameters(h), result);
            if (ms.length > 0) {
                result.push(renderTabFolder("Methods", ms, new MethodRenderer(false, ms.length == 1, false, true)));
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
    function MethodRenderer(topLevel, isSingle, isAnnotationType, renderAttrs) {
        if (isAnnotationType === void 0) { isAnnotationType = false; }
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
            tr.renderParameters("Uri Parameters", hl.uriParameters(h.parent()), result);
        }
        tr.renderParameters("Query Parameters", h.elements().filter(function (x) { return x.property().nameId() == "queryParameters"; }), result);
        tr.renderParameters("Headers", h.elements().filter(function (x) { return x.property().nameId() == "headers"; }), result);
        var rs = h.elements().filter(function (x) { return x.property().nameId() == "body"; });
        if (rs.length > 0) {
            result.push(renderTabFolder("Body", rs, new tr.TypeRenderer("Body", rs.length == 1)));
        }
        var rs = h.elements().filter(function (x) { return x.property().nameId() == "responses"; });
        if (rs.length > 0) {
            result.push(renderTabFolder("Responses", rs, new ResponseRenderer(rs.length == 1)));
        }
        return result.join("");
    };
    return MethodRenderer;
}());
exports.MethodRenderer = MethodRenderer;
var ResponseRenderer = (function () {
    function ResponseRenderer(isSingle, isAnnotationType) {
        if (isAnnotationType === void 0) { isAnnotationType = false; }
        this.isSingle = isSingle;
        this.isAnnotationType = isAnnotationType;
    }
    ResponseRenderer.prototype.render = function (h) {
        var result = [];
        var rs = h.elements().filter(function (x) { return x.property().nameId() == "body"; });
        if (this.isSingle && rs.length > 1) {
            result.push("<h3>Response: " + h.name() + "</h3>");
        }
        hl.prepareNodes(h.attrs()).forEach(function (x) {
            result.push(nr.renderNode(x, false));
        });
        tr.renderParameters("Headers", h.elements().filter(function (x) { return x.property().nameId() == "headers"; }), result);
        result.push(renderTabFolder(null, rs, new tr.TypeRenderer(rs.length == 1 && this.isSingle ? "Response payload" : "Payload", rs.length == 1)));
        return result.join("");
    };
    return ResponseRenderer;
}());
exports.ResponseRenderer = ResponseRenderer;

},{"./hl":3,"./nodeRender":4,"./typeRender":10}],10:[function(require,module,exports){
"use strict";
var hl = require("./hl");
var or = require("./objectRender");
var nr = require("./nodeRender");
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
    }
    NameColumn.prototype.id = function () { return "name"; };
    NameColumn.prototype.caption = function () { return "Name"; };
    NameColumn.prototype.width = function () { return "15em;"; };
    NameColumn.prototype.render = function (p, rowId) {
        var rs = p.nameId();
        if (rs.length == 0) {
            rs = "additionalProperties";
        }
        if (p instanceof WProperty) {
            var wp = p;
            if (wp._children.length > 0) {
                rs = ("<span style=\"padding-left: " + wp.level() * 20 + "px\"></span><span id=\"" + ("tricon" + rowId) + "\" class=\"glyphicon glyphicon-plus-sign\" ></span> ") + rs;
            }
            else {
                var st = "glyphicon-record";
                if (wp.recursive) {
                    st = "glyphicon-repeat";
                }
                rs = ("<span style=\"padding-left: " + wp.level() * 20 + "px\"></span><span class=\"glyphicon " + st + "\"></span> ") + rs;
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
        return hl.description(p.range());
    };
    return Description;
}());
var Type = (function () {
    function Type() {
    }
    Type.prototype.id = function () { return "description"; };
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
var TypeRenderer = (function () {
    function TypeRenderer(extraCaption, isSingle, isAnnotationType) {
        if (isAnnotationType === void 0) { isAnnotationType = false; }
        this.extraCaption = extraCaption;
        this.isSingle = isSingle;
        this.isAnnotationType = isAnnotationType;
    }
    TypeRenderer.prototype.render = function (h) {
        var at = h.localType();
        if (h.property().nameId() == "annotationTypes") {
            at = at.superTypes()[0];
        }
        var result = [];
        result.push("<h3>" + (this.extraCaption ? this.extraCaption + ": " : "") + at.nameId() + "</h3><hr>");
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
            renderPropertyTable(nm, ps, result, at);
        }
        if (at.isObject()) {
            ps = at.allProperties();
            renderPropertyTable("Properties", ps, result, at);
        }
        if (at.isArray()) {
            var ct = at.componentType();
            if (ct) {
                result.push("<h5>Component type:");
                result.push(renderTypeList([ct]).join(""));
                result.push("</h5>");
                ps = ct.allProperties();
                if (ct.isObject()) {
                    renderPropertyTable("Component type properties", ps, result, ct);
                }
            }
        }
        if (at.isUnion()) {
            result.push("Union options:");
            result.push(renderTypeList([at]).join(""));
        }
        return result.join("");
    };
    return TypeRenderer;
}());
exports.TypeRenderer = TypeRenderer;
function renderPropertyTable(name, ps, result, at) {
    result.push("<div style='padding-top: 10px'>");
    var pm = expandProps([at], ps);
    result.push(new or.TableRenderer(name, [new NameColumn(), new Type(), new Facets(), new Description()], {
        hidden: function (c) {
            return c.level() > 0;
        }
    }).render(pm));
    result.push("</div>");
}
exports.renderPropertyTable = renderPropertyTable;
function renderParameters(name, ps, result) {
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
                return !(x.name().charAt(x.name().length - 1) == "?");
            }
        });
    });
    var pm = expandProps([], pr);
    result.push(new or.TableRenderer(name, [new NameColumn(), new Type(), new Facets(), new Description()], {
        hidden: function (c) {
            return c.level() > 0;
        }
    }).render(pm));
    result.push("</div>");
}
exports.renderParameters = renderParameters;

},{"./hl":3,"./nodeRender":4,"./objectRender":5}],11:[function(require,module,exports){
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
var Pane = (function () {
    function Pane(_part) {
        this._part = _part;
    }
    Pane.prototype.setContextMenu = function (m) {
        this.contextMenuElement.innerHTML = "";
        new DrowpdownMenu(m).render(this.contextMenuElement);
    };
    Pane.prototype.setViewMenu = function (m) {
        this.menuContentElement.innerHTML = "";
        if (m.items.length == 0) {
            this.viewMenuButton.setAttribute("style", "display:none");
        }
        else {
            this.viewMenuButton.setAttribute("style", "display:inherit");
        }
        new DrowpdownMenu(m).render(this.menuContentElement);
    };
    Pane.prototype.setToolbar = function (m) {
        this.toolbarContentElement.innerHTML = "";
        new ToolbarRenderer(m).render(this.toolbarContentElement);
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
var ViewPart = (function () {
    function ViewPart(_id, _title) {
        this._id = _id;
        this._title = _title;
        this.selection = [];
        this.selectionListeners = [];
    }
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
        var n = findNode(this.treeNodes, model);
        if (n) {
            this.selection = [model];
            this.refresh();
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
            collapseIcon: "glyphicon glyphicon-chevron-down", borderColor: "0xFFFFFF" });
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
            var a = new controls.Accordition();
            this.control = a;
            this.trees = [];
            this.customizeAccordition(a, this.node);
            a.render(e);
        }
    };
    return AccorditionTreeView;
}(ViewPart));
exports.AccorditionTreeView = AccorditionTreeView;

},{"./controls":2}]},{},[1]);
