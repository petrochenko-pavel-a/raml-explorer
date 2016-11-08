import workbench=require("./framework/workbench")
import controls=require("./framework/controls")
import {Accordition, Label, Loading} from "./framework/controls";
import hl=require("./core/hl")
import {IHighLevelNode} from "./core/hl";
import  tr=require("./rendering/typeRender")
import  rr=require("./rendering/resourceRender")
import nr=require("./rendering/nodeRender")
import ra=require("./registryApp")
import usages=require("./core/usagesRegistry")

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
var apiCount=0;
function buildRegistryGroups(els:IRegistryObj[]):(GroupNode|ApiWithVersions)[]{
    apiCount=0;
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
        apiCount++;
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

export function findNodeWithUrl(d:(GroupNode|ApiWithVersions)[],url:string){
    for (var i=0;i<d.length;i++){
        if (d[i] instanceof ApiWithVersions){
            var w:ApiWithVersions=<ApiWithVersions>d[i];
            for (var j=0;j<w.versions.length;j++){
                if (w.versions[j].location==url){
                    return w;
                }
            }
        }
        else{
            var gn:GroupNode=<GroupNode>d[i];
            var res=findNodeWithUrl(gn.children,url);
            if (res){
                return res;
            }
        }
    }
    return null;
}

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
        if (this.groups){
            var n=findNodeWithUrl(this.groups,url);
            if (n){
                this.setSelection(n);
                return true;
            }
            else {
                this.node.libraries.forEach(x=>{
                    if(x.location==url){
                        this.setSelection(x);
                        return true;
                    }
                })
            }
        }
        return false;
    }
    searchable=true;
    groups:(GroupNode|ApiWithVersions)[]

    protected customizeAccordition(root: Accordition, node: IRegistry) {
        var groups=buildRegistryGroups(node.apis);
        this.groups=groups;
        this.addTree("Apis",groups)
        this.addTree("Libraries",node.libraries)
        var v=this;
        this.getHolder().setContextMenu({
            items:[
                { title:"Open", run(){
                    var api=v.getSelection()[0];
                    ra.showApi(api.location)
                }}
            ]
        });
        document.getElementById("stat").innerHTML=apiCount+" apis, "+node.apis.length+" unique api versions, and counting.";
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