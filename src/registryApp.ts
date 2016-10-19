import workbench=require("./workbench")
import controls=require("./controls")
import {Accordition, Label, Loading} from "./controls";
import hl=require("./hl")
import rr=require("./registryRender")
import rv=require("./ramlTreeView")



if (history && history.pushState) {
    window.onpopstate = function (event) {
        rv.back();
        //alert("location: " + document.location + ", state: " + JSON.stringify(event.state));
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