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
            result.push(new MethodRenderer(false, false, false).render(ms[0]));
        }
        else {
            result.push("<h3>Resource:" + hl.resourceUrl(h) + "</h3>");
            result.push("</hr>");
            hl.prepareNodes(h.attrs()).forEach(function (x) {
                result.push(nr.renderNode(x, false));
            });
            tr.renderParameters("Uri Parameters", hl.uriParameters(h), result);
            if (ms.length > 0) {
                result.push(renderTabFolder("Methods", ms, new MethodRenderer(ms.length == 1, false, true)));
            }
        }
        return result.join("");
    };
    return ResourceRenderer;
}());
exports.ResourceRenderer = ResourceRenderer;
function renderTabFolder(caption, nodes, r) {
    if (nodes.length == 0) {
        return "";
    }
    if (nodes.length == 1) {
        return r.render(nodes[0]);
    }
    var result = [];
    result.push("<h3>" + caption + "</h3>");
    result.push("<ul class=\"nav nav-tabs\">");
    var num = 0;
    nodes.forEach(function (x) { return result.push("<li class=\"" + (num++ == 0 ? "active" : "") + "\"><a data-toggle=\"tab\" href=\"#" + (x.name() + "Tab") + "\">" + x.name() + "</a></li>"); });
    result.push("</ul>");
    num = 0;
    result.push("<div class=\"tab-content\">");
    nodes.forEach(function (x) { return result.push("<div class=\"tab-pane fade " + (num++ == 0 ? "in active" : "") + "\" id=\"" + (x.name() + "Tab") + "\">" + r.render(x) + "</div>"); });
    result.push('</div>');
    return result.join("");
}
exports.renderTabFolder = renderTabFolder;
var MethodRenderer = (function () {
    function MethodRenderer(isSingle, isAnnotationType, renderAttrs) {
        if (isAnnotationType === void 0) { isAnnotationType = false; }
        this.isSingle = isSingle;
        this.isAnnotationType = isAnnotationType;
        this.renderAttrs = renderAttrs;
    }
    MethodRenderer.prototype.render = function (h) {
        var result = [];
        if (this.isSingle) {
            result.push("<h3>Method: " + h.name() + "</h3>");
        }
        if (this.renderAttrs) {
            hl.prepareNodes(h.attrs()).forEach(function (x) {
                result.push(nr.renderNode(x, false));
            });
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
