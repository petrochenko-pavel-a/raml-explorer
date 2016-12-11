import workbench=require("./framework/workbench")
import hl=require("./core/hl")
import oc=require("./core/overlayCore")
import controls=require("./framework/controls");
import {Label, Accordition} from "./framework/controls";
import forms=require("./framework/forms")
import  tr=require("./rendering/typeRender")
import  rr=require("./rendering/resourceRender")
import  rc=require("./core/registryCore")
import nr=require("./rendering/nodeRender")
import {ObjectBridge} from "./framework/forms";
import pg=require("./core/propertyGroup")
import {OverlayManager} from "./core/overlayCore";
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
            title:"Save",
            run(){
                view.manager.save(x=>{
                    workbench.showInDialog("Saved","Overlay stored");
                })
            }

        })
    }
    obj={};

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
        this.setTitle("Overlays for: "+mm+" of ("+hl.title(this._element)+")")
        var f=new forms.Form();
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
                var groups=[]
                groups=groups.concat(this.manager.getOvelayProperties(this._element));
                t.setInput(groups)
                t.addSelectionListener({
                    selectionChanged(v:any[]){
                        if (v.length==1){
                            f.children=[]
                            var p:pg.PropertyGroup =v[0]
                            var b=new ObjectBridge(view.obj);
                            f.add(forms.renderPropertyGroup(p,b));
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