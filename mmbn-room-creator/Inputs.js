class JoKeyboard {
    constructor(downCallback,upCallback) {
        this.keys = {}
        this.downCallback = downCallback || function(){}
        this.upCallback = upCallback || function(){}
        document.body.addEventListener("keydown", e => {
            this.keys[e.key.toLowerCase()] = true
            this.downCallback(e)
        });
        document.body.addEventListener("keyup", e => {
            this.keys[e.key.toLowerCase()] = false
            this.upCallback(e)
        });
    }
}
class JoMouse {
    constructor(canvas,downCallback,upCallback,movedCallback) {
        this.buttons = {};
        this.pos = {
            x: 0,
            y: 0
        };
        this.downCallback = downCallback || function(){}
        this.upCallback = upCallback || function(){}
        this.movedCallback = movedCallback || function(){}
        document.addEventListener("mousemove", e => {
            this.pos.x = e.clientX - canvas.offsetLeft
            this.pos.y = e.clientY - canvas.offsetTop
            this.movedCallback(e)
        });
        document.addEventListener("mousedown", e => {
            this.buttons[e.button] = true
            this.downCallback(e)
        });
        document.addEventListener("mouseup", e => {
            this.buttons[e.button] = false
            this.upCallback(e)
        });
    }
}