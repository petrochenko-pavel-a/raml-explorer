import workbench=require("./workbench")
import controls=require("./controls")
import {Accordition, Label, Loading} from "./controls";
import hl=require("./hl")
import {IHighLevelNode} from "./hl";
import  tr=require("./typeRender")
import  rr=require("./resourceRender")
import nr=require("./nodeRender")
import rrend=require("./registryRender")
export var states: string[] = [];

export function back(){
    if (states.length > 0) {
        ramlView.openNodeById(states.pop());
    }
    else{
        init();
    }
}
export class RAMLDetailsView extends workbench.ViewPart{

    _element:hl.IHighLevelNode;

    setSelection(v:hl.IHighLevelNode){
        this._element=v;

        this.refresh();
    }


    init(holder: workbench.IPartHolder): any {
        holder.setContextMenu({
            items:[
                {
                    title:"Back",

                    run(){
                        back()
                    }
                }

            ]
        })
        return super.init(holder);
    }

    innerRender(e:Element) {
        (<HTMLElement>e).style.overflow="auto"
        if (this._element)
        {
            if (this._element.property().nameId()=="types"||this._element.property().nameId()=="annotationTypes"){
                var cnt=new tr.TypeRenderer(null,false).render(this._element);
            }
            else {
                if (this._element.property().nameId()=="resources"){
                    var cnt=new rr.ResourceRenderer().render(this._element);
                }
                if (this._element.property().nameId()=="methods"){
                    var cnt=new rr.MethodRenderer(true,false,true).render(this._element);
                }

                // var cnt = `<h3>${this._element.name()}</h3><hr/>` + renderNodes(this._element.attrs());
                //
                // var groups = hl.elementGroups(this._element);
                // Object.keys(groups).forEach(x=> {
                //     if (x === "properties") {
                //         cnt += new or.TableRenderer("Properties", [new AttrProperty("name", "Name"), new AttrProperty("description", "Description"), new AttrProperty("type", "Type")]).render(groups[x]);
                //     }
                // })
            }
            new Label(this._element.name(),cnt).render(e);
        }
        else{
            e.innerHTML="";
        }
    }
}

export class RAMLTreeProvider implements workbench.ITreeContentProvider{

    children(x:hl.IHighLevelNode){
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

export class RAMLTreeView extends workbench.AccorditionTreeView{

    protected api:IHighLevelNode;


    constructor(private path:string,title:string="Overview")
    {
        super(title)
    }

    setUrl(url:string){
        this.path=url;
        this.node=null;
        this.api=null;
        this.refresh();
    }
    searchable=true;

    protected customize(tree: workbench.TreeView) {
        tree.setContentProvider(new RAMLTreeProvider());
        tree.setLabelProvider({
            label(x:any){
                var a=x.attrs();
                for (var i=0;i<a.length;i++){
                    if (a[i].name()=="displayName"){
                        return a[i].value();
                    }
                }
                return ""+x.name();
            },
            icon(x:any){
                if (x instanceof hl.ProxyNode){
                    return "glyphicon glyphicon-tasks"
                }
                if (x.property().nameId()=="resources"){
                    return "glyphicon glyphicon-link"
                }
                return "glyphicon glyphicon-pencil"
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
        var overview:string=nr.renderNodesOverview(this.api.attrs());
        if (overview.length>0) {
            a.add(new Label("Generic Info", overview))
        }

        var groups=hl.elementGroups(this.api);
        this.renderArraySection("annotationTypes","Annotation Types",groups,libs);
        this.renderArraySection("types","Types",groups,libs);
        this.renderArraySection("resources","Resources",groups,libs);
        var lt=null;
    }
    protected  load(){

        hl.loadApi(this.path,api=>{
            this.api=api;
            this.node=api;
            this.refresh();
            showTitle(this.api)
        })
    }

}

function showTitle(api:hl.IHighLevelNode){
    hl.prepareNodes(api.attrs()).forEach(x=>{
        if (x.name()=="(Title)"||x.name()=="title"){
            document.getElementById("title").innerHTML=x.value();
        }
    })
}
export var ramlView=new RAMLTreeView("");
var details=new RAMLDetailsView("Details","Details");
var regView=new rrend.RegistryView("API Registry")
export function init(){
    var page=new workbench.Page("rest");
    var rtv=new RAMLTreeView("");

    page.addView(details, "*", 100, workbench.Relation.LEFT);
    page.addView(regView,"Details",15,workbench.Relation.LEFT);
    page.addView(ramlView,"Details",20,workbench.Relation.LEFT);

    regView.addSelectionListener({
        selectionChanged(v: any[]){
            if (v.length > 0) {
                if (v[0].location) {
                    ramlView.setUrl(v[0].location)
                }
            }
            else {
                details.setSelection(null);
            }
        }

    })
    function initSizes(){
        var h=document.getElementById("header").clientHeight+50;
        document.getElementById("rest").setAttribute("style","height:"+(window.innerHeight-h)+"px");
    }
    initSizes();
    window.onresize=initSizes;
}
ramlView.addSelectionListener({
    selectionChanged(v: any[]){
        if (v.length > 0) {
            details.setSelection(v[0]);
        }
        else {
            details.setSelection(null);
        }
    }
})
export function showApi(url){
    ramlView.setUrl(url);
    regView.setSelectedUrl(url)
}