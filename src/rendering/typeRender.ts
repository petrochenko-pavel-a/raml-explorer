import hl=require("../core/hl")
import {IHighLevelNode, IType, IProperty} from "../core/hl";
import or=require("./objectRender")
import nr=require("./nodeRender")
import usages=require("../core/registryCore")
import workbench=require("../framework/workbench")
import rtv=require("../app")
import images=require("./styles")
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
    if (x.isBuiltIn()){

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
    nowrap= true
    render(p:hl.IProperty,rowId?:string){
        var rs= p.nameId();
        var s=p.range();
        if (p.local||(!s.isBuiltIn()&&!s.isArray()&&!s.isUnion())){
            while (s.superTypes().length==1&&!s.isBuiltIn()){
                s=s.superTypes()[0];
            }
        }
        if (p.range().isObject()){
            rs=images.OBJECT_IMAGE+rs;
        }
        if (p.range().isArray()){
            rs=images.ARRAY_IMAGE+rs;
        }
        else if (s.nameId()=="StringType"){
            rs=images.STRING_IMAGE+rs;
        }
        else if (s.nameId()=="BooleanType"){
            rs=images.BOOLEAN_TYPE+rs;
        }
        else if (s.nameId()=="NumberType"){
            rs=images.NUMBER_TYPE+rs;
        }
        else if (s.nameId()=="IntegerType"){
            rs=images.NUMBER_TYPE+rs;
        }
        else if (s.nameId().indexOf("Date")!=-1){
            rs=images.DATE_TYPE+rs;
        }
        else if (s.nameId().indexOf("File")!=-1){
            rs=images.FILE_TYPE+rs;
        }
        if (rs.length==0){
            rs="additionalProperties";
        }
        if (p instanceof WProperty){
            var wp=<WProperty>p;
            if (wp._children.length>0){
                rs=`<span style="padding-left: ${wp.level()*20}px"></span><span id="${"tricon"+rowId}" class="glyphicon glyphicon-plus-sign" ></span> `+rs
            }
            else{
                rs=`<span style="padding-left: ${wp.level()*20+15}px"></span> `+rs
            }
        }
        if (p.isRequired()){
            rs+=" <small style='color: red'>(required)</small>"
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
                if (x.property&&x.property().nameId()=="enum"){
                    var descs:string[]=hl.enumDescriptions(decl);
                    if(descs){
                        var vl:string[]=x.value();
                        rs.push("enum: ")
                        for (var i=0;i<vl.length;i++){
                            if (descs[i]){
                                rs.push(" <span style='color: darkred'>"+vl[i]+" </span>");
                                rs.push("<span class='glyphicon glyphicon-question-sign' data-toggle='tooltip' title='"+descs[i]+"'></span>");
                                if (i!=vl.length-1){
                                    rs.push(",")
                                }
                            }
                            else{
                                rs.push("<span style='color: darkred'>"+vl[i]+"</span>"+(i==vl.length-1?"":", "));
                            }
                        }

                        return;
                    }
                }
                var nd=nr.renderNode(x,true);
                if (nd) {
                    rs.push(nd+"; ");
                }
            });
        }
        return rs.join("");
    }
    width(){
        return "20em"
    }
}
declare var marked:any;

class Description implements or.IColumn<hl.IProperty>{

    id(){return "description"}
    caption(){return "Description"}
    render(p:hl.IProperty){
        var desc=hl.description(p.range());

        var s= marked(desc,{gfm:true});

        while (true) {
            var q=s;
            s = s.replace("<h1", "<h4");
            s = s.replace("</h1", "</h4");
            s = s.replace("<h2", "<h4");
            s = s.replace("</h2", "</h4");
            if (q==s){
                break;
            }
        }
        return s;
    }
}
marked.Lexer.rules.gfm.heading = marked.Lexer.rules.normal.heading;
marked.Lexer.rules.tables.heading = marked.Lexer.rules.normal.heading;
class Type implements or.IColumn<hl.IProperty>{

    id(){return "type"}
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
class Meta implements or.IColumn<hl.IProperty>{
    id(){return "meta"}
    caption(){return "Type &amp; Meta"}
    render(p:hl.IProperty){
        var v=new Type().render(p)
        var f=new Facets().render(p);
        return v+(f?'('+f+')':"");
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
var usageIndex=0;
var renderClicableLink = function (root: IHighLevelNode, result: string[], label: string|any|string|string) {
    if (root.property() && root.property().nameId() == "methods") {
        result.push("<div style='padding-left: 23px;padding-top: 2px' key='" + root.id() + "'>" + hl.methodKey(root.name()) + "<a onclick='Workbench.open(\"" + root.id() + "\")'>" + label + "(" + hl.resourceUrl(root.parent()) + ")" + "</a></div>")
    }
    else if (root.property() && root.property().nameId() == "types") {
        result.push("<div style='padding-left: 20px;padding-top: 2px' key='" + root.id() + "'>"+images.GENERIC_TYPE + "<a onclick='Workbench.open(\"" + root.id() + "\")'>" + label + "</a></div>")
    }
    else if (root.property() && root.property().nameId() == "annotationTypes") {
        result.push("<div style='padding-left: 20px;padding-top: 2px' key='" + root.id() + "'>"+images.ANNOTATION_TYPE + "<a onclick='Workbench.open(\"" + root.id() + "\")'>" + label + "</a></div>")
    }
};
export class TypeRenderer{

    constructor(private meta:boolean,private extraCaption: string,private isSingle:boolean,private isAnnotationType:boolean=false){

    }
    global:boolean;
    setGlobal(b:boolean){
        this.global=b;
    }
    usages:any

    setUsages(v:any){
        this.usages=v;
    }

    render(h:IHighLevelNode):string{
        var at=h.localType();
        if (h.property().nameId()=="annotationTypes"){
            at=at.superTypes()[0];
        }
        var result:string[]=[];
        result.push("<h3>"+(this.extraCaption?this.extraCaption+": ":"")+ at.nameId()+"</h3><hr>")

        if (at.hasExternalInHierarchy()){
            var type=at;
            var content="";
            while (type){
               if (type.schemaString){

                   content=type.schemaString.trim();
               }
               type=type.superTypes()[0];


            }
            if (at.superTypes().length==1&&!at.superTypes()[0].isBuiltIn()) {
                result.push("<h5>Schema: " + renderTypeList(at.superTypes()) + "</h5>")
            }
            if (content){
                result.push(`<pre><code class="${content.charAt(0)=="<"?'':'json'}">${or.encode(content)}</code></pre>`);
            }
            return result.join("");
        }
        if (at.superTypes().length==1&&h.children().length==2){
            result.push("<h5>Type: " + renderTypeList(at.superTypes()) + "</h5>")
        }
        else {
            result.push("<h5>Supertypes: " + renderTypeList(at.superTypes()) + "</h5>")
        }
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
            renderPropertyTable(nm,ps,result,at,this.meta)
        }
        if (at.isObject()){
            ps=at.allProperties();
            if (ps.length==0){
                if (this.isAnnotationType){
                    var ts=at.superTypes();
                    if (ts.length==1){
                        ps=ts[0].allProperties();
                    }
                }
            }
            renderPropertyTable("Properties",ps,result,at,this.meta)
        }
        if (at.isArray()){
            var ct=at.componentType();
            if (ct){
                result.push("<h5>Component type:")
                result.push(renderTypeList([ct]).join(""));
                result.push("</h5>")
                ps=ct.allProperties();
                if (ct.isObject()) {
                    renderPropertyTable("Component type properties", ps, result, ct,this.meta)
                }
            }
        }
        if (at.isUnion()){
            result.push("Union options:")
            result.push(renderTypeList([at]).join(""));
        }
        at.examples();
        if (this.global){
            var usage:hl.IHighLevelNode[]=[];
            hl.findUsages(h.root(),at,usage);
            if (usage.length>0){
                result.push("<h4>Usages:</h4>");
                var roots={};
                usage.forEach(x=>{
                    var root=hl.findUsagesRoot(x);
                    var label=hl.label(root);
                    if (roots[label]){
                        return;
                    }
                    roots[label]=1;
                    renderClicableLink(root, result, label);
                })
            }
        }
        if (this.usages){
            result.push("<h4>External Usages:</h4>");
            Object.keys(this.usages).forEach(x=>{
                result.push("<div id='usage"+(usageIndex++)+"' style='margin-right: 15px'><a id='ExpandLink"+(usageIndex-1)+"' style='cursor: hand' onclick='expandUsage("+(usageIndex-1)+")'>"+images.EXPAND_IMG(""+(usageIndex-1))+usages.getTitle(x)+"</a>")
                var v=this.usages[x];
                result.push("<span style='display: none' url='"+x+"'>")
                if (v) {
                    v.forEach(y=> {
                        result.push("<div>" + y + "</div>")
                    });
                }
                result.push("</span>")
                result.push("</div>")
            })
            //console.log(this.usages)
        }
        return result.join("");
    }
}


var w:any=window;
declare var Workbench:any;
w.expandUsage=function (index) {
    var el=document.getElementById("usage"+index);
    var iel=<HTMLImageElement>document.getElementById("Expand"+index);
    var eel=<HTMLImageElement>document.getElementById("ExpandLink"+index);
    iel.src=images.COLLAPSE_LINK;
    var span=el.getElementsByTagName("span");
    var url=span.item(0).getAttribute("url");
    var sp=document.createElement("div");

    sp.innerText="...";
    el.appendChild(sp);
    var rop = function (operation: any, result: string[], rp: string) {
        var label = hl.label(operation);
        result.push("<div style='padding-left: 20px;' key='" + operation.id() + "'>" + hl.methodKey(operation.name()) + "<a>" + label + "(" + rp + ")" + "</a></div>")
        return label;
    };
    hl.loadApi(url,(x,y)=>{
        el.removeChild(sp);
        var links=el.getElementsByTagName("div");
        var allOps=hl.allOps(x);
        var result:string[]=[];
        var dups={};
        for (var i=0;i<links.length;i++){

            var link=links.item(i).innerText;
            if (dups[link]){
                continue;
            }
            else {
                dups[link] = 1;
            }
            if (link.indexOf(";;R;")==0){
                var mi=link.indexOf(";M;");
                var rp=link.substring(";;R;".length,mi==-1?link.length:mi);
                if (mi!=-1){
                    var method=link.substr(mi+3);
                    var pn=method.indexOf(";");
                    if (pn!=-1){
                        method=method.substr(0,pn);
                    }
                    var operation=allOps[rp+"."+method];
                    if (operation) {
                        var label = rop(operation, result, rp);
                    }
                }
                else{
                    rp=link.substring(";;R;".length)
                    var pn=rp.indexOf(";");
                    if (pn!=-1){
                        rp=rp.substr(0,pn);
                    }
                    Object.keys(allOps).forEach(x=>{
                        if (x.indexOf(rp)==0){
                            var operation=allOps[x];
                            var label = rop(operation, result, rp);
                        }
                    })
                }
            }
            else if (link.indexOf(";;T;")==0){

                var rp=link.substring(";;T;".length);
                var lt=rp.indexOf(";");
                if (lt!=-1){
                    rp=rp.substr(0,lt);
                }

                    var type=x.elements().filter(x=>x.name()==rp);
                    if (type.length==1) {
                        var label = hl.label(type[0]);
                        if (dups[label]){
                            continue;
                        }
                        dups[label]=1;
                        result.push("<div style='padding-left: 20px;' key='"+type[0].id()+"'>"+images.GENERIC_TYPE+"<a>" +  label+"</a></div>")
                    }

            }
            else{
                result.push("<div style='padding-left: 20px;'>" + "<a>Root</a></div>")
            }
        }
        sp=document.createElement("div");

        sp.innerHTML=result.join("");
        var children=sp.getElementsByTagName("div");
        for (var i=0;i<children.length;i++){
            var di=children.item(i);
            var linkE=di.getElementsByTagName("a");

            linkE.item(0).onclick=function(x){
                var rs=(<any>x).target.parentElement.getAttribute("key");
                rtv.setBackUrl(rtv.ramlView.path)
                var sel=rtv.ramlView.getSelection()[0];
                rtv.states.push(sel.id());
                rtv.showApi(url,()=>{

                    Workbench.open(rs);
                });
            };
        }
        el.appendChild(sp);
    },false);
    eel.onclick=function () {
        el.removeChild(sp);
        iel.src="./images/expand.gif";
        eel.onclick=function (){
            w.expandUsage(index);
        }
    }
}
export function renderPropertyTable(name:string,ps:IProperty[],result:string[],at:IType,isMeta:boolean){
    result.push("<div style='padding-top: 10px'>")
    var pm = expandProps([at],ps);
    if (isMeta){
        result.push(new or.TableRenderer(name, [new NameColumn(), new Meta(), new Description()], {

            hidden(c: WProperty){
                return c.level() > 0;
            }
        }).render(pm));
    }
    else {
        result.push(new or.TableRenderer(name, [new NameColumn(), new Type(), new Facets(), new Description()], {

            hidden(c: WProperty){
                return c.level() > 0;
            }
        }).render(pm));
    }
    result.push("</div>")
}

export function renderParameters(name:string,ps:IHighLevelNode[],result:string[],isMeta:boolean){
    ps=ps.filter(x=>!hl.isSyntetic(x))
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
                if (hl.isRAML08(x)){
                    if (!x.property()||x.property().nameId()=="uriParameters"){
                        return true;
                    }
                    return false;
                }
                return !(x.name().charAt(x.name().length-1)=="?");
            }
        })
    })
    var pm = expandProps([],pr);
    if (isMeta){
        result.push(new or.TableRenderer(name, [new NameColumn(), new Meta(), new Description()], {

            hidden(c: WProperty){
                return c.level() > 0;
            }
        }).render(pm));
    }
    else {
        result.push(new or.TableRenderer(name, [new NameColumn(), new Type(), new Facets(), new Description()], {

            hidden(c: WProperty){
                return c.level() > 0;
            }
        }).render(pm));
    }
    result.push("</div>")
}