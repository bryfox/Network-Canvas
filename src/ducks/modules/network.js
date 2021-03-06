import { reject, findIndex, isMatch, omit } from 'lodash';

import uuidv4 from '../../utils/uuid';

// Property name for the primary key for nodes
export const nodePrimaryKeyProperty = '_uid';

// Property name for node "model" properties
export const nodeAttributesProperty = 'attributes';

// Property names passed to user worker scripts
export const primaryKeyPropertyForWorker = 'networkCanvasId';
export const nodeTypePropertyForWorker = 'networkCanvasType';

export const ADD_NODES = 'ADD_NODES';
export const REMOVE_NODE = 'REMOVE_NODE';
export const UPDATE_NODE = 'UPDATE_NODE';
export const TOGGLE_NODE_ATTRIBUTES = 'TOGGLE_NODE_ATTRIBUTES';
export const ADD_EDGE = 'ADD_EDGE';
export const TOGGLE_EDGE = 'TOGGLE_EDGE';
export const REMOVE_EDGE = 'REMOVE_EDGE';
export const SET_EGO = 'SET_EGO';
export const UNSET_EGO = 'UNSET_EGO';

// Initial network model structure
const initialState = {
  ego: {},
  nodes: [],
  edges: [],
};

function flipEdge(edge) {
  return { from: edge.to, to: edge.from, type: edge.type };
}

function edgeExists(edges, edge) {
  return (
    findIndex(edges, edge) !== -1 ||
    findIndex(edges, flipEdge(edge)) !== -1
  );
}

/**
 * All generated data is stored inside an 'attributes' property on the node
 */
export const getNodeAttributes = node => node[nodeAttributesProperty] || {};

/**
 * existingNodes - Existing network.nodes
 * netNodes - nodes to be added to the network
 * additionalProperties - static props shared to add to each member of newNodes
*/
function getNodesWithBatchAdd(existingNodes, newNodes, additionalProperties = {}) {
  // Create a function to create a UUID and merge node attributes
  const withModelandAttributeData = newNode => ({
    ...additionalProperties,
    [nodePrimaryKeyProperty]: uuidv4(),
    ...newNode, // second to prevent overwriting existing node UUID (e.g., assigned to externalData)
    [nodeAttributesProperty]: {
      ...additionalProperties[nodeAttributesProperty],
      ...newNode[nodeAttributesProperty],
    },
  });

  return existingNodes.concat(newNodes.map(withModelandAttributeData));
}

/**
 * @param {Array} nodes - the current state.nodes
 * @param {Object} updatingNode - the node to be updated. Will match on _uid.
 * @param {Object} nodeAttributeData - additional attributes to update the node with.
 *                                   If null, then the updatingNode's `attributes` property
 *                                   will overwrite the original node's. Use this to perform
 *                                   a 'full' update, but ensure the entire updated node is
 *                                   passed as `updatingNode`.
 */
function getUpdatedNodes(nodes, updatingNode, nodeAttributeData = null) {
  return nodes.map((node) => {
    if (node[nodePrimaryKeyProperty] !== updatingNode[nodePrimaryKeyProperty]) { return node; }

    const updatedNode = {
      ...node,
      ...updatingNode,
      [nodePrimaryKeyProperty]: node[nodePrimaryKeyProperty],
    };

    if (nodeAttributeData) {
      updatedNode[nodeAttributesProperty] = {
        ...node[nodeAttributesProperty],
        ...updatingNode[nodeAttributesProperty],
        ...nodeAttributeData,
      };
    }

    return updatedNode;
  });
}

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ADD_NODES: {
      return {
        ...state,
        nodes: getNodesWithBatchAdd(state.nodes, action.nodes, action.additionalProperties),
      };
    }
    /**
     * TOGGLE_NODE_ATTRIBUTES
     */
    case TOGGLE_NODE_ATTRIBUTES: {
      const updatedNodes = state.nodes.map((node) => {
        if (node[nodePrimaryKeyProperty] !== action[nodePrimaryKeyProperty]) {
          return node;
        }

        // If the node's attrs contain the same key/vals, remove them
        if (isMatch(node[nodeAttributesProperty], action.attributes)) {
          const omittedKeys = Object.keys(action.attributes);
          const nestedProps = omittedKeys.map(key => `${nodeAttributesProperty}.${key}`);
          return omit(node, nestedProps);
        }

        // Otherwise, add/update
        return {
          ...node,
          [nodeAttributesProperty]: {
            ...node[nodeAttributesProperty],
            ...action.attributes,
          },
        };
      });

      return {
        ...state,
        nodes: updatedNodes,
      };
    }
    case UPDATE_NODE: {
      return {
        ...state,
        nodes: getUpdatedNodes(state.nodes, action.node, action.additionalProperties),
      };
    }
    case REMOVE_NODE: {
      const removenodePrimaryKeyProperty = action[nodePrimaryKeyProperty];
      return {
        ...state,
        nodes: reject(state.nodes, node =>
          node[nodePrimaryKeyProperty] === removenodePrimaryKeyProperty),
        edges: reject(state.edges, edge =>
          edge.from === removenodePrimaryKeyProperty || edge.to === removenodePrimaryKeyProperty),
      };
    }
    case ADD_EDGE:
      if (edgeExists(state.edges, action.edge)) { return state; }
      return {
        ...state,
        edges: [...state.edges, action.edge],
      };
    case TOGGLE_EDGE:
      // remove edge if it exists, add it if it doesn't
      if (edgeExists(state.edges, action.edge)) {
        return {
          ...state,
          edges: reject(reject(state.edges, action.edge), flipEdge(action.edge)),
        };
      }
      return {
        ...state,
        edges: [...state.edges, action.edge],
      };
    case REMOVE_EDGE:
      if (edgeExists(state.edges, action.edge)) {
        return {
          ...state,
          edges: reject(reject(state.edges, action.edge), flipEdge(action.edge)),
        };
      }
      return state;
    default:
      return state;
  }
}

/**
 * @namespace NetworkActionCreators
 */
const actionCreators = {};

const actionTypes = {
  ADD_NODES,
  UPDATE_NODE,
  TOGGLE_NODE_ATTRIBUTES,
  REMOVE_NODE,
  ADD_EDGE,
  TOGGLE_EDGE,
  REMOVE_EDGE,
  SET_EGO,
  UNSET_EGO,
};

export {
  actionCreators,
  actionTypes,
};
