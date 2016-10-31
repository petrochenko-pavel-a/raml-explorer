

export var usages={

    usageRegistry:null
}
var locationToItem={}
export function reportData(n:any){
    n.apis.forEach(x=>{
        locationToItem[x.location]=x;
    })
    n.libraries.forEach(x=>{
        locationToItem[x.location]=x;
    })
}
var numToFile={};
export function loadedUsageData(d:any){
    usages.usageRegistry=d;

    Object.keys(usages.usageRegistry.fileToNum).forEach(x=>{
        numToFile[usages.usageRegistry.fileToNum[x]]=x;
    })
}
var gurl=null;
export function setUrl(url:string){
    console.log(url)
    gurl=url;
}
export function getUsages(isType:boolean,name:string):any{
    var iN=(isType?"T":"A")+name;
    var num=usages.usageRegistry.fileToNum[gurl];
    if (num) {
        var entry = usages.usageRegistry.usages[num]
        if (entry) {
            var result = entry.usages[iN]
            if (result){
                var aRes:any={};
                Object.keys(result.usage).forEach(x=>{
                    aRes[numToFile[x]]=result.usage[x];
                })
                return aRes;
            }
        }
    }
    return null;
}

export function getTitle(url:string){
    if (locationToItem[url]) {
        var ver = locationToItem[url].version;
        return locationToItem[url].name + (ver ? (("(") + ver + ")") : "");
    }
    return url;
}