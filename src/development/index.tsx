import { TextField } from '@material-ui/core';
import { Server } from 'miragejs/server';
import React from 'react';
import { useQueryClient } from 'react-query';
import { setValetudoBaseURL } from '../api/client';
import { useLocalStorage } from '../hooks';
import { makeServer } from './server';

const isValidURL = (str: string): boolean => {
  const pattern = new RegExp(
    '^(https?:\\/\\/)' + // required protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*', // port and path
    'i'
  ); // fragment locator
  return !!pattern.test(str);
};

const DevControls = (): JSX.Element => {
  const queryClient = useQueryClient();
  const [baseURL, setBaseURL] = useLocalStorage<string | null>('BaseURL', null);
  const mirageServer = React.useRef<Server>();

  React.useEffect(() => {
    if (baseURL === null) {
      if (mirageServer.current === undefined) {
        mirageServer.current = makeServer('development');
      }

      return;
    }

    if (mirageServer.current !== undefined) {
      mirageServer.current.shutdown();
      mirageServer.current = undefined;
    }

    setValetudoBaseURL(baseURL);
    queryClient.invalidateQueries();
  }, [baseURL, queryClient]);

  const handleBaseUrlChange = React.useCallback<
    React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>
  >(
    (event) => {
      const { value } = event.target;
      if (!isValidURL(value)) {
        setBaseURL(null);
        return;
      }
      setBaseURL(value);
    },
    [setBaseURL]
  );

  return (
    <TextField
      label="BaseURL"
      variant="outlined"
      margin="dense"
      defaultValue={baseURL}
      onBlur={handleBaseUrlChange}
      color="secondary"
    />
  );
};

export default DevControls;
