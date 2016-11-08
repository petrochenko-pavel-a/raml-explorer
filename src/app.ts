import workbench=require("./framework/workbench")
import controls=require("./framework/controls")
import RAMLTreeView=require("./treeView")
import RAMLDetailsView=require("./detailsView")
import RegistryView=require("./registryView")
import hl=require("./core/hl")

var url=""

var bu:string="";
export function setBackUrl(u:string){
    bu=u;
}

export var states: string[] = [];

export function back(){
    if (states.length > 0) {
        if (bu){
            showApi(bu,()=>{
                ramlView.openNodeById(states.pop());
            });
            bu=null;
        }
        else {
            ramlView.openNodeById(states.pop());
        }
    }
    else{
        init();
    }
}
var backAction={
    title:"Back",
    run(){
        back()
    }
};

export var ramlView=new RAMLTreeView("");
var details=new RAMLDetailsView("Details","Details");
var regView=new RegistryView("API Registry")
details.getContextMenu().add(backAction);
ramlView.getContextMenu().add(backAction);
ramlView.addSelectionConsumer(details);
regView.addSelectionConsumer(ramlView);

if (history && history.pushState) {
    window.onpopstate = function (event) {
        back();
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
function init(){
    var page=new workbench.Page("rest");
    page.addView(details, "*", 100, workbench.Relation.LEFT);
    page.addView(regView,"Details",15,workbench.Relation.LEFT);
    page.addView(ramlView,"Details",20,workbench.Relation.LEFT);
    function initSizes(){
        var h=document.getElementById("header").clientHeight+40;
        document.getElementById("rest").setAttribute("style","height:"+(window.innerHeight-h)+"px");
    }
    initSizes();
    window.onresize=initSizes;
    var w:any=window;
    w.openVersion=function(x){
        ramlView.setVersion(x);
    }
}
export function showApi(url,cb?:()=>any){
    var b=regView.setSelectedUrl(url)
    if (b) {
        ramlView.cb=cb;

    }
    else {
        ramlView.setUrl(url,cb)
    }
}

var h=document.location.hash
if (h&&h.length>1){
    url=h.substr(1);
    showApi(url)
}
else{
    init();
}