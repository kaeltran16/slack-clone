import { combineReducers } from 'redux';
import { SET_USER, CLEAR_USER } from '../actions/types';

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
            currentUser: null,
            isLoading: false
         };
      default:
         return state;
   }
};

const rootReducer = combineReducers({
   user: userReducer
});

export default rootReducer;
