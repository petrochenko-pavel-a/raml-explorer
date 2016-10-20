import hl=require("./hl")
import {IHighLevelNode} from "./hl";
import or=require("./objectRender")
import tr=require("./typeRender")

import nr=require("./nodeRender")

export class ResourceRenderer{

    constructor(private isAnnotationType:boolean=false){
    }

    render(h:IHighLevelNode):string{
        var ms=h.elements().filter(x=>x.property().nameId()=="methods")
        var result:string[]=[];
        var pn=hl.uriParameters(h);
        if (ms.length==1){
            var dn=ms[0].attr("displayName");
            if (dn&&(dn.value())){
                result.push("<h3>"+dn.value()+"</h3>");
                result.push("<h5>Resource: " + hl.resourceUrl(h) + " Method: " + ms[0].name() + "</h5>");
            }
            else {
                result.push("<h3>Resource: " + hl.resourceUrl(h) + " Method: " + ms[0].name() + "</h3>");
            }
            hl.prepareNodes(ms[0].attrs()).forEach(x=> {
                result.push(nr.renderNode(x, false));
            });
            result.push("</hr>");
            tr.renderParameters("Uri Parameters", hl.uriParameters(h), result)
            result.push(new MethodRenderer(false,false,false).render(ms[0]));
        }
        else {
            result.push("<h3>Resource:"+hl.resourceUrl(h)+"</h3>");
            result.push("</hr>");
            hl.prepareNodes(h.attrs()).forEach(x=> {
                result.push(nr.renderNode(x, false));
            });
            tr.renderParameters("Uri Parameters", hl.uriParameters(h), result)
            if (ms.length > 0) {
                result.push(renderTabFolder("Methods", ms, new MethodRenderer(ms.length == 1,false,true)));
            }
        }
        return result.join("");
    }
}
export function renderTabFolder(caption: string,nodes:hl.IHighLevelNode[],r:{render(x:IHighLevelNode):string}):string{
    if(nodes.length==0){
        return "";
    }
    if (nodes.length==1){
        return r.render(nodes[0])
    }
    var result:string[]=[];
    result.push("<h3>"+caption+"</h3>");
    result.push(`<ul class="nav nav-tabs">`);
    var num=0;

    nodes.forEach(x=>result.push(`<li class="${num++==0?"active":""}"><a data-toggle="tab" href="#${x.name()+"Tab"}">${x.name()}</a></li>`))
    result.push(`</ul>`)
    num=0;
    result.push(`<div class="tab-content">`)
    nodes.forEach(x=>result.push(`<div class="tab-pane fade ${num++==0?"in active":""}" id="${x.name()+"Tab"}">${r.render(x)}</div>`))
    result.push('</div>')

    return result.join("")
}

export class MethodRenderer{

    constructor(private isSingle:boolean,private isAnnotationType:boolean=false,private renderAttrs:boolean){

    }

    render(h:IHighLevelNode):string{
        var result:string[]=[];
        if (this.isSingle) {
            result.push(`<h3>Method: ${h.name()}</h3>`)
        }
        if (this.renderAttrs) {
            hl.prepareNodes(h.attrs()).forEach(x=> {
                result.push(nr.renderNode(x, false));
            });
        }
        tr.renderParameters("Query Parameters",h.elements().filter(x=>x.property().nameId()=="queryParameters"),result)
        tr.renderParameters("Headers",h.elements().filter(x=>x.property().nameId()=="headers"),result)
        var rs=h.elements().filter(x=>x.property().nameId()=="body")
        if (rs.length>0) {
            result.push(renderTabFolder("Body",rs, new tr.TypeRenderer("Body",rs.length==1)))
        }
        var rs=h.elements().filter(x=>x.property().nameId()=="responses")

        if (rs.length>0)
        {
            result.push(renderTabFolder("Responses",rs,new ResponseRenderer(rs.length==1)))
        }

        return result.join("");
    }
}
export class ResponseRenderer{
    constructor(protected isSingle: boolean,private isAnnotationType:boolean=false){
    }

    render(h:IHighLevelNode):string{
        var result:string[]=[];
        var rs=h.elements().filter(x=>x.property().nameId()=="body")
        if (this.isSingle&&rs.length>1) {
            result.push(`<h3>Response: ${h.name()}</h3>`)
        }
        hl.prepareNodes(h.attrs()).forEach(x=> {
            result.push(nr.renderNode(x,false));
        });
        tr.renderParameters("Headers",h.elements().filter(x=>x.property().nameId()=="headers"),result)

        result.push(renderTabFolder(null,rs,new tr.TypeRenderer(rs.length==1&&this.isSingle?"Response payload":"Payload",rs.length==1)))
        return result.join("");
    }
}