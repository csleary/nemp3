import { toastError, toastSuccess } from 'features/toast';
import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';

const artistSlice = createSlice({
  name: 'artists',
  initialState: {
    activeArtistId: '',
    artists: [],
    errors: {},
    isLoading: false,
    isSubmitting: false
  },
  reducers: {
    removeLink(state, action) {
      const { artistId, linkId } = action.payload;

      state.artists = state.artists.map(artist => {
        if (artist._id === artistId) return { ...artist, links: artist.links.filter(link => link._id !== linkId) };
        return artist;
      });
    },

    setActiveArtistId(state, action) {
      state.activeArtistId = action.payload;
    },

    setArtist(state, action) {
      state.artists = state.artists.map(artist => {
        if (artist._id === action.payload._id) return action.payload;
        return artist;
      });
    },

    setArtists(state, action) {
      state.artists = action.payload;
      if (action.payload.length === 1) state.activeArtistId = action.payload[0]._id;
    },

    setErrors(state, action) {
      state.errors[action.payload.name] = action.payload.value;
    },

    setIsLoading(state, action) {
      state.isLoading = action.payload;
    },

    setIsSubmitting(state, action) {
      state.isSubmitting = action.payload;
    },

    setValues(state, action) {
      const { artistId, name, value } = action.payload;

      state.artists = state.artists.map(artist => {
        if (artist._id === artistId && name.split('.').length === 2) {
          const [linkId, fieldName] = name.split('.');

          return {
            ...artist,
            links: artist.links.map(link => {
              if (link._id === linkId) return { ...link, [fieldName]: value };
              return link;
            })
          };
        }

        if (artist._id === artistId) return { ...artist, [name]: value };
        return artist;
      });
    }
  }
});

const addLink = activeArtistId => async dispatch => {
  try {
    dispatch(setIsLoading(true));
    const res = await axios.patch(`/api/artist/${activeArtistId}/link`);
    dispatch(setArtist(res.data));
    dispatch(setIsLoading(false));
  } catch (error) {
    dispatch(toastError(error.response?.data.error));
    dispatch(setIsLoading(false));
  }
};

const fetchArtists = () => async dispatch => {
  try {
    dispatch(setIsLoading(true));
    const res = await axios.get('/api/artists');
    dispatch(setArtists(res.data));
    dispatch(setIsLoading(false));
  } catch (error) {
    dispatch(toastError(error.response?.data.error));
    dispatch(setIsLoading(false));
  }
};

const updateArtist = values => async dispatch => {
  try {
    dispatch(setIsSubmitting(true));
    const res = await axios.post(`/api/artist/${values._id}`, values);
    dispatch(setArtist(res.data));
    dispatch(toastSuccess('Artist saved'));
    dispatch(setIsSubmitting(false));
  } catch (error) {
    dispatch(toastError(error.response?.data.error));
    dispatch(setIsLoading(false));
  }
};

export const {
  removeLink,
  setActiveArtistId,
  setArtist,
  setArtists,
  setErrors,
  setIsSubmitting,
  setValues,
  setIsLoading
} = artistSlice.actions;

export { addLink, fetchArtists, updateArtist };

export default artistSlice.reducer;
