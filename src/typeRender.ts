

import hl=require("./hl")
import {IHighLevelNode, IType, IProperty} from "./hl";
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
    if (n==="DateTimeType"){
        n="date-time"
    }
    if (n==="BooleanType"){
        n="boolean"
    }
    if (n==="NumberType"){
        n="number"
    }
    if (n==="IntegerType"){
        n="integer"
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
        result.push("<span>"+name+"</span> ");
    }
    return result.join("");
}

class NameColumn implements or.IColumn<hl.IProperty>{

    id(){return "name"}
    caption(){return "Name"}
    width(){return "15em;"}
    render(p:hl.IProperty,rowId?:string){

        var rs= p.nameId();
        if (p instanceof WProperty){
            var wp=<WProperty>p;
            if (wp._children.length>0){
                rs=`<span style="padding-left: ${wp.level()*20}px"></span><span id="${"tricon"+rowId}" class="glyphicon glyphicon-plus-sign" ></span> `+rs
            }
            else{
                var st="glyphicon-record"
                if (wp.recursive){
                    st="glyphicon-repeat"
                }
                rs=`<span style="padding-left: ${wp.level()*20}px"></span><span class="glyphicon ${st}"></span> `+rs
            }
        }
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

class Facets implements or.IColumn<hl.IProperty>{

    id(){return "name"}
    caption(){return "Facets &amp; Annotations"}
    render(p:hl.IProperty){
        var decl=hl.getDeclaration(p.range(),false);
        var rs:string[]=[];
        if (decl) {

            hl.prepareNodes(decl.attrs()).forEach(x=> {
                if (skipProps[x.name()]) {
                    return;
                }
                rs.push(nr.renderNode(x,true)+"; ");
            });
        }
        return rs.join("");
    }
    width(){
        return "20em"
    }
}
class Description implements or.IColumn<hl.IProperty>{

    id(){return "description"}
    caption(){return "Description"}
    render(p:hl.IProperty){
        
        return hl.description(p.range());
    }
}
class Type implements or.IColumn<hl.IProperty>{

    id(){return "description"}
    caption(){return "Type"}
    render(p:hl.IProperty){
        var s=p.range();
        if (p.local||(!s.nameId()&&!s.isArray()&&!s.isUnion())){
            if (s.superTypes().length==1){
                s=s.superTypes()[0]
            }
        }
        return "<span style='white-space: nowrap;'>"+renderTypeLink(s)+"</span>";
        //return hl.description(p.range());
    }

    width(){
        return "15em"
    }
}
class WProperty implements hl.IProperty{

    _children: hl.IProperty[]=[];
    recursive:boolean=false;
    local:boolean
    constructor(private _orig:hl.IProperty,private _o:hl.IProperty){
        if (_orig instanceof WProperty){
            (<WProperty>_orig)._children.push(_o);
        }
        if (_o.local){
            this.local=true;
        }
    }
    level():number{
        if (this._orig){
            if (this._orig instanceof WProperty){
                var wp=<WProperty>this._orig;
                return wp.level()+1;
            }
        }
        return 0;
    }

    nameId():string {
        return this._o.nameId();
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


var expandProps = function (ts:hl.IType[],ps:hl.IProperty[],parent?:hl.IProperty):WProperty[] {
    var pm:WProperty[] = [];
    ps.forEach(x=> {
        x = new WProperty(parent, x);
        pm.push(<WProperty>x);
        var r = x.range();
        if (ts.indexOf(r) == -1) {
            ts.push(r);
            if(r.isObject()) {
                var ps = r.allProperties();
                if (ps.length > 0) {
                    expandProps(ts, ps, x).forEach(y=>pm.push(y));
                }
            }
            else if (x.range().isArray() && !x.range().nameId()) {
                if (x.range().isObject()) {
                    var as = x.range().componentType().allProperties();
                    if (as.length > 0) {
                        expandProps(ts, as, x).forEach(y=>pm.push(y));
                    }
                }
            }
            ts.pop();
        }
        else{
            (<WProperty>x).recursive=true;
        }

    })
    return pm;
};
export class TypeRenderer{

    constructor(private isAnnotationType:boolean=false){

    }

    render(h:IHighLevelNode):string{
        var at=h.localType();
        if (h.property().nameId()=="annotationTypes"){
            at=at.superTypes()[0];
        }
        var result:string[]=[];
        result.push("<h3>"+at.nameId()+"</h3><hr>")
        result.push("<h5>Supertypes: "+renderTypeList(at.superTypes())+"</h5>")
        var desc=hl.description(at);
        if (desc){
            result.push("<h5 style='display: inline'>Description: </h5><span style='color: darkred'>"+desc+"</span>")
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
        var ps=at.facets();
        var nm="Facet declarations";
        if (ps.length>0){
            renderPropertyTable(nm,ps,result,at)
        }
        if (at.isObject()){
            ps=at.allProperties();
            renderPropertyTable("Properties",ps,result,at)
        }
        if (at.isArray()){
            var ct=at.componentType();
            if (ct){
                result.push("Component type:")
                result.push(renderTypeList([ct]).join(""));
                ps=ct.allProperties();
                if (ct.isObject()) {
                    renderPropertyTable("Component type properties", ps, result, ct)
                }
            }
        }
        if (at.isUnion()){
            result.push("Union options:")
            result.push(renderTypeList([at]).join(""));
        }
        return result.join("");
    }
}
export function renderPropertyTable(name:string,ps:IProperty[],result:string[],at:IType){
    result.push("<div style='padding-top: 10px'>")
    var pm = expandProps([at],ps);
    result.push(new or.TableRenderer(name,[new NameColumn(), new Type(),new Facets(),new Description()],{

        hidden(c:WProperty){
            return c.level()>0;
        }
    }).render(pm));
    result.push("</div>")
}

export function renderParameters(name:string,ps:IHighLevelNode[],result:string[]){
    if (ps.length==0){
        return;
    }
    result.push("<div style='padding-top: 10px'>")
    var pr:IProperty[]=[];
    ps.forEach(x=>{
        pr.push({
            nameId():string{
                if(x.name().charAt(x.name().length-1)=="?"){
                    var r=x.attr("required");
                    if (!r){
                        return x.name().substr(0,x.name().length-1);
                    }
                }
                return x.name();
            },
            isKey() {
                return false;
            },
            local:true,
            range() {
                return x.localType();
            },
            isRequired(){
                var r=x.attr("required");
                if (r&&r.value()==="false"){
                    return false;
                }
                if (r&&r.value()=="true"){
                    return true;
                }
                return !(x.name().charAt(x.name().length-1)=="?");
            }
        })
    })
    var pm = expandProps([],pr);
    result.push(new or.TableRenderer(name,[new NameColumn(), new Type(),new Facets(),new Description()],{

        hidden(c:WProperty){
            return c.level()>0;
        }
    }).render(pm));
    result.push("</div>")
}

