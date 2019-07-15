//global variables
let tileSize = 32;
let roomWidth = Number(prompt("Width?","5"))
let roomHeight = Number(prompt("Height?","5"))

const canvas = document.getElementById("canvas");
canvas.width = roomWidth*tileSize;
canvas.height = roomHeight*tileSize;
canvas.oncontextmenu = (e)=>{e.preventDefault()};

const ctx = canvas.getContext('2d');
const keyboard = new JoKeyboard(keyboardEvent,keyboardEvent);
const mouse = new JoMouse(canvas,mouseEvent,mouseEvent,mouseEvent);
const roomEditor = new RoomEditor(roomWidth,roomHeight)
const btnExport = document.getElementById("btn_export");
const inpExport = document.getElementById("inp_export");

start();

btnExport.onclick = ()=>{
    inpExport.value = roomEditor.export()
    inpExport.select();
    document.execCommand("copy");
    alert("Copied the text: " + inpExport.value);
}

function keyboardEvent(e){
    if(keyboard.keys["0"]){
        roomEditor.setGridTile(mouse.gridX,mouse.gridY,0)
        draw()
    }
    if(keyboard.keys["1"]){
        roomEditor.setGridTile(mouse.gridX,mouse.gridY,1)
        draw()
    }
    if(keyboard.keys["2"]){
        roomEditor.setGridTile(mouse.gridX,mouse.gridY,2)
        draw()
    }
    if(keyboard.keys["c"]){
        roomEditor.addFeature(mouse.gridX,mouse.gridY,"connector","rgba(255,0,0,0.5)")
        draw()
    }
    if(keyboard.keys["l"]){
        roomEditor.addFeature(mouse.gridX,mouse.gridY,"link","rgba(0,0,255,0.5)")
        draw()
    }
    if(keyboard.keys["delete"]){
        roomEditor.removeFeature(mouse.gridX,mouse.gridY)
        draw()
    }
}

function mouseEvent(e){
    mouse.gridX = Math.floor(mouse.pos.x/tileSize)
    mouse.gridY = Math.floor(mouse.pos.y/tileSize)
    if(mouse.gridX >= roomWidth || mouse.gridY >= roomHeight || mouse.gridX < 0 || mouse.gridY < 0){
        return;
    }
    if(mouse.buttons[0]){
        roomEditor.setGridTile(mouse.gridX,mouse.gridY,1)
        draw()
    }
    if(mouse.buttons[2]){
        roomEditor.setGridTile(mouse.gridX,mouse.gridY,0)
        draw()
    }
}

function start(){
    draw()
}

function draw(){
    roomEditor.draw(ctx, tileSize)
}
