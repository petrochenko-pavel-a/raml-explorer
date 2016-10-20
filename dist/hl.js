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
        root = api.expand ? api.expand().highLevel() : api.highLevel();
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
