import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  themeMode: localStorage.getItem('spreetail_theme_mode') || 'light',
  sidebarOpen: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('spreetail_theme_mode', state.themeMode);
    },
    setThemeMode(state, action) {
      state.themeMode = action.payload;
      localStorage.setItem('spreetail_theme_mode', action.payload);
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const { toggleTheme, setThemeMode, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;

export const selectThemeMode = (state) => state.ui.themeMode;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
