import workbench=require("./framework/workbench")
import controls=require("./framework/controls")
import {Accordition, Label, Loading} from "./framework/controls";
import hl=require("./core/hl")
import rr=require("./registryView")
import rv=require("./ramlTreeView")
if (history && history.pushState) {
    window.onpopstate = function (event) {
        rv.back();
    };
}
workbench.registerHandler((x: string)=> {
    if (history.pushState) {
        var node = rv.ramlView.getSelection();
        if (node && node.length > 0) {
            rv.states.push(node[0].id())
        }
        history.pushState({page: x}, document.title, document.location.toString());

    }
    rv.ramlView.openNodeById(x);
    return true;
})
export function init()
{
    rv.init();
}
export function showApi(s:string){
    rv.showApi(s);
}