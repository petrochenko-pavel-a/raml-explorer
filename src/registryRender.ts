import workbench=require("./workbench")
import controls=require("./controls")
import {Accordition, Label, Loading} from "./controls";
import hl=require("./hl")
import {IHighLevelNode} from "./hl";
import  tr=require("./typeRender")
import  rr=require("./resourceRender")
import nr=require("./nodeRender")
import ra=require("./registryApp")

function loadData(url:string, c:(t:any,e?:number)=>void){
    var xhr = new XMLHttpRequest();

    xhr.open('GET', url, true);

    xhr.send(); // (1)

    xhr.onreadystatechange = function() { // (3)
        if (xhr.readyState != 4) return;
        c(JSON.parse(xhr.responseText),xhr.status)
    }
}

interface IRegistryObj{
    name: string
    tags?: string[]
    category: string
    location?: string
}

interface IRegistry{

    apis:any[]
    libraries:[IRegistryObj]
}
export class RegistryDetailsView extends workbench.ViewPart{

    innerRender(e: Element) {
    }
}

export class RegistryView extends workbench.AccorditionTreeView{

    protected load() {
        loadData("https://raw.githubusercontent.com/apiregistry/registry/master/registry.json",(data:any,s:number)=>{
            console.log(data);
            this.node=data;
            this.refresh();
        })
    }
    protected url: string;
    setSelectedUrl(url:string){
        this.url=url;
    }

    protected customizeAccordition(root: Accordition, node: IRegistry) {
        this.addTree("Libraries",node.libraries)
        this.addTree("Apis",node.apis)
        var v=this;
        this.getHolder().setContextMenu({
            items:[
                { title:"Open", run(){
                    var api=v.getSelection()[0];
                    ra.showApi(api.location)
                }}
            ]
        });
        if (this.url!=null){
            var selection=null;
            node.libraries.forEach(x=>{
                if (x.location==this.url){
                    selection=x;
                }
            })
            var view=this;
            if (selection){
                setTimeout(function () {
                    view.setSelection(selection);
                },100)
            }
        }
    }

    protected customize(tree: workbench.TreeView) {
        tree.setContentProvider(new workbench.ArrayContentProvider())
        tree.setLabelProvider({
            label(e){
                if (e.name) {

                    return ""+e.name+"";
                }
                else{
                    var c=Object.keys(e)[0];
                    return c;
                }
            }
        })
    }
}