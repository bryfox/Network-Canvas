import { filter, differenceBy } from 'lodash';
import { nodePrimaryKeyProperty } from '../ducks/modules/network';

const nodeIncludesAttributes = (network, attributes) => {
  const nodes = filter(network.nodes, attributes);

  return {
    ...network, // TODO: filter edge etc.
    nodes,
  };
};

const difference = (source, target) => {
  const nodes = differenceBy(source.nodes, target.nodes, nodePrimaryKeyProperty);

  return {
    ...source, // TODO: filter edge etc.
    nodes,
  };
};

// TODO: combine edge etc.
const join = (networkA, networkB) => ({
  ...networkA,
  edges: [...networkA.edges, ...networkB.edges],
  nodes: [...networkA.nodes, ...networkB.nodes],
});

export {
  nodeIncludesAttributes,
  difference,
  join,
};

export default {
  nodeIncludesAttributes,
  difference,
  join,
};
