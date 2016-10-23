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
function renderNode(h, small) {
    if (small === void 0) { small = false; }
    var vl = h.value ? h.value() : null;
    if (!h.definition) {
        var obj = h.lowLevel().dumpToObject();
        return or.renderObj(obj);
    }
    if (vl) {
        if (h.isAttr()) {
            if (typeof vl === "object") {
                if (!Array.isArray(vl)) {
                    var v = hl.asObject(h);
                    v = v[Object.keys(v)[0]];
                    vl = JSON.stringify(v, null, 2);
                    var svl = "" + vl;
                    svl = svl.replace(": null", "");
                    vl = svl.substr(1, svl.length - 2);
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
