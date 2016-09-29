import  or=require("./objectRender")
import hl=require("./hl")
import IHighLevelNode=hl.IHighLevelNode;
export function renderNodes(nodes:IHighLevelNode[]):string{
    var result:string[]=[];
    var obj:any={};
    nodes=hl.prepareNodes(nodes);
    nodes.forEach(x=>result.push(renderNode(x)));
    return result.join("");
}



export function renderNode(h:IHighLevelNode,small:boolean=false):string{
    var vl=h.value?h.value():null;
    if (!h.definition){
        var obj=h.lowLevel().dumpToObject();
        return or.renderObj(obj);
    }
    if (vl){
        if (h.isAttr()){
            res=or.renderKeyValue(h.property().nameId(),vl,small)
        }
        else {
            var res =or.renderKeyValue(h.definition().nameId(),vl,small);
        }
    }
    else {
        var res = `<h5 style="background: gainsboro">${h.definition().nameId()}:</h5>`
        var ch=h.children();
        res+=renderNodes(ch);
    }
    return res;
}


export class AttrProperty implements or.IProperty<IHighLevelNode>{

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