class RNG{
    constructor(startingSeed){
        this.seed = startingSeed
    }
    Float() {
        var x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }
    Integer(min,max){
        var range = max - min + 1;
        return Math.floor(range * this.Float()) + min;
    }
    RandomPositionOnCircumference(radius) {
        var angle = this.Float() * Math.PI * 2;
        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
        }
    }
}

function distance(a, b) {
    return Math.abs(a - b);
}

function generateGrid(width, height) {
    let grid = [];
    for (var y = 0; y < height; y++) {
        grid.push([])
        for (var x = 0; x < width; x++) {
            grid[y].push(0)
        }
    }
    return grid;
}

//unused snippits
/*

    smoothAndExpandPath(path,grid){
            //Smoothen that path to remove janky diagonal movements (also removes unimportant steps)
            path = PF.Util.smoothenPath(grid, path);
            //Add back the unimportant steps (because we need a full path)
            path = this.expandPath(path)
            return path;
    }
expandPath(path) {
        let newPath = []
        path.forEach((location, index) => {
            if (index > 0) {
                let x = path[index - 1][0];
                let y = path[index - 1][1];
                let x2 = path[index][0];
                let y2 = path[index][1];
                newPath.push([x, y])
                //The nonsence below shuffles up the order of the while statements
                //This results in a less bias pathing shape
                let cases = [1, 2, 3, 4];
                while (cases.length > 0) {
                    let item = cases.splice(RNG(0, cases.length - 1), 1)[0]
                    switch (item) {
                        case 1:
                            while (x < x2) {
                                x++
                                newPath.push([x, y])
                            }
                            break
                        case 2:
                            while (x > x2) {
                                x--
                                newPath.push([x, y])
                            }
                            break
                        case 3:
                            while (y < y2) {
                                y++
                                newPath.push([x, y])
                            }
                            break
                        case 4:
                            while (y > y2) {
                                y--
                                newPath.push([x, y])
                            }
                            break
                    }
                }
            }
        })
        return newPath
    }
    */