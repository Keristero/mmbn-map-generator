class Feature{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
    get locationString(){
        return `${this.x},${this.y}`
    }
}

class LinkFeature extends Feature{
    constructor(x,y,link){
        super(x,y)
        this.href = link.info.href
        this.title = link.info.text ? link.info.text : link.info.href
        this.color = link.info.color
        this.type = "link"
    }
}