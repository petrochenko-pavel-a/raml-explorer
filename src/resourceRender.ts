import hl=require("./hl")
import {IHighLevelNode} from "./hl";
import or=require("./objectRender")
import tr=require("./typeRender")

import nr=require("./nodeRender")

export class ResourceRenderer{

    constructor(private isAnnotationType:boolean=false){

    }

    render(h:IHighLevelNode):string{

        var result:string[]=[];
        hl.prepareNodes(h.attrs()).forEach(x=> {
            result.push(nr.renderNode(x,false));
        });
        tr.renderParameters("Uri Parameters",h.elements().filter(x=>x.property().nameId()=="uriParameters"),result)


        var ms=h.elements().filter(x=>x.property().nameId()=="methods")
        if (ms.length>0) {
            result.push("<h3>Methods:</h3>")
            result.push(renderTabFolder(ms, new MethodRenderer()));
        }
        return result.join("");
    }
}
export function renderTabFolder(nodes:hl.IHighLevelNode[],r:{render(x:IHighLevelNode):string}):string{
    if(nodes.length==0){
        return "";
    }
    if (nodes.length==1){
        return r.render(nodes[0])
    }
    var result:string[]=[];
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

    constructor(private isAnnotationType:boolean=false){

    }

    render(h:IHighLevelNode):string{
        var result:string[]=[];
        result.push(`<h3>${h.name()}</h3>`)
        hl.prepareNodes(h.attrs()).forEach(x=> {
            result.push(nr.renderNode(x,false));
        });
        tr.renderParameters("Query Parameters",h.elements().filter(x=>x.property().nameId()=="queryParameters"),result)
        tr.renderParameters("Headers",h.elements().filter(x=>x.property().nameId()=="headers"),result)
        var rs=h.elements().filter(x=>x.property().nameId()=="body")
        if (rs.length>0) {
            result.push("<h3>Body:</h3>")
            result.push(renderTabFolder(rs, new tr.TypeRenderer()))
        }
        var rs=h.elements().filter(x=>x.property().nameId()=="responses")

        if (rs.length>0)
        {
            result.push("<h3>Responses:</h3>")
            result.push(renderTabFolder(rs,new ResponseRenderer()))
        }

        return result.join("");
    }
}
export class ResponseRenderer{

    constructor(private isAnnotationType:boolean=false){

    }

    render(h:IHighLevelNode):string{
        var result:string[]=[];
        result.push(`<h3>${h.name()}</h3>`)
        hl.prepareNodes(h.attrs()).forEach(x=> {
            result.push(nr.renderNode(x,false));
        });
        tr.renderParameters("Headers",h.elements().filter(x=>x.property().nameId()=="headers"),result)
        var rs=h.elements().filter(x=>x.property().nameId()=="body")
        result.push(renderTabFolder(rs,new tr.TypeRenderer()))
        return result.join("");
    }
}