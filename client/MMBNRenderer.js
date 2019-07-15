class MMBNRenderer {
    constructor(netArea) {
        this.netArea = netArea;
        this.grid = netArea.grid;
        this.rooms = netArea.rooms;
        //These tilesizes control the size of drawings to canvas
        this.ts = 1;
        this.isoTileWidth = 32;
        this.isoTileHeight = 16;
        //These offsets result in isometric drawings appearing in the center of the canvas
        this.xOffset = (canvas2.width / 2) - (this.ts * (this.grid.length / 2))
        this.yOffset = (canvas2.height / 2) - (this.ts * (this.grid.length / 2));
        this.isoXoffset = canvas.width / 2;
        this.isoYoffset = (canvas.height / 2) - (this.isoTileHeight * this.grid.length);

        this.colours = { 1: 'black', 2: 'white', 3: 'blue', 4: 'green' }
        this.featureColours = { link: 'red' }
        this.featureImages = { link: imgLink }

        //Debug draw options
        this.useCSSColors = true

        //removeLaterMaybe
        this.recentColors = []
    }
    GridtoISO(x, y) {
        var isoX = this.isoXoffset + ((x - y) * this.isoTileWidth);
        var isoY = this.isoYoffset + ((x + y) * this.isoTileHeight);
        return { x: isoX, y: isoY }
    }
    draw(ctx) {
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
    drawRoom(ctx, room) {
        let colorOverride = false
        if (room.node.info.styles.color != undefined) {
            ctx.fillStyle = room.node.info.styles.color
            colorOverride = true
            this.recentColors.push(room.node.info.styles.color)
        }
        if (room.node.info.styles.backgroundColor != undefined) {
            ctx.fillStyle = room.node.info.styles.backgroundColor
            colorOverride = true
            this.recentColors.push(room.node.info.styles.backgroundColor)
        }
        let g = room.prefab.grid
        for (var y = 0; y < g.length; y++) {
            for (var x = 0; x < g[y].length; x++) {
                let tileID = g[y][x]
                if (tileID !== 0 && tileID !== 2 && tileID !== 9) {
                    if(!colorOverride){
                        ctx.fillStyle = this.colours[tileID]
                    }
                    //Draw in color for fun
                    ctx.fillRect(this.xOffset + ((room.x + x) * this.ts), this.yOffset + ((room.y + y) * this.ts), this.ts, this.ts);
                }
            }
        }
        this.drawRoomFeatures(ctx, room)
    }
    drawRoomFeatures(ctx, room) {
        ctx.fillStyle = this.featureColours.link
        for (let locationString in room.features) {
            let feature = room.features[locationString]
            ctx.fillStyle = this.featureColours[feature.type]
            ctx.fillRect(this.xOffset + ((feature.x) * this.ts), this.yOffset + ((feature.y) * this.ts), this.ts, this.ts);
        }
    }
    drawPath(ctx, path, important) {
        let pathTileID = 3;
        if (important) {
            pathTileID = 4;
        }
        ctx.fillStyle = this.colours[pathTileID]
        path.forEach((loc) => {
            ctx.fillRect(this.xOffset + ((loc.x) * this.ts), this.yOffset + ((loc.y) * this.ts), this.ts, this.ts);
        })
    }
    async drawISO(ctx) {
        //Draw grid
        let img;
        let imgGenericTile = await createTile(randomColor(0.5),this.isoTileHeight*0.8,this.isoTileWidth*2,this.isoTileHeight*2)
        let imgPathTile = await createTile(randomColor(0.5),this.isoTileHeight*0.2,this.isoTileWidth*2,this.isoTileHeight*2)
        let imgImportantPathTile = await createTile(randomColor(0.5),this.isoTileHeight*0.4,this.isoTileWidth*2,this.isoTileHeight*2)
        for (var y = 0; y < this.grid.length; y++) {
            for (var x = 0; x < this.grid[y].length; x++) {
                let tileID = this.grid[y][x]
                if (tileID != 0 && tileID != 2) {
                    if (tileID == 1) { 
                        img = imgGenericTile
                    } else if (tileID == 3) {
                        img = imgPathTile;
                    } else if (tileID == 4) {
                        img = imgImportantPathTile;
                    }
                    let isoPos = this.GridtoISO(x, y)
                    ctx.drawImage(img, isoPos.x + this.isoTileWidth/2, isoPos.y - this.isoTileHeight/2);
                }
            }
        }
        //Draw features
        for (let locationString in this.netArea.features) {
            let feature = this.netArea.features[locationString]
            let img = this.featureImages[feature.type]
            let isoPos = this.GridtoISO(feature.x, feature.y)
            ctx.drawImage(img, isoPos.x + this.isoTileWidth/2, isoPos.y - this.isoTileHeight/2,this.isoTileWidth*2,this.isoTileHeight*2);
            if (feature.type == "link") {
                ctx.fillStyle = "red";
                if (feature.color) {
                    ctx.fillStyle = feature.color
                }
                ctx.font = "16px Terminal";
                ctx.textAlign = "center"
                ctx.fillText(feature.title, isoPos.x + this.isoTileWidth, isoPos.y - this.isoTileHeight * 2);
            }
        }
    }
}

function createTile(color,depth = 8,width,height){
    return new Promise((resolve,reject)=>{
        let image = new Image();
        let tempCanvas = document.createElement('canvas');
        tempCanvas.width = width+2
        tempCanvas.height = height+depth+2
        let tempCtx = tempCanvas.getContext('2d')
        drawTile(tempCtx,width/2,0,width,height,depth,"rgba(164,164,255,0.5)","rgba(255,255,255,0.7)",color)
        image.src = tempCanvas.toDataURL();
        image.onload = ()=>{
            resolve(image)
        }
    })
}

function drawTile(ctx, x, y, xSize, ySize, depth, baseColor, sideColor, topColor) {
	let drawAndFillPath = function(points){
    ctx.beginPath();
    points.forEach((point,index)=>{
      if(index == 0){
        ctx.moveTo(point.x, point.y);
      }else{
        ctx.lineTo(point.x,point.y)
      }
    })
    //Draw a nice thick line along path
    ctx.lineWidth = 3
    ctx.strokeStyle = "rgb(50,50,50)"
    ctx.stroke();
    ctx.fill();
    ctx.lineWidth = 1
    ctx.strokeStyle = "rgba(255,255,255,0.5)"
    ctx.stroke();
  }
	let hw = xSize/2
  let hh = ySize/2
  let ly = y+depth
  let top_back = {x:x,y:y}
  let bottom_back = {x:x,y:ly}
  let top_right = {x:x+hw,y:y+hh}
  let bottom_right = {x:x+hw,y:ly+hh}
  let top_front = {x:x,y:y+ySize}
  let bottom_front = {x:x,y:ly+ySize}
  let top_left = {x:x-hw,y:y+hh}
  let bottom_left = {x:x-hw,y:ly+hh}
  
  ctx.fillStyle = baseColor
  let bottomPoints = [bottom_back,bottom_right,bottom_front,bottom_left,bottom_back]
  drawAndFillPath(bottomPoints)
  ctx.fillStyle = sideColor
  let rightSidePoints = [bottom_back,top_back,top_right,bottom_right,bottom_back]
  drawAndFillPath(rightSidePoints)
  let leftSidePoints = [bottom_back,top_back,top_left,bottom_left,bottom_back]
  drawAndFillPath(leftSidePoints)
  let frontRightPoints = [bottom_front,top_front,top_right,bottom_right,bottom_front]
  drawAndFillPath(frontRightPoints)
  let frontLeftPoints = [bottom_front,top_front,top_left,bottom_left,bottom_front]
  drawAndFillPath(frontLeftPoints)
  ctx.fillStyle = topColor
  let topPoints = [top_back,top_right,top_front,top_left,top_back]
  drawAndFillPath(topPoints)
  
  let drawReflection = function(layers){
  	ctx.globalCompositeOperation = "source-atop"
    ctx.fillStyle = `rgba(0,0,0,0.1)`
    for(let i = 0; i < layers; i++){
      ctx.beginPath();
      ctx.ellipse(x-ySize, y+hh, ySize/(2+i/4), depth*2, 0, 0, Math.PI*2)
      ctx.fill();
    }
    for(let i = 0; i < layers; i++){
      ctx.beginPath();
      ctx.ellipse(x+ySize, y+hh, ySize/(2+i/4), depth*2, 0, 0, Math.PI*2)
      ctx.fill();
    }
    ctx.fillStyle = `rgba(255,255,255,0.05)`
  	for(let i = 0; i < layers; i++){
      ctx.beginPath();
      ctx.ellipse(x, y+hh, ySize/(2+i/2), xSize/(4+i/2), 0, 0, Math.PI*2)
      ctx.fill();
    }
	}
  drawReflection(5)
}

function randomColor(transparency){
    return `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},${transparency})`
}