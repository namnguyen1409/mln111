
export interface LayoutNode {
    id: string;
    type: string;
    x: number;
    y: number;
    [key: string]: any;
}

export interface LayoutConnection {
    from: string;
    to: string;
}

export function autoLayout<T extends LayoutNode>(nodes: T[], connections: LayoutConnection[]): T[] {
    if (nodes.length === 0) return [];

    const nodeMap = new Map<string, T>(nodes.map(n => [n.id, { ...n }]));
    const childrenMap = new Map<string, string[]>();

    connections.forEach(conn => {
        const children = childrenMap.get(conn.from) || [];
        children.push(conn.to);
        childrenMap.set(conn.from, children);
    });

    const root = nodes.find(n => n.type === 'root') || nodes[0];
    const centerX = 500;
    const centerY = 350;
    const padding = 60; // Safe zone to avoid UI overlap

    const positioned = new Set<string>();

    function positionRadial(nodeId: string, x: number, y: number, startAngle: number, endAngle: number, depth: number) {
        const node = nodeMap.get(nodeId);
        if (!node || positioned.has(nodeId)) return;

        // Clamp to safe area
        node.x = Math.max(padding, Math.min(1000 - padding, x));
        node.y = Math.max(padding + 20, Math.min(700 - padding, y)); // Extra top padding for title
        positioned.add(nodeId);

        const children = childrenMap.get(nodeId) || [];
        if (children.length === 0) return;

        // Smaller radius as we go deeper
        const radius = depth === 0 ? 160 : (depth === 1 ? 120 : 100);
        const angleStep = (endAngle - startAngle) / children.length;

        children.forEach((childId, index) => {
            const angle = startAngle + (angleStep * index) + (angleStep / 2);
            const childX = x + Math.cos(angle) * radius;
            const childY = y + Math.sin(angle) * radius;

            const nextStart = depth === 0 ? angle - (angleStep / 2) : startAngle + (angleStep * index);
            const nextEnd = depth === 0 ? angle + (angleStep / 2) : startAngle + (angleStep * (index + 1));

            positionRadial(childId, childX, childY, nextStart, nextEnd, depth + 1);
        });
    }

    positionRadial(root.id, centerX, centerY, 0, 2 * Math.PI, 0);

    // Position unreached nodes in a grid at the bottom if any
    let unreachedX = 100;
    let unreachedY = 620;
    nodeMap.forEach((node, id) => {
        if (!positioned.has(id)) {
            node.x = unreachedX;
            node.y = unreachedY;
            unreachedX += 120;
            if (unreachedX > 900) {
                unreachedX = 50;
                unreachedY += 80;
            }
        }
    });

    return Array.from(nodeMap.values());
}
