import workbench=require("./framework/workbench")
import hl=require("./core/hl")
import nr=require("./rendering/nodeRender")
import ui=require("./uiUtils")
import {IControl,Accordition, Label} from "./framework/controls";
import rrend=require("./core/registryCore")
import IHighLevelNode=hl.IHighLevelNode;
import methodKey=hl.methodKey;
import images=require("./rendering/styles")
import state=require("./state")
import actions=require("./actions")
class RAMLTreeProvider implements workbench.ITreeContentProvider{

    children(x:hl.IHighLevelNode){
        if (x instanceof hl.TreeLike){
            var c:hl.TreeLike=<any>x;
            return c.allChildren();
        }
        if (x instanceof hl.ProxyNode){
            var pn=<hl.ProxyNode>x;
            return pn.children();
        }
        if (x.property().nameId()=="resources"){
            return x.elements().filter(x=>x.property().nameId()=="resources");
        }
        return [];
    }
    elements(x:any){
        return x;
    }
}

class RAMLTreeView extends workbench.AccorditionTreeView{

    protected api:hl.IHighLevelNode;
    protected versions:rrend.ApiWithVersions;
    protected devMode: boolean

    constructor(title:string="Overview")
    {
        super(title)
        var v=this;

        this.getToolbar().add({
            title:"",
            image:"glyphicon glyphicon-asterisk",
            checked: this.devMode,
            run(){
                v.devMode=!v.devMode;
                v.refresh();
                v.init(v.holder);
            }
        });
    }

    openVersion(version:string){
        state.updateVersion(version);
    }

    setKnownVersions(r:rrend.ApiWithVersions){
        this.versions=r;
    }

    searchable=true;
    hasSelection: boolean=true;
    operations=true;

    protected customize(tree: workbench.TreeView) {
        tree.setContentProvider(new RAMLTreeProvider());
        tree.setLabelProvider(ui.HLNodeLabelProvider)
    }
    private updatingFromState=false;

    public updateFromState() {
        try {
            if (this.updatingFromState){
                return;
            }
            this.updatingFromState=true;
            state.getApiInstance(this.path,(input,path)=>{
                if (input instanceof rrend.ApiWithVersions){
                    var aw=<rrend.ApiWithVersions>input;
                    this.setKnownVersions(aw);
                }
                if (!path||this.path!=path){
                    this.path=path;
                    this.hasSelection=this.path!=null;
                    this.node=null;
                    this.api=null;
                    this.refresh();
                }
                else{
                    this.selectNodeFromState();
                }
            },n=>{
                if (!n){
                    this.hasSelection=false;
                }
                else{
                    this.hasSelection=true;
                }
                rrend.setUrl(this.path)
                this.node=n;
                this.api=n;
                this.refresh();
                this.selectNodeFromState();
            })
        }finally {
            this.updatingFromState=false;
        }
    }

    private selectNodeFromState() {
        var q=this.updatingFromState;
        this.updatingFromState=true;
        try {
            if (this.api) {
                if (state.specElementId()) {
                    var mm = hl.findById(state.specElementId());
                    if (mm) {
                        this.setSelection(mm);
                    }
                }
            }
        }finally {
            this.updatingFromState=q;
        }
    }

    protected control:Accordition;
    protected trees:workbench.TreeView[]=[];
    protected path:string

    innerRender(e:Element) {
        if (!this.hasSelection){
            e.innerHTML=`<div style="display: flex;flex: 1 1 0; flex-direction: column;justify-content: center;"><div style="display: flex;flex-direction: row;justify-content: center"><div><div>Please select API or Library</div></div></div></div>`
        }
        else{
            super.innerRender(e);
        }
    }

    

    protected onSelection(v: any[]): any {
        if (!this.updatingFromState&&v[0]){
            this.updatingFromState=true;
            try {

                var node: hl.IHighLevelNode = v[0];
                if (node.id) {
                    if (typeof node.id=="function") {
                        state.propogateNode(node.id());
                    }
                }
            }finally {
                this.updatingFromState = false;
            }
        }
        return super.onSelection(v);
    }

    showInternal:boolean=true;

    protected renderArraySection(id:string,label:string,groups:any,libs:IHighLevelNode[],always:boolean=false){
        var toRender=[];
        libs.forEach(x=>{
            var childrenOfKind=x.children().filter(y=>y.property().nameId()==id);
            if (childrenOfKind.length>0){
                toRender.push(new hl.ProxyNode(x.name(),x,childrenOfKind));
            }
        })
        if (groups[id]){
            toRender=toRender.concat(groups[id]);
        }
        var v=this;
        if (toRender.length>0||always){
            var at=toRender
            var types=this.createTree(label);
            if (id=="types"&&this.api.definition().nameId()=="Api") {

                    (<IControl>types).contextActions = [{

                        title: "Show Internal Types",

                        checked: v.showInternal,

                        run(){
                            v.showInternal=!v.showInternal;
                            v.refresh();
                            v.showTab("Data Types");
                        }

                    }];
            }
            if (id=="methods") {
                (<IControl>types).contextActions = [{

                    title: "Show Resources",

                    run(){
                        v.operations=false;
                        v.refresh();
                        v.showTab("ops");
                    }

                }];
                (<IControl>types).controlId="ops";
            }
            if (id=="resources") {
                (<IControl>types).contextActions = [{

                    title: "Show Operations",

                    run(){
                        v.operations=true;
                        v.refresh();
                        v.showTab("ops");
                    }

                }];
                (<IControl>types).controlId="ops";
            }
            types.setInput(at);
            this.control.add(types)
            this.trees.push(types)
        };
    }

    public openNodeById(id: string)
    {
        var node=hl.findById(id);
        if (node){
            this.setSelection(node);
        }
    }
    getSpecTitle(){
        var result="";
        var t=this.api.attr("title");
        if (t!=null){
            result+=t.value();
        }
        var v=this.api.attr("version");
        if (v!=null){
            result+=' '+v.value();
        }
        return result;
    }
    specRoot(){
        return this.api.root();
    }
    protected customizeAccordition(a: Accordition, node: any) {

        var x=this.api.elements();
        var libs=hl.getUsedLibraries(this.api);
        var ab=actions.renderActionsBlock(state.registry());
        var overview:string=nr.renderNodesOverview(this.api,ab,this.versions,this.path);

        overview=overview;

        if (overview.length>0) {
            a.add(new Label("Generic Info", "<div style='min-height: 900px'>"+overview+"</div>"))
        }
        if (!this.devMode){
            libs=[]
        }
        var groups=hl.elementGroups(this.api);
        var methods:hl.IHighLevelNode[]=[];
        var ts=hl.gatherMethods(this.api,methods);
        var groupedMethods=hl.groupMethods(methods).allChildren();
        if (methods!=null) {
            groups["methods"] = groupedMethods;
        }
        var original=null;
        if (groups["types"]) {
            var tps=<any>groups["types"];
            original=tps;
            if (!this.showInternal){
                var used=hl.allUsedTypes(this.api);
                tps=tps.filter(x=>used[x.name()]);
            }
            var types = hl.groupTypes(tps);
            if (types) {
                groups["types"]=types.allChildren();
            }
        }
        if (this.devMode||this.api.definition().nameId()=="Library") {
            this.renderArraySection("annotationTypes", "Annotation Types", groups, libs);
        }
        if (this.operations) {
            this.renderArraySection("methods", "Operations", groups, libs);
        }
        else{
            this.renderArraySection("resources", "Resources", groups, libs);
        }
        this.renderArraySection("types","Data Types",groups,libs,original&&original.length>0);
        var lt=null;
    }
    protected  load(){
        this.updateFromState();
    }
}
export = RAMLTreeView;