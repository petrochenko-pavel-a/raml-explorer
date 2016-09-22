

export interface IProperty{
    nameId():string
    isKey(): boolean
}
export interface IType{
    nameId():any
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


}
declare var RAML:any;

export function loadApi(path:string,f:(x:IHighLevelNode,e?:any)=>void){
    RAML.Parser.loadApi(path).then(
        function (api) {
            f(api.highLevel());
        }
    )
}