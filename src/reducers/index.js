import { combineReducers } from 'redux';
import { SET_USER, CLEAR_USER, SET_CURRENT_CHANNEL } from '../actions/types';

const initialState = {
   currentUser: null,
   isLoading: true
};

const userReducer = (state = initialState, action) => {
   switch (action.type) {
      case SET_USER:
         return {
            currentUser: action.payload.currentUser,
            isLoading: false
         };
      case CLEAR_USER:
         return {
            ...state,
            isLoading: false
         };
      default:
         return state;
   }
};

const channelReducers = (state = { currentChannel: null }, action) => {
   switch (action.type) {
      case SET_CURRENT_CHANNEL:
         return {
            ...state,
            currentChannel: action.payload.currentChannel
         };
      default:
         return state;
   }
};

const rootReducer = combineReducers({
   user: userReducer,
   channel: channelReducers
});

export default rootReducer;
