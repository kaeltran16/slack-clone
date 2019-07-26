import { SET_USER, CLEAR_USER, SET_CURRENT_CHANNEL, SET_PRIVATE_CHANNEL } from './types';

export const setUser = user => ({
   type: SET_USER,
   payload: {
      currentUser: user
   }
});

export const clearUser = () => ({
   type: CLEAR_USER
});

export const setCurrentChannel = channel => ({
   type: SET_CURRENT_CHANNEL,
   payload: {
      currentChannel: channel
   }
});

export const setPrivateChannel = isPrivate => ({
   type: SET_PRIVATE_CHANNEL,
   payload: {
      isPrivateChannel: isPrivate
   }
});
