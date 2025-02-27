import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: [],
  keyword: ""
}

export const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: { 
    createDataFunc: (state, action) => {
      state.data = [...state.data, action.payload]
    },
    sortingDataFunc: (state, action) => {
      const sortedData = [...state.data].sort((a, b) => 
        action.payload === "asc" ? a.price - b.price : b.price - a.price
      );
      state.data = sortedData;
    },
    deleteDataFunc: (state, action) => {
      state.data = [...state.data.filter(dt => dt.id !== action.payload)]
    },
    updateDataFunc: (state, action) => {
      // State'i güncellerken doğru verinin kullanıldığından emin olalım
      const updatedData = state.data.map(dt =>
        dt.id === action.payload.id ? { ...dt, ...action.payload } : dt
      );
      state.data = updatedData;  // Güncellenmiş veriyi state'e set ediyoruz
    },
    searchDataFunc: (state, action) => {
      state.keyword = action.payload
    },
  },
});

// Action creators are generated for each case reducer function
export const { createDataFunc, sortingDataFunc, deleteDataFunc, updateDataFunc, searchDataFunc } = dataSlice.actions;

export default dataSlice.reducer;