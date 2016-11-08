import workbench=require("./framework/workbench")
import hl=require("./core/hl")
import nr=require("./rendering/nodeRender")
import {Accordition, Label} from "./framework/controls";
import rrend=require("./core/registryCore")
import IHighLevelNode=hl.IHighLevelNode;
import methodKey=hl.methodKey;
import images=require("./rendering/styles")
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

    constructor(public path:string,title:string="Overview")
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

    setKnownVersions(r:rrend.ApiWithVersions){
        this.versions=r;
    }
    setInput(v:any){
        if (v instanceof rrend.ApiWithVersions){
            var aw:rrend.ApiWithVersions=v;
            var sel:rrend.IRegistryObj=aw.versions[aw.versions.length-1];
            this.setKnownVersions(aw);
            this.setUrl(sel.location)

        }
        else {
            if (v) {
                if (v.location) {
                    this.setUrl(v[0].location)
                }
            }
        }
    }

    setVersion(ver:string){
        this.versions.versions.forEach(x=>{
            if (x.version==ver){
                this.setUrl(x.location);
            }
        })
    }
    cb:()=>void;
    setUrl(url:string,cb?:()=>void){
        this.path=url;
        this.node=null;
        this.api=null;
        this.refresh();
        this.cb=cb;
        rrend.setUrl(url);
    }
    searchable=true;

    protected customize(tree: workbench.TreeView) {
        tree.setContentProvider(new RAMLTreeProvider());
        tree.setLabelProvider({
            label(x:any){
                if (x instanceof hl.TreeLike){
                    var t:hl.TreeLike=x;
                    if (t.id.indexOf("!!")==0){
                        var ss=t.id.substr(2);
                        if (ss=="object"){
                            return images.OBJECT_IMAGE+ss;
                        }
                        if (ss=="array"){
                            return images.ARRAY_IMAGE+ss;
                        }
                        if (ss=="scalar"){
                            return images.STRING_IMAGE+ss;
                        }
                        return images.OBJECT_IMAGE+ss;
                    }
                    return t.id;
                }
                var result="";
                var pr=x.property?x.property():null;
                var isMethod=pr&&pr.nameId()=="methods";
                var isType=pr&&pr.nameId()=="types";
                var isAType=pr&&pr.nameId()=="annotationTypes";
                result=hl.label(x);
                if (isMethod){
                    result=methodKey(x.name())+result;
                }
                if (isType){
                    result=images.GENERIC_TYPE+result;
                }
                if (isAType){
                    result=images.ANNOTATION_TYPE+result;
                }
                return result;
            },
            icon(x:any){
                if (x instanceof hl.TreeLike){
                    var t:hl.TreeLike=x;
                    if (t.id.indexOf("!!")==0){
                        return ""
                    }
                    return images.FOLDER_SPAN;
                }
                if (x instanceof hl.ProxyNode){
                    return images.LIBRARY_SPAN;
                }
                if (x.property().nameId()=="resources"){
                    return images.RESOURCE_SPAN;
                }
                return ""
            }
        })
    }

    protected control:Accordition;
    protected trees:workbench.TreeView[]=[];

    innerRender(e:Element) {
        if (this.path==""){
            e.innerHTML=`<div style="display: flex;flex: 1 1 0; flex-direction: column;justify-content: center;"><div style="display: flex;flex-direction: row;justify-content: center"><div><div>Please select API or Library</div></div></div></div>`
        }
        else{
            super.innerRender(e);
            if (this.cb){
                var q=this.cb;
                setTimeout(q,100);
                //this.cb();
                this.cb=null;
            }
        }
    }

    protected renderArraySection(id:string,label:string,groups:any,libs:IHighLevelNode[]){
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
        if (toRender.length>0){
            var at=toRender
            var types=this.createTree(label);
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



    protected customizeAccordition(a: Accordition, node: any) {
        var x=this.api.elements();
        var libs=hl.getUsedLibraries(this.api);
        var overview:string=nr.renderNodesOverview(this.api,this.versions,this.path);
        if (overview.length>0) {
            a.add(new Label("Generic Info", "<div style='min-height: 200px'>"+overview+"</div>"))
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
        if (groups["types"]) {
            var types = hl.groupTypes(<any>groups["types"]);
            if (types) {
                groups["types"]=types.allChildren();
            }
        }
        if (this.devMode||this.api.definition().nameId()=="Library") {
            this.renderArraySection("annotationTypes", "Annotation Types", groups, libs);
        }
        this.renderArraySection("methods","Operations",groups,libs);
        this.renderArraySection("types","Data Types",groups,libs);
        if (this.devMode) {
            this.renderArraySection("resources", "API Paths", groups, libs);
        }
        var lt=null;
    }
    protected  load(){
        hl.loadApi(this.path,api=>{
            this.api=api;
            this.node=api;
            this.refresh();
        })
    }
}
export = RAMLTreeView;