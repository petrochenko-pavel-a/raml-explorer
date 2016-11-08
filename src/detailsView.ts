import workbench=require("./framework/workbench")
import hl=require("./core/hl")
import { Label} from "./framework/controls";
import  tr=require("./rendering/typeRender")
import  rr=require("./rendering/resourceRender")
import  rc=require("./core/registryCore")
import nr=require("./rendering/nodeRender")

declare var $: any
declare var hljs:any;

class RAMLDetailsView extends workbench.ViewPart{

    _element:hl.IHighLevelNode;
    compact:boolean=true;
    setInput(v:hl.IHighLevelNode){
        this._element=v;

        this.refresh();
    }
    constructor(id:string,title:string){
        super(id,title);
        var v=this;
        this.toolbar.add({
            title:"",
            image:"glyphicon glyphicon-asterisk",
            checked: this.compact,
            run(){
                v.compact=!v.compact;
                v.refresh();
                v.init(v.holder);
            }
        })
    }

    innerRender(e:Element) {
        (<HTMLElement>e).style.overflow="auto"
        if (this._element&&this._element.property)
        {

            if (this._element.property().nameId()=="types"||this._element.property().nameId()=="annotationTypes"){
                var rnd=new tr.TypeRenderer(this.compact,null,false);
                rnd.setGlobal(true)
                rnd.setUsages(rc.getUsages(this._element.property().nameId()=="types",this._element.name()))
                var cnt=rnd.render(this._element);
            }
            else {
                if (this._element.property().nameId()=="resources"){
                    var cnt=new rr.ResourceRenderer(this.compact).render(this._element);
                }
                if (this._element.property().nameId()=="methods"){
                    var cnt=new rr.MethodRenderer(this.compact,true,true,false,true).render(this._element);
                }
            }
            new Label(this._element.name(),cnt).render(e);
        }
        else{
            e.innerHTML="";
        }
        $('[data-toggle="tooltip"]').tooltip();
        $('pre code').each(function(i, block) {
            hljs.highlightBlock(block);
        });
    }
}
export = RAMLDetailsView;