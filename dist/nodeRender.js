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
