import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  InputAdornment,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import {
  Search,
  Business,
  Email,
  Phone,
  Download,
  Visibility,
  Delete,
  Refresh,
  Psychology,
  TrendingUp,
  AutoAwesome,
  LinkedIn,
  DeleteSweep,
  Add,
  Clear,
} from '@mui/icons-material';
import { leadsApi, apolloApi, exportApi, Lead, LeadStats, ApolloJob, ApolloConfig } from '../../services/api';
import ApolloSearch from '../../components/LeadGeneration/ApolloSearch';

// Transform backend Lead to frontend format
const transformLead = (lead: Lead) => ({
  id: lead.id,
  companyName: lead.company_name,
  contactName: lead.contact_name || '',
  email: lead.email || '',
  phone: lead.phone || '',
  website: lead.website || '',
  linkedinUrl: lead.linkedin_url || '',
  industry: lead.industry || '',
  location: lead.location || '',
  title: lead.title || '',
  companySize: lead.company_size || '',
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
  const [debouncedSearch, setDebouncedSearch] = useState('');
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

  // Bulk delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Apollo state
  const [apolloConfig, setApolloConfig] = useState<ApolloConfig | null>(null);
  const [apolloJobs, setApolloJobs] = useState<ApolloJob[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  const industries = ['All', 'Retail', 'Hospitality', 'Fashion', 'Wellness', 'Healthcare', 'Corporate', 'Technology', 'Finance'];

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load data
  const loadLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { per_page: 500 }; // Increase to show more leads
      if (debouncedSearch) params.search = debouncedSearch;
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
  }, [debouncedSearch, selectedIndustry, selectedStatus]);

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

  const loadApolloConfig = async () => {
    try {
      const response = await apolloApi.getConfig();
      if (response.success && response.data) {
        setApolloConfig(response.data);
      }
    } catch (err) {
      console.error('Failed to load Apollo config:', err);
    }
  };

  const loadApolloJobs = async () => {
    try {
      const response = await apolloApi.listJobs();
      if (response.success && response.data) {
        setApolloJobs(response.data.jobs);
      }
    } catch (err) {
      console.error('Failed to load Apollo jobs:', err);
    }
  };

  // Initial load
  useEffect(() => {
    loadLeads();
    loadStats();
    loadApolloConfig();
    loadApolloJobs();
  }, [loadLeads]);

  // Poll for job status when generating
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (currentJobId && isGenerating) {
      interval = setInterval(async () => {
        try {
          const response = await apolloApi.getJobStatus(currentJobId);
          if (response.success && response.data) {
            const job = response.data;
            if (job.status === 'completed' || job.status === 'failed') {
              setIsGenerating(false);
              setCurrentJobId(null);
              
              // Reload all data after job completes
              await Promise.all([loadLeads(), loadStats(), loadApolloJobs()]);
              
              // Switch to Lead Management tab to show new leads
              if (job.status === 'completed' && job.saved_leads > 0) {
                setActiveTab(0);
              }
              
              showSnackbar(
                job.status === 'completed' 
                  ? `✅ Lead generation completed! Found ${job.saved_leads} new leads.`
                  : `❌ Lead generation failed`,
                job.status === 'completed' ? 'success' : 'error'
              );
            }
          }
        } catch (err) {
          console.error('Failed to check job status:', err);
        }
      }, 2000); // Poll every 2 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentJobId, isGenerating, loadLeads]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Actions
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
      setSelectedRows([]);
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

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    setDeleting(true);
    try {
      const response = await leadsApi.bulkDelete(selectedRows as string[]);
      if (response.success && response.data) {
        setDeleteDialogOpen(false);
        setSelectedRows([]);
        await Promise.all([loadLeads(), loadStats()]);
        showSnackbar(`✅ Deleted ${response.data.deleted_count} leads successfully`, 'success');
      } else {
        throw new Error(response.error || 'Failed to delete leads');
      }
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to delete leads', 'error');
    } finally {
      setDeleting(false);
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

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await Promise.all([loadLeads(), loadStats(), loadApolloJobs()]);
      showSnackbar('Data refreshed', 'success');
    } catch (err) {
      showSnackbar('Failed to refresh', 'error');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedIndustry('');
    setSelectedStatus('');
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
      flex: 1.5,
      minWidth: 280,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Avatar sx={{ bgcolor: 'primary.light', mr: 1.5, width: 36, height: 36 }}>
            <Business fontSize="small" />
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {params.value}
            </Typography>
            {params.row.location && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {params.row.location}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    { 
      field: 'contact_name', 
      headerName: 'Contact', 
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" noWrap>{params.value || '-'}</Typography>
          {params.row.email && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.email}
            </Typography>
          )}
        </Box>
      ),
    },
    { 
      field: 'title', 
      headerName: 'Title', 
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>{params.value || '-'}</Typography>
      ),
    },
    {
      field: 'industry',
      headerName: 'Industry',
      flex: 0.7,
      minWidth: 110,
      renderCell: (params) => (
        params.value ? <Chip label={params.value} size="small" variant="outlined" /> : '-'
      ),
    },
    {
      field: 'score',
      headerName: 'Score',
      width: 90,
      align: 'center',
      headerAlign: 'center',
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
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getStatusColor(params.value as string) as any}
        />
      ),
    },
    {
      field: 'source',
      headerName: 'Source',
      width: 110,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          variant="outlined"
          icon={params.value === 'apollo.io' ? <AutoAwesome fontSize="small" /> : undefined}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
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
      {/* Apollo Search Configuration */}
      <Grid item xs={12} lg={8}>
        <ApolloSearch
          onJobStarted={(jobId) => {
            setCurrentJobId(jobId);
            setIsGenerating(true);
            showSnackbar('🚀 Lead generation started!', 'info');
          }}
          onSuccess={(message) => showSnackbar(message, 'success')}
          onError={(error) => showSnackbar(error, 'error')}
        />
      </Grid>

      {/* Job Progress / Status */}
      <Grid item xs={12} lg={4}>
        {currentJobId && isGenerating ? (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔄 Generating Leads...
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CircularProgress size={24} sx={{ mr: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Job: {currentJobId}
                </Typography>
              </Box>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography variant="caption" color="textSecondary">
                Fetching data from Apollo.io and analyzing with AI...
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                You'll be automatically redirected to Lead Management when complete.
              </Alert>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Apollo.io Status
              </Typography>
              {apolloConfig ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      API Status
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      <Chip 
                        label={apolloConfig.is_configured ? '✓ Connected' : '✗ Not Configured'}
                        size="small"
                        color={apolloConfig.is_configured ? 'success' : 'error'}
                      />
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Max leads per search
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {apolloConfig.max_leads_per_search}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Total Leads in Database
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color="primary">
                      {stats?.total_leads || 0}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <CircularProgress size={20} />
              )}
            </CardContent>
          </Card>
        )}
      </Grid>

      {/* Recent Jobs */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Lead Generation Jobs
              </Typography>
              <Button size="small" startIcon={<Refresh />} onClick={loadApolloJobs}>
                Refresh
              </Button>
            </Box>
            {apolloJobs.length > 0 ? (
              <Grid container spacing={2}>
                {apolloJobs.slice(0, 6).map((job) => (
                  <Grid item xs={12} sm={6} md={4} key={job.id}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {job.parameters.search_type === 'people' ? '👤 People Search' : '🏢 Organization Search'}
                        </Typography>
                        <Chip
                          label={job.status}
                          size="small"
                          color={
                            job.status === 'completed'
                              ? 'success'
                              : job.status === 'running'
                              ? 'info'
                              : 'error'
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
                            Saved
                          </Typography>
                          <Typography variant="body2" fontWeight={600} color="success.main">
                            {job.saved_leads}
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
              <Alert severity="info">No lead generation jobs yet. Configure Apollo.io and start generating leads.</Alert>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderLeadManagement = () => (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {stats?.total_leads || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Leads
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50' }}>
            <Typography variant="h4" color="info.main" fontWeight="bold">
              {stats?.by_status?.new || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              New
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {stats?.by_status?.contacted || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Contacted
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {stats?.by_status?.qualified || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Qualified
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.50' }}>
            <Typography variant="h4" color="secondary.main" fontWeight="bold">
              ${((stats?.total_estimated_value || 0) / 1000).toFixed(0)}K
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Value
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
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
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search by company, contact, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <Clear fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300, flex: 1 }}
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
              <MenuItem value="lost">Lost</MenuItem>
            </Select>
          </FormControl>
          
          {(searchQuery || selectedIndustry || selectedStatus) && (
            <Button 
              variant="text" 
              size="small" 
              onClick={clearFilters}
              startIcon={<Clear />}
            >
              Clear
            </Button>
          )}
          
          <Box sx={{ flex: 1 }} />
          
          <Button 
            variant="outlined" 
            startIcon={<Refresh />} 
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Download />} 
            onClick={handleExportExcel}
          >
            Export {selectedRows.length > 0 ? `(${selectedRows.length})` : 'All'}
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={() => setActiveTab(1)}
            color="primary"
          >
            Generate Leads
          </Button>
        </Box>

        {/* Bulk actions when rows selected */}
        {selectedRows.length > 0 && (
          <Box sx={{ display: 'flex', gap: 2, mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
              <strong>{selectedRows.length}</strong>&nbsp;leads selected
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              startIcon={<Psychology />} 
              onClick={handleBulkAnalyze}
            >
              Analyze Selected
            </Button>
            <Button 
              variant="outlined" 
              size="small"
              color="error"
              startIcon={<DeleteSweep />} 
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete Selected
            </Button>
            <Button 
              variant="text" 
              size="small"
              onClick={() => setSelectedRows([])}
            >
              Clear Selection
            </Button>
          </Box>
        )}
      </Paper>

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
              paginationModel: { page: 0, pageSize: 25 },
            },
            sorting: {
              sortModel: [{ field: 'score', sort: 'desc' }],
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={(newSelection) => setSelectedRows(newSelection)}
          rowSelectionModel={selectedRows}
          sx={{ 
            border: 'none', 
            minHeight: 500,
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
            },
          }}
          getRowHeight={() => 'auto'}
          slotProps={{
            row: {
              style: { minHeight: 60 },
            },
          }}
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
              {Object.entries(
                leads.reduce((acc, lead) => {
                  const source = lead.source || 'Unknown';
                  acc[source] = (acc[source] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).sort((a, b) => b[1] - a[1]).map(([source, count]) => (
                <Box key={source} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{source}</Typography>
                    <Typography variant="body2">{count} ({leads.length > 0 ? Math.round(count / leads.length * 100) : 0}%)</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={leads.length > 0 ? (count / leads.length) * 100 : 0}
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
          AI-powered lead generation with Apollo.io integration
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab
            label={
              <Badge badgeContent={stats?.total_leads || 0} color="primary" max={999}>
                Lead Management
              </Badge>
            }
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Generate New Leads
                {isGenerating && <CircularProgress size={16} />}
              </Box>
            }
            icon={<AutoAwesome fontSize="small" />}
            iconPosition="start"
          />
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
                  <Typography variant="body2"><strong>Title:</strong> {selectedLead.title || 'N/A'}</Typography>
                  <Typography variant="body2"><strong>Email:</strong> {selectedLead.email || 'N/A'}</Typography>
                  <Typography variant="body2"><strong>Phone:</strong> {selectedLead.phone || 'N/A'}</Typography>
                  <Typography variant="body2"><strong>Website:</strong> {selectedLead.website || 'N/A'}</Typography>
                  {selectedLead.linkedinUrl && (
                    <Typography variant="body2">
                      <strong>LinkedIn:</strong>{' '}
                      <a href={selectedLead.linkedinUrl} target="_blank" rel="noopener noreferrer">
                        View Profile
                      </a>
                    </Typography>
                  )}
                </Box>
                
                <Typography variant="subtitle2" gutterBottom color="primary">
                  Company Details
                </Typography>
                <Box>
                  <Typography variant="body2"><strong>Industry:</strong> {selectedLead.industry || 'N/A'}</Typography>
                  <Typography variant="body2"><strong>Location:</strong> {selectedLead.location || 'N/A'}</Typography>
                  <Typography variant="body2"><strong>Company Size:</strong> {selectedLead.companySize || 'N/A'}</Typography>
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
          {selectedLead?.linkedinUrl && (
            <Button 
              variant="outlined" 
              startIcon={<LinkedIn />}
              href={selectedLead.linkedinUrl}
              target="_blank"
            >
              View LinkedIn
            </Button>
          )}
          <Button variant="outlined" startIcon={<Email />}>
            Send Email
          </Button>
          <Button variant="contained" startIcon={<Phone />}>
            Call Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>
          Delete {selectedRows.length} Lead{selectedRows.length > 1 ? 's' : ''}?
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedRows.length} selected lead{selectedRows.length > 1 ? 's' : ''}? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleBulkDelete} 
            color="error" 
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <DeleteSweep />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ minWidth: 300 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LeadGenerator;
