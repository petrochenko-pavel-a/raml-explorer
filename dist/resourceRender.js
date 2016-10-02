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
        var result = [];
        hl.prepareNodes(h.attrs()).forEach(function (x) {
            result.push(nr.renderNode(x, false));
        });
        tr.renderParameters("Uri Parameters", h.elements().filter(function (x) { return x.property().nameId() == "uriParameters"; }), result);
        var ms = h.elements().filter(function (x) { return x.property().nameId() == "methods"; });
        if (ms.length > 0) {
            result.push("<h3>Methods:</h3>");
            result.push(renderTabFolder(ms, new MethodRenderer()));
        }
        return result.join("");
    };
    return ResourceRenderer;
}());
exports.ResourceRenderer = ResourceRenderer;
function renderTabFolder(nodes, r) {
    if (nodes.length == 0) {
        return "";
    }
    if (nodes.length == 1) {
        return r.render(nodes[0]);
    }
    var result = [];
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
    function MethodRenderer(isAnnotationType) {
        if (isAnnotationType === void 0) { isAnnotationType = false; }
        this.isAnnotationType = isAnnotationType;
    }
    MethodRenderer.prototype.render = function (h) {
        var result = [];
        result.push("<h3>" + h.name() + "</h3>");
        hl.prepareNodes(h.attrs()).forEach(function (x) {
            result.push(nr.renderNode(x, false));
        });
        tr.renderParameters("Query Parameters", h.elements().filter(function (x) { return x.property().nameId() == "queryParameters"; }), result);
        tr.renderParameters("Headers", h.elements().filter(function (x) { return x.property().nameId() == "headers"; }), result);
        var rs = h.elements().filter(function (x) { return x.property().nameId() == "body"; });
        if (rs.length > 0) {
            result.push("<h3>Body:</h3>");
            result.push(renderTabFolder(rs, new tr.TypeRenderer()));
        }
        var rs = h.elements().filter(function (x) { return x.property().nameId() == "responses"; });
        if (rs.length > 0) {
            result.push("<h3>Responses:</h3>");
            result.push(renderTabFolder(rs, new ResponseRenderer()));
        }
        return result.join("");
    };
    return MethodRenderer;
}());
exports.MethodRenderer = MethodRenderer;
var ResponseRenderer = (function () {
    function ResponseRenderer(isAnnotationType) {
        if (isAnnotationType === void 0) { isAnnotationType = false; }
        this.isAnnotationType = isAnnotationType;
    }
    ResponseRenderer.prototype.render = function (h) {
        var result = [];
        result.push("<h3>" + h.name() + "</h3>");
        hl.prepareNodes(h.attrs()).forEach(function (x) {
            result.push(nr.renderNode(x, false));
        });
        tr.renderParameters("Headers", h.elements().filter(function (x) { return x.property().nameId() == "headers"; }), result);
        var rs = h.elements().filter(function (x) { return x.property().nameId() == "body"; });
        result.push(renderTabFolder(rs, new tr.TypeRenderer()));
        return result.join("");
    };
    return ResponseRenderer;
}());
exports.ResponseRenderer = ResponseRenderer;
