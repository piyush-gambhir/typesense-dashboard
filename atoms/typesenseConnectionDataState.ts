import { atom } from 'recoil';

import { getLocalStorageData } from '@/lib/utils/localStorage';

const getInitialTypesenseConnectionState = () => {
  if (typeof window !== 'undefined') {
    const typesenseConnectionState = getLocalStorageData(
      'typesenseConnectionData',
    );

    if (typesenseConnectionState) {
      return typesenseConnectionState;
    }
  }
  return {
    typesenseHost: '',
    typesensePort: '',
    typesenseProtocol: 'http',
    typesenseApiKey: '',
  };
};

export const typesenseConnectionDataState = atom({
  key: 'typesenseConnectionDataState',
  default: getInitialTypesenseConnectionState(),
});
