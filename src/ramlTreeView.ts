import workbench=require("./workbench")
import controls=require("./controls")
import {Accordition, Label, Loading} from "./controls";
import hl=require("./hl")
import {IHighLevelNode} from "./hl";
import  tr=require("./typeRender")
import nr=require("./nodeRender")

export class RAMLDetailsView extends workbench.ViewPart{

    _element:hl.IHighLevelNode;

    setSelection(v:hl.IHighLevelNode){
        this._element=v;
        this.refresh();
    }

    innerRender(e:Element) {
        if (this._element)
        {
            if (this._element.property().nameId()=="types"){
                var cnt=new tr.TypeRenderer().render(this._element);
            }
            else {
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

export class RAMLTreeView extends workbench.ViewPart{

    protected api:IHighLevelNode;

    constructor(private path:string)
    {
        super("Overview","Overview")
    }

    createTree(name: string){
        var tree=new workbench.TreeView(name,name);
        tree.setContentProvider(new workbench.ArrayContentProvider());
        tree.setLabelProvider({
            label(x:any){

                return ""+x.name();
            },
            icon(x:any){
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

    protected renderArraySection(id:string,label:string,groups:any){
        if (groups[id]){
            var at=groups[id]
            var annotationTypes=groups[id];
            var types=this.createTree(label);
            types.setInput(at);
            this.control.add(types)
            this.trees.push(types)
        };
    }

    public openNodeById(id: string)
    {
        var node=this.api.findById(id);
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
            var overview:string=nr.renderNodes(this.api.attrs());
            var a = new Accordition();
            this.control=a;
            this.trees=[];
            if (overview.length>0) {
                a.add(new Label("Generic Info", overview))
            }
            var groups=hl.elementGroups(this.api);
            this.renderArraySection("annotationTypes","Annotation Types",groups);
            this.renderArraySection("types","Types",groups);
            var lt=null;
            a.render(e);

        }
    }
}