/*
:!npx tsx xml.ts
:!npx tsc --noEmit
*/

"use strict";

// Simplified BNF grammar for XML:
//
// element ::= emptyElement | startTag content endTag
// emptyElement ::= '<' Name attributes? '/>'
// startTag ::= '<' Name attributes? '>'
// content ::= (element | text)*
// endTag ::= '</' Name '>'
//   attributes ::= attribute*
//   attribute ::= Name '=' String

// Gets converted to string.
type XmlAttributes = Record<string, any>;
function toStringXmlAttributes(obj: XmlAttributes): string {
  return Object.entries(obj)
    .map(([k, v]) => `${k}="${JSON.stringify(v)}"`)
    .join(" ");
}
console.assert(toStringXmlAttributes({}) === "");
console.log(
  toStringXmlAttributes({ a: 1, b: "two", c: true, d: null }) ===
    'a="1" b="two" c="true" d="null"',
);
//console.log(JSON.stringify({a:1, b:"two"}));

class XmlElement {
  name: string;
  attribute: XmlAttributes;
  content: (string | XmlElement)[];
  parent?: XmlElement;
  constructor(
    name: string,
    attribute: XmlAttributes = {},
    content: (XmlElement | string)[] = [],
  ) {
    this.name = name;
    this.attribute = attribute;
    this.content = content;
  }
  // Avoid references when copying.
  static clone(e: XmlElement): XmlElement {
    const clone = new XmlElement(e.name, e.attribute);
    e.content.map((c) =>
      clone.addChild(typeof c === "string" ? c : XmlElement.clone(c)),
    );

    return clone;
  }

  // add/replace attributes({k1: v1, k1: v2, ...})
  setAttributes(attributes: XmlAttributes): this {
    Object.assign(this.attribute, attributes);

    return this;
  }
  // Return attribute value given key in current or ancestors.
lookupAttributeValue(key: string) : string | undefined {
    const value = this.attribute[key];
    if (value) {
      return value;
    }
    const parent = this.parent;
    if (parent) {
      return parent.lookupAttributeValue(key);
    }

    return undefined;
  }

  // Append new content.
  addChild(child: XmlElement | string): this {
    if (typeof(child) !== "string") {
      child.parent = this;
    }
    this.content.push(child);

    return this;
  }
  
  toString(): string {
    const attributes = toStringXmlAttributes(this.attribute);
    const content = this.content
      .map((c) => (typeof c === "string" ? escapeXml(c) : c.toString()))
      .join("");
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
console.assert(new XmlElement("foo", {vb: [1,2]}).toString() === '<foo vb="1,2"/>');

console.assert(
  new XmlElement("a", { b: 'x"<&' }, ["1<2"]).toString() ===
    '<a b="x&quot;&lt;&amp;">1&lt;2</a>',
);

export { XmlElement, escapeXml };

// TODO: make idempotent?
function escapeXml(value: string, attribute = false): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(attribute ? /"/g : /$^/g, "&quot;")
    .replace(attribute ? /'/g : /$^/g, "&apos;");
}
/*
// attribute ::= Name '=' String
type AttributeValue = string | number; // convert number to string in constructor
class Attribute {
  name: string;
  value: string;

  // escape entities and convert numbers to string
  constructor(name: string, value: AttributeValue) {
    this.name = name;
    this.value = escapeXml(String(value), true);
  }
  // 'name="value"'
  toString(): string {
    return `${this.name}="${this.value}"`;
  }
}

// content ::= (element | text)*
class Content {
  content: Element | string;
  constructor(content: Element | string) {
    this.content = content;
  }
  toString(): string {
    return this.content.toString();
  }
}

// ??? class Node Element|Attribute|string|...
/*
// element ::= emptyElement | startTag content endTag
class Element {
  name: string;
  attribute: Attributes;
  contents: Content[];
  parent?: Element;

  constructor(name: string, attributes: Attributes = {}) {
    this.name = name;
    this.attribute = attributes;
    this.contents = [];
  }
  // Avoid references when copying.
  static copy(e: Element): Element {
    const copy = new Element(e.name, e.attribute);
    for (const c of e.contents) {
      copy.content(
        typeof c.content === "string" ? c.content : Element.copy(c.content),
      );
    }
    return copy;
  }
  // add/replace attributes({k1: v1, k1: v2, ...})
  attributes(as: Attributes): this {
    Object.assign(this.attribute, as);

    return this;
  }

  // Append new Content. No getContent.
  content(content: Element | string): this {
    if (typeof content !== "string") {
      content.parent = this;
    }
    this.contents.push(new Content(content));

    return this;
  }
  // Return attribute value given key in current or ancestors.
  lookupAttributeValue(key: string): AttributeValue | undefined {
    const value = this.attribute[key];
    if (value) {
      return value;
    }
    const parent = this.parent;
    if (parent) {
      return parent.lookupAttributeValue(key);
    }

    return undefined;
  }
  // element ::= emptyElement | startTag content endTag
  toString(): string {
    let attributes = "";
    for (const [k, v] of Object.entries(this.attribute)) {
      // attribute ::= Name '=' String
      attributes += ` ${k}="${v}"`;
    }
    if (this.contents.length === 0) {
      // emptyElement ::= '<' Name attributes? '/>'
      return `<${this.name}${attributes}/>`;
    } else {
      // startTag ::= '<' Name attributes? '>'
      const contents = this.contents.map((c) => c.toString()).join("");
      return `<${this.name}${attributes}>${contents}</${this.name}>`;
    }
  }
}

export { Element };
//export { Attribute, Content, Element };
*/
