/*
:!npx tsx svg.ts
:!npx tsc --noEmit
*/
import { Element } from "./xml.js";
import { writeFileSync } from "node:fs";

class Point {
	x: number;
	y: number;
	constructor(x: number, y: number)
	{
		this.x = x;
		this.y = y;
	}

	// x{suffix}="x" y{suffix}="y"
	toString(suffix: string | number = ""): string
	{
		const s = String(suffix);
		return `x${s}="${this.x}" y${s}="${this.y}"`;
	}
	// {x{suffix}: x, y{suffix}: y}
	toAttributes(suffix: string | number = "")
	{
		const s = String(suffix);
		return { [`x${s}`]: this.x, [`y${s}`]: this.y };
	}
	// translate, scale, rotate
}
/*
console.log((new Point(1,2)).toString());
console.log((new Point(1,2)).toAttributes(2));
console.log((new Point(1,2)).toString(1));
console.log((new Point(1,2)).toString());
console.log((new Point(1,2)).toString(1));
console.log((new Point(1,2)).toAttributes(1));
*/

class viewBox {
	x: number;
	y: number;
	width: number;
	height: number;
	constructor(x: number, y: number, width: number, height: number)
	{
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	toString(): string
	{
		return `viewBox="${this.x} ${this.y} ${this.width} ${this.height}"`;
	}
}

// svg width height
class Svg extends Element {
	// allow number or string. 
	constructor(width: number, height: number, xmlns: string = "http://www.w3.org/2000/svg")
	{
		super("svg", {width: width, height: height, xmlns: xmlns});
		// TODO: remove
		this.content(new Element(
			"rect", {x: 0, y: 0, width: "100%", height: "100%", 
			fill: "none", stroke: "red", "stroke-width": 1}
		));
	}
}

// 
class Plot extends Svg {
	// transform user coordinates so 
	// (0,0) -> (x0*scale, y0*scale)
	// (w,h) -> (x0+w*scale, y0+h*scale)
	constructor(x0: number, y0: number, w: number, h: number, scale: number = 1)
	{
		super(w, h);
	}
}

// https://www.w3.org/TR/SVG/shapes.html#LineElement
class Line extends Element {
	constructor(p1: Point, p2: Point)
	{
		super("line", {...p1.toAttributes(1), ...p2.toAttributes(2)});
		this.attribute["stroke"] = "black";
	}
	color(color: string): this
	{
		this.attribute["stroke"] = color;
		return this;
	}
	width(width: number): this
	{
		//const sx = this.lookupAttributeValue("sx");
		//console.log(`sx = ${sx}`);
		this.attribute["stroke-width"] = width;
		return this;
	}
	opacity(opacity: number): this
	{
		this.attribute["stroke-opacity"] = opacity;
		return this;
	}
	linecap(linecap: "butt" | "round" | "square"): this
	{
		this.attribute["stroke-linecap"] = linecap;
		return this;
	}
}

const w = 100;
const h = 200;
const svg = new Svg(w, h);
/*
const svg = new Svg(100, 100);
//const g = svg.drawBox(0, 0, 2, 2).content(new Line(new Point(0.5, 0.5), new Point(1.5, 1.5)));
const w = 10;
const h = 20;
const g = svg.drawBox(-1, -1, w, h);
svg.content(g);
console.log(g);
>>>>>>> c39b46a (node_modules)
const x = new Line(new Point(0, 0), new Point(0, w*.9)).width(1/w).linecap("square");
console.log(x);
//console.dir(svg, {depth: null, colors: true});
console.log(svg.toString());
writeFileSync("output.svg", svg.toString(), "utf8");
*/
