export var usages={
    usageRegistry:null
}
var locationToItem={}

function reportData(n:any){
    n.apis.forEach(x=>{
        locationToItem[x.location]=x;
    })
    n.libraries.forEach(x=>{
        locationToItem[x.location]=x;
    })
}
var numToFile={};
function loadedUsageData(d:any){
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

function loadData(url:string, c:(t:any,e?:number)=>void){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.send(); // (1)
    xhr.onreadystatechange = function() { // (3)
        if (xhr.readyState != 4) return;
        var data=JSON.parse(xhr.responseText);
        c(data,xhr.status)

    }
}

export interface IRegistryObj{
    name: string
    tags?: string[]
    category: string
    location?: string
    org?: string
    version?:string
    icon?:string
}

interface IRegistry{
    name:string
    apis:IRegistryObj[]
    libraries:IRegistryObj[]
}

export class GroupNode{
    name: string
    children: ApiWithVersions[]
    icon: string
}
export class ApiWithVersions{
    name: string
    icon: string
    versions: IRegistryObj[]
}


function groupBy(els:any[], f:(x)=>string){
    var result={};
    els.forEach(x=>{
        var group=f(x);
        if (result[group]){
            result[group].push(x);
        }
        else {
            result[group] = []
            result[group].push(x);
        }
    })
    return result;
}


export class LoadedRegistry{

    constructor(protected registry:IRegistry){}
    _apiCount: number;
    _apis:(GroupNode|ApiWithVersions)[]
    _libs:(GroupNode|ApiWithVersions)[]

    findNodeWithUrl(url:string){
        if (!this._apis){
            this.apis();
        }
        var apis = this._apis;
        if (!apis){
            this.apis();
        }
        var f=this.find(apis,url);
        if (f){
            return f;
        }
        var f=this.find(this.libraries(),url);
        return f;
    }

    private find(apis:(GroupNode|ApiWithVersions)[],url:string){
        for (var i=0;i<apis.length;i++){
            if (apis[i] instanceof ApiWithVersions){
                var w:ApiWithVersions=<ApiWithVersions>apis[i];
                for (var j=0;j<w.versions.length;j++){
                    if (w.versions[j].location==url){
                        return w;
                    }
                }
            }
            else{
                var gn:GroupNode=<GroupNode>apis[i];
                var res=this.find(gn.children,url);
                if (res){
                    return res;
                }
            }
        }
    }
    private  mergeVersions(els:IRegistryObj[],merge:boolean):ApiWithVersions[]{
        var groups=groupBy(els,x=>x.name);
        var groupNodes:ApiWithVersions[]=[];
        Object.keys(groups).forEach(gr=>{
            var g=new ApiWithVersions();
            if(merge) {
                this._apiCount++;
            }
            g.name=gr;

            g.versions=groups[gr];
            g.icon=g.versions[0].icon;
            groupNodes.push(g);
        })
        return groupNodes;
    }
    libraries():(GroupNode|ApiWithVersions)[]{
        if (this._libs){
            return this._libs;
        }
        var els = this.registry.libraries;
        this._libs= this.group(els,false);
        return this._libs;
    }
    apis():(GroupNode|ApiWithVersions)[]{
        if (this._apis){
            return this._apis;
        }
        this._apiCount=0;
        var els = this.registry.apis;

        this._apis=this.group(els,true);
        return this._apis;
    }

    private group(els:IRegistryObj[],merge:boolean) {
        var groups = groupBy(els, x=>x.org?x.org:x.name);
        var groupNodes: GroupNode[] = [];
        Object.keys(groups).forEach(gr=> {
            var g = new GroupNode();
            g.name = gr;
            g.children = this.mergeVersions(groups[gr],merge);
            groupNodes.push(g);
        })
        var result: (GroupNode| ApiWithVersions)[] = [];
        groupNodes.forEach(x=> {
            if (x.children.length == 1) {
                result.push(x.children[0]);
            }
            else {
                result.push(x);
                var v = x.children[0];
                x.icon = v.icon;
            }
        })
        return result;
    }
    apiCount(){
        return this._apiCount;
    }
    specCount(){
        return this.registry.apis.length+this.registry.libraries.length;
    }
}

export function getInstance(url:string,f:(data:LoadedRegistry,s:number)=>void){
    var usageUrl=url.substr(0,url.lastIndexOf('/'))+"/registry-usages.json";
    loadData(url,(d,s)=>{
        reportData(d);
        var lr=new LoadedRegistry(<IRegistry>d);
        f(lr,s);
    });
    loadData(usageUrl,(data:any,s:number)=> {
        loadedUsageData(data);
    })
}
