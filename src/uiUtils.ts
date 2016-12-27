import hl=require("./core/hl")
import images=require("./rendering/styles")
import methodKey=hl.methodKey;

export const HLNodeLabelProvider={
    label(x:any){
        if (x instanceof hl.TreeLike){
            var t:hl.TreeLike=x;
            if (t.id.indexOf("!!")==0){
                var ss=t.id.substr(2);
                if (ss=="object"){
                    return images.OBJECT_IMAGE+ss;
                }
                if (ss=="array"){
                    return images.ARRAY_IMAGE+ss;
                }
                if (ss=="scalar"){
                    return images.STRING_IMAGE+ss;
                }
                return images.OBJECT_IMAGE+ss;
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
            result=images.GENERIC_TYPE+result;
        }
        if (isAType){
            result=images.ANNOTATION_TYPE+result;
        }
        return result;
    },
    icon(x:any){
        if (x instanceof hl.TreeLike){
            var t:hl.TreeLike=x;
            if (t.id.indexOf("!!")==0){
                return ""
            }
            return images.FOLDER_SPAN;
        }
        if (!x.property()){
            return images.FOLDER_SPAN
        }
        if (x instanceof hl.ProxyNode){
            return images.LIBRARY_SPAN;
        }
        if (x.property().nameId()=="resources"){
            return images.RESOURCE_SPAN;
        }
        return ""
    }
}