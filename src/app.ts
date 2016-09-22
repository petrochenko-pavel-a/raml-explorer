import workbench=require("./workbench")
import controls=require("./controls")
import {Accordition, Label, Loading} from "./controls";
import hl=require("./hl")
import rv=require("./ramlTreeView")
var page=new workbench.Page("rest");
var details=new rv.RAMLDetailsView("Details","Details");
//https://raw.githubusercontent.com/apiregistry/commons/master/commons.raml
var r2j="https://raw.githubusercontent.com/OnPositive/aml/master/raml2java.raml"
var ramlView=new rv.RAMLTreeView(r2j);

page.addView(details,"*",100,workbench.Relation.LEFT);
page.addView(ramlView,"Details",20,workbench.Relation.LEFT);
//page.addView(tree,"b1",50,workbench.Relation.BOTTOM);
function initSizes(){
    var h=document.getElementById("header").clientHeight+50;
    document.getElementById("rest").setAttribute("style","height:"+(window.innerHeight-h)+"px");
}
initSizes();
ramlView.addSelectionListener({
    selectionChanged(v:any[]){
        if (v.length>0) {
            details.setSelection(v[0]);
        }
        else{
            details.setSelection(null);
        }
    }
})
window.onresize=initSizes;