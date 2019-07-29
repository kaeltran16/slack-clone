import {
  SET_USER,
  CLEAR_USER,
  SET_CURRENT_CHANNEL,
  SET_PRIVATE_CHANNEL,
  SET_USER_POSTS,
  SET_COLORS
} from './types';

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

export const setUserPosts = userPosts => ({
  type: SET_USER_POSTS,
  payload: {
    userPosts
  }
});

export const setColors = (primaryColor, secondaryColor) => ({
  type: SET_COLORS,
  payload: {
    primaryColor,
    secondaryColor
  }
});
