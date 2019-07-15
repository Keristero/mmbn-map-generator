let canvas = document.getElementById('canvas')
let ctx = canvas.getContext('2d')
let canvas2 = document.getElementById('canvas2')
let ctx2 = canvas2.getContext('2d')
let imgGenericTile = document.getElementById('img_genericTile')
let imgPathTile = document.getElementById('img_pathTile')
let imgImportantPathTile = document.getElementById('img_importantPathTile')
let imgLink = document.getElementById('img_link')
let btn_go = document.getElementById('btn_go')
let inp_url = document.getElementById('inp_url')
let img_siteFavicon = document.getElementById('img_siteFavicon')
let tilesize = 6;

btn_go.onclick = async()=>{
    start()
}

let sampleNode;
let easystar;
let netArea;
let mmbnRenderer;

function getUrlInfo(url){
    let matches = url.match(/([htps]{4,5}):\/\/(www[0-9]?\.)?(.[^\/:]+)(.+)/i)
    let info = {
        protocol:matches[1],
        prefix:matches[2],
        domain:matches[3],
        suffix:matches[4],
    }
    return info
}

async function start(){
    let result = await getScrapedElements()
    console.log(result)
    let scrapedElementsRoot = result.rootElement
    InitializeMapNodes(scrapedElementsRoot)
    console.log(scrapedElementsRoot)

    ctx2.clearRect(0,0,canvas.width,canvas.height)
    easystar = new EasyStar.js();
    netAreaGenerator = new NetAreaGenerator()
    mmbnRenderer = new MMBNRenderer(netAreaGenerator);
    await netAreaGenerator.generateNetArea(scrapedElementsRoot);
    mmbnRenderer.drawISO(ctx,tilesize)
}

function getFavIcon(protocol,prefix,domain){
    return new Promise((resolve,reject)=>{
        let faviconUrl = `${protocol}://${prefix || ""}${domain}/favicon.ico`
        img_siteFavicon.src = faviconUrl
        img_siteFavicon.onload = resolve
        console.log('faviconurl = ',faviconUrl)
        //document.body.style.backgroundImage = `url(${faviconUrl})`;
        //document.body.style.backgroundRepeat = "repeat";
    })
}

async function getScrapedElements(){
    let targetSite = inp_url.value
    let targetSiteInfo = getUrlInfo(inp_url.value)
    let requestURL = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/site/${targetSiteInfo.protocol}/`

    console.log("done")

    if(targetSiteInfo.prefix){
        requestURL += targetSiteInfo.prefix
    }
    requestURL += targetSiteInfo.domain
    if(targetSiteInfo.suffix){
        requestURL += targetSiteInfo.suffix
    }
    console.log('requesting',requestURL)
    let result = await fetch(requestURL)
    let siteInfo = await result.json()
    console.log(siteInfo)

    //Experimental stuff start
    let favicon = getFavIcon(targetSiteInfo.protocol,targetSiteInfo.prefix,targetSiteInfo.domain)
    if(siteInfo.bodyBackgroundColor){
        document.body.style.backgroundColor = siteInfo.bodyBackgroundColor
    }

    //Experimental stuff end

    return siteInfo
}

function InitializeMapNodes(rootNode){
    InitializeMapNodes(rootNode)
}

function InitializeMapNodes(node){
    for(let child of node.children){
        child.parent = node
        InitializeMapNodes(child)
    }
}

class MapNode{
    constructor(elementObj,parent){
        this.children = elementObj.children
        this.links = elementObj.links
        this.info = elementObj.info
        this.minimumConnectors = elementObj.minimumConnectors
        this.minimumLinks = elementObj.minimumLinks
        this.totalDescendants = elementObj.totalDescendants
        this.parent = parent || null;
        this.room = null;
    }
}