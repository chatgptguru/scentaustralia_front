import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Chip,
  Grid,
  Typography,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Stack,
  Paper,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
} from '@mui/material';
import {
  PlayArrow,
  Add,
  Search,
  Person,
  Business,
  AutoAwesome,
} from '@mui/icons-material';
import { apolloApi, ApolloConfig } from '../../services/api';

interface ApolloSearchProps {
  onJobStarted?: (jobId: string) => void;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

const ApolloSearch: React.FC<ApolloSearchProps> = ({
  onJobStarted,
  onError,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<ApolloConfig | null>(null);

  // Form state
  const [searchType, setSearchType] = useState<'people' | 'organizations'>('people');
  const [personTitles, setPersonTitles] = useState<string[]>([]);
  const [personLocations, setPersonLocations] = useState<string[]>([]);
  const [organizationIndustries, setOrganizationIndustries] = useState<string[]>([]);
  const [keywords, setKeywords] = useState('');
  const [maxLeads, setMaxLeads] = useState(50);
  const [analyzeWithAi, setAnalyzeWithAi] = useState(true);
  const [saveLeads, setSaveLeads] = useState(true);

  // Custom input states
  const [titleInput, setTitleInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [industryInput, setIndustryInput] = useState('');

  // Job state
  const [isRunning, setIsRunning] = useState(false);

  // Load config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await apolloApi.getConfig();
        if (response.success && response.data) {
          setConfig(response.data);
          // Pre-fill with config defaults
          if (response.data.target_locations.length > 0) {
            setPersonLocations(response.data.target_locations.slice(0, 3));
          }
        }
      } catch (error) {
        console.error('Failed to load config:', error);
      }
    };

    loadConfig();
  }, []);

  const addItem = (
    input: string,
    setInput: (v: string) => void,
    items: string[],
    setItems: (v: string[]) => void
  ) => {
    if (input.trim() && !items.includes(input.trim())) {
      setItems([...items, input.trim()]);
      setInput('');
    }
  };

  const removeItem = (item: string, items: string[], setItems: (v: string[]) => void) => {
    setItems(items.filter((i) => i !== item));
  };

  const handleGenerateLeads = async () => {
    if (!config?.is_configured) {
      onError?.('Apollo.io API key is not configured. Please add APOLLO_API_KEY to your environment.');
      return;
    }

    setLoading(true);
    setIsRunning(true);

    try {
      const response = await apolloApi.generateLeads({
        search_type: searchType,
        person_titles: personTitles.length > 0 ? personTitles : undefined,
        person_locations: personLocations.length > 0 ? personLocations : undefined,
        organization_industries: organizationIndustries.length > 0 ? organizationIndustries : undefined,
        keywords: keywords || undefined,
        max_leads: maxLeads,
        analyze_with_ai: analyzeWithAi,
        save_leads: saveLeads,
      });

      if (response.success && response.data) {
        onJobStarted?.(response.data.job_id);
        onSuccess?.(`Lead generation started: ${response.data.job_id}`);
      } else {
        throw new Error(response.error || 'Failed to start lead generation');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start lead generation';
      onError?.(errorMessage);
      setIsRunning(false);
    } finally {
      setLoading(false);
    }
  };

  const commonTitles = config?.available_filters.person_titles || [
    'CEO', 'Director', 'Manager', 'Owner', 'Founder', 'VP', 'Head of'
  ];

  return (
    <Card>
      <CardHeader
        title="Apollo.io Lead Generation"
        subheader="Find decision-makers and companies using Apollo.io's database"
        avatar={<AutoAwesome color="primary" />}
      />
      <CardContent>
        <Stack spacing={3}>
          {/* API Status */}
          {config && !config.is_configured && (
            <Alert severity="warning">
              Apollo.io API key is not configured. Add <code>APOLLO_API_KEY</code> to your environment variables.
            </Alert>
          )}

          {/* Search Type Toggle */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Search Type
            </Typography>
            <ToggleButtonGroup
              value={searchType}
              exclusive
              onChange={(_, value) => value && setSearchType(value)}
              fullWidth
            >
              <ToggleButton value="people">
                <Person sx={{ mr: 1 }} />
                People / Contacts
              </ToggleButton>
              <ToggleButton value="organizations">
                <Business sx={{ mr: 1 }} />
                Organizations
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Job Titles (for people search) */}
          {searchType === 'people' && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                Job Titles
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <Autocomplete
                  freeSolo
                  options={commonTitles}
                  inputValue={titleInput}
                  onInputChange={(_, value) => setTitleInput(value)}
                  onChange={(_, value) => {
                    if (value && !personTitles.includes(value)) {
                      setPersonTitles([...personTitles, value]);
                    }
                    setTitleInput('');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder="Add job title (e.g., CEO, Director)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addItem(titleInput, setTitleInput, personTitles, setPersonTitles);
                        }
                      }}
                    />
                  )}
                  fullWidth
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {personTitles.map((title) => (
                  <Chip
                    key={title}
                    label={title}
                    onDelete={() => removeItem(title, personTitles, setPersonTitles)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Locations */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              {searchType === 'people' ? 'Person Locations' : 'Organization Locations'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
              <Autocomplete
                freeSolo
                options={config?.target_locations || []}
                inputValue={locationInput}
                onInputChange={(_, value) => setLocationInput(value)}
                onChange={(_, value) => {
                  if (value && !personLocations.includes(value)) {
                    setPersonLocations([...personLocations, value]);
                  }
                  setLocationInput('');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Add location (e.g., Sydney, Australia)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addItem(locationInput, setLocationInput, personLocations, setPersonLocations);
                      }
                    }}
                  />
                )}
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {personLocations.map((location) => (
                <Chip
                  key={location}
                  label={location}
                  onDelete={() => removeItem(location, personLocations, setPersonLocations)}
                  color="secondary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>

          {/* Industries */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Industries
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
              <Autocomplete
                freeSolo
                options={config?.target_industries || []}
                inputValue={industryInput}
                onInputChange={(_, value) => setIndustryInput(value)}
                onChange={(_, value) => {
                  if (value && !organizationIndustries.includes(value)) {
                    setOrganizationIndustries([...organizationIndustries, value]);
                  }
                  setIndustryInput('');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Add industry (e.g., Hospitality, Retail)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addItem(industryInput, setIndustryInput, organizationIndustries, setOrganizationIndustries);
                      }
                    }}
                  />
                )}
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {organizationIndustries.map((industry) => (
                <Chip
                  key={industry}
                  label={industry}
                  onDelete={() => removeItem(industry, organizationIndustries, setOrganizationIndustries)}
                  color="info"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>

          {/* Keywords */}
          <TextField
            label="Keywords (Optional)"
            placeholder="Additional search keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            fullWidth
            size="small"
            helperText="Search for specific terms in company names, descriptions, etc."
          />

          {/* Settings */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Max Leads"
                  type="number"
                  value={maxLeads}
                  onChange={(e) => setMaxLeads(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                  inputProps={{ min: 1, max: 100 }}
                  fullWidth
                  size="small"
                  helperText="1-100 leads per search"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={analyzeWithAi}
                      onChange={(e) => setAnalyzeWithAi(e.target.checked)}
                    />
                  }
                  label="AI Analysis"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={saveLeads}
                      onChange={(e) => setSaveLeads(e.target.checked)}
                    />
                  }
                  label="Save to Database"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Generate Button */}
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={isRunning ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
            onClick={handleGenerateLeads}
            disabled={loading || isRunning || !config?.is_configured}
            fullWidth
          >
            {loading ? 'Starting...' : isRunning ? 'Generating Leads...' : 'Generate Leads with Apollo.io'}
          </Button>

          {/* Info */}
          <Alert severity="info" icon={<AutoAwesome />}>
            <Typography variant="caption">
              <strong>Apollo.io Integration:</strong> Access 275M+ contacts and 73M+ companies. 
              Leads are automatically enriched with verified emails, phone numbers, and company data.
              {analyzeWithAi && ' AI will analyze each lead for fit and provide recommendations.'}
            </Typography>
          </Alert>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ApolloSearch;
