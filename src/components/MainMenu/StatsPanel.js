import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '../../ui/components';

const StatsPanel = ({ onFinishInterview }) => (
  <div className="main-menu-stats-panel">
    <h4>Session Information</h4>
    <Button onClick={onFinishInterview}>Finish Interview</Button>
  </div>
);

StatsPanel.propTypes = {
  onFinishInterview: PropTypes.func.isRequired,
};

export default StatsPanel;
