import {NodeModel} from '../models/NodeModel';
import {AudioGraphModel, NodeModels} from '../models/AudioGraphModel';
import Coordinates, {isCoordinates} from '../models/Coordinates';
import {isPortKind} from '../models/PortModel';
import Bounds from '../models/Bounds';
import {ConnectionModel} from '../models/ConnectionModel';
import {KNOWN_DOC_VERSIONS, ProjectDocument} from '../ProjectDocument';
import {isNodeKind} from '../models/NodeKind';

export function isValidProjectDocument(candidate: any): candidate is ProjectDocument {
  if (typeof candidate !== 'object') {
    return false;
  }

  const {
    projectName,
    docVersion,
    audioGraph,
    selection
  } = candidate;

  assertIsString(projectName, 'projectName');
  assertIsValidAppVersion(docVersion);
  assertIsValidGraphModel(audioGraph);
  assertIsValidGraphSelection(selection, audioGraph);
  return true;
}

function assertIsValidAppVersion(candidate: any): void {
  if (!KNOWN_DOC_VERSIONS.includes(candidate)) {
    throw new Error('Unhandled document version ' + candidate);
  }
}

function isValidNodeOrder(nodeOrder: any, nodes: NodeModel[]): Boolean {
  if (!isStringArray(nodeOrder)) {
    return false;
  }

  return nodeOrder.every(candidate => nodes.map(n => n.id).includes(candidate));
}

function assertIsValidGraphModel(candidate: any): candidate is AudioGraphModel {
  if (typeof candidate !== 'object') {
    return false;
  }

  const {
    nodes,
    nodeOrder,
    connections,
    viewportOffset
  } = candidate;

  assertIsValidNodeModels(nodes);
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

function assertIsValidNodeModels(candidate: any): candidate is NodeModels {
  assertIsObject(candidate, 'nodes');
  Object.entries(candidate).forEach(([key, item]) => assertIsValidNode(item, key));

  const allPorts = extractAllPortIds(Object.values(candidate));

  if (!isUniqueArray(allPorts)) {
    throw new Error('Found ports with non unique IDs.');
  }

  return true;
}

function assertIsValidNodeOrder(candidate: any, nodes: NodeModel[]): void {
  if (!isValidNodeOrder(candidate, nodes)) {
    throw new Error('Invalid node order.');
  }
}

function assertIsValidConnectionArray(candidate: any, nodes: NodeModel[]): void {
  assertIsArray(candidate, 'connections');
  candidate.forEach((c: any) => assertIsValidConnection(c, nodes));
}

function assertIsValidConnection(candidate: any, nodes: NodeModel[]): void {
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

function extractAllPortIds(nodes: NodeModel[]): string[] {
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

function assertIsValidNode(candidate: any, candidateId: string): candidate is NodeModel {
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
  candidate.forEach((item: any) => assertIsValidPort(item, name));
}

function assertIsValidPort(candidate: any, name: string): void {
  assertIsObject(candidate, name);

  if (!isPortKind(candidate.kind)) {
    throw new Error(`One of ${name} has invalid PortKind.`)
  }
}

function assertIsValidParamPorts(candidate: any, node: NodeModel): void {
  assertIsObject(candidate, `[${node.id}].paramPorts`);
  assertIsValidPortArray(Object.values(candidate), `[${node.id}].paramPorts`);

  if (!Object.keys(candidate).every(key => hasParam(key, node))) {
    throw new Error('Found invalid param port key for node ' + node.id);
  }
}

function hasParam(name: string, node: NodeModel): boolean {
  return Object.keys(node.paramValues).includes(name);
}

function isBounds(candidate: any): candidate is Bounds {
  return typeof candidate === 'object'
    && typeof candidate.x === 'number'
    && typeof candidate.y === 'number'
    && typeof candidate.width === 'number'
    && typeof candidate.height === 'number';
}

function isValidGraphSelection(selection: string[], audioGraph: AudioGraphModel): boolean {
  const nodeIds = Object.keys(audioGraph.nodes);
  const connectionIds = audioGraph.connections.map(c => c.id);
  return selection.every(item => {
    return nodeIds.includes(item) || connectionIds.includes(item);
  });
}

function allIdsAreUnique(nodes: NodeModel[], connections: ConnectionModel[]): boolean {
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

function assertIsValidGraphSelection(candidate: any, maybeGraph: any): void {
  if (!isStringArray(candidate) || !isValidGraphSelection(candidate, maybeGraph)) {
    throw new Error('Invalid graph selection.');
  }
}

function reportTypeError(propertyName: string, expectedType: string): void {
  reportError(`Expect ${propertyName} to have type ${expectedType}`);
}

function reportError(message: string): void {
  throw new Error(message);
}
