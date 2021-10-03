import {GraphState} from '../state/GraphState';
import {NodeId, NodeState} from '../state/NodeState';
import Coordinates, {isCoordinates} from '../model/Coordinates';
import {ConnectionState} from '../state/ConnectionState';
import {isNodeKind} from '../model/NodeKind.model';
import Bounds from '../model/Bounds';
import {isPortKind} from '../state/PortState';

const KNOWN_VERSIONS = ['0'];

export interface PersistedProjectState {
  projectName: string;
  docVersion: string;
  graphState: Omit<GraphState, 'temporaryConnectionPort'>;
  selection: string[];
}

export function isValidPersistedProjectState(candidate: any): candidate is PersistedProjectState {
  if (typeof candidate !== 'object') {
    return false;
  }

  const {
    projectName,
    docVersion,
    graphState,
    selection
  } = candidate;

  assertIsString(projectName, 'projectName');
  assertIsValidAppVersion(docVersion);
  assertIsValidGraphState(graphState);
  assertIsValidGraphSelection(selection, graphState);
  return true;
}

function assertIsValidAppVersion(candidate: any): void {
  if (!KNOWN_VERSIONS.includes(candidate)) {
    throw new Error('Unhandled document version ' + candidate);
  }
}

function isValidNodeOrder(nodeOrder: any, nodes: NodeState[]): Boolean {
  if (!isStringArray(nodeOrder)) {
    return false;
  }

  return nodeOrder.every(candidate => nodes.map(n => n.id).includes(candidate));
}

function assertIsValidGraphState(candidate: any): candidate is GraphState {
  if (typeof candidate !== 'object') {
    return false;
  }

  const {
    nodes,
    nodeOrder,
    connections,
    viewportOffset
  } = candidate;

  assertIsValidNodesCollection(nodes);
  assertIsValidNodeOrder(nodeOrder, Object.values(nodes));
  assertIsValidConnectionArray(connections, Object.values(nodes));

  if (!allIdsAreUnique(Object.values(nodes), connections)) {
    throw new Error('Non-unique IDs found.');
  }

  if (!isValidViewportOffset(viewportOffset)) {
    throw new Error('Invalid viewport offset.');
  }

  return true;
}

function assertIsValidNodesCollection(candidate: any): candidate is { [id: NodeId]: NodeState; } {
  assertIsObject(candidate, 'nodes');
  Object.entries(candidate).forEach(([key, item]) => assertIsValidNode(item, key));

  const allPorts = extractAllPortIds(Object.values(candidate));

  if (!isUniqueArray(allPorts)) {
    throw new Error('Found ports with non unique IDs.');
  }

  return true;
}

function assertIsValidNodeOrder(candidate: any, nodes: NodeState[]): void {
  if (!isValidNodeOrder(candidate, nodes)) {
    throw new Error('Invalid node order.');
  }
}

function assertIsValidConnectionArray(candidate: any, nodes: NodeState[]): void {
  assertIsArray(candidate, 'connections');
  candidate.forEach((c: any) => assertIsValidConnectionState(c, nodes));
}

function assertIsValidConnectionState(candidate: any, nodes: NodeState[]): void {
  if (typeof candidate !== 'object') {
    throw new Error('Expect to find a connection object in connections array.');
  }

  assertIsString(candidate.id, '[connection].id');

  if (candidate.source === candidate.target) {
    throw new Error(`A connection's source cannot be its target (id: ${candidate.id}).`);
  }

  const allPorts = extractAllPortIds(nodes);

  if (!allPorts.includes(candidate.source)) {
    throw new Error('Cannot find source port for connection ' + candidate.id);
  }

  if (!allPorts.includes(candidate.target)) {
    throw new Error('Cannot find target port for connection ' + candidate.id);
  }
}

function extractAllPortIds(nodes: NodeState[]): string[] {
  return nodes.map(n => [
    ...Object.values(n.paramPorts).map(port => port.id),
    ...n.inputPorts.map(port => port.id),
    ...n.outputPorts.map(port => port.id),
  ]).flat();
}

function isValidViewportOffset(candidate: any): candidate is Coordinates {
  return isCoordinates(candidate);
}

function isUniqueArray(candidate: any[]): boolean {
  const known: any = {};

  for (let item of candidate) {
    if (known[item]) {
      return false;
    } else {
      known[item] = true;
    }
  }

  return true;
}

function assertIsValidNode(candidate: any, candidateId: string): candidate is NodeState {
  assertIsObject(candidate, candidateId);

  const {
    id,
    kind,
    paramValues,
    display,
    name,
    inputPorts,
    outputPorts,
    paramPorts,
  } = candidate;

  assertIsString(id, `[${candidateId}].id`);

  if (!isNodeKind(kind)) {
    throw new Error(`Expect [${candidateId}].kind to have type NodeKind.`);
  }

  assertIsObject(paramValues, `[${candidateId}].paramValues`);
  assertIsObject(display, `[${candidateId}].display`);

  if (!isBounds(display.bounds)) {
    throw new Error(`Expect [${candidateId}].bounds to be a Bounds object.`);
  }

  assertIsBoolean(display.folded, `[${candidateId}].display.folded`);
  assertIsString(name, `[${candidateId}].name`);
  assertIsValidPortArray(inputPorts, `[${candidateId}].inputPorts`);
  assertIsValidPortArray(outputPorts, `[${candidateId}].outputPorts`);
  assertIsValidParamPorts(paramPorts, candidate);
  return true;
}

function assertIsValidPortArray(candidate: any, name: string): void {
  assertIsArray(candidate, name);
  candidate.forEach((item: any) => assertIsValidPortState(item, name));
}

function assertIsValidPortState(candidate: any, name: string): void {
  assertIsObject(candidate, name);

  if (!isPortKind(candidate.kind)) {
    throw new Error(`One of ${name} has invalid PortKind.`)
  }
}

function assertIsValidParamPorts(candidate: any, node: NodeState): void {
  assertIsObject(candidate, `[${node.id}].paramPorts`);
  assertIsValidPortArray(Object.values(candidate), `[${node.id}].paramPorts`);

  if (!Object.keys(candidate).every(key => hasParam(key, node))) {
    throw new Error('Found invalid param port key for node ' + node.id);
  }
}

function hasParam(name: string, node: NodeState): boolean {
  return Object.keys(node.paramValues).includes(name);
}

function isBounds(candidate: any): candidate is Bounds {
  return typeof candidate === 'object'
    && typeof candidate.x === 'number'
    && typeof candidate.y === 'number'
    && typeof candidate.width === 'number'
    && typeof candidate.height === 'number';
}

function isValidGraphSelection(selection: string[], graphState: GraphState): boolean {
  console.log(graphState);
  const nodeIds = Object.keys(graphState.nodes);
  const connectionIds = graphState.connections.map(c => c.id);
  return selection.every(item => {
    return nodeIds.includes(item) || connectionIds.includes(item);
  });
}

function allIdsAreUnique(nodes: NodeState[], connections: ConnectionState[]): boolean {
  const allIds = [
    nodes.map(n => n.id),
    connections.map(c => c.id),
  ];

  return isUniqueArray(allIds);
}

function isStringArray(candidate: any): candidate is string[] {
  if (!Array.isArray(candidate)) {
    return false;
  }

  return candidate.every((item: any) => typeof item === 'string');
}

function assertIsString(candidate: any, name: string) {
  if (typeof candidate !== 'string') {
    reportTypeError(name, 'string');
  }
}

function assertIsArray(candidate: any, name: string) {
  if (!Array.isArray(candidate)) {
    reportTypeError(name, 'Array');
  }
}

function assertIsObject(candidate: any, name: string) {
  if (typeof candidate !== 'object') {
    reportTypeError(name, 'object');
  }
}

function assertIsBoolean(candidate: any, name: string) {
  if (typeof candidate !== 'boolean') {
    reportTypeError(name, 'boolean');
  }
}

function assertIsValidGraphSelection(candidate: any, maybeGraphState: any): void {
  if (!isStringArray(candidate) || !isValidGraphSelection(candidate, maybeGraphState)) {
    throw new Error('Invalid graph selection.');
  }
}

function reportTypeError(propertyName: string, expectedType: string): void {
  reportError(`Expect ${propertyName} to have type ${expectedType}`);
}

function reportError(message: string): void {
  throw new Error(message);
}
