"use strict";
var hl = require("./hl");
var or = require("./objectRender");
var nr = require("./nodeRender");
var usages = require("./usagesRegistry");
var ramlTreeView_1 = require("./ramlTreeView");
var rtv = require("./ramlTreeView");
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
            rs = "<img src='object.gif'/> " + rs;
        }
        if (p.range().isArray()) {
            rs = "<img src='arraytype_obj.gif'/> " + rs;
        }
        else if (s.nameId() == "StringType") {
            rs = "<img src='string.gif'/> " + rs;
        }
        else if (s.nameId() == "BooleanType") {
            rs = "<img src='boolean.gif'/> " + rs;
        }
        else if (s.nameId() == "NumberType") {
            rs = "<img src='number.png'/> " + rs;
        }
        else if (s.nameId() == "IntegerType") {
            rs = "<img src='number.png'/> " + rs;
        }
        else if (s.nameId().indexOf("Date") != -1) {
            rs = "<img src='date.gif'/> " + rs;
        }
        else if (s.nameId().indexOf("File") != -1) {
            rs = "<img src='file.gif'/> " + rs;
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
                var st = "glyphicon-record";
                if (wp.recursive) {
                    st = "glyphicon-repeat";
                }
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
var usageIndex = 0;
var renderClicableLink = function (root, result, label) {
    if (root.property() && root.property().nameId() == "methods") {
        result.push("<div style='padding-left: 23px;padding-top: 2px' key='" + root.id() + "'>" + hl.methodKey(root.name()) + "<a onclick='Workbench.open(\"" + root.id() + "\")'>" + label + "(" + hl.resourceUrl(root.parent()) + ")" + "</a></div>");
    }
    else if (root.property() && root.property().nameId() == "types") {
        result.push("<div style='padding-left: 20px;padding-top: 2px' key='" + root.id() + "'><img src='typedef_obj.gif'/>" + "<a onclick='Workbench.open(\"" + root.id() + "\")'>" + label + "</a></div>");
    }
    else if (root.property() && root.property().nameId() == "annotationTypes") {
        result.push("<div style='padding-left: 20px;padding-top: 2px' key='" + root.id() + "'><img src='annotation_obj.gif'/>" + "<a onclick='Workbench.open(\"" + root.id() + "\")'>" + label + "</a></div>");
    }
};
var TypeRenderer = (function () {
    function TypeRenderer(extraCaption, isSingle, isAnnotationType) {
        if (isAnnotationType === void 0) { isAnnotationType = false; }
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
                result.push("<div id='usage" + (usageIndex++) + "' style='margin-right: 15px'><a id='ExpandLink" + (usageIndex - 1) + "' style='cursor: hand' onclick='expandUsage(" + (usageIndex - 1) + ")'><img src='expand.gif' id='Expand" + (usageIndex - 1) + "'/>" + usages.getTitle(x) + "</a>");
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
    iel.src = "collapse.gif";
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
                        return;
                    }
                    dups[label] = 1;
                    result.push("<div style='padding-left: 20px;' key='" + type[0].id() + "'><img src='typedef_obj.gif'/><a>" + label + "</a></div>");
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
                rtv.setBackUrl(ramlTreeView_1.ramlView.path);
                var sel = ramlTreeView_1.ramlView.getSelection()[0];
                rtv.states.push(sel.id());
                ramlTreeView_1.ramlView.setUrl(url, function () {
                    Workbench.open(rs);
                });
            };
        }
        el.appendChild(sp);
    }, false);
    eel.onclick = function () {
        el.removeChild(sp);
        iel.src = "expand.gif";
        eel.onclick = function () {
            w.expandUsage(index);
        };
    };
};
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
