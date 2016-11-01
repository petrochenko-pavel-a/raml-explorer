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
                title = this.control.getSelectedTitle();
            }
            var a = new controls.Accordition();
            this.control = a;
            this.trees = [];
            this.customizeAccordition(a, this.node);
            a.render(e);
            if (title) {
                for (var i = 0; i < this.control.children.length; i++) {
                    if (this.control.children[i].title() == title) {
                        this.control.expandIndex(i);
                    }
                }
            }
        }
    };
    return AccorditionTreeView;
}(ViewPart));
exports.AccorditionTreeView = AccorditionTreeView;
