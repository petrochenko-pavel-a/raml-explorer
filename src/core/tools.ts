import rc=require("./registryCore");
import hl=require("./hl")
import oc=require("./overlayCore")
function postData(url: string, content: string, c: (t: any, e?: number)=>void) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    xhr.send(content); // (1)
    xhr.onreadystatechange = function () { // (3)
        if (xhr.readyState != 4) return;
        var data = JSON.parse(xhr.responseText);
        c(data, xhr.status)

    }
}

export function callTool(){

}


// postData("https://3jn3sf0a8e.execute-api.us-east-1.amazonaws.com/prod/","AAAAAA",x=>{
//     console.log("Done")
// })

export var V=1;

export function execute(tool:rc.ITool,content:hl.IHighLevelNode,f:(x)=>void){
    if (tool.needsConfig){

    }
    else {
        var location=hl.location(content);
        var ovr=oc.createEmptyOverlay(location);
        postData(tool.location, ovr, f)
    }
}

export function executeWithConfig(tool:rc.ITool,content:string,f:(x)=>void){
    postData(tool.location, content, f)
}