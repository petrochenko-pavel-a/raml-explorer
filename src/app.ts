import workbench=require("./workbench")
import controls=require("./controls")
import {Accordition, Label, Loading} from "./controls";
import hl=require("./hl")
import rv=require("./ramlTreeView")
var page=new workbench.Page("rest");
import reg=require("./registryApp")
//https://raw.githubusercontent.com/apiregistry/commons/master/commons.raml
var url=""
var h=document.location.hash
reg.init();
if (h&&h.length>1){
    url=h.substr(1);
    reg.showApi(url)
}


