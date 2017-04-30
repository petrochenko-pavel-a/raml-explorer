import workbench=require("raml-semantic-ui/dist/workbench")
import controls=require("raml-semantic-ui/dist/controls")
import {IControl,Accordition, Label} from "raml-semantic-ui/dist/controls";
import hl=require("./core/hl")
import oc=require("./core/overlayCore")
import ui=require("./uiUtils")
import forms=require("raml-semantic-ui/dist/forms")
import  tr=require("./rendering/typeRender")
import  rr=require("./rendering/resourceRender")
import  rc=require("./core/registryCore")
import nr=require("./rendering/nodeRender")
import pg=require("./core/propertyGroup")
import {OverlayManager} from "./core/overlayCore";
import tools=require("./core/tools")
import {ITool} from "./core/registryCore";
declare var $: any
declare var hljs:any;

class RAMLOverlayView extends workbench.ViewPart{

    _element:hl.IHighLevelNode;
    compact:boolean=true;

    location: string;
    manager:OverlayManager;
    loading=false;

    libLocation="https://raw.githubusercontent.com/OnPositive/aml/master/org.aml.apigatewayimporter/apigateway-lib.raml"
    setLib(lib:string){
        this.libLocation=lib;
        this.location=null;
        this.setInput(this._element);
    }

    setInput(v:hl.IHighLevelNode){
        this._element=v;
        if (v) {
            var view = this;
            var loc = hl.location(v);
            if (this.location != loc) {
                this.loading=true;
                this.manager=null;
                this.refresh();
                oc.createManager(loc,this.libLocation , (m)=> {
                    this.loading=false;
                    view.manager = m;
                    view.location = loc;
                    this.refresh();
                })
            }
            else {
               this.refresh();
            }
        }
    }
    constructor(id:string,title:string){
        super(id,title);

        var view=this;
        this.getToolbar().add({
            title:" Select node",
            image:"glyphicon glyphicon-screenshot",
            run(){
                workbench.selectDialog("Select node",'Please select a node to overlay from the tree of possible targets',x=>{
                  view.setInput(x)
                },[view._element.root()],ui.HLNodeLabelProvider,{
                    elements(v){
                        return v;
                    },
                    children(c){
                        return c.elements().filter(x=>view.manager.hasOverlayableChildren(x));
                    }
                })
            }
        });
        this.getToolbar().add({
            title:"Save",
            run(){
                view.manager.save(x=>{
                    workbench.showInDialog("Saved","Overlay stored");
                })
            }

        })
        this.getToolbar().add({
            title:"Run",
            primary:true,
            checked:true,
            run(){
                var ovr=view.manager.dump();
                tools.executeWithConfig(view.tool,ovr,res=>{
                    if (res.resultUrl){
                        if (res.resultUrl.indexOf("http://")==0||res.resultUrl.indexOf("https://")==0){
                            document.location.assign(res.resultUrl);
                            return;
                        }
                        var ll=view.tool.location.indexOf('/',7);
                        var loc=view.tool.location.substring(0,ll);
                        loc+=res.resultUrl;
                        document.location.assign(loc);
                    }
                    else {
                        workbench.showInDialog("Result", new Label(res.result))
                    }
                });
            }

        })
    }
    obj={};

    tool:ITool={
        name: "",
        category:"Test",
        location:"http://localhost:8080/home/hello"
    }

    innerRender(e:Element) {
        e.innerHTML="";
        if (this.loading&&!this.manager){
            new controls.Loading().render(e);
            return;
        }
        if (!this._element){
            return;
        }
        var mm=hl.overlayId(this._element).join("/");
        if (!this._element.property()){
            mm=" root"
        }
        if (this.tool.name){
            this.setTitle("Configuring execution of "+this.tool.name+" " + mm + " of (" + hl.title(this._element) + ")")
        }
        else {
            this.setTitle("Overlays for: " + mm + " of (" + hl.title(this._element) + ")")
        }
        var f=new controls.Form();
        f._style.height="100%"
        var vv=new controls.VerticalFlex();
        vv.wrapStyle.height="100%";
        var m=new controls.HorizontalFlex();
        vv._style.height="100%"
        m._style.flex="1 1 0"
        //m._style.backgroundColor="gray"
        m._style.height="100%"

        var view=this;
        var hide=false;
        if (this._element&&this.manager) {
            var groups=[]
            groups=groups.concat(this.manager.getOvelayProperties(this._element));
            this.obj=view.manager.overlay(this._element);
            if (true) {
                var t=new workbench.TreeView("","");
                t.styleString="overflow: auto;flex: 1 1 0; min-height: 50px;height: 100%;display: block;background: lightgray; min-width:200px"
                m.add(t);
                m.add(f);
                t.setLabelProvider({
                    label(e: any): string{
                        return e.caption
                    }
                })
                t.setContentProvider(new workbench.ArrayContentProvider())
                t.setInput(groups)
                t.addSelectionListener({
                    selectionChanged(v:any[]){
                        if (v.length==1){
                            f.children=[]
                            // var p:pg.PropertyGroup =v[0]
                            // var b=new ObjectBridge(view.obj);
                            // f.add(forms.renderPropertyGroup(p,b));
                            f.refresh();
                            $('[data-toggle="tooltip"]').tooltip();
                        }
                    }
                })
                if (groups.length<=1){
                    hide=true;
                }

            }
        }
        vv.add(m)
        vv.render(e);
        $('[data-toggle="tooltip"]').tooltip();
        if (hide){
            t.hide();
        }
        if (groups && groups.length>0){
            t.select(groups[0]);
        }
    }
}
export = RAMLOverlayView;