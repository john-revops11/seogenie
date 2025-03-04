
// API integration events and utilities

export const API_CHANGE_EVENT = "api-integration-change";

export type ApiChangeAction = 'add' | 'update' | 'remove';

export interface ApiChangeEvent {
  apiId: string;
  action: ApiChangeAction;
}

export const broadcastApiChange = (apiId: string, action: ApiChangeAction) => {
  const event = new CustomEvent(API_CHANGE_EVENT, { 
    detail: { apiId, action } 
  });
  window.dispatchEvent(event);
};

export const listenToApiChanges = (
  callback: (event: CustomEvent<ApiChangeEvent>) => void
): () => void => {
  const typedCallback = (event: Event) => {
    callback(event as CustomEvent<ApiChangeEvent>);
  };
  
  window.addEventListener(API_CHANGE_EVENT, typedCallback);
  
  return () => {
    window.removeEventListener(API_CHANGE_EVENT, typedCallback);
  };
};
