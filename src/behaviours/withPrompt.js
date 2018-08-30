import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';

import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import { getPromptForCurrentSession } from '../selectors/session';

export default function withPrompt(WrappedComponent) {
  class WithPrompt extends Component {
    prompts() {
      return this.props.stage.prompts;
    }

    promptsCount() {
      return this.prompts().length;
    }

    isFirstPrompt = () => this.props.promptIndex === 0;

    isLastPrompt = () => this.props.promptIndex === (this.promptsCount() - 1);

    prompt() {
      return this.prompts() && this.prompts()[this.props.promptIndex];
    }

    promptForward = () => {
      this.props.updatePrompt(
        (this.promptsCount() + this.props.promptIndex + 1) % this.promptsCount(),
      );
    }

    promptBackward = () => {
      this.props.updatePrompt(
        (this.promptsCount() + this.props.promptIndex - 1) % this.promptsCount(),
      );
    }

    render() {
      const { promptIndex, ...rest } = this.props;

      return (
        <WrappedComponent
          prompt={this.prompt()}
          promptForward={this.promptForward}
          promptBackward={this.promptBackward}
          isLastPrompt={this.isLastPrompt}
          isFirstPrompt={this.isFirstPrompt}
          {...rest}
        />
      );
    }
  }
  WithPrompt.propTypes = {
    stage: PropTypes.object.isRequired,
    promptIndex: PropTypes.number,
    updatePrompt: PropTypes.func.isRequired,
  };

  WithPrompt.defaultProps = {
    promptIndex: 0,
  };

  function mapStateToProps(state, ownProps) {
    return {
      promptIndex: ownProps.promptId || getPromptForCurrentSession(state),
    };
  }

  function mapDispatchToProps(dispatch) {
    return {
      updatePrompt: bindActionCreators(sessionsActions.updatePrompt, dispatch),
    };
  }

  return connect(mapStateToProps, mapDispatchToProps)(WithPrompt);
}
