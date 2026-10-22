type XmlAttributeValue = string | number | boolean | null;
type XmlAttributes = Record<string, XmlAttributeValue>;
declare class XmlElement {
    name: string;
    attribute: XmlAttributes;
    content: (string | XmlElement)[];
    parent?: XmlElement;
    constructor(name: string, attribute?: XmlAttributes, content?: (XmlElement | string)[]);
    static clone(e: XmlElement): XmlElement;
    setAttributes(attributes: XmlAttributes): this;
    lookupAttributeValue(key: string): XmlAttributeValue;
    addChild(child: XmlElement | string): this;
    toString(): string;
}
export { XmlElement };
//# sourceMappingURL=xml.d.ts.map