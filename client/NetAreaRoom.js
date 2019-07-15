class NetAreaRoom{
    constructor(node,netAreaGenerator){
        this.node = node;
        node.room = this
        this.netAreaGenerator = netAreaGenerator
        this.prefab = this.pickSmallestPrefab(node);
        this.features = {};
        this.addActiveLinks()
        this.width = this.prefab.width;
        this.height = this.prefab.height;
        this.widthRatio = this.width/this.height
        this.heightRatio = this.height/this.width
        this._x = 500
        this._y = 500
    }
    addActiveLinks(){
        this.node.links.forEach((linkData,index)=>{
            if(this.prefab.links && this.prefab.links[index]){
                let prefabLink = this.prefab.links[index]
                let linkFeature = new LinkFeature(prefabLink.x,prefabLink.y,linkData)
                this.features[linkFeature.locationString] = linkFeature;
            }else{
                return;
            }
        })
    }
    pickSmallestPrefab(node){
        /*
        let filtered = roomPrefabs.filter(prefab => prefab.total.connectors > node.minimumConnectors);
        let filteredFuther = filtered.filter(prefab => prefab.total.links > node.minimumLinks);
        if(filteredFuther.length == 0){
            console.warn(`node requirements not met minimumConnectors:${node.minimumConnectors} , minimumLinks:${node.minimumLinks}`)
            return roomPrefabs[this.netAreaGenerator.RNG.Integer(0,roomPrefabs.length-1)]
        }else{
            return filteredFuther[0];
        }
        */
        let prefabGenerator = new PrefabGenerator()
        return prefabGenerator.newPrefab({connectors:node.minimumConnectors,links:node.minimumLinks})
    }
    set x(val){
        if(val > 0 && val < (this.width+this.netAreaGenerator.width-1)){
            this._x = val;
        }
    }
    set y(val){
        if(val > 0 && val < (this.height+this.netAreaGenerator.height-1)){
            this._y = val;
        }
    }
    get x(){
        return this._x
    }
    get y(){
        return this._y
    }
}