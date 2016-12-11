import workbench=require("./framework/workbench")
import rc=require("./core/registryCore")
import hl=require("./core/hl")

class ExplorerState {

    private _registryUrl: string = "https://raw.githubusercontent.com/apiregistry/registry/gh-pages/registry-resolved.json"

    private specificationLink: string

    private version:string

    private specElementLink: string

    private registryTabLink: string

    private specTabLink: string

    private extras: string

    private listeners: (()=>void)[] = []

    addListener(l: ()=>void) {
        this.listeners.push(l);
    }

    removeListener(l: ()=>void) {
        this.listeners = this.listeners.filter(x=>x != l);
    }

    specificationId() {
        return this.specificationLink;
    }
    private lr:rc.LoadedRegistry;

    private requests:((data: rc.LoadedRegistry, s: number)=>void)[]=[]
    private queried:boolean;

    private options:{ [name:string]:string}={}

    getApiInstance(current:any,resC:(n:any,path:string)=>void,cb:(n:hl.IHighLevelNode)=>void){
        this.getRegistryInstance((r,c)=>{
            var n = r.findNodeWithUrl(this.specificationId());

            if (n) {
                if (n instanceof rc.ApiWithVersions){
                    var aw:rc.ApiWithVersions=n;

                    var sel:rc.IRegistryObj=aw.versions[aw.versions.length-1];
                    if (this.version){
                        sel=aw.versions.filter(x=>x.version==this.version)[0];
                        if (!sel){
                            sel=aw.versions[aw.versions.length-1];
                        }
                    }
                    resC(n,sel.location)
                    if (current==sel.location){
                        return;
                    }
                    hl.loadApi(sel.location,x=>{
                        cb(x)
                    })
                }
            }
            else {
                resC(null,null)
            }
        })
    }

    getRegistryInstance(f: (data: rc.LoadedRegistry, s: number)=>void) {
        if (this.lr){
            f(this.lr,200);
            return;
        }
        this.requests.push(f);
        if (!this.queried) {
            this.queried=true;
            rc.getInstance(this._registryUrl, x=> {
                this.lr=x;
                this.queried=false;
                this.requests.forEach(y=>y(this.lr,200));
                this.requests=[];
            });
        }
    }

    registry(){
        return this.lr;
    }


    registryUrl() {
        return this._registryUrl
    }

    registryTab() {
        return this.registryTabLink;
    }

    specTab() {
        return this.specTabLink;
    }

    encode(): string {
        if (this.registryTabLink) {
            return "#registryTab:" + this.registryTabLink;
        }
        var optionsString="";
        if (Object.keys(this.options).length>0){
            var optArr:string[]=[];
            Object.keys(this.options).forEach(k=>{
                optArr.push(k+"="+this.options[k]);
            })
            optionsString="^"+optArr.join(",")
        }
        if (this.specificationLink) {
            var result = [];
            if (this.version){
                result.push(this.specificationLink+"~"+this.version);
            }else {
                result.push(this.specificationLink);
            }
            if (this.specElementLink) {
                result.push(this.specElementLink)
            }
            else if (this.specTabLink) {
                result.push("specTab:" + this.specTabLink);
            }
            return "#" + result.join("#")+optionsString;
        }
    }
    propogateNode(nodeId:string){
        this.specElementLink=nodeId;
        this.stateUpdated();
    }

    updateVersion(v:string){
        this.version=v;
        this.stateUpdated();
    }

    specElementId(){
        return this.specElementLink;
    }
    propogateSpecification(specId:string) {
        this.version=null;
        this.specificationLink = specId;
        this.registryTabLink = null;
        this.specElementLink = null;
        this.stateUpdated();
    }

    onState(state: string) {
        if (state&&state.charAt(0)!='#'){
            this.propogateNode(state);
            return;
        }
        this.decode(state);
        this.listeners.forEach(x=>x());
    }

    getOptions(){
        return this.options;
    }
    setOption(opt:string,val:string){
        this.options[opt]=val;
        this.stateUpdated();
    }

    stateUpdated() {
        workbench.notifyState({hash: this.encode()})
        this.listeners.forEach(x=>x());
    }
    clearOptions(){
        this.options={}
        this.stateUpdated();
    }
    decode(hash: string) {
        var extras=hash.lastIndexOf('^')
        this.options={};
        if (extras!=-1){
            var extraoptions=hash.substring(extras+1);
            var elements=extraoptions.split(",");
            var v=this;
            elements.forEach(e=>{
                var a=e.indexOf('=')
                var key=e.substring(0,a);
                var val=e.substring(a+1);
                v.options[key]=val;
            })
            hash=hash.substring(0,extras);
        }
        if (hash.indexOf("#registryTab:") == 0) {
            this.registryTabLink = hash.substring("#registryTab:".length);
            this.specElementLink = null;
            this.specTabLink = null;
            this.specificationLink = null;
            return;
        }
        var extraHash = hash.indexOf("#", 1);
        if (extraHash != -1) {
            var innerLocation = hash.substring(extraHash);
            hash = hash.substring(0, extraHash);
            if (innerLocation.indexOf("#specTab:") == 0) {
                this.specTabLink = innerLocation.substring("#specTab:".length);
                this.specElementLink = null;
            }
            else {
                this.specTabLink = null;
                this.specElementLink = innerLocation.substring(1);
            }
        }
        this.specificationLink = hash.substring(1);
        var versionIndex=this.specificationLink.indexOf("~");
        if (versionIndex!=-1){
            this.version=this.specificationLink.substring(versionIndex+1);
            this.specificationLink=this.specificationLink.substring(0,versionIndex);
        }
    }
}
const state = new ExplorerState();
export =state;
state.decode(location.hash)