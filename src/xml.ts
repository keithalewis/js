// xml.ts - XML helpers
/*
:!npx tsx xml.ts
*/

function escapeXml(value: string, attribute = false): string {
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
	key: string;
	value: string;
	constructor(key: string, value: string)
	{
		this.key = key;
		this.value = value;
	}
	toString(): string
	{
		return `${this.key}="${escapeXml(this.value, true)}"`;
	}
}

class Content {
	content: (Element | string)[];
	constructor(content?: (Element | string)[])
	{
		this.content = content ?? [];
	}
	toString(): string {
		return this.content.map((item) => typeof item === "string" ? escapeXml(item) : item.toString()).join("");
	}
}

class Element {
	tag: string;
	attributes: Attribute[];
	content: Content;
	constructor(tag: string, attributes?: Attribute[], content?: Content) {
		this.tag = tag;
		this.attributes = attributes ?? [];
		this.content = content ?? new Content();
	};
	toString(): string {
		const attrs = this.attributes.map((a) => " " + a.toString()).join("");
		return `<${this.tag}${attrs}${this.content ? `>${this.content.toString()}</${this.tag}>` : '/>'}`;
	}
}

export { Element };
