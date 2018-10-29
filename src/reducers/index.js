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
            ...state,
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

const initialChannelState = {
   currentChannel: null
};

const channelReducer = (state = initialChannelState, action) => {
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
   channel: channelReducer
});

export default rootReducer;
