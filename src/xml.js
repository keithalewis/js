/*
:!npx tsx xml.ts
:!npx tsc --noEmit
*/
"use strict";
function toStringXmlAttributes(obj) {
    return Object.entries(obj)
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ");
}
console.assert(toStringXmlAttributes({}) === "");
console.assert(toStringXmlAttributes({ a: 1, b: "two", c: true, d: null }) ===
    'a="1" b="two" c="true" d="null"');
class XmlElement {
    name;
    attribute;
    content;
    parent;
    constructor(name, attribute = {}, content = []) {
        this.name = name;
        this.attribute = attribute;
        this.content = content;
    }
    // Avoid references when copying.
    static clone(e) {
        const clone = new XmlElement(e.name, e.attribute);
        e.content.map((c) => clone.addChild(typeof c === "string" ? c : XmlElement.clone(c)));
        return clone;
    }
    // add/replace attributes({k1: v1, k1: v2, ...})
    setAttributes(attributes) {
        Object.assign(this.attribute, attributes);
        return this;
    }
    // Return attribute value given key in current or ancestors.
    lookupAttributeValue(key) {
        const value = this.attribute[key];
        if (value) {
            return value;
        }
        const parent = this.parent;
        if (parent) {
            return parent.lookupAttributeValue(key);
        }
        return null;
    }
    // Append new content.
    addChild(child) {
        if (typeof (child) !== "string") {
            child.parent = this;
        }
        this.content.push(child);
        return this;
    }
    toString() {
        const attributes = toStringXmlAttributes(this.attribute);
        const content = this.content.map((c) => String(c)).join("");
        let tag = `<${this.name}`;
        if (attributes.length) {
            tag += ` ${attributes}`;
        }
        return content.length ? `${tag}>${content}</${this.name}>` : `${tag}/>`;
    }
}
console.assert(new XmlElement("a", {}, ["b"]).toString() === "<a>b</a>");
console.assert(new XmlElement("a", { b: "c" }).toString() === '<a b="c"/>');
console.assert(new XmlElement("a", {}, ["b"]).toString() === "<a>b</a>");
export { XmlElement };
// TODO: make idempotent?
function escapeXml(value, attribute = false) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(attribute ? /"/g : /$^/g, "&quot;")
        .replace(attribute ? /'/g : /$^/g, "&apos;");
}
//# sourceMappingURL=xml.js.map