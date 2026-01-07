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
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Add,
  Close,
  Search,
  Settings,
} from '@mui/icons-material';
import { scraperApi, ScraperConfig } from '../../services/api';

interface LeadScrapingProps {
  onJobStarted?: (jobId: string) => void;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

const LeadScraping: React.FC<LeadScrapingProps> = ({
  onJobStarted,
  onError,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<ScraperConfig | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form state
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState('');
  const [maxLeads, setMaxLeads] = useState(50);
  const [sources, setSources] = useState(['google_search', 'yellow_pages']);
  const [analyzeWithAi, setAnalyzeWithAi] = useState(true);

  // Job state
  const [isRunning, setIsRunning] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  // Load config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await scraperApi.getConfig();
        if (response.success && response.data) {
          setConfig(response.data);
          // Pre-fill with config defaults
          if (response.data.target_industries.length > 0) {
            setKeywords(response.data.target_industries);
          }
          if (response.data.target_locations.length > 0) {
            setLocations(response.data.target_locations);
          }
        }
      } catch (error) {
        console.error('Failed to load config:', error);
      }
    };

    loadConfig();
  }, []);

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const addLocation = () => {
    if (locationInput.trim() && !locations.includes(locationInput.trim())) {
      setLocations([...locations, locationInput.trim()]);
      setLocationInput('');
    }
  };

  const removeLocation = (location: string) => {
    setLocations(locations.filter((l) => l !== location));
  };

  const handleStartScraping = async () => {
    if (keywords.length === 0 || locations.length === 0) {
      onError?.('Please add at least one keyword and one location');
      return;
    }

    setLoading(true);
    try {
      const response = await scraperApi.startScraping({
        keywords,
        locations,
        max_leads: maxLeads,
        sources,
        analyze_with_ai: analyzeWithAi,
      });

      if (response.success && response.data) {
        setIsRunning(true);
        setCurrentJobId(response.data.job_id);
        onJobStarted?.(response.data.job_id);
        onSuccess?.(`Scraping job started: ${response.data.job_id}`);
      } else {
        throw new Error(response.error || 'Failed to start scraping');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start scraping';
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStopScraping = async () => {
    if (!currentJobId) return;

    setLoading(true);
    try {
      const response = await scraperApi.stopJob(currentJobId);

      if (response.success) {
        setIsRunning(false);
        onSuccess?.('Scraping job stopped');
      } else {
        throw new Error(response.error || 'Failed to stop scraping');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop scraping';
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sourceOptions = ['google_search', 'yellow_pages', 'business_directories'];

  return (
    <Card>
      <CardHeader
        title="Lead Scraping Configuration"
        subheader="Configure parameters for automated lead generation"
        avatar={<Search />}
      />
      <CardContent>
        <Stack spacing={3}>
          {/* Keywords Section */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Keywords (Industries/Categories)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
              <TextField
                size="small"
                placeholder="Add keyword (e.g., Fragrance Retail)"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addKeyword();
                  }
                }}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        size="small"
                        onClick={addKeyword}
                        variant="text"
                        sx={{ mr: -1 }}
                      >
                        <Add />
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {keywords.map((keyword) => (
                <Chip
                  key={keyword}
                  label={keyword}
                  onDelete={() => removeKeyword(keyword)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>

          {/* Locations Section */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Locations
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
              <TextField
                size="small"
                placeholder="Add location (e.g., Sydney, NSW)"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addLocation();
                  }
                }}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        size="small"
                        onClick={addLocation}
                        variant="text"
                        sx={{ mr: -1 }}
                      >
                        <Add />
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {locations.map((location) => (
                <Chip
                  key={location}
                  label={location}
                  onDelete={() => removeLocation(location)}
                  color="secondary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>

          {/* Basic Settings */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Max Leads per Run"
                  type="number"
                  value={maxLeads}
                  onChange={(e) => setMaxLeads(Math.max(1, parseInt(e.target.value) || 1))}
                  inputProps={{ min: 1, max: 500 }}
                  fullWidth
                  size="small"
                  helperText={`${maxLeads} leads`}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={analyzeWithAi}
                      onChange={(e) => setAnalyzeWithAi(e.target.checked)}
                    />
                  }
                  label="Analyze with AI"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Advanced Settings Toggle */}
          <Button
            startIcon={<Settings />}
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="text"
            size="small"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
          </Button>

          {/* Advanced Settings */}
          {showAdvanced && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Data Sources
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Select Sources</InputLabel>
                <Select
                  multiple
                  value={sources}
                  onChange={(e) => setSources(typeof e.target.value === 'string' ? [e.target.value] : e.target.value)}
                  label="Select Sources"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {sourceOptions.map((source) => (
                    <MenuItem key={source} value={source}>
                      {source}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
          )}

          {/* Control Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={isRunning ? <CircularProgress size={20} /> : <PlayArrow />}
              onClick={handleStartScraping}
              disabled={loading || isRunning || keywords.length === 0 || locations.length === 0}
              fullWidth
            >
              {loading ? 'Starting...' : isRunning ? 'Scraping in Progress' : 'Start Scraping'}
            </Button>
            {isRunning && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Stop />}
                onClick={handleStopScraping}
                disabled={loading}
              >
                Stop Job
              </Button>
            )}
          </Box>

          {/* Job ID Display */}
          {currentJobId && (
            <Alert severity="info">
              Job ID: <strong>{currentJobId}</strong>
            </Alert>
          )}

          {/* Info Box */}
          <Alert severity="info" icon={false}>
            <Typography variant="caption">
              💡 <strong>Tip:</strong> Scraping will search through multiple sources and compile
              leads with the specified keywords and locations. With AI analysis enabled, each
              lead will be scored and analyzed for fit and potential.
            </Typography>
          </Alert>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default LeadScraping;
