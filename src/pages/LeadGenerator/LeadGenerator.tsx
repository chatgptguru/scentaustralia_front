import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Badge,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import {
  Search,
  Add,
  FilterList,
  Star,
  Business,
  Email,
  Phone,
  Download,
  Visibility,
  Edit,
  Delete,
  PlayArrow,
  Stop,
  Refresh,
  Psychology,
  CheckCircle,
  Error as ErrorIcon,
  Schedule,
  TrendingUp,
} from '@mui/icons-material';
import { leadsApi, scraperApi, exportApi, Lead, LeadStats, ScrapingJob, ScraperConfig } from '../../services/api';
import LeadScraping from '../../components/LeadGeneration/LeadScraping';
import JobProgress from '../../components/LeadGeneration/JobProgress';
import LeadResults from '../../components/LeadGeneration/LeadResults';

// Transform backend Lead to frontend format
const transformLead = (lead: Lead) => ({
  id: lead.id,
  companyName: lead.company_name,
  contactName: lead.contact_name || '',
  email: lead.email || '',
  phone: lead.phone || '',
  website: lead.website || '',
  industry: lead.industry || '',
  location: lead.location || '',
  score: lead.score,
  status: lead.status,
  source: lead.source,
  lastContact: lead.last_contacted ? new Date(lead.last_contacted) : null,
  estimatedValue: lead.estimated_value,
  priority: lead.priority,
  aiAnalysis: lead.ai_analysis,
  createdAt: lead.created_at,
});

type TransformedLead = ReturnType<typeof transformLead>;

const LeadGenerator: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openLeadDetail, setOpenLeadDetail] = useState(false);
  const [selectedLead, setSelectedLead] = useState<TransformedLead | null>(null);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Scraping state
  const [scraperConfig, setScraperConfig] = useState<ScraperConfig | null>(null);
  const [scrapingJobs, setScrapingJobs] = useState<ScrapingJob[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [generationForm, setGenerationForm] = useState({
    keywords: '',
    location: '',
    maxLeads: 50,
    analyzeWithAI: true,
  });

  const industries = ['All', 'Retail', 'Hospitality', 'Fashion', 'Wellness', 'Healthcare', 'Corporate'];

  // Load data
  const loadLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { per_page: 100 };
      if (searchQuery) params.search = searchQuery;
      if (selectedIndustry && selectedIndustry !== 'All') params.industry = selectedIndustry;
      if (selectedStatus) params.status = selectedStatus;

      const response = await leadsApi.getLeads(params);
      if (response.success && response.data) {
        setLeads(response.data.leads);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load leads');
      showSnackbar('Failed to load leads', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedIndustry, selectedStatus]);

  const loadStats = async () => {
    try {
      const response = await leadsApi.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadScraperConfig = async () => {
    try {
      const response = await scraperApi.getConfig();
      if (response.success && response.data) {
        setScraperConfig(response.data);
      }
    } catch (err) {
      console.error('Failed to load scraper config:', err);
    }
  };

  const loadScrapingJobs = async () => {
    try {
      const response = await scraperApi.listJobs();
      if (response.success && response.data) {
        setScrapingJobs(response.data.jobs);
      }
    } catch (err) {
      console.error('Failed to load scraping jobs:', err);
    }
  };

  useEffect(() => {
    loadLeads();
    loadStats();
    loadScraperConfig();
    loadScrapingJobs();
  }, [loadLeads]);

  // Poll for job status when generating
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (currentJobId && isGenerating) {
      interval = setInterval(async () => {
        try {
          const response = await scraperApi.getJobStatus(currentJobId);
          if (response.success && response.data) {
            const job = response.data;
            if (job.status === 'completed' || job.status === 'failed' || job.status === 'stopped') {
              setIsGenerating(false);
              setCurrentJobId(null);
              loadLeads();
              loadStats();
              loadScrapingJobs();
              showSnackbar(
                job.status === 'completed' 
                  ? `Scraping completed! Found ${job.processed_leads} leads.`
                  : `Scraping ${job.status}`,
                job.status === 'completed' ? 'success' : 'error'
              );
            }
          }
        } catch (err) {
          console.error('Failed to check job status:', err);
        }
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentJobId, isGenerating]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Actions
  const handleGenerateLeads = async () => {
    try {
      setIsGenerating(true);
      const keywords = generationForm.keywords.split(',').map(k => k.trim()).filter(k => k);
      const locations = generationForm.location.split(',').map(l => l.trim()).filter(l => l);

      const response = await scraperApi.startScraping({
        keywords: keywords.length > 0 ? keywords : undefined,
        locations: locations.length > 0 ? locations : undefined,
        max_leads: generationForm.maxLeads,
        analyze_with_ai: generationForm.analyzeWithAI,
      });

      if (response.success && response.data) {
        setCurrentJobId(response.data.job_id);
        showSnackbar('Lead generation started!', 'info');
      }
    } catch (err: any) {
      setIsGenerating(false);
      showSnackbar(err.message || 'Failed to start lead generation', 'error');
    }
  };

  const handleStopGeneration = async () => {
    if (currentJobId) {
      try {
        await scraperApi.stopJob(currentJobId);
        setIsGenerating(false);
        setCurrentJobId(null);
        showSnackbar('Lead generation stopped', 'info');
        loadScrapingJobs();
      } catch (err: any) {
        showSnackbar(err.message || 'Failed to stop generation', 'error');
      }
    }
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(transformLead(lead));
    setOpenLeadDetail(true);
  };

  const handleAnalyzeLead = async (leadId: string) => {
    try {
      showSnackbar('Analyzing lead with AI...', 'info');
      await leadsApi.analyzeLead(leadId);
      loadLeads();
      showSnackbar('AI analysis completed!', 'success');
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to analyze lead', 'error');
    }
  };

  const handleBulkAnalyze = async () => {
    if (selectedRows.length === 0) return;
    try {
      showSnackbar(`Analyzing ${selectedRows.length} leads...`, 'info');
      await leadsApi.bulkAnalyze(selectedRows as string[]);
      loadLeads();
      showSnackbar('Bulk analysis completed!', 'success');
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to analyze leads', 'error');
    }
  };

  const handleExportExcel = async () => {
    try {
      const params = selectedRows.length > 0 ? { lead_ids: selectedRows as string[] } : {};
      const response = await exportApi.exportToExcel(params);
      if (response.success && response.data) {
        window.open(exportApi.getDownloadUrl(response.data.filename), '_blank');
        showSnackbar(`Exported ${response.data.total_exported} leads to Excel`, 'success');
      }
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to export', 'error');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await leadsApi.deleteLead(leadId);
      loadLeads();
      loadStats();
      showSnackbar('Lead deleted successfully', 'success');
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to delete lead', 'error');
    }
  };

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      await leadsApi.updateLead(leadId, { status: newStatus } as any);
      loadLeads();
      loadStats();
      showSnackbar('Lead status updated', 'success');
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to update status', 'error');
    }
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'info';
      case 'contacted': return 'warning';
      case 'qualified': return 'success';
      case 'converted': return 'primary';
      case 'lost': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const columns: GridColDef[] = [
    {
      field: 'company_name',
      headerName: 'Company',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.light', mr: 1, width: 32, height: 32 }}>
            <Business fontSize="small" />
          </Avatar>
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    { field: 'contact_name', headerName: 'Contact', width: 150 },
    {
      field: 'industry',
      headerName: 'Industry',
      width: 120,
      renderCell: (params) => (
        params.value ? <Chip label={params.value} size="small" variant="outlined" /> : '-'
      ),
    },
    {
      field: 'score',
      headerName: 'Score',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          color={getScoreColor(params.value as number) as any}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getStatusColor(params.value as string) as any}
        />
      ),
    },
    {
      field: 'estimated_value',
      headerName: 'Est. Value',
      width: 120,
      renderCell: (params) => params.value ? `$${(params.value as number).toLocaleString()}` : '-',
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getPriorityColor(params.value as string) as any}
          variant="outlined"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => handleLeadClick(params.row)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="AI Analyze">
            <IconButton size="small" onClick={() => handleAnalyzeLead(params.row.id)}>
              <Psychology fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => handleDeleteLead(params.row.id)} color="error">
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const renderLeadGeneration = () => (
    <Grid container spacing={3}>
      {/* Main Scraping Configuration */}
      <Grid item xs={12} lg={8}>
        <LeadScraping
          onJobStarted={(jobId) => {
            setCurrentJobId(jobId);
            setIsGenerating(true);
            showSnackbar('Lead scraping job started!', 'success');
          }}
          onSuccess={(message) => showSnackbar(message, 'success')}
          onError={(error) => showSnackbar(error, 'error')}
        />
      </Grid>

      {/* Job Progress Tracking */}
      <Grid item xs={12} lg={4}>
        {currentJobId && isGenerating ? (
          <JobProgress
            jobId={currentJobId}
            onCompleted={(job) => {
              setIsGenerating(false);
              showSnackbar(`Scraping completed! Found ${job.processed_leads} leads.`, 'success');
              loadLeads();
              loadStats();
              loadScrapingJobs();
            }}
            onFailed={(job) => {
              setIsGenerating(false);
              showSnackbar(`Scraping failed. Errors: ${job.errors.length}`, 'error');
            }}
            onClose={() => {
              setCurrentJobId(null);
              setIsGenerating(false);
            }}
          />
        ) : (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Scraper Information
              </Typography>
              {scraperConfig ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Max leads per run
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {scraperConfig.max_leads_per_run}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Request delay
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {scraperConfig.scraping_delay}s between requests
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Available sources
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                      {scraperConfig.available_sources.map((source) => (
                        <Chip key={source} label={source} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                </Box>
              ) : (
                <CircularProgress size={20} />
              )}
            </CardContent>
          </Card>
        )}
      </Grid>

      {/* Recent Scraping Jobs */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Scraping Job History
            </Typography>
            {scrapingJobs.length > 0 ? (
              <Grid container spacing={2}>
                {scrapingJobs.slice(0, 6).map((job) => (
                  <Grid item xs={12} sm={6} md={4} key={job.id}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {job.parameters.keywords?.slice(0, 2).join(', ') || 'All industries'}
                        </Typography>
                        <Chip
                          label={job.status}
                          size="small"
                          color={
                            job.status === 'completed'
                              ? 'success'
                              : job.status === 'running'
                              ? 'info'
                              : job.status === 'failed'
                              ? 'error'
                              : 'default'
                          }
                        />
                      </Box>
                      <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 1 }}>
                        {new Date(job.started_at).toLocaleString()}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Found
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {job.total_leads}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Processed
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {job.processed_leads}
                          </Typography>
                        </Box>
                        {job.errors.length > 0 && (
                          <Box>
                            <Typography variant="caption" color="error">
                              Errors
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="error">
                              {job.errors.length}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">No scraping jobs yet. Start a new job using the configuration panel.</Alert>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Scraped Leads Results */}
      {leads.length > 0 && (
        <Grid item xs={12}>
          <LeadResults
            leads={leads}
            loading={loading}
            onLeadSelect={(lead) => {
              setSelectedLead(transformLead(lead));
              setOpenLeadDetail(true);
            }}
            onLeadUpdate={(lead) => {
              // Handle lead update
              loadLeads();
            }}
            onLeadDelete={(leadId) => {
              handleDeleteLead(leadId);
            }}
            onExport={handleExportExcel}
          />
        </Grid>
      )}
    </Grid>
  );

  const renderLeadManagement = () => (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {stats?.total_leads || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Leads
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main" fontWeight="bold">
              {stats?.by_status?.new || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              New Leads
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {stats?.by_status?.contacted || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Contacted
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {stats?.by_status?.qualified || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Qualified
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="secondary.main" fontWeight="bold">
              ${((stats?.total_estimated_value || 0) / 1000).toFixed(0)}K
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Value
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {stats?.average_score?.toFixed(0) || 0}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg Score
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters and Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search leads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ minWidth: 250 }}
          size="small"
        />
        <FormControl sx={{ minWidth: 130 }} size="small">
          <InputLabel>Industry</InputLabel>
          <Select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            label="Industry"
          >
            {industries.map((industry) => (
              <MenuItem key={industry} value={industry === 'All' ? '' : industry}>
                {industry}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 130 }} size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            label="Status"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="new">New</MenuItem>
            <MenuItem value="contacted">Contacted</MenuItem>
            <MenuItem value="qualified">Qualified</MenuItem>
            <MenuItem value="converted">Converted</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" startIcon={<Refresh />} onClick={loadLeads}>
          Refresh
        </Button>
        {selectedRows.length > 0 && (
          <>
            <Button variant="outlined" startIcon={<Psychology />} onClick={handleBulkAnalyze}>
              Analyze ({selectedRows.length})
            </Button>
          </>
        )}
        <Button variant="outlined" startIcon={<Download />} onClick={handleExportExcel}>
          Export Excel
        </Button>
      </Box>

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Data Grid */}
      <Card>
        <DataGrid
          rows={leads}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={(newSelection) => setSelectedRows(newSelection)}
          rowSelectionModel={selectedRows}
          sx={{ border: 'none', minHeight: 400 }}
        />
      </Card>
    </Box>
  );

  const renderAnalytics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Lead Sources
            </Typography>
            <Box sx={{ mt: 2 }}>
              {['AI Generated', 'Manual', 'Google Search', 'Yellow Pages'].map((source, index) => (
                <Box key={source} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{source}</Typography>
                    <Typography variant="body2">{[45, 20, 25, 10][index]}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={[45, 20, 25, 10][index]}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top Industries
            </Typography>
            <List>
              {stats && Object.entries(stats.top_industries || {}).map(([industry, count]) => (
                <ListItem key={industry} sx={{ px: 0 }}>
                  <ListItemText primary={industry} />
                  <Chip label={count} size="small" color="primary" />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Conversion Funnel
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', py: 4 }}>
              {[
                { label: 'New', count: stats?.by_status?.new || 0, color: 'info.main' },
                { label: 'Contacted', count: stats?.by_status?.contacted || 0, color: 'warning.main' },
                { label: 'Qualified', count: stats?.by_status?.qualified || 0, color: 'success.main' },
                { label: 'Converted', count: stats?.by_status?.converted || 0, color: 'primary.main' },
              ].map((stage, index) => (
                <React.Fragment key={stage.label}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color={stage.color} fontWeight="bold">
                      {stage.count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stage.label}
                    </Typography>
                  </Box>
                  {index < 3 && <TrendingUp color="disabled" sx={{ fontSize: 40 }} />}
                </React.Fragment>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Lead Generator
        </Typography>
        <Typography variant="body1" color="text.secondary">
          AI-powered lead generation and management system
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab
            label={
              <Badge badgeContent={stats?.by_status?.new || 0} color="error">
                Lead Management
              </Badge>
            }
          />
          <Tab label="Generate New Leads" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      {activeTab === 0 && renderLeadManagement()}
      {activeTab === 1 && renderLeadGeneration()}
      {activeTab === 2 && renderAnalytics()}

      {/* Lead Detail Dialog */}
      <Dialog open={openLeadDetail} onClose={() => setOpenLeadDetail(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {selectedLead?.companyName}
            {selectedLead && (
              <>
                <Chip
                  label={`Score: ${selectedLead.score}%`}
                  size="small"
                  color={getScoreColor(selectedLead.score) as any}
                />
                <Chip
                  label={selectedLead.priority}
                  size="small"
                  color={getPriorityColor(selectedLead.priority) as any}
                  variant="outlined"
                />
              </>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedLead && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom color="primary">
                  Contact Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2"><strong>Name:</strong> {selectedLead.contactName || 'N/A'}</Typography>
                  <Typography variant="body2"><strong>Email:</strong> {selectedLead.email || 'N/A'}</Typography>
                  <Typography variant="body2"><strong>Phone:</strong> {selectedLead.phone || 'N/A'}</Typography>
                  <Typography variant="body2"><strong>Website:</strong> {selectedLead.website || 'N/A'}</Typography>
                </Box>
                
                <Typography variant="subtitle2" gutterBottom color="primary">
                  Company Details
                </Typography>
                <Box>
                  <Typography variant="body2"><strong>Industry:</strong> {selectedLead.industry || 'N/A'}</Typography>
                  <Typography variant="body2"><strong>Location:</strong> {selectedLead.location || 'N/A'}</Typography>
                  <Typography variant="body2"><strong>Est. Value:</strong> ${selectedLead.estimatedValue?.toLocaleString() || 0}</Typography>
                  <Typography variant="body2"><strong>Source:</strong> {selectedLead.source}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                {selectedLead.aiAnalysis ? (
                  <>
                    <Typography variant="subtitle2" gutterBottom color="primary">
                      AI Analysis
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2"><strong>Fit:</strong> {selectedLead.aiAnalysis.fit_assessment}</Typography>
                      <Typography variant="body2"><strong>Confidence:</strong> {selectedLead.aiAnalysis.confidence_level}%</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>{selectedLead.aiAnalysis.reasoning}</Typography>
                    </Box>
                    {selectedLead.aiAnalysis.recommended_products?.length > 0 && (
                      <>
                        <Typography variant="subtitle2" gutterBottom color="primary">
                          Recommended Products
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                          {selectedLead.aiAnalysis.recommended_products.map((product) => (
                            <Chip key={product} label={product} size="small" />
                          ))}
                        </Box>
                      </>
                    )}
                    {selectedLead.aiAnalysis.talking_points?.length > 0 && (
                      <>
                        <Typography variant="subtitle2" gutterBottom color="primary">
                          Talking Points
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                          {selectedLead.aiAnalysis.talking_points.map((point, i) => (
                            <li key={i}><Typography variant="body2">{point}</Typography></li>
                          ))}
                        </ul>
                      </>
                    )}
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Psychology sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography color="text.secondary" gutterBottom>
                      No AI analysis yet
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Psychology />}
                      onClick={() => handleAnalyzeLead(selectedLead.id)}
                    >
                      Analyze with AI
                    </Button>
                  </Box>
                )}
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" gutterBottom color="primary">
                  Update Status
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {['new', 'contacted', 'qualified', 'converted', 'lost'].map((status) => (
                    <Chip
                      key={status}
                      label={status}
                      color={getStatusColor(status) as any}
                      variant={selectedLead.status === status ? 'filled' : 'outlined'}
                      onClick={() => handleUpdateStatus(selectedLead.id, status)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLeadDetail(false)}>Close</Button>
          <Button variant="outlined" startIcon={<Email />}>
            Send Email
          </Button>
          <Button variant="contained" startIcon={<Phone />}>
            Call Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LeadGenerator;
