import workbench=require("./framework/workbench")
import controls=require("./framework/controls")
import {Accordition, Label, Loading} from "./framework/controls";
import hl=require("./core/hl")
import rv=require("./ramlTreeView")
var page=new workbench.Page("rest");
import y=require("./registryApp")
//https://raw.githubusercontent.com/apiregistry/commons/master/commons.raml
var url=""
var h=document.location.hash
y.init();
if (h&&h.length>1){
    url=h.substr(1);
    rv.showApi(url)
}


