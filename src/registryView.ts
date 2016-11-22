import workbench=require("./framework/workbench")
import {Accordition} from "./framework/controls";
import rc=require("./core/registryCore")
import GroupNode=rc.GroupNode;
import ApiWithVersions=rc.ApiWithVersions;
import getInstance=rc.getInstance;
import LoadedRegistry=rc.LoadedRegistry;

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

class RegistryView extends workbench.AccorditionTreeView{

    protected registry:LoadedRegistry;

    protected load() {
        rc.getInstance("https://raw.githubusercontent.com/apiregistry/registry/gh-pages/registry-resolved.json",(data:any,s:number)=>{
            this.node=data;
            this.registry=data;
            this.refresh();
            if (this.url){
                var n=this.registry.findNodeWithUrl(this.url);
                if (n) {
                    this.setSelection(n);
                }
            }
        })
    }
    protected url: string;
    setSelectedUrl(url:string){

        this.url=url;
        if (!this.node){
            return;
        }
        var n=this.registry.findNodeWithUrl(url);
        if (n) {
                this.setSelection(n);
                return true;
        }
        return false;
    }
    searchable=true;

    protected customizeAccordition(root: Accordition, node: rc.LoadedRegistry) {
        this.addTree("Apis",node.apis())
        this.addTree("Libraries",node.libraries())
        var v=this;
        document.getElementById("stat").innerHTML=node.apiCount()+" apis, "+node.specCount()+" unique specifications, and counting.";
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
            }
        })
    }
}
export =RegistryView;