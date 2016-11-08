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
            if (x.image){
                    button.innerHTML=`<span class="${x.image}">${x.title}</span>`
            }
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
export class ContributionManager{

    menu:IMenu={ items:[]}

    constructor(private onChange:(m:IMenu)=>void){

    }

    add(item:IContributionItem){
        this.menu.items.push(item);
        this.onChange(this.menu);
    }
    remove(item:IContributionItem){
        this.menu.items=this.menu.items.filter(x=>x!=item);
        this.onChange(this.menu);
    }


}
var nh={
    setViewMenu(m:IMenu){},
    setToolbar(m:IMenu){},
    setContextMenu(m:IMenu){}
};
export abstract class ViewPart implements IWorkbenchPart , ISelectionProvider{


    addSelectionConsumer(t:{setInput(c:any)}){
    this.addSelectionListener({
        selectionChanged(v: any[]){
            if (v.length > 0) {
                t.setInput(v[0]);
            }
            else {
                t.setInput(null);
            }
        }
    })
}

    protected contentElement:Element
    protected holder:IPartHolder=nh;
    protected selection:any[]=[]
    protected selectionListeners:ISelectionListener[]=[]

    protected contextMenu:ContributionManager=new ContributionManager(m=>this.holder.setContextMenu(m));
    protected toolbar:ContributionManager=new ContributionManager(m=>this.holder.setToolbar(m));
    protected viewMenu:ContributionManager=new ContributionManager(m=>this.holder.setViewMenu(m));


    public getContextMenu(){
        return this.contextMenu;
    }
    public getToolbar(){
        return this.toolbar;
    }
    public getViewMenu(){
        return this.viewMenu;
    }

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
        this.holder.setViewMenu(this.viewMenu.menu);
        this.holder.setToolbar(this.toolbar.menu);
        this.holder.setContextMenu(this.contextMenu.menu);
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
function findNodeNoRecursion(nodes:INode[],v:any){
    for (var i=0;i<nodes.length;i++){
        var ch=nodes[i];
        if (ch.original===v){
            return ch;
        }
    }
    return null;
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
        var vs=$('#' + this.treeId).treeview(true);
        var n=findNode(vs.all(),model);
        if (n) {
            this.selection=[model];
            this.refresh();
            $('#' + this.treeId).treeview("revealNode",n);
        }
    }
    hasModel(model:any):boolean{
        if (!this.treeNodes){
            this.getTree();
        }
        if (findNode(this.treeNodes,model)){
            return true;
        }
        return false;
    }
    pattern: string;

    onSearch(s:string):boolean{
        if (!this.treeId){
            return false;
        }
        this.pattern=s;
        $('#'+this.treeId).treeview("search",s,{revealResults:true});

        return this.afterSearch(s);
    }

    /**
     *
     * @param s
     * @returns {boolean}
     */
    private afterSearch(s: string) {
        var lst = document.getElementById(this.treeId).getElementsByTagName("li")
        var parents = {}
        var found: boolean = false;
        for (var i = 0; i < lst.length; i++) {
            var el = lst.item(i);
            if (el.classList.contains("search-result")) {
                el.style.display = "inherit";
                found = true;
                var id = el.attributes.getNamedItem("data-nodeid").value;
                var rs = $('#' + this.treeId).treeview("getParent", parseInt(id));
                parents[rs.nodeId] = true;
                while (rs.parentId !== undefined) {
                    parents[rs.parentId] = true;
                    rs = $('#' + this.treeId).treeview("getParent", rs.parentId);
                    parents[rs.nodeId] = true;
                }
            }
            else {
                el.style.display = s.length == 0 ? "inherit" : "none"
            }
        }
        for (var i = 0; i < lst.length; i++) {
            var el = lst.item(i);
            var id = el.attributes.getNamedItem("data-nodeid").value;
            if (parents[parseInt(id)]) {
                el.style.display = "inherit"
            }
        }
        return found;
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
            onNodeExpanded:function (x) {
                var sel= $('#'+treeId).treeview("getSelected");
                if (view.pattern) {
                    view.afterSearch(view.pattern)
                }
            },
            collapseIcon:"glyphicon glyphicon-chevron-down",borderColor:"0xFFFFFF",levels:0});
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
    seachable=true;


    protected control:controls.Accordition;
    protected trees:TreeView[]=[];

    protected addTree(label:string, at:any){
        var types=this.createTree(label);
        types.setInput(at);

        this.control.add(types)
        this.trees.push(types)
    }

    onSearch(searchStr:string){
        var num=0;
        var index=-1;
        var selectedIndexIsOk=false;
        this.control.children.forEach(x=> {
            if (x instanceof TreeView) {
            var has = x.onSearch(searchStr);
            if (searchStr.length > 0) {
                if (!has) {
                    this.control.disable(x);
                }
                else {
                    this.control.enable(x);
                    if (num == this.control.getSelectedIndex()) {
                        selectedIndexIsOk = true;
                    }
                    index = num;
                }

            }
            else {
                this.control.enable(x);
            }
        }
            num++;
        })
        if (searchStr.length>0){
            if (!selectedIndexIsOk&&index!=-1){
                this.control.expandIndex(index);
            }
        }
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
            var title=null;
            if (this.control){
                title=this.control.getSelectedTitle();

            }
            var a = new controls.Accordition();
            this.control=a;
            this.trees=[];
            this.customizeAccordition(a,this.node);
            a.render(e);
            if (title){
                for (var i=0;i<this.control.children.length;i++){
                    if (this.control.children[i].title()==title){
                        this.control.expandIndex(i);
                    }
                }
            }
        }
    }
}