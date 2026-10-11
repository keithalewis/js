type AttributeValue = string | number;
type Attributes = Record<string, AttributeValue>;
declare class Content {
    content: Element | string;
    constructor(content: Element | string);
    toString(): string;
}
declare class Element {
    name: string;
    attribute: Attributes;
    contents: Content[];
    parent?: Element;
    constructor(name: string, attributes?: Attributes);
    static copy(e: Element): Element;
    attributes(as: Attributes): this;
    content(content: Element | string): this;
    lookupAttributeValue(key: string): AttributeValue | undefined;
    toString(): string;
}
export { Element };
//# sourceMappingURL=xml.d.ts.map