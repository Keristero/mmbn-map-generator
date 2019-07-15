class NetAreaGenerator {
    constructor() {
        this.width = 1000;
        this.height = 1000;
        this.grid = generateGrid(this.width, this.height)
        this.rooms = [];
        this.totalNodes;
        this.nodeQueue = []
        this.features = {};
        this.RNG = new RNG(60902583)

        //Setup pathfinding
        easystar.setGrid(this.grid);
        easystar.setAcceptableTiles([0,1,3,4]);
        //Set pathfinding costs
        easystar.setTileCost(1, 32);//Going through rooms
        easystar.setTileCost(0, 16);//Going through empty area
        easystar.setTileCost(3, 8);//Going along paths
        easystar.setTileCost(4, 1);//Going along important paths

        //Options
        this.maximumPathFindingAttempts = 1; //If pathfinding is failing, raising may help
        this.oneUseConnectors = true; //Improves look, but increases failure rate
        this.pathImportanceThreshold = 0.6 //less = more important paths, Suggested range, 0.2 to 1
        this.sparseness = 1
        this.importantRoomSeperationMultiplier = 5;

    }
    async generateNetArea(startingNode){
        this.totalNodes = startingNode.totalDescendants+1;
        this.nodeQueue = [startingNode]
        await this.processNodeQueue();
    }
    roomPlacementValid(room) {
        return this.areaIsClear(room.x, room.y, room.x + room.prefab.width, room.y + room.prefab.height)
    }
    areaIsClear(px, py, endx, endy) {
        let g = this.grid
        for (var y = py; y < endy; y++) {
            for (var x = px; x < endx; x++) {
                let tileID = g[y][x]
                if (tileID !== 0) {
                    return false;
                }
            }
        }
        return true;
    }
    burnRoomToGrid(room) {
        //Burn layout
        let g = room.prefab.grid
        for (var y = 0; y < g.length; y++) {
            for (var x = 0; x < g[y].length; x++) {
                let tileID = g[y][x]
                //make coordinates global
                let globalX = room.x + x
                let globalY = room.y + y
                if (tileID != 0) {
                    this.grid[globalY][globalX] = tileID;
                }
            }
        }
        //Burn features
        for(let locationString in room.features){
            let feature = room.features[locationString]
            //make coordinates global
            feature.x+=room.x;
            feature.y+=room.y;
            this.features[feature.locationString] = feature
        }
    }
    async processNodeQueue() {
        while(this.nodeQueue.length > 0){
            let currentNode = this.nodeQueue.shift()
            this.addNodesChildrenToQueue(currentNode)
            await this.generateLayout(currentNode)
            //Testing
                mmbnRenderer.drawRoom(ctx2,this.rooms[this.rooms.length-1])
            //
        }
    }
    addNodesChildrenToQueue(node) {
        node.children.sort((a, b) => {
            //Sort ascending
            if (a.totalDescendants < b.totalDescendants) {
                return -1
            }
            if (a.totalDescendants > b.totalDescendants) {
                return 1
            }
            return 0
        })
        //Add children in order (so the biggest rooms are first in queue)
        node.children.forEach((childNode) => {
            this.nodeQueue.push(childNode)
        })
    }
    async generateLayout(node) {
        let newRoom = new NetAreaRoom(node,this);
        let roomUnplaced = true;
        let attempts = 0;
        while (roomUnplaced) {
            if (this.roomPlacementValid(newRoom)) {
                this.burnRoomToGrid(newRoom);
                roomUnplaced = false;
                if (newRoom.node.parent) {
                    await this.findPathBetweenRooms(newRoom, newRoom.node.parent.room)
                }
            } else {
                this.setRoomLocation(newRoom, attempts)
                attempts++;
            }
        }
        this.rooms.push(newRoom);
    }
    calculateNewRoomLocation(room, attempts){
        let parentNode = room.node.parent;
        let parentRoom = parentNode.room;
        let minimumDistance = ((Math.max(room.width, room.height) + Math.max(parentRoom.width, parentRoom.height))/ 2);
        let roomImportanceAllowence = Math.floor(Math.log(parentNode.children.length + room.node.children.length))
        let roomDecendantAllowence = Math.floor(Math.max(0,Math.log(room.node.totalDescendants))*this.importantRoomSeperationMultiplier)
        let attemptsAllowence = Math.floor(attempts / 5)
        let radius = (minimumDistance + roomDecendantAllowence + roomImportanceAllowence + attemptsAllowence)
        let pos = this.RNG.RandomPositionOnCircumference(radius)
        pos.x = Math.floor(parentRoom.x + pos.x)
        pos.y = Math.floor(parentRoom.y + pos.y)
        return pos;
    }
    setRoomLocation(room, attempts) {
        let pos = this.calculateNewRoomLocation(room,attempts)
        room.x = pos.x
        room.y = pos.y
    }
    async findPathBetweenRooms(roomA, roomB) {
        this.PFgrid = easystar.setGrid(this.grid);

        let attempts = 0;
        let path = null;
        let con = null;

        while(path == null && attempts < this.maximumPathFindingAttempts){
            if(attempts == 0){
                con = this.findClosestConnectors(roomA,roomB)
            }else{
                con = this.findRandomConnectors(roomA,roomB)
            }
            let startX = roomA.x + con.a.x
            let startY = roomA.y + con.a.y;
            let endX = roomB.x + con.b.x;
            let endY = roomB.y + con.b.y;
            path = await this.findPath(startX, startY, endX, endY)
            
            if(path !== null){
                //Add the path to the map
                let pathImportant = roomA.node.totalDescendants+roomB.node.totalDescendants > this.totalNodes*this.pathImportanceThreshold;
                this.burnPathToGrid(path,pathImportant)
                if(this.oneUseConnectors){
                    if(roomA.prefab.connectors > 1){
                        roomA.prefab.connectors.splice(con.indexA,1)
                    }
                    if(roomB.prefab.connectors > 1){
                        roomB.prefab.connectors.splice(con.indexB,1)
                    }
                }
            }else{
                console.warn("no path found, attempt:",attempts)
            }

            attempts++
        }
        if(path == null){
            throw("no path found!")
        }
    }
    findPath(startX,startY,endX,endY){
        return new Promise((resolve, reject)=>{
            easystar.findPath(startX, startY, endX, endY, (result)=>{
                resolve(result)
            });
            easystar.calculate();
        });
    }
    findRandomConnectors(roomA,roomB){
        let con = {
            a: null,
            b: null,
            indexA: null,
            indexB: null
        };
        con.indexA = this.RNG.Integer(0,roomA.prefab.connectors.length-1,this.seed);
        con.indexB = this.RNG.Integer(0,roomB.prefab.connectors.length-1,this.seed);
        con.a = roomA.prefab.connectors[con.indexA];
        con.b = roomB.prefab.connectors[con.indexB];
        return con
    }
    findClosestConnectors(roomA,roomB){
        let smallestDistance = Infinity;
        let con = {
            a: null,
            b: null,
            indexA: null,
            indexB: null
        };
        //Find the closest connector pair for connecting the rooms
        roomA.prefab.connectors.forEach((conA,indexA) => {
            roomB.prefab.connectors.forEach((conB,indexB) => {
                let dist = distance(roomA.x + conA.x, roomB.x + conB.x) + distance(roomA.y + conA.y, roomB.y + conB.y)
                if (dist < smallestDistance) {
                    smallestDistance = dist
                    con.a = conA
                    con.b = conB
                    con.indexA = indexA
                    con.indexB = indexB
                }
            })
        })
        if(con.a == null || con.b == null){
            throw("Unable to connect rooms, not enough connections",roomA.prefab,roomB.prefab)
        }
        return con
    }
    burnPathToGrid(path,important) {
        let pathTileID = 3;
        if(important){
            pathTileID = 4;
        }
        path.forEach((loc) => {
            if(this.grid[loc.y][loc.x] == 0 || this.grid[loc.y][loc.x] == 3){
                this.grid[loc.y][loc.x] = pathTileID;
            }
        })

        //Testing
        mmbnRenderer.drawPath(ctx2,path,important)
        //
        return true;
    }
}