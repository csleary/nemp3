import artistSlice from 'features/artists';
import artworkSlice from 'features/artwork';
import { combineReducers } from 'redux';
import nemSlice from 'features/nem';
import paymentSlice from 'features/payment';
import playerSlice from 'features/player';
import releaseSlice from 'features/releases';
import searchSlice from 'features/search';
import toastSlice from 'features/toast';
import trackSlice from 'features/tracks';
import userSlice from 'features/user';

const appReducer = combineReducers({
  artists: artistSlice,
  artwork: artworkSlice,
  nem: nemSlice,
  payment: paymentSlice,
  player: playerSlice,
  releases: releaseSlice,
  search: searchSlice,
  toast: toastSlice,
  tracks: trackSlice,
  user: userSlice
});

const rootReducer = (state, action) => {
  if (action.type === 'user/logOut') {
    state = undefined;
  }

  return appReducer(state, action);
};

export default rootReducer;
