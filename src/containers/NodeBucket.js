import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import Node from './Node';
import { makeGetNextUnplacedNode, makeGetSociogramOptions } from '../selectors/sociogram';
import { DragSource, DropObstacle } from '../behaviours/DragAndDrop';

import { NO_SCROLL } from '../behaviours/DragAndDrop/DragManager';
import { nodePrimaryKeyProperty } from '../ducks/modules/network';

const EnhancedNode = DragSource(Node);

class NodeBucket extends PureComponent {
  static propTypes = {
    allowPositioning: PropTypes.bool,
    node: PropTypes.object,
  };

  static defaultProps = {
    allowPositioning: true,
    node: null,
  };

  render() {
    const {
      allowPositioning,
      node,
    } = this.props;

    if (!allowPositioning || !node) { return (<div />); }

    return (
      <div className="node-bucket">
        { node &&
          <EnhancedNode
            key={node[nodePrimaryKeyProperty]}
            meta={() => ({ ...node, itemType: 'POSITIONED_NODE' })}
            scrollDirection={NO_SCROLL}
            {...node}
          />
        }
      </div>
    );
  }
}

function makeMapStateToProps() {
  const getNextUnplacedNode = makeGetNextUnplacedNode();
  const getSociogramOptions = makeGetSociogramOptions();

  return function mapStateToProps(state, props) {
    return {
      node: getNextUnplacedNode(state, props),
      ...getSociogramOptions(state, props),
    };
  };
}

export { NodeBucket };

export default compose(
  DropObstacle,
  connect(makeMapStateToProps),
)(NodeBucket);
