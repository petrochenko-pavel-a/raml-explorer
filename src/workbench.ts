/**
 * Created by kor on 29/08/16.
 */
import controls=require("./controls")

export interface ILayoutPart{

    splitHorizontal(sizes:number[]): ILayoutPart[]

    splitVertical(sizes:number[]): ILayoutPart[]

    element():Element
}

var globalId=0;
function nextId(){
    return "split"+(globalId++);
}

declare function Split(a,b):void;

export class LayoutPart implements ILayoutPart{

    constructor(private _el:Element){

    }

    splitHorizontal(sizes:number[]): ILayoutPart[]{
        var fid=nextId();
        var nid=nextId();
        var content=`<div style="height: 100%"><div  id="${fid}" class="split split-horizontal" style="height: 100%"></div><div id="${nid}" class="split split-horizontal" style="height: 100%"></div></div>`;
        this._el.innerHTML=content;
        var r1=new LayoutPart(document.getElementById(fid));
        var r2=new LayoutPart(document.getElementById(nid));
        Split(["#"+fid,"#"+nid],{
            gutterSize: 8,
            cursor: 'col-resize',
            sizes: sizes
        })
        return [r1,r2];
    }

    splitVertical(sizes:number[]): ILayoutPart[]{
        var fid=nextId();
        var nid=nextId();
        var content=`<div id="${fid}"  class="split" ></div><div  id="${nid}" class="split"></div>`;
        this._el.innerHTML=content;
        var r1=new LayoutPart(document.getElementById(fid));
        var r2=new LayoutPart(document.getElementById(nid));
        Split(["#"+fid,"#"+nid],{
            gutterSize: 8,
            sizes:sizes,
            direction: 'vertical',
            cursor: 'row-resize'
        })
        return [r1,r2];

    }

    element(){
        return this._el;
    }
}

export interface IContributionItem{
    title?: string
    image?: string
    disabled?: boolean
    checked?:boolean
    run?():void
    items?:IContributionItem[]
}

export interface IMenu extends IContributionItem{
    items:IContributionItem[]
}

export class DrowpdownMenu{

    constructor(private menu:IMenu){}

    render(host:Element){
        this.menu.items.forEach(x=>{
            var li=document.createElement("li");
            li.setAttribute("role","presentation");
            if (x.disabled){
                li.classList.add("disabled");
            }
            var a=document.createElement("a");

            a.setAttribute("role","menuitem")
            if ((x).run){
                a.onclick=(x).run;
            }
            if (x.checked){
                a.innerHTML=x.title+"<span class='glyphicon glyphicon-ok' style='float: right'></span>"
            }
            else{
                a.innerHTML=x.title;
            }
            li.appendChild(a);
            host.appendChild(li);
        })
    }
}
export class Context{

    constructor(private menu:IMenu){}

    render(host:Element){
        this.menu.items.forEach(x=>{
            var li=document.createElement("li");
            //li.setAttribute("role","presentation");
            if (x.disabled){
                li.classList.add("disabled");
            }
            var a=document.createElement("a");
            //a.setAttribute("role","menuitem")
            if ((x).run){
                a.onclick=(x).run;
            }
            a.innerHTML=x.title;
            li.appendChild(a);
            host.appendChild(li);

        })
    }
}
export class ToolbarRenderer{

    constructor(private menu:IMenu){}

    render(host:Element){
        this.menu.items.forEach(x=>{
            var button=document.createElement("button");
            button.classList.add("btn")
            button.classList.add("btn-xs")
            if (x.checked){
                button.classList.add("btn-success");
            }
            else {
                button.classList.add("btn-primary")
            }
            button.textContent=x.title
            if (x.run){
                button.onclick=x.run
            }
            host.appendChild(button);
        })
    }
}
export interface IPartHolder{
    setViewMenu(m:IMenu);
    setToolbar(m:IMenu);
    setContextMenu(m:IMenu);
}

export interface IWorkbenchPart extends controls.IControl{
    id():string,
    title():string
    render(e:Element);
    searchable?:boolean
    onSearch?(searchStr:string)
    init?(h:IPartHolder)
}


class Pane implements IPartHolder{

    _v:IWorkbenchPart;

    menuContentElement:Element;
    contextMenuElement:Element;
    viewMenuButton:Element

    toolbarContentElement:Element;

    setContextMenu(m:IMenu){
        this.contextMenuElement.innerHTML="";

        new DrowpdownMenu(m).render(this.contextMenuElement)
    }

    setViewMenu(m:IMenu){
        this.menuContentElement.innerHTML="";
        if (m.items.length==0){
            this.viewMenuButton.setAttribute("style","display:none")
        }
        else{
            this.viewMenuButton.setAttribute("style","display:inherit")
        }
        new DrowpdownMenu(m).render(this.menuContentElement)
    }
    setToolbar(m:IMenu){
        this.toolbarContentElement.innerHTML="";
        new ToolbarRenderer(m).render(this.toolbarContentElement)
    }

    constructor(public  _part:ILayoutPart){

    }

    addPart(v:IWorkbenchPart){
        this._v=v;
        this.render();
    }

    render(){
        var hid=nextId();
        var bid=nextId();
        var mid=nextId();

        var menuId=nextId();
        var cmenuId=nextId();
        var cmenuInnerId=nextId();
        var tid=nextId();
        var searchId=nextId();
        var cmenu=`<div id='${cmenuId}'><ul class="dropdown-menu"  id="${cmenuInnerId}"role="menu"  aria-labelledby="${mid}"></ul></div>`;
        var cnt=`<div style='display: flex;flex-direction: column;height: 100%;width: 99.9%;margin-bottom:0px;overflow: hidden' class="panel panel-primary"><div id="${hid}" class="panel-heading" style="flex: 0 0 auto;display: flex"></div>
        <div class="panel-body"  data-toggle="context" data-target="#${cmenuId}" style="flex: 1 1 auto;display: flex;overflow: hidden;margin: 0;padding: 0" ><div style="width: 100%" id="${bid}"></div>${cmenu}</div></div>`
        this._part.element().innerHTML=cnt;
        var hel=document.getElementById(hid);
        var headerHtml= `<div style="display: flex;flex-direction: row;width: 100%"><div style="flex:1 1 auto">${this._v.title()}</div>`
        var searchHtml= `<input type="text"style="color: black;border-radius: 3px;height: 23px;margin-right: 4px" id="${searchId}"/>`
        if(!this._v.searchable){
            searchHtml="";
        }
        var th=`<span id="${tid}"></span>`
    var dropMenu=`<div class="dropdown" style="flex: 0 0 auto"/><button class="btn btn-primary dropdown-toggle btn-xs" style="display: none" type="button" id="${mid}" data-toggle="dropdown">
  <span class="caret"></span></button>
  <ul class="dropdown-menu dropdown-menu-left" style="right: 0;left: auto" role="menu" id='${menuId}' aria-labelledby="${mid}"/></div>`

        headerHtml=headerHtml+searchHtml+th+dropMenu+`</div>`;
        hel.innerHTML=headerHtml;
        this.menuContentElement=document.getElementById(menuId);
        this.toolbarContentElement=document.getElementById(tid);
        this.contextMenuElement=document.getElementById(cmenuInnerId);
        this.viewMenuButton=document.getElementById(mid)
        var bel=document.getElementById(bid);
        if (this._v) {
            this._v.render(bel);
        }
        if (this._v.init){
            this._v.init(this);
        }
        //hel.style.background="green"
        var pe=this._part.element();
        function handleResize() {
            var h = hel.getBoundingClientRect().height;
            bel.style.minHeight = "50px";
            bel.style.display="flex";
            bel.style.flexDirection="column";
        }
        pe.addEventListener("resize",handleResize);
        if (this._v.searchable){
            var ie=document.getElementById(searchId)
            var view=this._v;
            ie.onkeyup=function (){
                setTimeout(
                function () {
                    view.onSearch((<any>ie).value);
                },200)
            }
        }
        handleResize();
    }
}
export abstract class ViewPart implements IWorkbenchPart , ISelectionProvider{


    protected contentElement:Element
    protected holder:IPartHolder
    protected selection:any[]=[]
    protected selectionListeners:ISelectionListener[]=[]

    getHolder(){
        return this.holder;
    }

    addSelectionListener(l:ISelectionListener){
        this.selectionListeners.push(l);
    }
    removeSelectionListener(l:ISelectionListener){
        this.selectionListeners=this.selectionListeners.filter(x=>x!=l);
    }
    getSelection(){
        return this.selection;
    }

    protected onSelection(v:any[]){
        this.selection=v;
        this.selectionListeners.forEach(x=>x.selectionChanged(v));
    }

    constructor(private _id,private _title){}

    title(){
        return this._title
    }
    id(){
        return this._id;
    }


    init(holder:IPartHolder){
        this.holder=holder;
    }
    render(e:Element){
        this.contentElement=e;
        this.innerRender(e)
    }
    refresh(){
        if (this.contentElement) {
            this.innerRender(this.contentElement)
        }
    }

    abstract innerRender(e:Element);
    dispose(){
        this.contentElement=null;
    }
}
declare var $:any;

export interface ILabelProvider{
    label(e:any):string
    icon?(e:any):string
}

export interface ITreeContentProvider{

    elements(i:any):any[];
    children(i:any):any[]
}
function buildTreeNode(x:any,t:ITreeContentProvider,l:ILabelProvider,selection:any[]){

    var nodes=t.children(x).map(n=>buildTreeNode(n,t,l,selection));
    if (nodes.length==0){
        nodes=undefined;
    }
    var icon=undefined;
    if (l.icon){
        icon=l.icon(x);
    }
    var selected=selection.indexOf(x)!=-1
    return {
        original:x,
        text: l.label(x),
        icon: icon,
        nodes: nodes,
        state:{
            selected: selected
        }
    }
}
interface ISelectionListener{
    selectionChanged(newSelection:any[])
}

interface ISelectionProvider{
    addSelectionListener( l:ISelectionListener)
    removeSelectionListener(l:ISelectionListener);
    getSelection():any[]
}

export class ArrayContentProvider implements ITreeContentProvider{

    children(x:any){
        return [];
    }
    elements(x:any){
        return x;
    }
}

interface IFilter{
    accept(x:any)
}

interface IComparator{
    compare(a:any,b:any):number
    init?(view:any)
}
export class ContentProviderProxy implements ITreeContentProvider{

    filters:IFilter[]=[];
    sorter:IComparator

    constructor(private _inner:ITreeContentProvider){

    }

    elements(x:any){
        var rs:any[]= this._inner.elements(x).filter(x=>{
            var accept=true;
            this.filters.forEach(x=>accept=accept&&x.accept(x));
            return accept;
        })
        if (this.sorter){
            return rs.sort( (x,y)=>this.sorter.compare(x,y))
        }
        return rs;
    }

    children(x:any){
        var rs= this._inner.children(x).filter(x=>{
            var accept=true;
            this.filters.forEach(x=>accept=accept&&x.accept(x));
            return accept;
        })
        if (this.sorter){
            return rs.sort( (x,y)=>this.sorter.compare(x,y))
        }
        return rs;
    }

}
export class BasicSorter implements IComparator{

    _labelProvider:ILabelProvider;

    constructor(){

    }

    init(v:TreeView){
        this._labelProvider=v.labelProvider;
    }

    compare(a:any,b:any):number{
        var l1=this._labelProvider.label(a);
        var l2=this._labelProvider.label(b);
        return l1.localeCompare(l2);
    }
}
export interface INode{

    nodes:INode[]

    original: any;
}

function findNode(nodes:INode[],v:any){
    for (var i=0;i<nodes.length;i++){
        var ch=nodes[i];
        if (ch.original===v){
            return ch;
        }
        if (ch.nodes) {
            var n=findNode(ch.nodes,v);
            if (n){
                return n;
            }
        }
    }
    return null;
}
export class TreeView extends ViewPart{

    treeId:string;
    contentProvider:ContentProviderProxy
    labelProvider:ILabelProvider
    input:any;
    treeNodes:INode[];
    searchable=true;

    setSorter(s:IComparator){
        this.contentProvider.sorter=s;
        s.init(this);
        this.refresh();
    }
    addFilter(f:IFilter){
        this.contentProvider.filters.push(f);
        this.refresh();
    }
    removeFilter(f:IFilter){
        this.contentProvider.filters=this.contentProvider.filters.filter(x=>x!=f);
        this.refresh();
    }

    select(model: any){
        var n=findNode(this.treeNodes,model);
        if (n) {
            this.selection=[model];
            this.refresh();
        }
    }
    hasModel(model:any):boolean{
        if (findNode(this.treeNodes,model)){
            return true;
        }
        return false;
    }

    onSearch(s:string){
        if (!this.treeId){
            return;
        }
        $('#'+this.treeId).treeview("search",s,{revealResults:true});

        var lst=document.getElementById(this.treeId).getElementsByTagName("li")
        var parents={}
        for (var i=0;i<lst.length;i++){
            var el=lst.item(i);
            if (el.classList.contains("search-result")){
                el.style.display ="inherit" ;
                var id=el.attributes.getNamedItem("data-nodeid").value;
                var rs=$('#'+this.treeId).treeview("getParent",parseInt(id));
                parents[rs.nodeId]=true;
                while (rs.parentId!==undefined){
                    parents[rs.parentId]=true;
                    rs=$('#'+this.treeId).treeview("getParent",rs.parentId);
                    parents[rs.nodeId]=true;
                }
            }
            else {
                el.style.display = s.length == 0 ? "inherit" : "none"
            }
        }
        for (var i=0;i<lst.length;i++){
            var el=lst.item(i);
            var id=el.attributes.getNamedItem("data-nodeid").value;
            if(parents[parseInt(id)]){
                el.style.display="inherit"
            }
        }
    }

    setContentProvider(i:ITreeContentProvider){
        this.contentProvider=new ContentProviderProxy(i);
        this.refresh();
    }
    setLabelProvider(l:ILabelProvider){
        this.labelProvider=l;
        this.refresh();
    }
    getInput():any{
        return this.input;
    }

    setInput(x:any){
        this.input=x;
        this.refresh();
    }

    innerRender(e:Element){
        var treeId=nextId();
        this.treeId=treeId;
        var view=this;
        e.innerHTML=`<div id='${treeId}' style='width:100%;overflow: auto;flex: 1 1 0; min-height: 50px;display: block'></div>`;
        $('#'+treeId).treeview({data: this.getTree(),expandIcon:"glyphicon glyphicon-chevron-right",
            onNodeSelected:function (x) {
               var sel= $('#'+treeId).treeview("getSelected");
               view.onSelection(sel.map(x=>x.original))
            },
            collapseIcon:"glyphicon glyphicon-chevron-down",borderColor:"0xFFFFFF"});
        var sel= $('#'+treeId).treeview("getSelected");
        view.onSelection(sel.map(x=>x.original))
    }

    getTree(){
        if (this.input&&this.contentProvider&&this.labelProvider){
            var els=this.contentProvider.elements(this.input);
            var nodes=els.map(x=>buildTreeNode(x,this.contentProvider,this.labelProvider,this.selection));
            this.treeNodes=<INode[]>nodes;
            return nodes;
        }
        return [];
    }
}

export enum Relation{
    LEFT,RIGHT,BOTTOM,TOP,STACk
}
export class Page{


    panes:Pane[]=[];
    root:ILayoutPart
    constructor(r:string){
        this.root=new LayoutPart(document.getElementById(r));
    }

    addView(v:IWorkbenchPart,relatedTo:string,ratio:number,r:Relation){
        var p:Pane=this.createPane(relatedTo,ratio,r);
        p.addPart(v);
    }
    createPane(relatedTo:string,ratio:number,r:Relation):Pane{
        if (this.panes.length==0){
            var p=new Pane(this.root);
            this.panes.push(p);
            return p;
        }
        var p:Pane=this.findPane(relatedTo);
        var newPart=null;
        var oldPart=null;
        if (r==Relation.LEFT){
            var newParts=p._part.splitHorizontal([ratio,100-ratio]);
            newPart=newParts[0];
            oldPart=newParts[1];
        }
        if (r==Relation.RIGHT){
            var newParts=p._part.splitHorizontal([100-ratio,ratio]);
            newPart=newParts[1];
            oldPart=newParts[0];
        }
        if (r==Relation.BOTTOM){
            var newParts=p._part.splitVertical([100-ratio,ratio]);
            newPart=newParts[1];
            oldPart=newParts[0];
        }
        if (r==Relation.TOP){
            var newParts=p._part.splitHorizontal([ratio,100-ratio]);
            newPart=newParts[0];
            oldPart=newParts[1];
        }
        p._part=oldPart;
        p.render();
        var newPane=new Pane(newPart);
        this.panes.push(newPane);
        return newPane;
    }
    findPane(s:string):Pane{
        for (var i = 0; i < this.panes.length; i++) {
            if (this.panes[i]._v) {
                if (this.panes[i]._v.id() == s) {
                    return this.panes[i];
                }
            }
        }
        return null;
    }
}

var w:any=window;

interface UrlHandler{
    (s:string):boolean
}
var handlers:UrlHandler[]=[]


export function registerHandler(f:UrlHandler){
    handlers.push(f);
}
export function unregisterHandler(f:UrlHandler){
    handlers=handlers.filter(x=>x!==f);
}

w.Workbench={

    open(url:string){
        for (var i=0;i<handlers.length;i++){
            if (handlers[i](url)){
                return;
            }
        }
    }
}


export abstract class AccorditionTreeView extends ViewPart{

    protected node:any;

    constructor(title:string)
    {
        super(title,title)
    }


    createTree(name: string){
        var tree=new TreeView(name,name);
        this.customize(tree);
        var view=this;
        tree.addSelectionListener({
            selectionChanged(z:any[]){
                view.onSelection(z);
            }
        })
        return tree;
    }



    protected control:controls.Accordition;
    protected trees:TreeView[]=[];

    protected addTree(label:string, at:any){
        var types=this.createTree(label);
        types.setInput(at);

        this.control.add(types)
        this.trees.push(types)
    }



    public setSelection(o:any){
        for(var i=0;i<this.trees.length;i++){
            if (this.trees[i].hasModel(o)){
                this.control.expand(this.trees[i]);
                this.trees[i].select(o);
            }
        }
    }
    protected abstract load()
    protected abstract customizeAccordition(root:controls.Accordition, node:any);
    protected abstract customize(tree:TreeView);

    innerRender(e:Element) {
        if (!this.node) {
            new controls.Loading().render(e);
            this.load();
        }
        else{
            var a = new controls.Accordition();
            this.control=a;
            this.trees=[];
            this.customizeAccordition(a,this.node);
            a.render(e);
        }
    }

}