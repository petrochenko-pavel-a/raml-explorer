

import hl=require("./hl")
import {IHighLevelNode} from "./hl";
import or=require("./objectRender")
import nr=require("./nodeRender")

export function renderTypeList(t:hl.IType[]){
    var result:string[]=[];
    t.forEach(x=>{
        result.push(renderTypeLink(x))
    })
    return result;
}
function escapeBuiltIn(n:string):string{
    if (n==="StringType"){
        n="string"
    }
    if (n==="BooleanType"){
        n="boolean"
    }
    if (n==="NumberType"){
        n="number"
    }
    return n;
}
function renderTypeLink(x:hl.IType):string{
    var result:string[]=[];
    if (x.isArray()){
        var cp=x.componentType();
        var lnk=renderTypeLink(cp);
        if (cp.isUnion()){
            lnk="("+lnk+")"
        }
        return lnk+"[]";
    }
    if (x.isUnion()){
        return renderTypeLink(x.union().leftType())+" | "+renderTypeLink(x.union().rightType());
    }
    var d=hl.getDeclaration(x);

    if (d){
        var name=x.nameId();
        if (!name){
            if (x.superTypes().length==1){
                name=x.superTypes()[0].nameId();
            }
        }
        name=escapeBuiltIn(name);
        result.push(new or.Link(d,name).render()+"")
    }
    else{
        var name=x.nameId();
        if (!name){
            if (x.superTypes().length==1){
                name=x.superTypes()[0].nameId();
            }
        }
        name=escapeBuiltIn(name);
        result.push("<b>"+name+"</b> ");
    }
    return result.join("");
}

class NameColumn implements or.IProperty<hl.IProperty>{

    id(){return "name"}
    caption(){return "Name"}
    render(p:hl.IProperty){

        var rs= p.nameId();
        if (!p.isRequired()){
            rs+=" <small>(optional)</small>"
        }
        return rs;
    }
}
var skipProps={
    "description":true,
    "example": true,
    "examples": true,
    "type": true,
    "required": true,
    "items": true
}

class Facets implements or.IProperty<hl.IProperty>{

    id(){return "name"}
    caption(){return "Facets"}
    render(p:hl.IProperty){
        var decl=hl.getDeclaration(p.range(),false);
        var rs:string[]=[];
        if (decl) {

            hl.prepareNodes(decl.attrs()).forEach(x=> {
                if (skipProps[x.name()]) {
                    return;
                }
                rs.push(nr.renderNode(x,true));
            });
        }
        return rs.join("");
    }
}
class Description implements or.IProperty<hl.IProperty>{

    id(){return "description"}
    caption(){return "Description"}
    render(p:hl.IProperty){
        
        return hl.description(p.range());
    }
}
class Type implements or.IProperty<hl.IProperty>{

    id(){return "description"}
    caption(){return "Type"}
    render(p:hl.IProperty){
        return renderTypeLink(p.range());
        //return hl.description(p.range());
    }
}
class WProperty implements hl.IProperty{

    constructor(private _orig:hl.IProperty,private _o:hl.IProperty){}

    nameId():string {
        if (!(this._orig instanceof  WProperty)) {
            return "<span style='margin-left: 15px'>" + "" + this._o.nameId() + "</span>";
        }
    }

    isKey():boolean {
        return this._o.isKey();
    }

    range():hl.IType {
        return this._o.range();
    }

    isRequired():boolean {
        return this._o.isRequired();
    }
}

var expandProps = function (ps:hl.IProperty[]) {
    var pm:hl.IProperty[] = [];
    ps.forEach(x=> {
        var ps = x.range().properties();

        pm.push(x);
        if (ps.length > 0) {
            expandProps(ps).forEach(y=>pm.push(new WProperty(x, y)));
        }
        if (x.range().isArray()&&!x.range().nameId()){
            var as=x.range().componentType().properties();
            if (as.length>0){
                expandProps(as).forEach(y=>pm.push(new WProperty(x, y)));
            }
        }
    })
    return pm;
};
export class TypeRenderer{

    constructor(private isAnnotationType:boolean=false){

    }

    render(h:IHighLevelNode):string{
        var at=h.localType();
        var result:string[]=[];
        result.push("<h3>"+at.nameId()+"</h3><hr>")
        result.push("<h5>Supertypes: "+renderTypeList(at.superTypes())+"</h5>")
        var desc=hl.description(at);
        if (desc){
            result.push("<h5 style='display: inline'>Description: </h5>"+desc)
        }
        hl.prepareNodes(h.attrs()).forEach(x=> {
            if (skipProps[x.name()]) {
                return;
            }
            result.push(nr.renderNode(x,false));
        });
        if (!this.isAnnotationType) {
            var st=hl.subTypes(at);
            if (st.length>0) {
                result.push("<h5>Direct known subtypes: " + renderTypeList(st));
            }
        }
        if (at.isObject()){
            result.push("<div style='padding-top: 10px'>")
            var ps=at.allProperties();
            var pm = expandProps(ps);
            result.push(new or.TableRenderer("Properties",[new NameColumn(),new Description(), new Type(),new Facets()]).render(pm));
            result.push("</div>")
        }
        return result.join("");
    }
}


