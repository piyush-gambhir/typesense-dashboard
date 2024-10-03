export const getSessionStorageData = (key: string) => {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
  return null;
};

export const setSessionStorageData = (key: string, data: any) => {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    sessionStorage.setItem(key, JSON.stringify(data));
  }
};
