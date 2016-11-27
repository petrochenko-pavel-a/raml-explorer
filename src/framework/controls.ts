
declare var require: any
require("../../lib/bootstrap-contextmenu")
require("../../lib/bootstrap-treeview")

export interface IControl{
    render(e:Element);
    dispose?();
    title():string;

    controlId?:string
    contextActions?:IContributionItem[]
}

export interface IContributionItem{
    title?: string
    link?: string
    image?: string
    disabled?: boolean
    checked?:boolean
    run?():void
    items?:IContributionItem[]
}

export interface IMenu extends IContributionItem{
    items:IContributionItem[]
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
export class DrowpdownMenu{

    constructor(private menu:IMenu,private setRoles:boolean=true){}

    render(host:Element){
        this.menu.items.forEach(x=>{
            var li=document.createElement("li");
            if (this.setRoles) {
                li.setAttribute("role", "presentation");
            }

            if (x.disabled){
                li.classList.add("disabled");
            }

            var a=document.createElement("a");
            a.setAttribute("href",x.link?x.link:"#")
            if (this.setRoles) {
                a.setAttribute("role", "menuitem")
            }
            a.style.cursor="hand";
            if ((x).run){
                a.onclick=function (e){
                    x.run();
                };
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
export abstract class Composite implements IControl{

    private _title: string;

    children:IControl[]=[]
    protected _element:Element;

    render(e:Element){
        this._element=e;
        this.innerRender(e);
    }

    refresh(){
        if (this._element){
            this.innerRender(this._element);
        }
    }

    protected abstract innerRender(e:Element);

    add(c:IControl){
        this.children.push(c);
        this.refresh();

    }

    remove(c:IControl){
        this.children=this.children.filter(x=>x!=c);
        this.refresh();
    }
    dispose(){
        this._element=null;
        this.children.forEach(x=>{
            if (x.dispose){
                x.dispose();
            }
        })
    }

    setTitle(title:string){
        this._title=title;
    }

    title(){
        return this._title;
    }
}
var globalId=0;
function nextId(){
    return "el"+(globalId++);
}
export class Loading extends  Composite{
    protected innerRender(e:Element){
        e.innerHTML=`<div style="display: flex;flex: 1 1 0; flex-direction: column;justify-content: center;"><div style="display: flex;flex-direction: row;justify-content: center"><div><div>Loading...</div><img src='./lib/progress.gif'/></div></div></div>`
    }
}
export class Label extends Composite{

    constructor(title?:string,private content?:string){
        super();
        this.setTitle(title);
    }
    protected innerRender(e:Element){
        if (this.content){
            e.innerHTML = `<span style="padding: 5px;overflow: auto">${this.content}</span>`
        }
        else {
            e.innerHTML = `<span>${this.title()}</span>`
        }
    }
}
export class Accordition extends Composite{

    public expand(c:IControl){
        var index=this.children.indexOf(c);
        this.expandIndex(index);
    }
    protected selectedIndex:number;

    getSelectedIndex(){
        return this.selectedIndex;
    }
    getSelectedTitle(){
        if (this.selectedIndex!=undefined){
            return this.children[this.selectedIndex].title();
        }
    }
    getSelectedTitleId(){
        if (this.selectedIndex!=undefined){
            var c=this.children[this.selectedIndex];
            return c.controlId?c.controlId:c.title();
        }
    }

    public expandIndex(index: number){
        var bids=this.bids;
        var gids=this.gids;
        this.selectedIndex=index;
        for (var j=0;j<bids.length;j++) {
            if (j!=index) {
                document.getElementById(bids[j]).style.display = "none";
                document.getElementById(gids[j]).style.flex = null;
                //document.getElementById(gids[j]).style.display = "none";
            }
            else{
                document.getElementById(bids[j]).style.display = "flex";
                document.getElementById(gids[j]).style.flex = "1 1 0";
                document.getElementById(gids[j]).style.display = "flex";
            }
        }
    }

    getHeader(c:IControl){
        var positon=this.children.indexOf(c);
        if (positon=-1){
            return null;
        }
        return document.getElementById(this.headings[positon]);
    }

    disabled={

    }

    disable(c:IControl){
        var positon=this.children.indexOf(c);
        if (positon==-1){
            return null;
        }
        document.getElementById(this.headings[positon]).style.color="gray";
        this.disabled[this.headings[positon]]=true;
    }
    enable(c:IControl){
        var positon=this.children.indexOf(c);
        if (positon==-1){
            return null;
        }
        delete this.disabled[this.headings[positon]];
        document.getElementById(this.headings[positon]).style.color="black";
    }

    private bids:string[]
    private gids: string[]
    private headings: string[]
    protected innerRender(e:Element){
        var topId=nextId();

        var templates:string[]=[]
        var headings:string[]=[]
        this.headings=headings;
        var bids:string[]=[]
        var gids:string[]=[]
        for (var i=0;i<this.children.length;i++){
            var elId=nextId();
            var hId=nextId();
            var bid=nextId();
            var gid=nextId();
            bids.push(elId)
            headings.push(hId)
            gids.push(gid)
            var styleExpanded=i==0?"flex: 1 1 0":"display: none";
            var expanded=i==0;
            var s=`<div id="${gid}" class="panel panel-default" style="margin: 0px;${styleExpanded}; display: flex;flex-direction: column">
               <div class="panel-heading" id="${hId}">
                <h4 class="panel-title" style="display: inline"><a>${this.children[i].title()}</a></h4>
                <div style="float: right" id="${"T"+hId}"></div>
            </div>
            <div id="${elId}"  style="flex: 1 1 auto;display: flex;flex-direction: column;${styleExpanded}">
            <div class="panel-body" style="background: red;flex: 1 1"><div id="${bid}" style="background: green;"></div></div>
            </div>
           </div>`;
           templates.push(s);
        }
        var content=`<div class="panel-group" id="${topId}" style="margin: 0;padding: 0;display: flex;flex-direction: column;flex: 1 1 auto; height: 100%">
             ${templates.join('')}       
        </div>`
        e.innerHTML=content;
        for (var i=0;i<this.children.length;i++){
            var el=document.getElementById(bids[i]);
            this.children[i].render(el);
            //e.style.maxHeight="500px"
        }
        var i=0;
        this.bids=bids;
        this.gids=gids;
        headings.forEach(x=>{
            var panelId=bids[i];
            var containerId=gids[i]
            var k=i;
            if (this.children[i].contextActions){
                var tH=document.getElementById("T"+x);
                new ToolbarRenderer({items: this.children[i].contextActions}).render(tH)
            }
            document.getElementById(x).onclick=()=> {
                if (!this.disabled[x]) {
                    this.expandIndex(k);
                }
            }
            i++;
        });
    }
}