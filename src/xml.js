"use strict";
// xml.ts - XML helpers
/*
:!npx tsx xml.ts
:!npx tsc --noEmit
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Element = void 0;
function escapeXml(value, attribute = false) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(attribute ? /"/g : /$^/g, "&quot;")
        .replace(attribute ? /'/g : /$^/g, "&apos;");
}
class Attribute {
    name;
    value;
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
    // 'name="value"'
    toString() {
        return `${this.name}="${escapeXml(String(this.value), true)}"`;
    }
}
// 'k1="v1" k2="v2" ... kn="vn"'
function toString(attributes) {
    return Object.entries(attributes)
        .map(([name, value]) => new Attribute(name, value).toString())
        .join(" ");
}
console.log({ "a": 1 });
console.log(toString({ "a": 1 }));
console.assert(toString({ "a": 1, "b": 2 }) === 'a="1" b="2"', "toString(Attributes) failed");
// content ::= (element | text)*
class Content {
    content;
    constructor(content) {
        this.content = content;
    }
    toString() {
        return typeof this.content === "string"
            ? escapeXml(this.content)
            : this.content.toString();
    }
}
//console.assert(new Content("abc").toString() === "abc", "Content failed.");
class Element {
    tag;
    attribute;
    contents;
    parent;
    children;
    constructor(tag, attribute, contents) {
        this.tag = tag;
        this.attribute = attribute ?? {};
        this.contents = contents ?? [];
        this.children = [];
    }
    // Avoid circular references when copying.
    static copy(e) {
        return new Element(e.tag, e.attribute, e.contents.map((c) => new Content(typeof c.content === "string" ? c.content : Element.copy(c.content))));
    }
    // add attributes({k1: v1, k1: v2, ...})
    attributes(as) {
        Object.assign(this.attribute, as);
        return this;
    }
    // Append new Content. No getContent.
    content(content) {
        this.contents.push(new Content(content));
        return this;
    }
    // element ::= emptyElement | startTag content endTag
    toString() {
        const attributes = Object.keys(this.attribute).length > 0
            ? " " + toString(this.attribute)
            : "";
        if (this.contents.length === 0) {
            // emptyElement ::= '<' Name attributes? '/>'
            return `<${this.tag}${attributes}/>`;
        }
        else {
            // startTag ::= '<' Name attributes? '>'
            const contents = this.contents.map((c) => c.toString()).join("");
            return `<${this.tag}${attributes}>${contents}</${this.tag}>`;
        }
    }
}
exports.Element = Element;
//export { Attribute, Content, Element };
/*
const c: Content = new Content("a");
console.log(c.toString());

let e = new Element("tag");
console.log(e);
console.log(e.toString());
console.log(".");

e.attribute["k"] = "v";
console.log(e);
console.log(e.toString());
e.attribute["k1"] = "v2";
console.log(".");

e.content("c");
console.log(e);
console.log(e.toString());
console.log(".");

const v: Element = Element.copy(e);
console.log("v = " + v);
console.log("v = " + v.toString());
const ev: Content = new Content(v);
console.log("ev = " + ev.toString());
e.content(v);
console.log(e);
console.log(e.toString());
console.log(".");
*/
