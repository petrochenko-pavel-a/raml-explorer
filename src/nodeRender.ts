import  or=require("./objectRender")
import hl=require("./hl")
import reg=require("./registryRender")
import IHighLevelNode=hl.IHighLevelNode;
export function renderNodes(nodes:IHighLevelNode[]):string{
    var result:string[]=[];
    var obj:any={};
    nodes=hl.prepareNodes(nodes);
    nodes.forEach(x=>result.push(renderNode(x)));
    return result.join("");
}

export class HeaderRenderer{

    title: string
    iconUrl: string
    version: string
    baseUrl: string

    constructor(private versions?:reg.ApiWithVersions){

    }

    consume(nodes:hl.IHighLevelNode[]):hl.IHighLevelNode[]{
        var result:hl.IHighLevelNode[]=[];
        nodes.forEach(x=>{
            if(x.property().nameId()=="title"){
                this.title=x.value();
                return;
            }
            if(x.property().nameId()=="version"){
                this.version=x.value();
                return;
            }
            if(x.property().nameId()=="baseUri"){
                this.baseUrl=x.value();
                return;
            }
            if (x.definition().nameId()==="Icons"){
                var obj=x.lowLevel().dumpToObject(true);
                obj=obj[Object.keys(obj)[0]];
                this.iconUrl=obj[0].url;
                return;
            }

            result.push(x);
        })
        return result;
    }

    render():string{
        var result:string[]=[];
        if (this.iconUrl!=null){
            result.push(`<img src='${this.iconUrl}'/>`)
        }
        if (this.title!=null){
            result.push("<h4 style='display: inline'> "+this.title+"</h4>")
        }
        if (this.version!=null){
            var mens=""
            if (this.versions&&this.versions.versions.length>1){
                mens=this.versions.versions.map(x=>`<li><a onclick="openVersion('${x.version}')">${x.version}</a></li>`).join("")
                result.push(`<h5>Version: <div class="btn-group">
                  <button class="btn btn-default btn-xs dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    ${this.version} <span class="caret"></span>
                  </button>
                  <ul class="dropdown-menu">
                    ${mens}
                  </ul>
                </div></h5>`)
            }
            else {
                result.push(or.renderKeyValue("Version", this.version, false))
            }
        }
        if (this.baseUrl!=null){
            result.push(or.renderKeyValue("Base url",this.baseUrl,false))
        }
        return result.join("");
    }
}

export function renderNodesOverview(nodes:IHighLevelNode[],v?:reg.ApiWithVersions,path?:string):string{
    var result:string[]=[];
    var obj:any={};
    nodes=hl.prepareNodes(nodes);
    var hr=new HeaderRenderer(v);
    nodes=hr.consume(nodes);
    result.push(hr.render())

    nodes.forEach(x=>result.push(renderNode(x)));
    if (path){
        result.push("<hr/>");
        result.push("<a href='"+path+"'>Get RAML</a>");
    }
    return result.join("");
}
var ToSkip={"LogicalStructure":1,"EnumDescriptions":1,"is":1,"Id":1,"displayName":1}
export function renderNode(h:IHighLevelNode,small:boolean=false):string{
    if (h.definition&&ToSkip[h.definition().nameId()]){
        return "";
    }

    var vl=h.value?h.value():null;
    if (!h.definition){
        var obj=h.lowLevel().dumpToObject();
        return or.renderObj(obj);
    }
    if (vl){
        if (h.isAttr()){
            var pname=h.property().nameId();
            if (ToSkip[pname]){
                return "";
            }
            if (pname=="securedBy"){
                var v=hl.asObject(h);
                v = v[Object.keys(v)[0]];
                var result:string[]=[];
                if (Object.keys(v).length==1){
                    if (h.parent()&&(h.parent().parent()!=null)) {
                        var sd = h.root().elements().filter(x=>x.property() && x.property().nameId() == "securitySchemes");
                        if (sd.length == 1) {
                            var toRend=v[Object.keys(v)[0]];
                            var rs:string[]=[];
                            Object.keys(toRend).forEach(x=>{
                                rs.push(or.renderKeyValue(x,toRend[x]));
                            })
                            return "<div>"+rs.join("")+"</div>";
                        }
                    }
                }


            }
            if (typeof vl==="object"){
                if (!Array.isArray(vl)) {
                    var v=hl.asObject(h);
                    v=v[Object.keys(v)[0]]
                    vl=JSON.stringify(v,null,2);
                    var svl=""+vl;
                    svl=svl.replace(": null","")
                    vl=svl.substr(1,svl.length-2);
                }
                else{
                    vl=vl.join(", ")
                }
            }
            res=or.renderKeyValue(h.property().nameId(),vl,small)
        }
        else {
            var res =or.renderKeyValue(h.definition().nameId(),vl,small);
        }
    }
    else {
        if (typeof vl==="string"){
            return;
        }
        if (h.isAttr()){
            res=or.renderKeyValue(h.property().nameId(),vl,small)
            return res;
        }
        var res = `<h5 style="background: gainsboro">${h.definition().nameId()}:</h5>`
        var ch=h.children();
        res+=renderNodes(ch);
    }
    return res;
}


export class AttrProperty implements or.IColumn<IHighLevelNode>{

    constructor(private _id:string,private _caption:string){}

    id(){
        return this._id;
    }
    caption(){
        return this._caption;
    }

    render(o:IHighLevelNode){
        var atr=o.attr(this._id);
        if (atr){
            return or.renderObj(atr.value());
        }
        return "";
    }
}

