import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Edge } from '../../components';
import { makeDisplayEdgesForPrompt } from '../../selectors/sociogram';

const viewBoxScale = 100;

export class EdgeLayout extends PureComponent {
  static propTypes = {
    displayEdges: PropTypes.array,
  };

  static defaultProps = {
    displayEdges: [],
  };

  renderEdge = ({ key, from, to, type }) => (
    <Edge key={key} from={from} to={to} type={type} viewBoxScale={viewBoxScale} />
  );

  render() {
    const { displayEdges } = this.props;

    return (
      <div className="edge-layout">
        <svg viewBox={`0 0 ${viewBoxScale} ${viewBoxScale}`} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          { displayEdges.map(this.renderEdge) }
        </svg>
      </div>
    );
  }
}

function makeMapStateToProps() {
  const displayEdgesForPrompt = makeDisplayEdgesForPrompt();
  return function mapStateToProps(state, props) {
    return {
      displayEdges: displayEdgesForPrompt(state, props),
    };
  };
}

export default connect(makeMapStateToProps)(EdgeLayout);
