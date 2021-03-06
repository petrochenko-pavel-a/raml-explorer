import  or=require("./objectRender")
import hl=require("../core/hl")
import reg=require("../core/registryCore")
import IHighLevelNode=hl.IHighLevelNode;

export function renderNodes(nodes:IHighLevelNode[]):string{
    var result:string[]=[];
    var obj:any={};
    nodes=hl.prepareNodes(nodes);
    nodes.forEach(x=>result.push(renderNode(x)));
    return result.join("");
}

function renderVersionsSwitch(h:HeaderRenderer) {
    return `<h5>Version: <div class="btn-group">
                  <button class="btn btn-default btn-xs dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    ${h.version} <span class="caret"></span>
                  </button>
                  <ul class="dropdown-menu">
                    ${h.versions.versions.map(x=>`<li><a onclick="WorkbenchUtils.getView(event.target).openVersion('${x.version}')">${x.version}</a></li>`).join("")}
                  </ul>
    </div></h5>`;
};

var id=12312;
export function buttonStyleTab(name: string,content:string){
    var elId="exp"+(id++)
    var s=`<p>
    <a class="btn btn-primary btn-sm" data-toggle="collapse" href="#${id}" aria-expanded="false" aria-controls="${id}">
    ${name}
    </a>
    <div class="collapse"  id="${id}">
    <div class="card card-block">`;
    return s+content+"</div></div>"
}
export class HeaderRenderer{

    title: string
    iconUrl: string
    version: string
    baseUrl: string

    constructor(public versions?:reg.ApiWithVersions){
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
            if (this.versions&&this.versions.versions.length>1){
                result.push(renderVersionsSwitch(this))
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
declare var marked:any;

export function renderNodesOverview(api:IHighLevelNode,ab:string,v?:reg.ApiWithVersions,path?:string):string{
    var result:string[]=[];
    var nodes:IHighLevelNode[]=api.attrs();
    var obj:any={};
    var docs=api.elements().filter(x=>x.property().nameId()=="documentation");

    nodes=hl.prepareNodes(nodes);
    var hr=new HeaderRenderer(v);
    nodes=hr.consume(nodes);
    result.push(hr.render())
    result.push(ab)
    nodes.forEach(x=>result.push(renderNode(x)));
    docs.forEach(x=>{
        var t=x.attr("title");
        if (t) {
            result.push("<h5 style='background-color: lightgray'>" + t.value() + "</h5>");
        }
        var c=x.attr("content");
        if (c) {
            result.push(marked(c.value()));
        }
    })
    result.push("<div>Registry id: "+hl.registryId(api)+"</div>");
    // if (path){
    //     result.push("<hr/>");
    //     result.push("<a href='"+path+"'>Get RAML</a>");
    // }
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
                            var descriptions=hl.scopeDescriptionsofApi(h.root(),Object.keys(v)[0]);
                            var rs:string[]=[];
                            Object.keys(toRend).forEach(x=>{
                                if (x=="scopes"&&descriptions){
                                    var scopes=toRend[x];
                                    rs.push("scopes: ")
                                    for (var i=0;i<scopes.length;i++){
                                        if (descriptions[i]){
                                            rs.push(" <span ><a>"+scopes[i]+"</a> </span>");
                                            rs.push("<span class='glyphicon glyphicon-question-sign' data-toggle='tooltip' title='"+descriptions[i]+"'></span>");
                                            if (i!=scopes.length-1){
                                                rs.push(",")
                                            }
                                        }
                                        else{
                                            rs.push("<span ><a>"+scopes[i]+"</a> </span>"+(i==scopes.length-1?"":", "));
                                        }
                                    }
                                    return;
                                }
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
            if (vl.dumpNode){
                var v=hl.asObject(h);
                v=v[Object.keys(v)[0]]
                vl=JSON.stringify(v,null,2);
                var svl=""+vl;
                svl=svl.replace(": null","")
                vl=svl.substr(1,svl.length-2);
            }
            //#else {
                var id=h.definition().nameId();
                if (id=="StringType"){
                    id=h.name();
                }
                var res = or.renderKeyValue(id, vl, small);
            //}
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
        var id=h.definition().nameId();
        if (id=="StringType"){
            id=h.name();
            if (true){
                var v=hl.asObject(h);
                v=v[Object.keys(v)[0]]
                vl=JSON.stringify(v,null,2);
                var svl=""+vl;
                svl=svl.replace(": null","")
                vl=svl.substr(1,svl.length-2);
            }
            var res = or.renderKeyValue(id, vl, true);
            return res;
        }
        var res = `<h5 style="background: gainsboro">${h.definition().nameId()}:</h5>`
        var ch=h.children();
        res+=renderNodes(ch);
    }
    return res;
}