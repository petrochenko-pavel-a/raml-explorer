import workbench=require("./workbench")
import controls=require("./controls")
import {Accordition, Label, Loading} from "./controls";
import hl=require("./hl")
import {IHighLevelNode} from "./hl";
import  tr=require("./typeRender")
import  rr=require("./resourceRender")
import nr=require("./nodeRender")
import ra=require("./registryApp")
import usages=require("./usagesRegistry")
function loadData(url:string, c:(t:any,e?:number)=>void){
    var xhr = new XMLHttpRequest();

    xhr.open('GET', url, true);

    xhr.send(); // (1)

    xhr.onreadystatechange = function() { // (3)
        if (xhr.readyState != 4) return;
        c(JSON.parse(xhr.responseText),xhr.status)
    }
}

export interface IRegistryObj{
    name: string
    tags?: string[]
    category: string
    location?: string
    org?: string
    version?:string
    icon?:string
}

interface IRegistry{

    apis:any[]
    libraries:[IRegistryObj]
}
export class RegistryDetailsView extends workbench.ViewPart{

    innerRender(e: Element) {
    }
}

class GroupNode{
    name: string
    children: any
    icon: string
}
export class ApiWithVersions{
    name: string
    icon: string
    versions: IRegistryObj[]
}
class RegistryContentProvider implements workbench.ITreeContentProvider{
    elements(i:any):any[]{
        return i;
    }
    children(i:any):any[]{
        if (i instanceof GroupNode){
            return i.children;
        }
        return []
    }
}
function groupBy(els:any[], f:(x)=>string){
    var result={};
    els.forEach(x=>{
        var group=f(x);
        if (result[group]){
            result[group].push(x);
        }
        else {
            result[group] = []
            result[group].push(x);
        }
    })
    return result;
}

function buildRegistryGroups(els:IRegistryObj[]){
    var groups=groupBy(els,x=>x.org);
    var groupNodes:GroupNode[]=[];
    Object.keys(groups).forEach(gr=>{
        var g=new GroupNode();
        g.name=gr;
        g.children=mergeVersions(groups[gr]);
        groupNodes.push(g);
    })
    var result:(GroupNode| ApiWithVersions)[]=[];
    groupNodes.forEach(x=>{
        if (x.children.length==1){
            result.push(x.children[0]);
        }
        else{
            result.push(x);
            var v=x.children[0];
            x.icon=v.icon;
        }
    })
    return result;
}
function mergeVersions(els:IRegistryObj[]):ApiWithVersions[]{
    var groups=groupBy(els,x=>x.name);
    var groupNodes:ApiWithVersions[]=[];
    Object.keys(groups).forEach(gr=>{
        var g=new ApiWithVersions();
        g.name=gr;

        g.versions=groups[gr];
        g.icon=g.versions[0].icon;
        groupNodes.push(g);
    })
    return groupNodes;
}

loadData("https://raw.githubusercontent.com/apiregistry/registry/gh-pages/registry-usages.json",(data:any,s:number)=>{
     usages.loadedUsageData(data);
})
export class RegistryView extends workbench.AccorditionTreeView{

    protected load() {
        loadData("https://raw.githubusercontent.com/apiregistry/registry/gh-pages/registry-resolved.json",(data:any,s:number)=>{
            this.node=data;
            this.refresh();
            usages.reportData(data)
        })
    }
    protected url: string;
    setSelectedUrl(url:string){
        this.url=url;
    }
    searchable=true;

    protected customizeAccordition(root: Accordition, node: IRegistry) {
        this.addTree("Libraries",node.libraries)
        this.addTree("Apis",buildRegistryGroups(node.apis))
        var v=this;
        this.getHolder().setContextMenu({
            items:[
                { title:"Open", run(){
                    var api=v.getSelection()[0];
                    ra.showApi(api.location)
                }}
            ]
        });
        if (this.url!=null){
            var selection=null;
            node.libraries.forEach(x=>{
                if (x.location==this.url){
                    selection=x;
                }
            })
            var view=this;
            if (selection){
                setTimeout(function () {
                    view.setSelection(selection);
                },100)
            }
        }
    }

    protected customize(tree: workbench.TreeView) {
        tree.setContentProvider(new RegistryContentProvider())
        tree.setLabelProvider({
            label(e){
                if (e.name) {
                     if (e.icon){
                         return "<img src='"+e.icon+"' /> "+e.name+"";
                     }
                    return ""+e.name+"";
                }
                else{
                    var c=Object.keys(e)[0];
                    return c;
                }
            }

        })
    }
}