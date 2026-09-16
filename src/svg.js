"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
:!npx tsx svg.ts
:!npx tsc --noEmit
*/
const xml_js_1 = require("./xml.js");
const node_fs_1 = require("node:fs");
//writeFileSync("output.txt", "hello world", "utf8");
// Global functions to communicate scaling
class Point {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    // x="x" y="y"
    toString(suffix = "") {
        const s = String(suffix);
        return `x${s}="${this.x}" y${s}="${this.y}"`;
    }
    // {x: x, y: y}
    attributes(suffix = "") {
        const s = String(suffix);
        return { [`x${s}`]: this.x, [`y${s}`]: this.y };
    }
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
    x;
    y;
    width;
    height;
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    toString() {
        return `${this.x} ${this.y} ${this.width} ${this.height}`;
    }
}
// svg width height
class Svg extends xml_js_1.Element {
    #width;
    #height;
    #sx;
    #sy;
    constructor(width, height, xmlns = "http://www.w3.org/2000/svg") {
        super("svg");
        this.#width = width;
        this.#height = height;
        this.#sx = 1;
        this.#sy = 1;
        this.attribute["width"] = width;
        this.attribute["height"] = height;
        this.attribute["xmlns"] = xmlns;
        const rect = new xml_js_1.Element("rect");
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
    drawBox(xmin, ymin, xmax, ymax) {
        this.#sx = this.#width / (xmax - xmin);
        this.#sy = this.#height / (ymax - ymin);
        this.attribute["viewBox"] = `0 0 ${this.#width} ${this.#height}`;
        const g = new xml_js_1.Element("g");
        const dx = -xmin;
        const dy = ymax;
        g.attribute["transform"] = `translate(${dx * this.#sx}, ${dy * this.#sy}) scale(${this.#sx}, ${this.#sy}) scale(1,-1)`;
        return g;
    }
}
//console.log((new Svg(100,200)).drawBox(0, 0, 1, 2).toString());
class Line extends xml_js_1.Element {
    constructor(p1, p2) {
        super("line");
        Object.assign(this.attribute, p1.attributes(1));
        Object.assign(this.attribute, p2.attributes(2));
        this.attribute["stroke"] = "black";
    }
    color(color) {
        this.attribute["stroke"] = color;
        return this;
    }
    width(width) {
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
const svg = new Svg(100, 100);
//const g = svg.drawBox(0, 0, 2, 2).content(new Line(new Point(0.5, 0.5), new Point(1.5, 1.5)));
const w = 10;
const h = 10;
const g = svg.drawBox(-1, -1, w, h);
svg.content(g);
console.log(g);
const x = new Line(new Point(0, 0), new Point(0, w * .9)).width(1).linecap("square");
g.content(x);
const y = new Line(new Point(0, 0), new Point(h * .9, 0)).width(1).linecap("square");
g.content(y);
const z = new Line(new Point(w * .1, h * .1), new Point(w * .9, h * .9)).width(1);
g.content(z);
console.log(g);
console.dir(svg, { depth: null, colors: true });
console.log(svg.toString());
(0, node_fs_1.writeFileSync)("output.svg", svg.toString(), "utf8");
