class RoomEditor {
    constructor(width, height) {
        this.grid = this.generateGrid(width,height)
        this.features = {}
        this.total = {}
    }
    setGridTile(x,y,value){
        this.grid[y][x] = value;
    }
    addFeature(x,y,typeString,colour){
        this.features[x+","+y] = {type:typeString,colour:colour,x:x,y:y};
        if(typeString == "connector"){
            this.setGridTile(x,y,1);
        }
    }
    removeFeature(x,y){
        delete(this.features[x+","+y])
    }
    generateGrid(width, height) {
        let grid = [];
        for (var y = 0; y < height; y++) {
            grid.push([])
            for (var x = 0; x < width; x++) {
                grid[y].push(1)
            }
        }
        return grid;
    }
    export(){
        //Do some fancy stuff to simplify exported prefabs
        let trimmedObject = JSON.parse(JSON.stringify(this));
        trimmedObject.width = trimmedObject.grid[0].length;
        trimmedObject.height = trimmedObject.grid.length;

        for(let name in trimmedObject.features){
            let feature = trimmedObject.features[name]
            let plural = feature.type+"s"
            //give each feature (connectors for example) its own array
            if(trimmedObject[plural] == undefined){
                trimmedObject[plural] = []
            }
            //Add each feature to its own array
            trimmedObject[plural].push({x:feature.x,y:feature.y})
            trimmedObject.total[plural] = (trimmedObject.total[plural] || 0) + 1;
        }
        delete(trimmedObject.features)
        return JSON.stringify(trimmedObject)
    }
    draw(ctx, ts) {
        ctx.strokeStyle = "black";
        ctx.strokeSize = 2;
        let colours = ["White", "grey","black","green"]
        for (var y = 0; y < this.grid.length; y++) {
            for (var x = 0; x < this.grid[y].length; x++) {
                let tileID = this.grid[y][x]
                ctx.fillStyle = colours[tileID];
                ctx.fillRect(x * ts, y * ts, ts, ts);
                ctx.strokeRect(x * ts, y * ts, ts, ts)
            }
        }

        for(var positionString in this.features){
            let pos = positionString.split(',')
            ctx.fillStyle = this.features[positionString].colour
            ctx.fillRect(pos[0] * ts, pos[1] * ts, ts, ts);
        }
    }
}