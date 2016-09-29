/**
 * Created by kor on 28/09/16.
 */

/**
 * library to render objects with aribtrary projects to html
 */

export interface IWorkbench{
    url(v: any):string;
    open(url:string):any
}
declare var Workbench:IWorkbench;

enum RenderMode{
    FULL_VIEW,
    ROW_VIEW,
    COMPACT_VIEW
}

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

export interface IProperty<T>{
    id():string;
    caption():string
    render(o:T):string
}

export class TableRenderer{

    constructor(private _caption:string,private props:IProperty<any>[]){

    }

    render(hl:any[]){
        var result:string[]=[];
        var fp=this.props.filter(p=>{
            return hl.filter(x=>p.render(x)).length>0
        })
        hl.forEach(x=> {
            result.push("<tr>")
            fp.forEach(p=> {
                result.push("<td>")
                result.push(p.render(x))
                result.push("</td>")
            })
            result.push("</tr>")
        })
        var header:string[]=[];

        header.push("<tr>")
        fp.forEach(p=> {
            header.push("<th style='border-bottom: inherit;'>")
            header.push(p.caption())
            header.push("</th>")
        })
        header.push("</tr>")

        return `<div class="panel panel-default">
            <div class="panel-heading">${this._caption}</div><div class="panel-body" style="padding: 0px"><div><table class="table table-striped" style="margin: 0px;">
            <caption style="height: 0px;display: none"></caption>
            <thead>${header.join("")}</thead>
            ${result.join("")}
            </table>
            </div></div></div>`
    }
}


export function highlight(v:string):string{
    if (v.indexOf("http://")==0||v.indexOf("https://")==0){
        return `<a href="${v}">${v}</a>`
    }
    return v;
}
export function renderKeyValue(k:string,vl:any,small:boolean=false):string{
    //k=small?k:k.charAt(0).toUpperCase()+k.substr(1);
    var str=""+vl;

    vl=highlight(str)
    if (str.length>50&&str.indexOf(' ')!=-1){
        var res=`<h5 style="background: gainsboro">${k}: </h5><div>${vl}</div>`
        return res;
    }
    if (small){
        return `<i>${k}: ${vl} </i>`
    }
    return `<h5>${k}: ${vl} </h5>`
}
export function renderObj(v:any):string{
    if (Array.isArray(v)){
        var r:any[]=v;
        return r.map(x=>renderObj(x)).join("");
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