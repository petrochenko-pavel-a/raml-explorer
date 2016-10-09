import workbench=require("./workbench")
import controls=require("./controls")
import {Accordition, Label, Loading} from "./controls";
import hl=require("./hl")
import rr=require("./registryRender")
import rv=require("./ramlTreeView")

var ramlView=new rv.RAMLTreeView("");
var details=new rv.RAMLDetailsView("Details","Details");
var regView=new rr.RegistryView("API Registry")
export function init(){
    var page=new workbench.Page("rest");
    var rtv=new rv.RAMLTreeView("");

    page.addView(details, "*", 100, workbench.Relation.LEFT);
    page.addView(regView,"Details",15,workbench.Relation.LEFT);
    page.addView(ramlView,"Details",20,workbench.Relation.LEFT);

    regView.addSelectionListener({
        selectionChanged(v: any[]){
            if (v.length > 0) {
                if (v[0].location) {
                    ramlView.setUrl(v[0].location)
                }
            }
            else {
                details.setSelection(null);
            }
        }

    })
    function initSizes(){
        var h=document.getElementById("header").clientHeight+50;
        document.getElementById("rest").setAttribute("style","height:"+(window.innerHeight-h)+"px");
    }
    initSizes();
    window.onresize=initSizes;
}
ramlView.addSelectionListener({
    selectionChanged(v: any[]){
        if (v.length > 0) {
            details.setSelection(v[0]);
        }
        else {
            details.setSelection(null);
        }
    }
})
var states: string[] = [];
if (history && history.pushState) {
    window.onpopstate = function (event) {
        if (states.length > 0) {
            ramlView.openNodeById(states.pop());
        }
        else{
            init();
        }
        //alert("location: " + document.location + ", state: " + JSON.stringify(event.state));
    };
}
workbench.registerHandler((x: string)=> {
    if (history.pushState) {
        var node = ramlView.getSelection();
        if (node && node.length > 0) {
            states.push(node[0].id())
        }
        history.pushState({page: x}, document.title, document.location.toString());

    }
    ramlView.openNodeById(x);
    return true;
})
export function showApi(url){
    ramlView.setUrl(url);
    regView.setSelectedUrl(url)
}