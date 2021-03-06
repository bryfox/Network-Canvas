import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { addPairingUrlToService, pairingApiProtocol, isValidAddress, isValidPort, maxPort, minPort } from '../../utils/serverAddressing';
import { Button } from '../../ui/components';

/**
 * @class Renders a form for user to manually enter Server connection info.
 */
class ServerAddressForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      error: {},
      address: props.address || '',
      port: props.port || '',
    };
  }

  onSubmit = (evt) => {
    evt.preventDefault();
    const server = addPairingUrlToService({
      addresses: [this.state.address],
      port: this.state.port,
    });
    if (server.pairingServiceUrl) {
      this.props.selectServer(server);
    } else {
      this.setState({
        error: {
          address: !isValidAddress(this.state.address),
          port: !isValidPort(this.state.port),
        },
      });
    }
  }

  setAddress(address) {
    this.clearError('address');
    this.setState({ address });
  }

  setPort(port) {
    this.clearError('port');
    this.setState({ port });
  }

  validateAddress(address) {
    const addressError = { address: address && !isValidAddress(address) };
    this.setState({ error: { ...this.state.error, ...addressError } });
  }

  validatePort(port) {
    // Currently requires port number.
    // If port is not required, then be careful of input containing '+', '-', and 'e',
    // which are valid characters in a number field (and will be displayed), but may return
    // (in target.value) as '' if they don't form a number.
    const portError = { port: !isValidPort(port) };
    this.setState({ error: { ...this.state.error, ...portError } });
  }

  clearError(name) {
    const clearedError = { [name]: null };
    this.setState({ error: { ...this.state.error, ...clearedError } });
  }

  render() {
    const { cancel } = this.props;
    const { error } = this.state;
    const inputClass = 'server-address-form__input';
    const inputErrorClass = `${inputClass} ${inputClass}--error`;
    const labelClass = 'server-address-form__label';
    const labelErrorClass = `${labelClass} ${labelClass}--error`;

    return (
      <form className="server-address-form" onSubmit={this.onSubmit}>
        <h2>Server Connection</h2>
        <p>
          Enter the address and port number of your running Server instance.
          The local network IP and port number can be found on your Server’s overview screen.
        </p>
        <fieldset className="server-address-form__fields">
          <div className="server-address-form__field">
            <p className="server-address-form__text">{pairingApiProtocol}://</p>
          </div>
          <div className="server-address-form__field">
            <input
              type="text"
              autoComplete="off"
              autoCorrect="off"
              className={error.address ? inputErrorClass : inputClass}
              id="server-address-form-input-ip"
              placeholder="192.168.99.99"
              value={this.state.address}
              onChange={evt => this.setAddress(evt.target.value)}
              onBlur={evt => this.validateAddress(evt.target.value)}
            />
            <label
              className={error.address ? labelErrorClass : labelClass}
              htmlFor="server-address-form-input-ip"
            >
              Address
            </label>
          </div>
          <div className="server-address-form__field">
            <p className="server-address-form__text">:</p>
          </div>
          <div className="server-address-form__field">
            <input
              className={error.port ? inputErrorClass : inputClass}
              id="server-address-form-input-port"
              autoComplete="off"
              autoCorrect="off"
              max={maxPort}
              min={minPort}
              type="number"
              placeholder="51001"
              size="5"
              value={this.state.port}
              onChange={evt => this.setPort(evt.target.value)}
              onBlur={evt => this.validatePort(evt.target.value)}
            />
            <label
              className={error.port ? labelErrorClass : labelClass}
              htmlFor="server-address-form-input-port"
            >
              Port
            </label>
          </div>
        </fieldset>
        {
          cancel &&
          <Button color="platinum" onClick={() => cancel()} icon="close" type="button">
            Cancel
          </Button>
        }
        <span className="server-address-form__submit">
          <Button content="Pair" type="submit" />
        </span>
      </form>
    );
  }
}

ServerAddressForm.defaultProps = {
  address: '',
  cancel: null,
  port: '',
};

ServerAddressForm.propTypes = {
  address: PropTypes.string,
  cancel: PropTypes.func.isRequired,
  port: PropTypes.string,
  selectServer: PropTypes.func.isRequired,
};

export default ServerAddressForm;
