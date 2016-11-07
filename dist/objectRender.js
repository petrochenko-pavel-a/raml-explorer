"use strict";
function encode(r) {
    return r.replace(/[\x26\x0A\<>'"]/g, function (r) { return "&#" + r.charCodeAt(0) + ";"; });
}
exports.encode = encode;
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
