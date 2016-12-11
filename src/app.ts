import workbench=require("./framework/workbench")
import controls=require("./framework/controls")
import RAMLTreeView=require("./treeView")
import RAMLDetailsView=require("./detailsView")
import RegistryView=require("./registryView")
import OverlayView=require("./overlayView")
import hl=require("./core/hl")
import {Application} from "./framework/workbench";
import state=require("./state")
import RAMLOverlayView = require("./overlayView");

class AboutDialog implements controls.IControl{
    title(){
        return "About"
    }
    render(e:Element){
        e.innerHTML=
            `This project is devoted to building machine readable data base of API specifications in RAML 1.0 Format.
        <p>
        <hr>
        All API specs contributed to project by authors are covered by the CC01.0 license.
        All API specs acquired from public sources under the Fair use principal.
        </p>
        <hr>
        Some specs are taken from Open Source projects:
        <ul>
        <li>darklynx/swagger-api-collection - OpenAPI(aka Swagger) spec for Instagram API</li>
        <li>Mermade/bbcparse - OpenAPI(aka Swagger) spec for BBC Nitro API</li>
        <li>amardeshbd/medium-api-specification - OpenAPI (aka Swagger 2.0) spec for Medium API</li>
        </ul>`
    }
}
export var ramlView=new RAMLTreeView("");
var details=new RAMLDetailsView("Details","Details");

var regView=new RegistryView("API Registry")
var overlay=new RAMLOverlayView("Overlay","Overlay");
details.getContextMenu().add(new workbench.BackAction());
ramlView.getContextMenu().add(new workbench.BackAction());
ramlView.addSelectionConsumer(details);
ramlView.addSelectionConsumer(overlay);

var inExpansion=false;
workbench.registerHandler((x)=>{
    state.onState(x);
    return true;
})
state.addListener(()=>{
    regView.updateFromState()
    ramlView.updateFromState();
    if (inExpansion){
        return;
    }
    if (state.getOptions()["fullScreen"]=="true"){
        if (app.currentPerspective()!=fullSpecPerspective){
            app.openPerspective(fullSpecPerspective);
        }
    }
    else{
        if (app.currentPerspective()!=registryPerspective){
            app.openPerspective(registryPerspective);
        }
    }
});
var registryPerspective={

    title:"API Registry",

    actions:[
        new workbench.ShowDialogAction("About",new AboutDialog()),
        {title: "Add an API",link:"https://goo.gl/forms/SAr1zd6AuKi2EWbD2"}
    ],

    views:[
        {view:details,ref:"*",ratio:100,relation:workbench.Relation.LEFT},
        {view:regView,ref:"Details",ratio:15,relation:workbench.Relation.LEFT},
        {view:ramlView,ref:"Details",ratio:20,relation:workbench.Relation.LEFT},
        //{view:overlay,ref:"Details",ratio:20,relation:workbench.Relation.BOTTOM}
    ]
}
var fullSpecPerspective={

    title:"API Registry",

    actions:[
        new workbench.ShowDialogAction("About",new AboutDialog()),
        {title: "Add an API",link:"https://goo.gl/forms/SAr1zd6AuKi2EWbD2"}
    ],

    views:[
        {view:details,ref:"*",ratio:100,relation:workbench.Relation.LEFT},
        //{view:regView,ref:"Details",ratio:15,relation:workbench.Relation.LEFT},
        {view:ramlView,ref:"Details",ratio:20,relation:workbench.Relation.LEFT},
        //{view:overlay,ref:"Details",ratio:20,relation:workbench.Relation.BOTTOM}
    ],

    onOpen(){

    }

}
var overlayPerspective={

    title:"API Registry",

    actions:[
        new workbench.ShowDialogAction("About",new AboutDialog()),
        {title: "Add an API",link:"https://goo.gl/forms/SAr1zd6AuKi2EWbD2"}
    ],

    views:[
        {view:details,ref:"*",ratio:100,relation:workbench.Relation.LEFT},
        //{view:regView,ref:"Details",ratio:15,relation:workbench.Relation.LEFT},
        {view:ramlView,ref:"Details",ratio:20,relation:workbench.Relation.LEFT},
        {view:overlay,ref:"Details",ratio:50,relation:workbench.Relation.BOTTOM}
    ],

    onOpen(){

    }

}
var p=registryPerspective;
if (state.getOptions()["fullScreen"]=="true"){
    p=fullSpecPerspective;
}
var app=new Application("API REGISTRY",registryPerspective,"app",p);
app.home=function () {
    inExpansion=false;
    state.clearOptions();
}

workbench.addCommand({
    id:"/commands/ramlExplorer/focusOnSpec",
    run(){
        fullSpecPerspective.title=ramlView.getSpecTitle();
        state.setOption("fullScreen","true")
    }
})
workbench.addCommand({
    id:"/commands/ramlExplorer/overlayWithLib/",
    run(lib:string){
        inExpansion=true;
        overlay.setLib(lib)

        app.openPerspective(overlayPerspective);
        setTimeout(function(){
            overlay.setInput(ramlView.specRoot())
        },200)
    }
})