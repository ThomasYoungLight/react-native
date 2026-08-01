/**
 * Ring-0 demo module: the reconciler in idiomatic dynamic JS. This is the
 * bundle's fallback implementation; the app binary registers a typed native
 * port under this module's id + content hash.
 *
 * @format
 * @flow strict
 */

'use strict';

function h(type: string, props: Object, children: ?Array<Object>): Object {
  return {type, props, children};
}

function renderNode(
  level: number,
  depth: number,
  breadth: number,
  tick: number,
  index: number,
): Object {
  if (level >= depth) {
    const changing = index % 10 === 0;
    return h(
      'text',
      {
        key: index,
        content: changing ? 'item ' + index + ' t' + tick : 'item ' + index,
        color: index % 3 === 0 ? 'red' : 'blue',
        fontSize: 12 + (index % 4),
      },
      null,
    );
  }
  const children = [];
  for (let i = 0; i < breadth; i++) {
    children.push(
      renderNode(level + 1, depth, breadth, tick, index * breadth + i),
    );
  }
  let props;
  if (level % 3 === 0) {
    props = {key: index, direction: 'column', padding: 4, flex: 1};
  } else if (level % 3 === 1) {
    props = {
      key: index,
      direction: 'row',
      margin: 2,
      background: '#fff',
      opacity: 1,
    };
  } else {
    props = {
      key: index,
      width: 100 + level,
      height: 50 + level,
      overflow: 'hidden',
    };
  }
  return h(level % 2 === 0 ? 'view' : 'stack', props, children);
}

function Fiber(type: string) {
  this.type = type;
  this.props = null;
  this.child = null;
  this.sibling = null;
  this.parent = null;
  this.alternate = null;
  this.flags = 0;
}

function diffProps(oldProps: Object, newProps: Object): number {
  let changed = 0;
  for (const k in newProps) {
    if (oldProps[k] !== newProps[k]) {
      changed++;
    }
  }
  for (const k2 in oldProps) {
    if (!(k2 in newProps)) {
      changed++;
    }
  }
  return changed;
}

function reconcile(current: ?Object, element: Object, parent: ?Object): Object {
  const wip = new Fiber(element.type);
  if (current != null && current.type === element.type) {
    wip.alternate = current;
    const changed = diffProps(current.props, element.props);
    wip.props = element.props;
    wip.flags = changed > 0 ? 1 : 0;
  } else {
    wip.props = element.props;
    wip.flags = 2;
  }
  wip.parent = parent;
  const elChildren = element.children;
  if (elChildren != null) {
    let prevSibling = null;
    let oldChild = current != null ? current.child : null;
    for (let i = 0; i < elChildren.length; i++) {
      const childFiber = reconcile(oldChild, elChildren[i], wip);
      if (i === 0) {
        wip.child = childFiber;
      } else if (prevSibling != null) {
        prevSibling.sibling = childFiber;
      }
      prevSibling = childFiber;
      oldChild = oldChild != null ? oldChild.sibling : null;
    }
  }
  return wip;
}

function commit(root: Object): number {
  let effects = 0;
  let node = root;
  while (node != null) {
    if (node.flags !== 0) {
      effects++;
    }
    if (node.child != null) {
      node = node.child;
      continue;
    }
    while (node != null && node.sibling == null) {
      node = node.parent;
    }
    if (node != null) {
      node = node.sibling;
    }
  }
  return effects;
}

function runCommits(commits: number, warmup: number): number {
  let current = null;
  let totalEffects = 0;
  for (let t = 0; t < warmup + commits; t++) {
    const tree = renderNode(0, 7, 3, t, 0);
    const wip = reconcile(current, tree, null);
    const e = commit(wip);
    if (t >= warmup) {
      totalEffects += e;
    }
    current = wip;
  }
  return totalEffects;
}

module.exports = {runCommits, impl: 'interpreted-dynamic'};
