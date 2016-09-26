(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var workbench = require("./workbench");
var rv = require("./ramlTreeView");
var page = new workbench.Page("rest");
var details = new rv.RAMLDetailsView("Details", "Details");
var r2j = "https://raw.githubusercontent.com/OnPositive/aml/master/raml2java.raml";
var ramlView = new rv.RAMLTreeView(r2j);
page.addView(details, "*", 100, workbench.Relation.LEFT);
page.addView(ramlView, "Details", 20, workbench.Relation.LEFT);
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

},{"./ramlTreeView":4,"./workbench":5}],2:[function(require,module,exports){
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
            e.innerHTML = "<span style=\"padding: 5px\">" + this.content + "</span>";
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
    }
    Accordition.prototype.innerRender = function (e) {
        var topId = nextId();
        var templates = [];
        var headings = [];
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
        var content = "<div class=\"panel-group\" id=\"" + topId + "\" style=\"margin: 0;padding: 0;display: flex;flex-direction: column;flex: 1 1 auto; height: 100%;overflow: hidden\">\n             " + templates.join('') + "       \n        </div>";
        e.innerHTML = content;
        for (var i = 0; i < this.children.length; i++) {
            var el = document.getElementById(bids[i]);
            this.children[i].render(el);
        }
        var i = 0;
        headings.forEach(function (x) {
            var panelId = bids[i];
            var containerId = gids[i];
            var k = i;
            document.getElementById(x).onclick = function () {
                for (var j = 0; j < bids.length; j++) {
                    if (j != k) {
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
            i++;
        });
    };
    return Accordition;
}(Composite));
exports.Accordition = Accordition;

},{}],3:[function(require,module,exports){
"use strict";
function loadApi(path, f) {
    RAML.Parser.loadApi(path).then(function (api) {
        f(api.highLevel());
    });
}
exports.loadApi = loadApi;

},{}],4:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var workbench = require("./workbench");
var controls_1 = require("./controls");
var hl = require("./hl");
var Locals = {
    "Id": -1,
    "Title": 1,
    "Version": -1,
};
var PLocals = {
    "usage": 2,
    "description": 150
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
function isJoinable(n) {
    if (!n.isAttr()) {
        return false;
    }
    var p = n.property();
    return p.nameId() != "annotations";
}
function expandAnnotations(nodes) {
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
}
exports.expandAnnotations = expandAnnotations;
var MergedNode = (function () {
    function MergedNode(p, t, vl, _name) {
        this.p = p;
        this.t = t;
        this.vl = vl;
        this._name = _name;
    }
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
function renderNodes(nodes) {
    var result = [];
    var obj = {};
    nodes = expandAnnotations(nodes);
    nodes.forEach(function (x) { return result.push(renderNode(x)); });
    return result.join("");
}
exports.renderNodes = renderNodes;
function highlight(v) {
    if (v.indexOf("http://") == 0 || v.indexOf("https://") == 0) {
        return "<a href=\"" + v + "\">" + v + "</a>";
    }
    return v;
}
function renderKeyValue(k, vl) {
    k = k.charAt(0).toUpperCase() + k.substr(1);
    var str = "" + vl;
    vl = highlight(str);
    if (str.length > 50 && str.indexOf(' ') != -1) {
        var res = "<h5 style=\"background: gainsboro\">" + k + ": </h5><div>" + vl + "</div>";
        return res;
    }
    return "<h5>" + k + ": " + vl + " </h5>";
}
function renderObj(v) {
    if (Array.isArray(v)) {
        var r = v;
        return r.map(function (x) { return renderObj(x); }).join("");
    }
    var result = [];
    Object.getOwnPropertyNames(v).forEach(function (p) {
        result.push(renderKeyValue(p, v[p]));
    });
    return result.join("");
}
exports.renderObj = renderObj;
function renderNode(h) {
    var vl = h.value ? h.value() : null;
    if (!h.definition) {
        var obj = h.lowLevel().dumpToObject();
        return renderObj(obj);
    }
    if (vl) {
        if (h.isAttr()) {
            res = renderKeyValue(h.property().nameId(), vl);
        }
        else {
            var res = renderKeyValue(h.definition().nameId(), vl);
        }
    }
    else {
        var res = "<h5 style=\"background: gainsboro\">" + h.definition().nameId() + ":</h5>";
        var ch = h.children();
        res += renderNodes(ch);
    }
    return res;
}
exports.renderNode = renderNode;
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
        if (this._element) {
            var cnt = ("<h3>" + this._element.name() + "</h3><hr/>") + renderNodes(this._element.children());
            new controls_1.Label(this._element.name(), cnt).render(e);
        }
        else {
            e.innerHTML = "";
        }
    };
    return RAMLDetailsView;
}(workbench.ViewPart));
exports.RAMLDetailsView = RAMLDetailsView;
var RAMLTreeView = (function (_super) {
    __extends(RAMLTreeView, _super);
    function RAMLTreeView(path) {
        _super.call(this, "Overview", "Overview");
        this.path = path;
    }
    RAMLTreeView.prototype.createTree = function (name) {
        var tree = new workbench.TreeView(name, name);
        tree.setContentProvider(new workbench.ArrayContentProvider());
        tree.setLabelProvider({
            label: function (x) {
                return "" + x.name();
            },
            icon: function (x) {
                return "glyphicon glyphicon-pencil";
            }
        });
        var view = this;
        tree.addSelectionListener({
            selectionChanged: function (z) {
                view.onSelection(z);
            }
        });
        return tree;
    };
    RAMLTreeView.prototype.innerRender = function (e) {
        var _this = this;
        if (!this.api) {
            new controls_1.Loading().render(e);
            hl.loadApi(this.path, function (api) {
                _this.api = api;
                _this.refresh();
            });
        }
        else {
            var x = this.api.elements();
            var overview = renderNodes(this.api.attrs());
            var us = this.api.attr("usage");
            var a = new controls_1.Accordition();
            if (overview.length > 0) {
                a.add(new controls_1.Label("Generic Info", overview));
            }
            var groups = {};
            this.api.elements().forEach(function (x) {
                var z = groups[x.property().nameId()];
                if (!z) {
                    z = [];
                    groups[x.property().nameId()] = z;
                }
                z.push(x);
            });
            if (groups["annotationTypes"]) {
                var at = groups["annotationTypes"];
                var annotationTypes = groups['annotationTypes'];
                var types = this.createTree("Annotation Types");
                types.setInput(at);
                a.add(types);
            }
            ;
            if (groups["types"]) {
                var at = groups["types"];
                var annotationTypes = groups['types'];
                var types = this.createTree("Types");
                types.setInput(at);
                a.add(types);
            }
            ;
            a.render(e);
        }
    };
    return RAMLTreeView;
}(workbench.ViewPart));
exports.RAMLTreeView = RAMLTreeView;

},{"./controls":2,"./hl":3,"./workbench":5}],5:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
    TreeView.prototype.onSearch = function (s) {
        if (!this.treeId) {
            return;
        }
        $('#' + this.treeId).treeview("search", s, { revealResults: true });
        var lst = document.getElementById(this.treeId).getElementsByTagName("li");
        var parents = {};
        for (var i = 0; i < lst.length; i++) {
            var el = lst.item(i);
            if (el.classList.contains("search-result")) {
                el.style.display = "inherit";
                var id = el.attributes.getNamedItem("data-nodeid").value;
                var rs = $('#tree').treeview("getParent", parseInt(id));
                parents[rs.nodeId] = true;
                while (rs.parentId !== undefined) {
                    parents[rs.parentId] = true;
                    rs = $('#tree').treeview("getParent", rs.parentId);
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
            collapseIcon: "glyphicon glyphicon-chevron-down", borderColor: "0xFFFFFF" });
        var sel = $('#' + treeId).treeview("getSelected");
        view.onSelection(sel.map(function (x) { return x.original; }));
    };
    TreeView.prototype.getTree = function () {
        var _this = this;
        if (this.input && this.contentProvider && this.labelProvider) {
            var els = this.contentProvider.elements(this.input);
            return els.map(function (x) { return buildTreeNode(x, _this.contentProvider, _this.labelProvider, _this.selection); });
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

},{}]},{},[1]);
