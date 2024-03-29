import { createSlice, nanoid } from '@reduxjs/toolkit';
import { toastError, toastSuccess } from 'features/toast';
import axios from 'axios';
const defaultReleaseState = { artwork: {}, releaseDate: '', tags: [], trackList: [] };

const releaseSlice = createSlice({
  name: 'releases',
  initialState: {
    activeRelease: defaultReleaseState,
    artist: {},
    artworkUploading: false,
    artworkUploadProgress: 0,
    isLoading: false,
    catalogue: [],
    catalogueLimit: 12,
    catalogueSkip: 0,
    collection: [],
    formatExists: {},
    paymentAddress: '',
    priceInXem: '',
    reachedEndOfCat: false,
    releaseIdsForDeletion: {},
    userFavourites: [],
    userReleases: [],
    favCounts: {},
    playCounts: {},
    userWishList: [],
    versions: {}
  },
  reducers: {
    clearActiveRelease(state) {
      state.activeRelease = defaultReleaseState;
    },

    removeRelease(state, action) {
      if (state.userReleases) state.userReleases = state.userReleases.filter(release => release._id !== action.payload);
    },

    setReleasePurchaseInfo(state, action) {
      state.activeRelease = action.payload.release;
      state.paymentAddress = action.payload.paymentInfo.paymentAddress;
      state.paymentHash = action.payload.paymentInfo.paymentHash;
      state.priceInXem = action.payload.price;
    },

    setArtistCatalogue(state, action) {
      state.artist = action.payload;
      state.isLoading = false;
    },

    setArtworkUploading(state, action) {
      state.artworkUploading = action.payload;
    },

    setArtworkUploadProgress(state, action) {
      state.artworkUploadProgress = action.payload;
    },

    setCatalogue(state, action) {
      const { catalogue, isPaging } = action.payload;
      const reachedEndOfCat = catalogue.length < state.catalogueLimit ? true : false;
      state.catalogue = isPaging ? [...state.catalogue, ...catalogue] : catalogue;
      state.catalogueSkip = isPaging ? state.catalogueSkip + state.catalogueLimit : 0;
      state.reachedEndOfCat = reachedEndOfCat;
    },

    setCollection(state, action) {
      state.collection = action.payload;
    },

    setActiveRelease(state, action) {
      state.activeRelease = action.payload;
    },

    setFormatExists(state, action) {
      const { exists, format, releaseId } = action.payload;
      state.formatExists = { ...state.formatExists, [releaseId]: { [format]: exists } };
    },

    setIsLoading(state, action) {
      state.isLoading = action.payload;
    },

    setReleaseIdsForDeletion(state, action) {
      const { releaseId, isDeleting } = action.payload;
      state.releaseIdsForDeletion = { ...state.releaseIdsForDeletion, [releaseId]: isDeleting };
    },

    setUserFavourites(state, action) {
      state.userFavourites = action.payload;
    },

    setUserReleases(state, action) {
      state.userReleases = action.payload;
    },

    setUserReleaseFavs(state, action) {
      action.payload.forEach(rel => {
        state.favCounts[rel._id] = rel.sum;
      });
    },

    setUserReleasePlays(state, action) {
      action.payload.forEach(rel => {
        state.playCounts[rel._id] = rel.sum;
      });
    },

    setUserWishList(state, action) {
      state.userWishList = action.payload;
    },

    updateTrackStatus(state, action) {
      const { releaseId, trackId, status } = action.payload;
      const currentId = state.activeRelease?._id;

      if (!currentId || currentId === releaseId) {
        state.activeRelease.trackList = state.activeRelease.trackList.map(prevTrack =>
          prevTrack._id === trackId ? { ...prevTrack, status } : prevTrack
        );

        state.versions = { ...state.versions, [releaseId]: nanoid(8) };
      }
    },

    updateUserReleases(state, action) {
      state.isLoading = false;
      state.userReleases = state.userReleases.map(release => {
        if (release._id === action.payload._id) return action.payload;
        return release;
      });
    }
  }
});

const addNewRelease = () => async dispatch => {
  try {
    dispatch(clearActiveRelease());
    const res = await axios.post('/api/release');
    if (res.data.warning) return res.data;
    dispatch(setActiveRelease(res.data));
  } catch (error) {
    dispatch(toastError(error.response?.data.error));
  }
};

const deleteRelease = (releaseId, releaseTitle = 'release') => async (dispatch, getState) => {
  try {
    if (getState().releases.releaseIdsForDeletion[releaseId]) {
      dispatch(removeRelease(releaseId));
      await axios.delete(`/api/release/${releaseId}`);
      dispatch(toastSuccess(`Successfully deleted ${releaseTitle}.`));
      dispatch(setReleaseIdsForDeletion({ releaseId, isDeleting: false }));
    } else {
      dispatch(setReleaseIdsForDeletion({ releaseId, isDeleting: true }));
    }
  } catch (error) {
    dispatch(toastError(error.response.data.error));
  }
};

const fetchArtistCatalogue = (artistId = null, artistSlug = null) => async dispatch => {
  dispatch(setIsLoading(true));
  const res = await axios.get(`/api/catalogue/${artistSlug || artistId}`);
  dispatch(setArtistCatalogue(res.data));
};

const fetchCatalogue = ({ catalogueLimit, catalogueSkip, sortBy, sortOrder, isPaging = false }) => async dispatch => {
  try {
    const res = await axios.get('/api/catalogue/', {
      params: {
        catalogueLimit,
        catalogueSkip: isPaging ? catalogueSkip + catalogueLimit : 0,
        sortBy,
        sortOrder
      }
    });
    dispatch(setCatalogue({ catalogue: res.data, isPaging }));
  } catch (error) {
    dispatch(setIsLoading(false));
    dispatch(toastError(error.response.data.error));
  }
};

const fetchCollection = () => async dispatch => {
  try {
    const res = await axios.get('/api/user/collection/');
    dispatch(setCollection(res.data));
  } catch (error) {
    dispatch(toastError(error.response.data.error));
  }
};

const fetchRelease = releaseId => async dispatch => {
  try {
    const res = await axios.get(`/api/release/${releaseId}`);
    dispatch(setActiveRelease(res.data.release));
  } catch (error) {
    dispatch(toastError('Release currently unavailable.'));
    return error.response.data;
  }
};

const fetchUserRelease = releaseId => async dispatch => {
  const res = await axios.get(`/api/user/release/${releaseId}`);
  dispatch(setActiveRelease(res.data));
};

const fetchUserReleases = () => async dispatch => {
  const res = await axios.get('/api/user/releases');
  dispatch(setUserReleases(res.data));
};

const fetchUserReleasesFavCounts = () => async dispatch => {
  const res = await axios.get('/api/user/releases/favourites');
  dispatch(setUserReleaseFavs(res.data));
};

const fetchUserReleasesPlayCounts = () => async dispatch => {
  const res = await axios.get('/api/user/plays');
  dispatch(setUserReleasePlays(res.data));
};

const fetchUserFavourites = () => async dispatch => {
  try {
    const res = await axios.get('/api/user/favourites');
    if (res.data) dispatch(setUserFavourites(res.data));
  } catch (error) {
    dispatch(toastError(error.response.data.error));
  }
};

const fetchUserWishList = () => async dispatch => {
  try {
    const res = await axios.get('/api/user/wishlist');
    if (res.data) dispatch(setUserWishList(res.data));
  } catch (error) {
    dispatch(toastError(error.response.data.error));
  }
};

const publishStatus = releaseId => async dispatch => {
  try {
    const res = await axios.patch(`/api/release/${releaseId}`);
    if (res.data.error) return dispatch(toastError(res.data.error));
    dispatch(updateUserReleases(res.data));
    return true;
  } catch (error) {
    dispatch(toastError(error.response.data.error));
  }
};

const purchaseRelease = releaseId => async dispatch => {
  try {
    const res = await axios.get(`/api/release/purchase/${releaseId}`);
    if (res.data.error) dispatch(toastError(res.data.error));
    dispatch(setReleasePurchaseInfo(res.data));
  } catch (error) {
    dispatch(toastError(error.response.data.error));
  }
};

const updateRelease = values => async dispatch => {
  try {
    const res = await axios.put('/api/release', values);
    dispatch(setActiveRelease(res.data));
  } catch (error) {
    dispatch(toastError(error.response.data.error));
  }
};

export const {
  clearActiveRelease,
  removeRelease,
  setActiveRelease,
  setArtistCatalogue,
  setArtworkUploading,
  setArtworkUploadProgress,
  setCatalogue,
  setCollection,
  setFormatExists,
  setIsLoading,
  setReleaseIdsForDeletion,
  setReleasePurchaseInfo,
  setUserFavourites,
  setUserReleaseFavs,
  setUserReleasePlays,
  setUserReleases,
  setUserWishList,
  updateTrackStatus,
  updateUserReleases
} = releaseSlice.actions;

export {
  addNewRelease,
  deleteRelease,
  fetchArtistCatalogue,
  fetchCatalogue,
  fetchCollection,
  fetchRelease,
  fetchUserFavourites,
  fetchUserWishList,
  fetchUserRelease,
  fetchUserReleases,
  fetchUserReleasesFavCounts,
  fetchUserReleasesPlayCounts,
  publishStatus,
  purchaseRelease,
  updateRelease
};

export default releaseSlice.reducer;
