class MMBNRenderer{
    constructor(netArea){
        this.netArea = netArea;
        this.grid = netArea.grid;
        this.rooms = netArea.rooms;
        //These tilesizes control the size of drawings to canvas
        this.ts = 1;
        this.isoTileWidth = 16;
        this.isoTileHeight = 8;
        //These offsets result in isometric drawings appearing in the center of the canvas
        this.xOffset = (canvas2.width/2)-(this.ts*(this.grid.length/2))
        this.yOffset = (canvas2.height/2)-(this.ts*(this.grid.length/2));
        this.isoXoffset = canvas.width/2;
        this.isoYoffset = (canvas.height/2)-(this.isoTileHeight*this.grid.length);

        this.colours = {1:'black',2:'white',3:'blue',4:'green'}
        this.featureColours = {link:'red'}
        this.featureImages = {link:imgLink}

        //Debug draw options
        this.useCSSColors = true
    }
    GridtoISO(x,y){
        var isoX = this.isoXoffset + ((x - y) * this.isoTileWidth);
        var isoY = this.isoYoffset + ((x + y) * this.isoTileHeight);
        return {x:isoX,y:isoY}
    }
    draw(ctx){
        for (var y = 0; y < this.grid.length; y++) {
            for (var x = 0; x < this.grid[y].length; x++) {
                let tileID = this.grid[y][x]
                if (tileID !== 0 && tileID !== 2 && tileID !== 9) {
                    ctx.fillStyle = this.colours[tileID]
                    ctx.fillRect((x) * this.ts, (y) * this.ts, this.ts, this.ts);
                }
            }
        }
    }
    drawRoom(ctx,room){
        let g = room.prefab.grid
        for (var y = 0; y < g.length; y++) {
            for (var x = 0; x < g[y].length; x++) {
                let tileID = g[y][x]
                if (tileID !== 0 && tileID !== 2 && tileID !== 9) {
                    ctx.fillStyle = this.colours[tileID]
                    //Draw in color for fun
                    if(room.node.info.styles.color){
                        ctx.fillStyle = room.node.info.styles.color
                    }
                    if(room.node.info.styles.backgroundColor){
                        ctx.fillStyle = room.node.info.styles.backgroundColor
                    }
                    ctx.fillRect(this.xOffset+((room.x+x) * this.ts), this.yOffset+((room.y+y) * this.ts), this.ts, this.ts);
                }
            }
        }
        this.drawRoomFeatures(ctx,room)
    }
    drawRoomFeatures(ctx,room){
        ctx.fillStyle = this.featureColours.link
        for(let locationString in room.features){
            let feature = room.features[locationString]
            ctx.fillStyle = this.featureColours[feature.type]
            ctx.fillRect(this.xOffset+((feature.x) * this.ts), this.yOffset+((feature.y) * this.ts), this.ts, this.ts);
        }
    }
    drawPath(ctx,path,important){
        let pathTileID = 3;
        if(important){
            pathTileID = 4;
        }
        ctx.fillStyle = this.colours[pathTileID]
        path.forEach((loc) => {
            ctx.fillRect(this.xOffset+((loc.x) * this.ts), this.yOffset+((loc.y) * this.ts), this.ts, this.ts);
        })
    }
    drawISO(ctx) {
        //Draw grid
        let img;
        for (var y = 0; y < this.grid.length; y++) {
            for (var x = 0; x < this.grid[y].length; x++) {
                let tileID = this.grid[y][x]
                if(tileID != 0 && tileID != 2 && tileID != -1){
                    if(tileID == 1){
                        img = imgGenericTile;
                    }else if(tileID == 3){
                        img = imgPathTile;
                    }else if(tileID == 4){
                        img = imgImportantPathTile;
                    }
                    let isoPos = this.GridtoISO(x,y)
                    ctx.drawImage(img,isoPos.x,isoPos.y,img.width/2,img.height/2);
                }
            }
        }
        //Draw features
        for(let locationString in this.netArea.features){
            let feature = this.netArea.features[locationString]
            let img = this.featureImages[feature.type]
            let isoPos = this.GridtoISO(feature.x,feature.y)
            ctx.drawImage(img,isoPos.x,isoPos.y,img.width/2,img.height/2);
            if(feature.type == "link"){
                ctx.fillStyle="red";
                if(feature.color){
                    ctx.fillStyle = feature.color
                }
                ctx.font="16px Terminal";
                ctx.textAlign = "center"
                ctx.fillText(feature.title,isoPos.x+this.isoTileWidth,isoPos.y-this.isoTileHeight*2);
            }
        }
    }
}