import hl=require("./hl")
interface IFacet {
    facetName(): string
    value(): any
}

function propertyDescription(tp: hl.IType): PropertyDescription {
    var t = (tp).adapters[1];
    if (!t){
        var mm=tp.superTypes()[0];
        if (mm){
            t=(mm).adapters[1];
        }
    }
    return describe("", false, t);
}

var describe = function (id: string, required: boolean, t: any, level: number = 0) {

    var result: PropertyDescription = {}
    var name: string = tps.nicerName(id);
    result.displayName = name;
    result.id = id;
    result.required = required;
    var facets: IFacet[] = t.allFacets();
    var st=t.allSuperTypes();
    var tps=st.map(x=>{
        var r=<any>x;
        var result=x.name();
        if (!r.extras.SOURCE){
            return result;
        }
        var c:hl.IHighLevelNode=r.extras.SOURCE._highLevelRoot;
        var hd:any=c;

        if (hd.libId){
            return hd.libId+"."+x.name();
        }
        hl.prepareNodes(c.attrs()).forEach(a=>{
            if (a.definition().nameId()=='Id'){
                var obj= hl.asObject(a);
                var vl=obj[Object.keys(obj)[0]];
                hd.libId=vl;
                return;
            }
        })
        if (!hd.libId){
            hd.libId="";
        }
        return hd.libId+"."+x.name();
    })
    if (tps.indexOf("org.aml.ramltypes.multiline")!=-1){
        result.multiline=true;
    }
    updateDescription(facets, result, level + 1);
    if (t.isScalar()) {
        result.scalar = true;
    }
    if (t.isBoolean()){
        result.boolean=true;
    }
    if (t.isUnion()){
        var mn=t.allOptions();
        var lt=mn[0];

        return describe(id,required,lt,level);
    }
    if (t.isArray()) {
        result.array = true;
    }
    if (t.isObject()){
        result.object= true;
    }
    return result;
};


function updateDescription(facets: IFacet[], result: PropertyDescription, level: number = 0) {
    if (level > 6) {
        return;
    }
    result.children = [];
    var required: { [name: string]: boolean} = {};
    facets.forEach(x=> {
        if (x.facetName() == "enum") {
            result.enumOptions = x.value();
        }
        if (x.facetName()=="should be null"){
            result.nil=true;
        }
        if (x.facetName() == "mapPropertyIs") {
            var pf: PropertyDescription = describe((<any>x).regexp, false, x.value(), level);
            pf.map = true;
            pf.regExp = (<any>x).regexp;
            result.children.push(pf);
        }
        if (x.facetName() == "propertyIs") {
            var pf: PropertyDescription = describe((<any>x).name, false, (<any>x).type, level);
            result.children.push(pf);
        }
        if (x.facetName() == "items") {
            var pf: PropertyDescription = describe("item", false, (<any>x).value(), level);
            result.children.push(pf);

        }
        if (x.facetName() == "hasProperty") {
            required[x.value()] = true;
        }
        if (x.facetName() == "additionalPropertyIs") {
            result.enumOptions = x.value();
        }
        if (x.facetName() == "description") {
            result.description = x.value();
        }
    })

    Object.keys(required).forEach(x=> {
        result.children.forEach(y=> {
            if (y.id == x) {
                y.required = true;
            }
        })
    })
}

var properties = function (at: hl.IType, isAnnotation: boolean): PropertyDescription[] {
    var props = at.allProperties();
    if (props.length == 0) {
        if (isAnnotation) {
            at = at.superTypes()[0];
            var ts = at.superTypes();
            if (ts.length == 1) {
                return propertyDescription(ts[0]).children;
            }
        }
    }
    return propertyDescription(at).children;
};

export function overlayedGroupedProperties(items: hl.IHighLevelNode[]): PropertyGroup[] {
    var propertiesA=[];
    //Todo display names conflict
    items.forEach(n=> {
        var at = n.localType();

        var isAnnotation = n.property().nameId() == "annotationTypes";
        if (at.isObject()) {
            var props = properties(at, isAnnotation);
            props.forEach(x=>{
                x.id=at.nameId()+"=>"+x.id;
            })
            propertiesA = propertiesA.concat(props);
        }
        else if (at.isArray()){

        }
        else {
            var ds=propertyDescription(at);
            ds.id=at.nameId()+"=>"+"$value";
            ds.displayName=tps.nicerName(at.nameId());

            ds.scalar=true;
            propertiesA.push(ds);
        }
    })
    var providers = pg.createProviders();
    var consumed: {[name: string]: boolean} = {};
    pg.iterateProviders(providers, propertiesA, consumed);
    var result: PropertyGroup[] = [];
    providers.forEach(x=>result = result.concat(x.getResult()));
    result = pg.tryMerge(result);
    return result;
}