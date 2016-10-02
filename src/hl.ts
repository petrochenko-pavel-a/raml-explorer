

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
    isArray(): boolean
    isUnion(): boolean
    componentType(): IType
    union():IType
    isRequired();
    leftType():IType
    rightType():IType
    superTypes(): IType[]
    adapters:any[];
}

export var root:IHighLevelNode
export var libs:IHighLevelNode[];

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
}

declare var RAML:any;

export interface ElementGroups{
    [name:string]: IHighLevelNode[];
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
            root=api.expand().highLevel()
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
    "description":150
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