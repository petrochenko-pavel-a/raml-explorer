import workbench=require("./workbench")
import controls=require("./controls")
import {Accordition, Label, Loading} from "./controls";
import hl=require("./hl")
import {IHighLevelNode} from "./hl";
import  tr=require("./typeRender")
import  rr=require("./resourceRender")
import nr=require("./nodeRender")
import rrend=require("./registryRender")
import usages=require("./usagesRegistry")
export var states: string[] = [];

export function back(){
    if (states.length > 0) {
        if (bu){
            ramlView.setUrl(bu,()=>{
                ramlView.openNodeById(states.pop());
            });
            bu=null;
        }
        else {
            ramlView.openNodeById(states.pop());
        }
    }
    else{
        init();
    }
}
var bu:string="";
export function setBackUrl(u:string){
    bu=u;
}
declare var $:any
export class RAMLDetailsView extends workbench.ViewPart{

    _element:hl.IHighLevelNode;
    compact:boolean=false;
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
        var v=this;
        holder.setToolbar({
                items:[
                    {
                        title:"",
                        image:"glyphicon glyphicon-asterisk",
                        checked: this.compact,
                        run(){
                            v.compact=!v.compact;
                            v.refresh();
                            v.init(v.holder);
                        }
                    }
                ]
            }
        )
        return super.init(holder);
    }

    innerRender(e:Element) {
        (<HTMLElement>e).style.overflow="auto"
        if (this._element&&this._element.property)
        {

            if (this._element.property().nameId()=="types"||this._element.property().nameId()=="annotationTypes"){
                var rnd=new tr.TypeRenderer(this.compact,null,false);
                rnd.setGlobal(true)
                rnd.setUsages(usages.getUsages(this._element.property().nameId()=="types",this._element.name()))
                var cnt=rnd.render(this._element);
            }
            else {
                if (this._element.property().nameId()=="resources"){
                    var cnt=new rr.ResourceRenderer(this.compact).render(this._element);
                }
                if (this._element.property().nameId()=="methods"){
                    var cnt=new rr.MethodRenderer(this.compact,true,true,false,true).render(this._element);
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

        $('[data-toggle="tooltip"]').tooltip();
    }
}

export class RAMLTreeProvider implements workbench.ITreeContentProvider{

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
var colors={

    get:"#0f6ab4",
    post:"#10a54a",
    put:"#c5862b",
    patch:"#c5862b",
    delete:"#a41e22"
}
function methodKey(name:string){
    var color:string="#10a54a"
    color=colors[name];
    return `<span style="border: solid;border-radius: 1px; width:16px;height: 16px; border-width: 1px;margin-right: 5px;background-color: ${color};font-size: small;padding: 3px"> </span>`
}
export class RAMLTreeView extends workbench.AccorditionTreeView{

    protected api:IHighLevelNode;
    protected versions:rrend.ApiWithVersions;
    protected devMode: boolean

    constructor(public path:string,title:string="Overview")
    {
        super(title)
    }

    setKnownVersions(r:rrend.ApiWithVersions){
        this.versions=r;
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
        usages.setUrl(url);
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
                            return "<img src='object.gif'/> "+ss;
                        }
                        if (ss=="array"){
                            return "<img src='arraytype_obj.gif'/> "+ss;
                        }
                        if (ss=="scalar"){
                            return "<img src='string.gif'/> "+ss;
                        }
                        return "<img src='object.gif'/> "+ss;
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
                    result="<img src='typedef_obj.gif'/> "+result;
                }
                if (isAType){
                    result="<img src='annotation_obj.gif'/>"+result;
                }
                return result;
            },
            icon(x:any){
                if (x instanceof hl.TreeLike){
                    var t:hl.TreeLike=x;
                    if (t.id.indexOf("!!")==0){
                        return ""
                    }
                    return "glyphicon glyphicon-cloud";
                }
                if (x instanceof hl.ProxyNode){
                    return "glyphicon glyphicon-tasks"
                }
                if (x.property().nameId()=="resources"){
                    return "glyphicon glyphicon-link"
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
                this.cb();
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
        //this.devMode=true;
        var overview:string=nr.renderNodesOverview(this.api.attrs(),this.versions,this.path);
        if (overview.length>0) {
            a.add(new Label("Generic Info", "<div style='min-height: 200px'>"+overview+"</div>"))
        }
        if (!this.devMode){
            libs=[]
        }
        var groups=hl.elementGroups(this.api);
        var methods:hl.IHighLevelNode[]=[];
        var ts=hl.gatherMethods(this.api,methods);

        var mgroups=hl.groupMethods(methods);
        var groupedMethods=mgroups.allChildren();
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
            showTitle(this.api)
        })
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
        var v=this;
        holder.setToolbar({
                items:[
                    {
                        title:"",
                        image:"glyphicon glyphicon-asterisk",
                        checked: this.devMode,
                        run(){
                            v.devMode=!v.devMode;
                            v.refresh();
                            v.init(v.holder);
                        }
                    }
                ]
            }

        )
        return super.init(holder);
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
var w:any=window;
w.ramlView=ramlView;
var details=new RAMLDetailsView("Details","Details");
var regView=new rrend.RegistryView("API Registry")
export function init(){
    var page=new workbench.Page("rest");

    page.addView(details, "*", 100, workbench.Relation.LEFT);
    page.addView(regView,"Details",15,workbench.Relation.LEFT);
    page.addView(ramlView,"Details",20,workbench.Relation.LEFT);

    regView.addSelectionListener({
        selectionChanged(v: any[]){
            if (v.length > 0) {
                if (v[0] instanceof rrend.ApiWithVersions){
                    var aw:rrend.ApiWithVersions=v[0];
                    var sel:rrend.IRegistryObj=aw.versions[aw.versions.length-1];
                    ramlView.setKnownVersions(aw);
                    ramlView.setUrl(sel.location)

                }
                else {
                    if (v[0].location) {
                        ramlView.setUrl(v[0].location)
                    }
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
    var w:any=window;
    w.openVersion=function(x){
        ramlView.setVersion(x);
    }
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