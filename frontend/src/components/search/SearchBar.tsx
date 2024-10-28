import React from 'react';
import { Paper, InputBase, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// This component represents a search bar that users can use to search for listings.
// It uses Material-UI components for styling.

const SearchBar: React.FC = () => {
  return (
    <Paper
      component="form"
      sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400, m: 'auto', mt: 2 }}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search for items..." // Placeholder text for the search input
        inputProps={{ 'aria-label': 'search items' }}
      />
      <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
        <SearchIcon /> {/* Search icon button */}
      </IconButton>
    </Paper>
  );
};

export default SearchBar;
