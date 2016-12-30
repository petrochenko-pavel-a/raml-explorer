import workbench=require("./framework/workbench")
import {Accordition} from "./framework/controls";
import rc=require("./core/registryCore")
import GroupNode=rc.GroupNode;
import ApiWithVersions=rc.ApiWithVersions;
import getInstance=rc.getInstance;
import LoadedRegistry=rc.LoadedRegistry;
import state=require("./state")

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
        state.getRegistryInstance(((data:any,s:number)=>{
            this.node=data;
            this.registry=data;
            this.refresh();
            this.updateFromState();
        }))
    }
    private updatingFromState=false;
    public updateFromState() {
        try {
            if (this.updatingFromState){
                return;
            }
            this.updatingFromState=true;
            if (!this.registry){
                this.registry=state.registry();
            }
            if (state.specificationId()) {
                var n = this.registry.findNodeWithUrl(state.specificationId());
                if (n) {

                    this.setSelection(n);
                }
            }
            if (state.registryTab()) {
                this.showTab(state.registryTab())
            }
        }finally {
            this.updatingFromState=false;
        }
    }
    protected onSelection(v: any[]): any {
        if (!this.updatingFromState&&v[0]){
            this.updatingFromState=true;
            try {
                state.propogateSpecification(this.registry.itemId(v[0]));
            }
            finally {
                this.updatingFromState=false;
            }
        }
        return super.onSelection(v);
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
        this.setStatusMessage(node.apiCount()+" apis, "+node.specCount()+" unique specifications, and counting.");
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