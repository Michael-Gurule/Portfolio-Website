// Rehype plugin: turns a paragraph holding only an image into a <figure>.
// A Markdown image title becomes the caption: ![alt text](./images/chart.png "Caption")

type Node = {
    type: string;
    tagName?: string;
    value?: string;
    properties?: Record<string, unknown>;
    children?: Node[];
};

function toFigure(node: Node): Node | undefined {
    if (node.tagName !== 'p' || !node.children) return;
    const children = node.children.filter(child => !(child.type === 'text' && !child.value?.trim()));
    const [img] = children;
    if (children.length !== 1 || img.tagName !== 'img' || !img.properties) return;

    const caption = img.properties.title;
    delete img.properties.title;
    const figure: Node = { type: 'element', tagName: 'figure', properties: {}, children: [img] };
    if (typeof caption === 'string' && caption) {
        figure.children!.push({
            type: 'element',
            tagName: 'figcaption',
            properties: {},
            children: [{ type: 'text', value: caption }],
        });
    }
    return figure;
}

function walk(node: Node) {
    node.children?.forEach((child, i) => {
        const figure = toFigure(child);
        if (figure) node.children![i] = figure;
        else walk(child);
    });
}

export default function rehypeFigure() {
    return (tree: Node) => walk(tree);
}
