import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
  Chip,
  InputAdornment,
} from '@mui/material';
import { Search } from '@mui/icons-material';

interface Category {
  name: string;
  label: string;
  count: number;
}

interface SearchSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: Category[];
}

const SearchSection: React.FC<SearchSectionProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
}) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Search Knowledge Base
        </Typography>
        <TextField
          fullWidth
          placeholder="Search for documents, articles, FAQs, and more..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <Chip
              key={category.name}
              label={`${category.label} (${category.count})`}
              onClick={() => onCategoryChange(category.name)}
              color={selectedCategory === category.name ? 'primary' : 'default'}
              variant={selectedCategory === category.name ? 'filled' : 'outlined'}
              clickable
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SearchSection;
