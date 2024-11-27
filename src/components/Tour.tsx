import React from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useTour } from '../contexts/TourContext';

const tourSteps: Step[] = [
  {
    target: '.dashboard-title',
    content: 'Welcome to ServerPulse! This is your main dashboard where you can monitor all your servers in real-time.',
    disableBeacon: true,
  },
  {
    target: '.server-grid',
    content: 'Here you can see all your monitored servers in a clean, organized grid layout.',
  },
  {
    target: '.server-card',
    content: 'Each card shows important server information including status, response time, and any error messages.',
  },
  {
    target: '.status-badge',
    content: 'The status badge indicates if a server is online (green), offline (red), or experiencing issues (yellow).',
  },
  {
    target: '.server-metrics',
    content: 'View detailed metrics like response time and last check timestamp.',
  },
  {
    target: '.refresh-button',
    content: 'Click here to manually refresh the status of all servers.',
  },
  {
    target: '.check-button',
    content: 'Use this button to check the status of an individual server.',
  }
];

const Tour: React.FC = () => {
  const { isTourOpen, closeTour } = useTour();

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      closeTour();
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={isTourOpen}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={tourSteps}
      styles={{
 
        options: {
          primaryColor: '#3b82f6',
          zIndex: 1000,
          backgroundColor: '#ffffff',
          arrowColor: '#ffffff',
          textColor: '#374151',
          
        },
        tooltip: {
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
        },
        buttonNext: {
          backgroundColor: '#3b82f6',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
        },
        buttonBack: {
          color: '#6b7280',
          marginRight: 10,
          fontSize: '0.875rem',
        },
        buttonSkip: {
          color: '#6b7280',
          fontSize: '0.875rem',
        }
      }}
    />
  );
};

export default Tour;
