import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TourContextType {
  isTourOpen: boolean;
  startTour: () => void;
  closeTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isTourOpen, setIsTourOpen] = useState(false);

  const startTour = () => setIsTourOpen(true);
  const closeTour = () => setIsTourOpen(false);

  return (
    <TourContext.Provider value={{ isTourOpen, startTour, closeTour }}>
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
