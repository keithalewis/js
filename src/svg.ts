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

	// x="x" y="y"
	toString(suffix: string | number = ""): string
	{
		const s = String(suffix);
		return `x${s}="${this.x}" y${s}="${this.y}"`;
	}
	// {x: x, y: y}
	attributes(suffix: string | number = "")
	{
		const s = String(suffix);
		return { [`x${s}`]: this.x, [`y${s}`]: this.y };
	}
	// translate, scale, rotate
}
/*
console.log((new Point(1,2)).toString());
console.log((new Point(1,2)).attributes(2));
console.log((new Point(1,2)).toString(1));
console.log((new Point(1,2)).toString());
console.log((new Point(1,2)).toString(1));
console.log((new Point(1,2)).attributes(1));
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
		return `${this.x} ${this.y} ${this.width} ${this.height}`;
	}
}

// svg width height
class Svg extends Element {
	width: number;
	height: number;
	sx: number;
	sy: number;
	constructor(width: number, height: number, xmlns: string = "http://www.w3.org/2000/svg")
	{
		super("svg");
		this.width = width;
		this.height = height;
		this.sx = 1;
		this.sy = 1;
		this.attribute["width"] = width;
		this.attribute["height"] = height;

		const rect = new Element("rect");
		rect.attribute["x"] = 0;
		rect.attribute["y"] = 0;
		rect.attribute["width"] = width;
		rect.attribute["height"] = height;
		rect.attribute["fill"] = "none";
		rect.attribute["stroke"] = "red";
		rect.attribute["stroke-width"] = 1;
		this.content(rect);
	}
	// user coordinates in box with user pixels scale'd
	drawBox(xmin: number, ymin: number, xmax: number, ymax: number): Element
	{
		this.sx = this.width/(xmax - xmin);
		this.sy = this.height/(ymax - ymin);
		this.attribute["viewBox"] = `0 0 ${this.width} ${this.height}`;
		const g = new Element("g");
		/*
		g.attribute["sx"] = this.width/(xmax - xmin);
		g.attribute["sy"] = this.height/(ymax - ymin);
		*/
		const sx = this.width/(xmax - xmin);
		const sy = this.height/(ymax - ymin);
		const dx = -xmin;
		const dy = ymax;

		return g;
	}
}
//console.log((new Svg(100,200)).drawBox(0, 0, 1, 2).toString());

class Line extends Element {
	sx: number;
	sy: number
	constructor(p1: Point, p2: Point)
	{
		super("line");
		Object.assign(this.attribute, p1.attributes(1));
		Object.assign(this.attribute, p2.attributes(2));
		this.attribute["stroke"] = "black";
		this.sx = this.lookupAttributeValue("sx");
		this.sy = this.lookupAttributeValue("sy");
console.log("sx = " + this.sx);
console.log("sy = " + this.sy);
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

const svg = new Svg(100, 100);
//const g = svg.drawBox(0, 0, 2, 2).content(new Line(new Point(0.5, 0.5), new Point(1.5, 1.5)));
const w = 10;
const h = 20;
const g = svg.drawBox(-1, -1, w, h);
svg.content(g);
console.log(g);
const x = new Line(new Point(0, 0), new Point(0, w*.9)).width(1/w).linecap("square");
g.content(x);
const y = new Line(new Point(0, 0), new Point(h*.9, 0)).width(1/w).linecap("square");
g.content(y);
const z = new Line(new Point(w*.1, h*.1), new Point(w*.9, h*.9)).width(1/w);
g.content(z);
//console.log(g);
//console.dir(svg, {depth: null, colors: true});
console.log(svg.toString());
writeFileSync("output.svg", svg.toString(), "utf8");
