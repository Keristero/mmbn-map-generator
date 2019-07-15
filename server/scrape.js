const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var dom;
var window;
var document;

class ProcessedElement{
    constructor(element,parentProcessedElement,results){
        this.totalDescendants = 0
        this.element = element
        this.parentProcessedElement = parentProcessedElement
        this.children = []
        this.links = []
        this.info = {
            tag: element.tagName,
            styles:{}
        }
        if(this.parentProcessedElement){
            this.info.depth = parentProcessedElement.info.depth+1
        }else{
            this.info.depth = 0
        }

        if(this.info.tag){
            let style = window.getComputedStyle(this.element)
            if(style){
                let color = style.getPropertyValue("color")
                if(color){
                    this.info.color = color
                }
                let backgroundColor = style.getPropertyValue("background")
                backgroundColor = style.getPropertyValue("background-color")
                if(backgroundColor){
                    this.info.styles.backgroundColor = backgroundColor
                }
            }
        }

        if(this.info.tag){
            //Logic for different types of elements

            if(this.element.textContent){
                this.info.textContent = this.element.textContent
            }

            if(this.element.text){
                this.info.text = this.element.text
            }

            if(this.info.tag == "BODY"){
                //Get page background color
                let style = window.getComputedStyle(this.element)
                if(style){
                    //Get bodyBackgroundColor
                    results.bodyBackgroundColor = style.getPropertyValue("background-color")
                    if(!results.bodyBackgroundColor){
                        results.bodyBackgroundColor = style.getPropertyValue("background")
                    }
                    //get bodyBackgroundImage
                    results.bodyBackgroundImage = style.getPropertyValue("background-image")
                }
            }

            //Links: A
            if(this.info.tag == "A" || this.info.tag == "LINK"){
                //Get the link (if there is one)
                if(this.element.href != ""){
                    this.info.href = element.href
                    //Add the link to the parent 
                    this.parentProcessedElement.links.push(this)
                }
            }else if(this.info.tag == "IMG"){
                if(this.element.src){
                    this.info.src = element.src
                }
                if(this.element.alt){
                    this.info.alt = element.alt
                }
                if(this.element.title){
                    this.info.title = element.title
                }
            }else if(this.info.tag == "META"){
                //Add meta tag information
                results.meta[this.element.name] = this.element.content
            }else if(this.info.tag == "TITLE"){
                //Get the title text
                results.pageTitle = element.text
            }else if(this.info.tag == "SOURCE"){
                //Video and audio sources
                this.info.src = element.src
                this.info.type = element.type
            }else{
                //All non links
                //Add as a normal child
                this.parentProcessedElement.children.push(this)
            }
        }
    }
    toString(){
        let str = `${this.info.tag}, ${this.info.text}, ${this.info.textContent}`
        for(let i = 0; i < this.info.depth; i++){
            str = "-"+str
        }
        return str
    }
    get directDecendents(){
        return this.children.length
    }
}

function countTotalChildren(processedElement){
    //First add own children to total descendants
    processedElement.totalDescendants = processedElement.children.length
    //Count own children for minimum connectors, add one for connection to parent
    processedElement.minimumConnectors = processedElement.children.length+1
    //Count the number for links
    processedElement.minimumLinks = processedElement.links.length
    for(let child of processedElement.children){
        countTotalChildren(child)
        processedElement.totalDescendants += child.totalDescendants
    }
}

async function scrape(URL){
    console.log("Starting scrape of ",URL)
    let results = {
        rootElement:null,
        meta:{}
    }
    //Create virtual DOM of website
    dom = await getDOM(URL);
    window = dom.window
    document = window.document

    let collectedElements = []
    let rootElement = new ProcessedElement(document,0,results)
    //Start with the first element (usually html)
    let stack = [rootElement];
    //Process every element on the page
    while(stack.length > 0){
        let processedElement = stack.shift();
        for(let child of processedElement.element.children){
            let childProcessedElement = new ProcessedElement(child,processedElement,results)
            stack.push(childProcessedElement)
        }
        collectedElements.push(processedElement)
    }
    //Count children
    countTotalChildren(rootElement)
    //Cleanup
    for(let element of collectedElements){
        //delete unneeded stuff
        delete element.parentProcessedElement
        delete element.element
    }
    console.log("Finished scrape of ",URL)
    //prepare return values
    results.rootElement = rootElement;

    return results
}

function getDOM(url){
    return new Promise((resolve,reject)=>{
        JSDOM.fromURL(url).then(dom => {
            resolve(dom)
        });
    })
}

module.exports.scrape = scrape