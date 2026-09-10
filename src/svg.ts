type AttributeValue = string | number | boolean;

function attribute(name: string, value: AttributeValue): string {
	return `${name}="${String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`;
}

function element(tag: string, attributes: string[], content?: string): string {
	const attrs = attributes.length > 0 ? ` ${attributes.join(" ")}` : "";
	return content === undefined ? `<${tag}${attrs}/>` : `<${tag}${attrs}>${content}</${tag}>`;
}

const line = element("line", [
	attribute("x1", 10),
	attribute("y1", 10),
	attribute("x2", 90),
	attribute("y2", 90),
	attribute("stroke", "black"),
	attribute("stroke-width", 1),
]);

const svg = element("svg", [
	attribute("xmlns", "http://www.w3.org/2000/svg"),
	attribute("viewBox", "0 0 100 100"),
	attribute("width", 100),
	attribute("height", 100),
], line);

console.log(`<?xml version="1.0" encoding="UTF-8"?>\n${svg}`);
