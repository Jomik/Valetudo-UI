import React, { Dispatch, SetStateAction } from 'react';

export const useLocalStorage = <S>(
  key: string,
  initialState: S | (() => S)
): [S, Dispatch<SetStateAction<S | null>>] => {
  const [storedValue, setStoredValue] = React.useState<S>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialState;
    } catch (error) {
      console.log(error);
      return initialState;
    }
  });

  const setValue = React.useCallback(
    (value) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          if (valueToStore === null) {
            window.localStorage.removeItem(key);
            return initialState;
          }
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          return valueToStore;
        });
      } catch (error) {
        console.log(error);
      }
    },
    [initialState, key]
  );
  return [storedValue, setValue];
};
