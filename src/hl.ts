import keywords=require("./keywords")
import {trimDesc} from "./keywords";
export interface IProperty{
    nameId():string
    isKey(): boolean
    range(): IType
    isRequired():boolean
    local?:boolean
}
export interface IType{
    nameId():any
    properties():IProperty[]
    facets():IProperty[]
    allProperties():IProperty[]
    isObject():boolean
    isString():boolean
    isBoolean():boolean
    isNumber():boolean
    isArray(): boolean
    isBuiltIn(): boolean
    isUnion(): boolean
    componentType(): IType
    union():IType
    isRequired();
    leftType():IType
    rightType():IType
    superTypes(): IType[]
    adapters:any[];
}

var root:IHighLevelNode
var libs:IHighLevelNode[];

export function findById(id:string):IHighLevelNode{
    var n=root.findById(id);
    if (n){
        return n;
    }
    var nodes:IHighLevelNode[]=[];
    getUsedLibraries(root).forEach(x=>{
        var rs=x.findById(id);
        if (rs!=null){
            nodes.push(rs);
        }
    })
    if (nodes.length>0){
        return nodes[0];
    }
}
export function getDeclaration(n:IType,escP:boolean=true):IHighLevelNode{
    if (!n.adapters||n.adapters.length==0){
        return null;
    }
    var ns=n.adapters[0].getDeclaringNode();
    if (ns) {
        if (escP&&ns.property()&&(ns.property().nameId() === "properties" || ns.property().nameId() === "facets")) {
            return null;
        }
    }
    root.children().forEach(x=>{
        if (x.property().nameId()=="types"){
            if (x.name()==n.nameId()){
                return x;
            }
        }
    })
    var libs=getUsedLibraries(root);
    var options:IHighLevelNode[]=[]
    libs.forEach(t=>{
        t.children().forEach(x=>{
            if (x.property().nameId()=="types"){
                if (x.name()==n.nameId()){
                    options.push(x);
                }
            }
        })
    })
    if (options.length>0){
        return options[0];
    }
    return ns;
}

export function getUsedLibrary(usesNode:IHighLevelNode){
    var path=usesNode.attr("value");
    if (path) {
        var u = (<any>usesNode).lowLevel().unit();
        var ast=u.resolve(path.value()).highLevel();
        return new ProxyNode(usesNode.name(),ast,ast.children());
    }
    return null;
}
export function getUsedLibraries(root:IHighLevelNode){
    if (libs){
        return libs;
    }
    var nodes:IHighLevelNode[]=[];
    root.children().forEach(x=>{
        if (x.property().nameId()=="uses"){
            nodes.push(getUsedLibrary(x))
        }
    })
    libs=nodes;
    return nodes;
}

export class ProxyNode implements IHighLevelNode{


    constructor(private _name:string,private  original:IHighLevelNode,private  _children:IHighLevelNode[]){

    }

    parent(){
        return this.original.parent();
    }

    definition():IType{
        return this.original.definition();
    }
    name(): string{
        return this._name;
    }
    property(): IProperty{
        return this.original.property();
    }
    children():IHighLevelNode[]{
        return this._children;
    }
    elements():IHighLevelNode[]{
        return this._children;
    }
    attrs():IHighLevelNode[]{
        return [];
    }
    attr(name:string):IHighLevelNode{
        return this.original.attr(name)
    }
    value() {
        return null;
    }
    lowLevel() {
        return this.original.lowLevel();
    }
    isAttr():boolean{
        return false;
    }
    id(): string{
        return null;
    }
    root():IHighLevelNode{
        return this.original;
    }
    findById(id: string): IHighLevelNode{
        return this.original.findById(id)
    }
    localType(): IType{
        return null;
    }
}



export function description(n:IType): string{
    var h=getDeclaration(n,false);
    if (h) {
        var d = h.attr("description");
        if (d) {
            return "" + d.value()
        }
    }
    return "";
}
export function asObject(vl:IHighLevelNode){
    var r=vl.lowLevel().dumpToObject();
    return r
}
export interface IHighLevelNode{
    definition():IType
    name(): string
    property(): IProperty
    children():IHighLevelNode[]
    elements():IHighLevelNode[]
    attrs():IHighLevelNode[]
    attr(name:string):IHighLevelNode
    value(): any
    lowLevel(): any;
    isAttr():boolean
    id(): string;
    root():IHighLevelNode
    findById(id: string): IHighLevelNode;
    localType(): IType
    parent():IHighLevelNode
}

declare var RAML:any;

export interface ElementGroups{
    [name:string]: (IHighLevelNode|TreeLike)[];
}

export function elementGroups(hl:IHighLevelNode):ElementGroups{
    var groups:ElementGroups={};
    hl.elements().forEach(x=>{
        var z=groups[x.property().nameId()];
        if (!z){
            z=[];
            groups[x.property().nameId()]=z;
        }
        z.push(x);
    });
    return groups;
}

export function loadApi(path:string,f:(x:IHighLevelNode,e?:any)=>void){
    RAML.Parser.loadApi(path).then(
        function (api) {
            var hl=api.highLevel();
            var tr=hl.elements().filter(x=>x.property().nameId()=="traits"||x.property().nameId()=="resourceTypes");
            if (tr.length>0) {
                root = api.expand ? api.expand().highLevel() : api.highLevel();
            }
            else{
                root=hl;
            }
            libs=null;
            f(root);
        }
    )
}

export function subTypes(t:IType):IType[]{
    var n=getDeclaration(t);
    var result:IType[]=[];

    function extracted(cr) {
        cr.elements().forEach(x=>{
            if (x.property().nameId() == "types") {
                x.localType().superTypes().forEach(y=> {
                    var rs = getDeclaration(y);
                    if (rs == n) {
                        if (result.indexOf(x.localType())==-1) {
                            result.push(x.localType());
                        }
                    }
                })
            }
        })
    }

    if (n){
        var cr=n.root();
        extracted(cr);
        extracted(root);
        getUsedLibraries(root).forEach(l=>{
            extracted(l)
        })
    }
    return result;
}

export class FakeNode implements IHighLevelNode{

    constructor(private t:IType,private _name: string){

    }
    localType(){
        return this.t;
    }

    root(){
        return null;
    }
    id(){
        return this._name;
    }
    findById(){
        return null;
    }
    parent(){
        return null;
    }

    definition():IType {
        return this.t;
    }

    name():string {
        return this._name;
    }

    property():IProperty {
        return null;
    }

    children():IHighLevelNode[] {
        return [];
    }

    elements():IHighLevelNode[] {
        return [];
    }

    attrs():IHighLevelNode[] {
        return [];
    }

    attr(name:string):IHighLevelNode {
        return null;
    }

    value():any {
        return null;
    }

    lowLevel():any {
        return [];
    }

    isAttr():boolean {
        return true;
    }
}

export class MergedNode implements IHighLevelNode{

    constructor(private  p:IProperty,private t:IType,public vl:any[],private _name: string){

    }
    localType(){
        return null;
    }

    root(){
        return null;
    }
    id(){
        return "";
    }
    findById(){
        return null;
    }
    parent(){
        return null;
    }

    definition():IType {
        return this.t;
    }

    name():string {
        return this._name;
    }

    property():IProperty {
        return this.p;
    }

    children():IHighLevelNode[] {
        return [];
    }

    elements():IHighLevelNode[] {
        return [];
    }

    attrs():IHighLevelNode[] {
        return [];
    }

    attr(name:string):IHighLevelNode {
        return null;
    }

    value():any {
        return this.vl;
    }

    lowLevel():any {
        return [];
    }

    isAttr():boolean {
        return true;
    }
}

export function isJoinable(n:IHighLevelNode){
    if (!n.isAttr()){
        return false;
    }
    var p=n.property()
    return p.nameId()!="annotations";
}
var Locals={
    "Id":-1,
    "Title":1,
    "Version":-1,

}
var PLocals={
    "usage": 2,
    "description":150,
    "securedBy":-2
}


export function group(n:IHighLevelNode):number{
    if (n.definition&&n.definition()) {
        if (Locals[n.definition().nameId()]) {
            return Locals[n.definition().nameId()];
        }
    }
    if (n.property&&n.property()) {
        if (PLocals[n.property().nameId()]) {
            return PLocals[n.property().nameId()];
        }
    }
    return 10;
}
export function resourceUrl(h:IHighLevelNode):string{
    var result=""
    var o=h;
    while (h!=null&&h.property()!=null){
        result=h.name()+result;
        h=h.parent();
    }
    var up=uriParameters(o);
    for (var i=0;i<up.length;i++){
        if (isSyntetic(up[i])){
            var nm=up[i].name();
            if (nm.charAt(nm.length-1)=="?"){
                nm=nm.substr(0,nm.length-1);
            }
            result=result.replace("{"+nm+"}","");
        }
    }
    return result;
}

export function isSyntetic(x:IHighLevelNode):boolean{
    var attrs=prepareNodes(x.attrs());
    for (var i=0;i<attrs.length;i++){
        var d=attrs[i].definition();
        if (d&&d.nameId()=="syntetic"){
            return true;
        }
    }
    return false;
}
export function logicalStructure(x:IHighLevelNode):string[]{
    var attrs=prepareNodes(x.attrs());
    for (var i=0;i<attrs.length;i++){
        var d=attrs[i].definition();
        if (d&&(d.nameId()=="LogicalStructure")){
            var obj= asObject(attrs[i]);
            return obj[Object.keys(obj)[0]];
        }
    }
    return [];
}
export function enumDescriptions(x:IHighLevelNode):string[]{
    var attrs=prepareNodes(x.attrs());
    for (var i=0;i<attrs.length;i++){
        var d=attrs[i].definition();
        if (d&&(d.nameId()=="EnumDescriptions")){
            var obj= asObject(attrs[i]);
            return obj[Object.keys(obj)[0]];
        }
    }
    return null;
}



export function uriParameters(h:IHighLevelNode):IHighLevelNode[]{
    var result:IHighLevelNode[]=[];

    while (h!=null&&h.property()!=null){
        var nm:string=h.name();
        var names:string[]=[]
        while (true){

            var ind=nm.indexOf('{');
            if (ind!=-1){
                nm=nm.substr(ind+1);
                var end=nm.indexOf('}');
                if (end==-1){
                    break;
                }
                var upn=nm.substr(0,end);
                names.push(upn)
                nm=nm.substr(end);
            }
            else{
                break;
            }
        }
        names.forEach(x=>{
            var up=h.elements().filter(y=>y.property().nameId()=="uriParameters"&&y.name()==x||(y.name())==(x+ '?'));
            if (up.length>0){
                var m=up[0];
                result.push(up[0]);
            }
            else{
                result.push(new FakeNode({
                    nameId(){
                        return "string"
                    },
                    properties(){return []},
                    facets(){return []},
                    allProperties(){return []},
                    isObject(){return false},
                    isArray(){return false},
                    isBoolean(){return false},
                    isBuiltIn(){return false},
                    isString(){return false},
                    isNumber(){return false},
                    isUnion(){return false},
                    componentType(){return null},
                    union(){return null},
                    isRequired(){return true},
                    leftType(){return null},
                    rightType(){return null},
                    superTypes(){return []},
                    adapters:[]

                },x))
            }
        })
        h=h.parent();
    }
    return result;
}
export function gatherMethods(h:IHighLevelNode,result:IHighLevelNode[]){
    h.elements().forEach(x=>{
        var p=x.property();
        if (p) {
            if (p.nameId() == "resources") {
                gatherMethods(x, result);
            }
            if (p.nameId() == "methods") {
                result.push(x);

            }
        }
    })
}
export class TreeLike{

    id: string

    children: { [n:string]:TreeLike}={}

    values: any[]=[];

    constructor(id: string){
        this.id=id;

    }

    addItem(items:string[],position:number,i:any){
        if (position>=items.length){
            this.values.push(i);
            return;
        }
        var name=items[position];

        var ch=this.children[name];
        if (!ch){
            ch=new TreeLike(name);
            this.children[name]=ch;
        }
        ch.addItem(items,position+1,i);
    }

    allChildren():(TreeLike|IHighLevelNode)[]{
        var result:(TreeLike|IHighLevelNode)[]=[];
        result=result.concat(this.values);
        Object.keys(this.children).forEach(x=>{
            var c=this.children[x];

            result.push(c);
        })
        return result;
    }
    optimizeStructure(){
        var c=Object.keys(this.children);
        Object.keys(this.children).forEach(x=>{
            var c=this.children[x];
            c.optimizeStructure();
            var k=Object.keys(c.children);
            if (k.length==0&&c.values.length==1){
                delete this.children[x];
                c.values.forEach(x=>{
                    if (x.$name){
                        x.$name=c.id+" "+x.$name;
                    }
                    else x.$name=c.id;
                    this.values.push(x);
                })
            }
        })
        if (this.values.length>12){
           this.values=collapseValues(this.values);
        }
    }
}
declare class Map{
    set(k:any,v:any)
    has(k:any):boolean
    delete(k:any):boolean
}
export function collapseValues(v:any[]){
    var labelToMethods:{ [name:string]: any[]}={};
    v.forEach(m=>{
        var lab=label(m);
        if( lab=="Get your deposits history"){
            console.log("A")
        }
        var words=keywords.keywords(lab);
        words.forEach(x=>{
            if (x.length<=3){
              return;
            }
            x=x.toLowerCase();
            var r=labelToMethods[x];
            if (!r){
                r=[];
                labelToMethods[x]=r;
            }
            r.push(m);
        })
    })
    keywords.tryMergeToPlurals(labelToMethods);
    keywords.removeZombieGroups(labelToMethods);
    keywords.removeHighlyIntersectedGroups(labelToMethods);
    var sorted=Object.keys(labelToMethods).sort( (x,y)=>{
        return labelToMethods[x].length-labelToMethods[y].length;
    })
    var q=new Map()
    var result:any[]=[];
    for (var i=sorted.length-1;i>=0;i--){
        var key=sorted[i];
        var values=labelToMethods[key];
        if (values.length<=2){
            continue;
        }
        if (values.length<v.length-2){
            var t=new TreeLike(key);
            values.forEach(x=> {
                    //if (!q.has(x)) {
                        t.values.push(x);
                        q.set(x,1);
                    //}
                }
            )
            result.push(t);
        }
    }
    v.forEach(x=>{
        if (!q.has(x)){
            result.push(x);
        }
    });
    return result;
}

export function label(x:IHighLevelNode&{$name?:string}){
    var a=x.attrs();
    var b=null;
    var result="";
    var pr=x.property();
    var mm:any=x;
    if (mm.label){
        return mm.label;
    }
    var isMethod=pr&&pr.nameId()=="methods";
    for (var i=0;i<a.length;i++){

        if (a[i].name()=="displayName"){
            var v=a[i].value();
            if (x.$name){
                result=v+" "+x.$name;
                break;
            }
            else{
                result=v;
                break;
            }
        }
        if (isMethod&&a[i].name()=="description"){
            b=a[i].value();
        }
    }
    if (!result){
        if (x.$name){
            return b+" "+x.$name;
        }
        result=b;
    }
    if (!result){
        if (isMethod){
            result=resourceUrl(x.parent())
        }
        else {
            result = x.name();
        }
    }
    if (isMethod&&result.indexOf(' ')==-1){
        if (b){
            var tr=trimDesc(b);
            if (tr.indexOf("...")==-1&&tr.indexOf(' ')!=-1){
                result=tr;
            }
        }
    }
    result=keywords.trimDesc(result);
    mm.label=result;
    return result;
}

export function groupMethods(methods:IHighLevelNode[]):TreeLike{
    var root=new TreeLike("");
    methods.forEach(x=>{
        var structure=logicalStructure(x);
        root.addItem(structure,0,x);
    })
    root.optimizeStructure()
    return root;
}

export function prepareNodes(nodes:IHighLevelNode[]):IHighLevelNode[]{
    var nodesToRender:IHighLevelNode[]=[];
    //expand annotations;
    nodes.forEach(v=>{

        if (v.property&&v.property()&&v.property().nameId()=="annotations"){
            var node:IHighLevelNode=v.value().toHighLevel();

            if (node!=null){

                    nodesToRender.push(node);

            }
        }
        else{
            nodesToRender.push(v);
        }
    });
    nodesToRender.sort((x,y)=>{
        var g1=group(x);
        var g2=group(y);
        if (g1!=g2){
            return g1-g2;
        }
        return x.name().toLowerCase().localeCompare(y.name().toLowerCase());
    })
    return collapseScalarArrays(nodesToRender);
}
export var collapseScalarArrays = function (nodesToRender:IHighLevelNode[]):IHighLevelNode[] {
    var resultNodes:IHighLevelNode[] = [];
    var mp:IHighLevelNode = null;
    for (var i = 0; i < nodesToRender.length; i++) {
        var n = nodesToRender[i];
        if (n.property && n.property() && n.property().isKey()) {
            continue;
        }
        if (mp) {
            var merged = false;
            if (mp.property() === n.property() && isJoinable(n)) {
                if (!(mp instanceof MergedNode)) {
                    if (typeof mp.value() === "string" && typeof n.value() === "string") {
                        var mn = new MergedNode(mp.property(), mp.definition(), [mp.value(), n.value()], mp.name());
                        mp = mn;
                        merged = true;
                    }
                }
                else {
                    if (typeof n.value() == "string") {
                        (<MergedNode>mp).vl.push(n.value())
                        merged = true;
                    }
                }
            }
            if (!merged) {
                resultNodes.push(mp);
                mp = n;
            }
        }
        else {
            mp = n;
        }
    }
    if (mp != null) {
        resultNodes.push(mp);
    }
    return resultNodes;
};