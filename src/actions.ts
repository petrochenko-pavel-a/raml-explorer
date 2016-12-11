import state=require("./state")
import rc=require("./core/registryCore")

function link(link:string,title: string){
    return `<a onclick='Workbench.open("${link}")'>${title}</a>`;
}

export function renderActionsBlock(reg:rc.LoadedRegistry): string{
    var result= "<h4>Actions</h4>"
    result+=link("/commands/ramlExplorer/focusOnSpec","Focus on this specification");
    result+="<br>"
    reg.plainLibs().forEach(x=>{
        result+=link("/commands/ramlExplorer/overlayWithLib/"+x.location,"Overlay with "+x.name);
        result+="<br>"
    })
    return result;
}