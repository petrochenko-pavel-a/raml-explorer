/**
 * Created by kor on 28/09/16.
 */

import {IHighLevelNode} from "../core/hl";
/**
 * library to render objects with aribtrary projects to html
 */
export function encode(r){
    return r.replace(/[\x26\x0A\<>'"]/g,function(r){return"&#"+r.charCodeAt(0)+";"})
}
export interface IWorkbench{
    url(v: any):string;
    open(url:string):any
}
declare var Workbench:IWorkbench;


export interface IObject{

    id(): string
}

export class Link{
    constructor(protected target: IObject,protected _name){
    }

    getUrl():string{
        return this.target.id();
    }

    render():string{
        return `<a onclick="Workbench.open('${this.getUrl()}')">${this._name}</a>`
    }
}

export interface IColumn<T>{
    id():string;
    caption():string
    render(o:T,rowId?:string):string
    width?():string
    nowrap?:boolean
}

export interface IRowStyleProvider<T>{
    hidden(x:any):boolean
}
var mm=0;

export class TableRenderer{

    constructor(private _caption:string, private props:IColumn<any>[], private st:IRowStyleProvider<any>){

    }

    render(hl:any[]){
        var result:string[]=[];
        var fp=this.props.filter(p=>{
            return hl.filter(x=><boolean><any>p.render(x)).length>0
        })

        hl.forEach(x=> {
            var h=this.st.hidden(x)?"none":"table-row";
            if (x.level) {
                result.push(`<tr id="${"tr" + mm}" level="${x.level()}" style="display: ${h}" onclick="toggleRow('${"tr" + mm}')">`)
            }
            else{
                result.push(`<tr id="${"tr" + mm}" style="display: ${h}" onclick="toggleRow('${"tr" + mm}')">`)
            }
            fp.forEach(p=> {
                var pn=p.nowrap;
                var es=pn?"white-space: nowrap":"";
                result.push(`<td style='${es}'>`)
                result.push(p.render(x,"tr"+mm))
                result.push("</td>")
            })
            result.push("</tr>")
            mm=mm+1;
        })
        var header:string[]=[];

        header.push("<tr>")
        fp.forEach(p=> {
            var cw=p.width?"width: "+p.width():"";

            header.push(`<th style='border-bottom: inherit;${cw}'>`)
            header.push(p.caption())
            header.push("</th>")
        })
        header.push("</tr>")

        return `<div class="panel panel-default">
            <div class="panel-heading">${this._caption}</div><div class="panel-body" style="padding: 0px"><div><table class="table table-hover" style="margin: 0px">
            <caption style="height: 0px;display: none"></caption>
            <thead>${header.join("")}</thead>
            ${result.join("")}
            </table>
            </div></div></div>`
    }
}
var w:any=window;
w.toggleRow=function (id) {
    var el=document.getElementById(id);
    var nm=el.parentElement.getElementsByTagName("tr");
    if (!document.getElementById("tricon" + id)){
        return;
    }
    var vis=el.getAttribute("expanded");
    var style="table-row"
    if (vis=="true"){
        style="none";
        el.setAttribute("expanded","false")
        document.getElementById("tricon"+id).classList.add("glyphicon-plus-sign")
        document.getElementById("tricon"+id).classList.remove("glyphicon-minus-sign")
    }
    else{
        el.setAttribute("expanded","true")
        document.getElementById("tricon"+id).classList.remove("glyphicon-plus-sign")
        document.getElementById("tricon"+id).classList.add("glyphicon-minus-sign")
    }
    var tn=false;
    var ll=parseInt(el.getAttribute("level"));
    for (var i=0;i<nm.length;i++){
        var it=nm.item(i);
        if (it==el){
            tn=true;
            continue;
        }
        if (tn){
            var il=parseInt(it.getAttribute("level"));
            if(il<=ll){
                tn=false;
            }
            else {
                if(il==ll+1||style=='none') {
                    if (style=='none'){
                        it.setAttribute("expanded","false")
                    }
                    it.style.display = style;
                }

            }
        }
    }
}

export function highlight(v:string):string{
    v=encode(v);
    if (v.indexOf("http://")==0||v.indexOf("https://")==0){
        return `<a href="${v}">${v}</a>`
    }
    if (!isNaN(parseFloat(v))){
        return "<span style='color: purple'>"+v+"</span>"
    }
    if (!isNaN(parseInt(v))){
        return "<span style='color: purple'>"+v+"</span>"
    }
    if (v=="true"||v=="false"){
        return "<span style='color: blue'>"+v+"</span>"
    }
    return "<span style='color: darkred'>"+v+"</span>"
}
declare var marked:any

export function renderKeyValue(k:string,vl:any,small:boolean=false):string{
    //k=small?k:k.charAt(0).toUpperCase()+k.substr(1);
    if (k=="description"||k=="usage"){
        if (typeof vl=="string"){
            vl=marked(vl);
        }
        var res=`<h5 style="background: gainsboro">${k}: </h5><div>${vl}</div>`
        return res;
    }
    if (typeof  vl=="object"){
        vl=JSON.stringify(vl);
    }
    var str=""+vl;

    vl=highlight(str)
    if (str.length>70&&str.indexOf('\n')!=-1&&!small){
        var res=`<h5 style="background: gainsboro">${k}: </h5><div>${vl}</div>`
        return res;
    }
    if (small){
        return `<i>${k}: ${vl}</i>`
    }
    return `<h5>${k}: ${vl}</h5>`
}

export function renderObj(v:any):string{
    if (!v){
        return "";
    }

    if (Array.isArray(v)){
        var r:any[]=v;
        return r.map(x=>renderObj(x)).join("");
    }
    if (v["title"]&&v['url']){
        var role=v["role"];
        var img="";
        if (role=="Tool Location"){
            img="<image src='images/ApplicationElement.gif'/> "
        }
        return `<div><a href="${v['url']}">${img}${v["title"]}</a></div>`
    }
    if (typeof v==="string"){
        return v;
    }
    if (typeof v==="number"){
        return ""+v;
    }
    var result:string[]=[];
    Object.getOwnPropertyNames(v).forEach(p=>{
        result.push(renderKeyValue(p,v[p]));
    })
    return result.join("");
}