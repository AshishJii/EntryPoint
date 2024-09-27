import { createContext, useContext } from 'react';

const RegistrationContext = createContext();

export const useRegistrationContext = () => {
    return useContext(RegistrationContext);
  };

export { RegistrationContext };