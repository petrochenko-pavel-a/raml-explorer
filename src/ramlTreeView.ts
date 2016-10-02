import workbench=require("./workbench")
import controls=require("./controls")
import {Accordition, Label, Loading} from "./controls";
import hl=require("./hl")
import {IHighLevelNode} from "./hl";
import  tr=require("./typeRender")
import  rr=require("./resourceRender")
import nr=require("./nodeRender")

export class RAMLDetailsView extends workbench.ViewPart{

    _element:hl.IHighLevelNode;

    setSelection(v:hl.IHighLevelNode){
        this._element=v;

        this.refresh();
    }

    innerRender(e:Element) {
        (<HTMLElement>e).style.overflow="auto"
        if (this._element)
        {
            if (this._element.property().nameId()=="types"||this._element.property().nameId()=="annotationTypes"){
                var cnt=new tr.TypeRenderer().render(this._element);
            }
            else {
                if (this._element.property().nameId()=="resources"){
                    var cnt=new rr.ResourceRenderer().render(this._element);
                }
                if (this._element.property().nameId()=="methods"){
                    var cnt=new rr.MethodRenderer().render(this._element);
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
            return x.elements();
        }
        return [];
    }
    elements(x:any){
        return x;
    }
}

export class RAMLTreeView extends workbench.ViewPart{

    protected api:IHighLevelNode;

    constructor(private path:string)
    {
        super("Overview","Overview")
    }

    createTree(name: string){
        var tree=new workbench.TreeView(name,name);
        tree.setContentProvider(new RAMLTreeProvider());
        tree.setLabelProvider({
            label(x:any){

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
        var view=this;
        tree.addSelectionListener({
            selectionChanged(z:any[]){
                view.onSelection(z);
            }
        })
        return tree;
    }

    protected control:Accordition;
    protected trees:workbench.TreeView[]=[];

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

    public setSelection(o:any){
        for(var i=0;i<this.trees.length;i++){
            if (this.trees[i].hasModel(o)){
                this.control.expand(this.trees[i]);
                this.trees[i].select(o);
            }
        }
    }

    innerRender(e:Element) {
        if (!this.api) {
            new Loading().render(e);
            hl.loadApi(this.path,api=>{
                this.api=api;

                this.refresh();
            })
        }
        else{
            var x=this.api.elements();
            var libs=hl.getUsedLibraries(this.api);

            var overview:string=nr.renderNodes(this.api.attrs());
            var a = new Accordition();
            this.control=a;
            this.trees=[];
            if (overview.length>0) {
                a.add(new Label("Generic Info", overview))
            }
            var groups=hl.elementGroups(this.api);


            this.renderArraySection("annotationTypes","Annotation Types",groups,libs);
            this.renderArraySection("types","Types",groups,libs);
            this.renderArraySection("resources","Resources",groups,libs);
            var lt=null;
            a.render(e);

        }
    }
}