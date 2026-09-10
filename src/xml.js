"use strict";
// xml.ts - XML helpers
/*
:!npx tsx xml.ts
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
// element ::= emptyElement | startTag content endTag
// emptyElement ::= '<' Name attributes? '/>'
// startTag ::= '<' Name attributes? '>'
// content ::= (element | text)*
// endTag ::= '</' Name '>'
//   attributes ::= attribute*
//   attribute ::= Name '=' String
class Attribute {
    key;
    value;
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }
    toString() {
        return `${this.key}="${escapeXml(this.value, true)}"`;
    }
}
class Content {
    content;
    constructor(content) {
        this.content = content ?? [];
    }
    toString() {
        return this.content.map((item) => typeof item === "string" ? escapeXml(item) : item.toString()).join("");
    }
}
class Element {
    tag;
    attributes;
    content;
    constructor(tag, attributes, content) {
        this.tag = tag;
        this.attributes = attributes ?? [];
        this.content = content ?? new Content();
    }
    ;
    toString() {
        const attrs = this.attributes.map((a) => " " + a.toString()).join("");
        return `<${this.tag}${attrs}${this.content ? `>${this.content.toString()}</${this.tag}>` : '/>'}`;
    }
}
exports.Element = Element;
