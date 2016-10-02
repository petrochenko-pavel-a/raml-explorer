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
                    vl = JSON.stringify(hl.asObject(vl), null, 2);
                    var svl = "" + vl;
                    vl = svl.substr(1, svl.length - 1);
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
