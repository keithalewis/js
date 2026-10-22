/*
:!npx tsx %
:!npx tsc --noEmit
*/
import { XmlElement } from "./xml.js";
import { writeFileSync } from "node:fs";
const _DEBUG = true;
class Point {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    translate(dx, dy) {
        this.x += dx;
        this.y += dy;
        return this;
    }
    toAttributes(suffix = "") {
        const s = String(suffix);
        return { [`x${s}`]: this.x, [`y${s}`]: this.y };
    }
}
console.assert(JSON.stringify(new Point(1, 2).toAttributes("0")) === '{"x0":1,"y0":2}');
function toStringViewBox(v) {
    return `${v.x} ${v.y} ${v.w} ${v.h}`;
}
// svg width height
// https://www.w3.org/TR/SVG/struct.html#SVGElement
class Svg extends XmlElement {
    // allow number or string.
    constructor(width = "100%", height, xmlns = "http://www.w3.org/2000/svg") {
        super("svg", {
            width: width,
            height: height,
            xmlns: xmlns,
            preserveAspectRatio: "xMidYMid slice",
            style: "border: 1px solid black",
        });
    }
    viewBox(x, y, w, h) {
        this.setAttributes({ viewBox: `${x} ${y} ${w} ${h}` });
        return this;
    }
    plotBox(x, y, w, h) {
        this.viewBox(-x, -y, w + 2 * x, h + 2 * y);
        let g = new XmlElement("g", { transform: `translate(0, ${h})` });
        this.addChild(g);
        return g;
    }
}
// https://www.w3.org/TR/SVG/shapes.html#LineElement
class Line extends XmlElement {
    p1;
    p2;
    constructor(p1, p2, color = "black") {
        super("line");
        this.p1 = p1.translate(0, -2 * p1.y);
        this.p2 = p2.translate(0, -2 * p2.y);
        this.setAttributes({
            ...this.p1.toAttributes(1),
            ...this.p2.toAttributes(2),
            stroke: color
        });
    }
    color(color) {
        this.attribute["stroke"] = color;
        return this;
    }
    width(width) {
        //const sx = this.lookupAttributeValue("sx");
        //_DEBUG && console.log(`sx = ${sx}`);
        this.attribute["stroke-width"] = width;
        return this;
    }
    opacity(opacity) {
        this.attribute["stroke-opacity"] = opacity;
        return this;
    }
    linecap(linecap) {
        this.attribute["stroke-linecap"] = linecap;
        return this;
    }
}
const w = 4;
const h = 3;
let svg = new Svg("80%", "60%");
const g = svg
    .plotBox(1, 1, 4, 3)
    .addChild(new Line(new Point(0, 0), new Point(4, 3)).width(0.01));
g.addChild(new XmlElement("text", { x: 0, y: 0, "font-size": 0.1 }, ["(0,0)"]));
/*
const w = 10;
const h = 20;
const g = svg.drawBox(-1, -1, w, h);
svg.content(g);
>>>>>>> c39b46a (node_modules)
const x = new Line(new Point(0, 0), new Point(0, w*.9)).width(1/w).linecap("square");
console.log(x);
//console.dir(svg, {depth: null, colors: true});
_DEBUG && console.log(svg.toString());
*/
writeFileSync("output.svg", svg.toString(), "utf8");
//# sourceMappingURL=svg.js.map