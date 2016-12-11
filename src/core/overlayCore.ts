import hl=require("./hl")
import pg=require("./propertyGroup")

declare class Map<K,V> {
    set(k: K, v: V)

    has(k: K): boolean

    get(k: K): V

    delete(k: K): boolean

    keys(): any
}
function loadData(url: string, c: (t: any, e?: number)=>void) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.send(); // (1)
    xhr.onreadystatechange = function () { // (3)
        if (xhr.readyState != 4) return;
        var data = JSON.parse(xhr.responseText);
        c(data, xhr.status)

    }
}
function postData(url: string, content: string, c: (t: any, e?: number)=>void) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    xhr.send(content); // (1)
    xhr.onreadystatechange = function () { // (3)
        if (xhr.readyState != 4) return;
        var data = JSON.parse(xhr.responseText);
        c(data, xhr.status)

    }
}

interface ILoadedOverlays {
    name: string
    overlaysFor:{ [name: string]: string}
}
function getOverlays(id: string, f: (t: ILoadedOverlays)=>void) {
    loadData("https://1-dot-adept-turbine-152120.appspot.com/ramlregistry/" + id, f);
}
function storeOverlays(id: string, value: ILoadedOverlays, f: (t: ILoadedOverlays)=>void) {
    postData("https://1-dot-adept-turbine-152120.appspot.com/ramlregistry/"+id, JSON.stringify(value), f)
}

function childObject(ovr:any,node:hl.IHighLevelNode){
    if(!hl.isMerged(node.property())){
        ovr=ovr[node.property().nameId()]
    }
    if (!ovr){
        return null;
    }
    return ovr[node.name()];
}
export class OverlayManager {


    constructor(private root: hl.IHighLevelNode, private lib_url: string, private main_url: string,private loadedOverlays:ILoadedOverlays) {

    }
    loadDataToStore(ovr:any,node:hl.IHighLevelNode){
        node.children().forEach(x=>{
            var obj=childObject(ovr,x);
            if(obj){
                this.loadDataToStore(obj,x);
                var ToPut={};
                Object.keys(obj).forEach(x=>{
                    if (x.charAt(0)=='('){
                        var oo=obj[x];
                        if (oo===null){
                            oo='!!!NULL_VALUE'
                        }
                        var key=x.substring(x.lastIndexOf('.')+1,x.length-1);
                        ToPut[key]=oo;

                    }
                })
                if (Object.keys(ToPut).length>0){
                    this.overlays.set(x,ToPut)
                }
            }
        })
    }

    overlays: Map<hl.IHighLevelNode,any> = new Map();

    possibleOverlays(target: hl.IHighLevelNode) {
        var annotations = this.root.elements().filter(x=>x.property().nameId() == "annotationTypes");

        return annotations.filter(x=> {
            var ss = x.attrs();
            var found = !x.attr("allowedTargets");

            ss.forEach(a=> {
                if (a.name() != "allowedTargets") {
                    return;
                }
                if (ss) {
                    var val = a.value();
                    if (val == target.definition().nameId()) {
                        found = true;
                    }
                    if (val == "TypeDeclaration") {
                        if (target.property()) {
                            found = found || target.property().nameId() == "types" || target.property().nameId() == "annotationTypes"
                        }
                    }
                    if(val=="API"){
                        if (target.definition().nameId()=="Api"){
                            found=true;
                        }
                    }
                }
            })
            return found;
        })
    }

    loaded=false;

    getOvelayProperties(target: hl.IHighLevelNode) {
        if (!this.loaded){
            this.loaded=true;
            if (this.loadedOverlays.overlaysFor[this.lib_url]){
                var ovr=jsyaml.load(this.loadedOverlays.overlaysFor[this.lib_url]);
                this.loadDataToStore(ovr,target.root());
            }
        }
        var overlays = this.possibleOverlays(target);
        return pg.overlayedGroupedProperties(overlays);
    }


    overlay(h: hl.IHighLevelNode) {
        if (this.overlays.has(h)) {
            return this.overlays.get(h);
        }
        var rs = {};
        this.overlays.set(h, rs);
        return rs;
    }

    save(f:(x)=>void){
        if (!this.loadedOverlays.overlaysFor){
            this.loadedOverlays.overlaysFor={};
        }
        this.loadedOverlays.overlaysFor[this.lib_url]=this.dump();
        storeOverlays(escapeUrl(this.main_url),this.loadedOverlays,x=>{
            f(x);
        })
    }

    dump(): string {
        var objToDump = {};
        objToDump["extends"] = this.main_url;

        var fn = this.lib_url.substring(this.lib_url.lastIndexOf('/') + 1)
        if (fn.lastIndexOf(".") != -1) {
            fn = fn.substring(0, fn.lastIndexOf('.'));
        }
        var u = {};
        u[fn] = this.lib_url;
        objToDump["uses"] = u
        var keys = this.overlays.keys();
        while (true) {
            var n: hl.IHighLevelNode = keys.next().value;
            if (!n) {
                break;
            }
            var val = this.overlays.get(n);
            if (Object.keys(val).length > 0) {
                var ovId = hl.overlayId(n);
                var overlayed = objToDump;
                for (var i = 0; i < ovId.length; i++) {
                    var obj = overlayed[ovId[i]];
                    if (!obj) {
                        obj = {};
                        overlayed[ovId[i]] = obj;
                    }
                    overlayed = obj;
                }
                Object.keys(val).forEach(k=> {
                    overlayed["(" + fn + "." + k + ")"] = val[k];
                })
            }
        }
        var res = dump(objToDump);
        return "#%RAML 1.0 Overlay\n" + res;
    }
}

function escapeUrl(u:string){
    var rs="";
    for (var i=0;i<u.length;i++){
        var c=u.charAt(i);
        if (c=='/'){
            c='_'
        }
        if (c==':'){
            c='_'
        }
        rs=rs+c;
    }
    return rs;
}
export function createManager(main_url: string, lib_url: string, f: (m: OverlayManager)=>void) {
    hl.loadApi(lib_url, (v)=> {
        getOverlays(escapeUrl(main_url),o=>{
            f(new OverlayManager(v, lib_url, main_url,o))
        })
    }, false);
}
declare var jsyaml: any;
export function dump(v: any) {
    var ov = jsyaml.dump(v);
    var old = "";
    while (ov != old) {
        old = ov;
        ov = ov.replace("'!!!NULL_VALUE'", "")
    }
    return ov;
}