import workbench=require("./workbench")
import controls=require("./controls")
import {Accordition, Label, Loading} from "./controls";
import hl=require("./hl")
import {IHighLevelNode, IProperty, IType} from "./hl";
import {TreeView} from "./workbench";


var Locals={
    "Id":-1,
    "Title":1,
    "Version":-1,

}
var PLocals={
    "usage": 2,
    "description":150
}


export function group(n:IHighLevelNode):number{
    if (n.definition&&n.definition()) {
        if (Locals[n.definition().nameId()]) {
            return Locals[n.definition().nameId()];
        }
    }
    if (n.property&&n.property()) {
        if (PLocals[n.property().nameId()]) {
            return PLocals[n.property().nameId()];
        }
    }
    return 10;
}

function isJoinable(n:IHighLevelNode){
    if (!n.isAttr()){
        return false;
    }
    var p=n.property()
    return p.nameId()!="annotations";
}
export function expandAnnotations(nodes:IHighLevelNode[]):IHighLevelNode[]{
    var nodesToRender:IHighLevelNode[]=[];
    //expand annotations;
    nodes.forEach(v=>{

        if (v.property&&v.property()&&v.property().nameId()=="annotations"){
            var node:hl.IHighLevelNode=v.value().toHighLevel();
            if (node!=null){
                nodesToRender.push(node);
            }
        }
        else{

            nodesToRender.push(v);
        }
    });
    nodesToRender.sort((x,y)=>{
        var g1=group(x);
        var g2=group(y);
        if (g1!=g2){
            return g1-g2;
        }
        return x.name().toLowerCase().localeCompare(y.name().toLowerCase());
    })
    var resultNodes:IHighLevelNode[]=[];
    var mp:IHighLevelNode=null;
    for (var i=0;i<nodesToRender.length;i++){
        var n=nodesToRender[i];
        if (n.property&&n.property()&&n.property().isKey()){
            continue;
        }
        if (mp){
            var merged=false;
            if(mp.property()===n.property()&&isJoinable(n)){
                if (!(mp instanceof MergedNode)){
                    if (typeof mp.value()==="string"&&typeof n.value()==="string"){
                        var mn=new MergedNode(mp.property(),mp.definition(),[mp.value(),n.value()],mp.name());
                        mp=mn;
                        merged=true;
                    }
                }
                else{
                    if (typeof n.value()=="string"){
                        (<MergedNode>mp).vl.push(n.value())
                        merged=true;
                    }
                }
            }
            if (!merged){
                resultNodes.push(mp);
                mp=n;
            }
        }
        else {
            mp = n;
        }
    }
    if (mp!=null){
        resultNodes.push(mp);
    }
    return resultNodes;
}

class MergedNode implements IHighLevelNode{

    constructor(private  p:IProperty,private t:IType,public vl:any[],private _name: string){

    }

    definition():hl.IType {
        return this.t;
    }

    name():string {
        return this._name;
    }

    property():hl.IProperty {
        return this.p;
    }

    children():IHighLevelNode[] {
        return [];
    }

    elements():IHighLevelNode[] {
        return [];
    }

    attrs():IHighLevelNode[] {
        return [];
    }

    attr(name:string):IHighLevelNode {
        return null;
    }

    value():any {
        return this.vl;
    }

    lowLevel():any {
        return [];
    }

    isAttr():boolean {
        return true;
    }
}

export function renderNodes(nodes:IHighLevelNode[]):string{
 var result:string[]=[];
 var obj:any={};
 nodes=expandAnnotations(nodes);

 nodes.forEach(x=>result.push(renderNode(x)));
 return result.join("");
}
function highlight(v:string):string{
    if (v.indexOf("http://")==0||v.indexOf("https://")==0){
        return `<a href="${v}">${v}</a>`
    }
    return v;
}
function renderKeyValue(k:string,vl:any):string{
    k=k.charAt(0).toUpperCase()+k.substr(1);
    var str=""+vl;

    vl=highlight(str)
    if (str.length>50&&str.indexOf(' ')!=-1){
        var res=`<h5 style="background: gainsboro">${k}: </h5><div>${vl}</div>`
        return res;
    }
    return `<h5>${k}: ${vl} </h5>`
}
export function renderObj(v:any):string{
    if (Array.isArray(v)){
        var r:any[]=v;
        return r.map(x=>renderObj(x)).join("");
    }
    var result:string[]=[];
    Object.getOwnPropertyNames(v).forEach(p=>{
        result.push(renderKeyValue(p,v[p]));
    })
    return result.join("");
}

export function  renderNode(h:IHighLevelNode):string{
    var vl=h.value?h.value():null;
    if (!h.definition){
        var obj=h.lowLevel().dumpToObject();
        return renderObj(obj);
    }
    if (vl){
        if (h.isAttr()){
            res=renderKeyValue(h.property().nameId(),vl)
        }
        else {
            var res =renderKeyValue(h.definition().nameId(),vl);
        }
    }
    else {
        var res = `<h5 style="background: gainsboro">${h.definition().nameId()}:</h5>`
        var ch=h.children();
        res+=renderNodes(ch);
    }
    return res;
}
export class RAMLDetailsView extends workbench.ViewPart{

    _element:hl.IHighLevelNode;

    setSelection(v:hl.IHighLevelNode){
        this._element=v;
        this.refresh();
    }

    innerRender(e:Element) {
        if (this._element)
        {
            var cnt=`<h3>${this._element.name()}</h3><hr/>`+renderNodes(this._element.children());
            new Label(this._element.name(),cnt).render(e);
        }
        else{
            e.innerHTML="";
        }
    }
}

export class RAMLTreeView extends workbench.ViewPart{

    protected api:IHighLevelNode;

    constructor(private path:string)
    {
        super("Overview","Overview")
    }

    createTree(name: string){
        var tree=new workbench.TreeView(name,name);
        tree.setContentProvider(new workbench.ArrayContentProvider());
        tree.setLabelProvider({
            label(x:any){

                return ""+x.name();
            },
            icon(x:any){
                return "glyphicon glyphicon-pencil"
            }
        })
        var view=this;
        tree.addSelectionListener({
            selectionChanged(z:any[]){
                view.onSelection(z);
            }
        })
        return tree;
    }

    innerRender(e:Element) {
        if (!this.api) {
            new Loading().render(e);
            hl.loadApi(this.path,api=>{
                this.api=api;
                this.refresh();
            })
        }
        else{
            var x=this.api.elements();
            var overview:string=renderNodes(this.api.attrs());

            var us=this.api.attr("usage")
            //console.log(us.value)
            var a = new Accordition();
            //tree.setInput(x);
            //a.add(tree)
            if (overview.length>0) {
                a.add(new Label("Generic Info", overview))
            }
            var groups={};
            this.api.elements().forEach(x=>{
                var z=groups[x.property().nameId()];
                if (!z){
                    z=[];
                    groups[x.property().nameId()]=z;
                }
                z.push(x);
            });
            if (groups["annotationTypes"]){
                var at=groups["annotationTypes"]
                var annotationTypes=groups['annotationTypes'];
                var types=this.createTree("Annotation Types");
                types.setInput(at);
                a.add(types)
            };
            if (groups["types"]){
                var at=groups["types"]
                var annotationTypes=groups['types'];
                var types=this.createTree("Types");
                types.setInput(at);
                a.add(types)
            };
            //a.add(new Label("Types"))
            a.render(e);
        }
    }
}