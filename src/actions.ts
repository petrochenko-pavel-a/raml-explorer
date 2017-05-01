import state=require("./state")
import rc=require("./core/registryCore")

function link(link:string,title: string,image?:string){
    if (image){
        return `<a onclick='Workbench.open("${link}")'><img src="${image}"> ${title}</a>`;
    }
    return `<a onclick='Workbench.open("${link}")'>${title}</a>`;
}
export interface IAction{
    name: string
    icon: string
    link: string
}
function category(name: string, icon:string,actions:IAction[]){
    var mn=actions.map(a=>{ return '<li>'+link(a.link,a.name,a.icon)+'</li>'}).join("");
    var x=`<img src="${icon}"> ${name}`
    if (!icon){
        x=name;
    }
    return `<span class="dropdown">
    <button class="btn btn-sm btn-default dropdown-toggle" style="margin: 3px" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
        ${x}
        <span class="caret"></span>
    </button>
    <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
  
    ${mn}
    
    </ul>
    </span>`
}
function button(link:string,name: string, icon:string){
    return `
    <button class="btn btn-sm btn-default" style="margin: 3px" type="button" onclick='Workbench.open("${link}")' >
        <img src="${icon}">${name}
        
    </button>
    `
}

export function renderActionsBlock(reg:rc.LoadedRegistry): string{
    var result= ""
    result+=button("/commands/ramlExplorer/focusOnSpec"," View Full Size","http://favicon.yandex.net/favicon/twillio.com");
    //result+="<br>"
    result+=category("Configure Overlay","http://favicon.yandex.net/favicon/taxamo.com",reg.plainLibs().map(x=>{ return {
        link: "/commands/ramlExplorer/overlayWithLib/" + x.location,
        name: x.name,
        icon: x.icon
    }
    }))
    var groups:{ [name:string]:rc.ITool[]}={}
    if (reg.tools()) {
        reg.tools().forEach(x => {
            if (x.category) {
                if (!groups[x.category]) {
                    groups[x.category] = []
                }
                groups[x.category].push(x);
            }
            else {
                result += button("/commands/ramlExplorer/runTool/" + x.location, x.name, x.icon);
            }
            //result+="<br>"
        });
    }
    Object.keys(groups).forEach(x=>{
        if (groups[x].length>1) {
            result += category(x, null, groups[x].map(y=> {
                return {name: y.name, icon: y.icon, link: "/commands/ramlExplorer/runTool/" + y.location}
            }))
        }
    })
    Object.keys(groups).forEach(x=>{
        if (groups[x].length==1) {
            result += button("/commands/ramlExplorer/runTool/" + groups[x][0].location, groups[x][0].name, groups[x][0].icon);
        }
    })
    return result;
}