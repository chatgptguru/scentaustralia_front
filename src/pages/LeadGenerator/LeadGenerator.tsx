import React, { useState } from 'react';
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
  ListItemAvatar,
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
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Search,
  Add,
  FilterList,
  Star,
  StarBorder,
  Business,
  Email,
  Phone,
  Language,
  LocationOn,
  TrendingUp,
  Schedule,
  Refresh,
  Download,
  Send,
  Visibility,
  Edit,
} from '@mui/icons-material';

interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  location: string;
  score: number;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  source: 'ai-generated' | 'manual' | 'imported';
  lastContact: Date;
  estimatedValue: number;
  priority: 'high' | 'medium' | 'low';
}

const LeadGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [openLeadDetail, setOpenLeadDetail] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const leads: Lead[] = [
    {
      id: '1',
      companyName: 'Luxury Retail Group',
      contactName: 'Sarah Johnson',
      email: 'sarah.johnson@luxuryretail.com',
      phone: '+61 2 9876 5432',
      website: 'www.luxuryretail.com',
      industry: 'Retail',
      location: 'Sydney, NSW',
      score: 92,
      status: 'new',
      source: 'ai-generated',
      lastContact: new Date('2024-11-05'),
      estimatedValue: 75000,
      priority: 'high',
    },
    {
      id: '2',
      companyName: 'Premium Hospitality Solutions',
      contactName: 'Michael Chen',
      email: 'm.chen@premiumhosp.com',
      phone: '+61 3 8765 4321',
      website: 'www.premiumhosp.com',
      industry: 'Hospitality',
      location: 'Melbourne, VIC',
      score: 87,
      status: 'contacted',
      source: 'ai-generated',
      lastContact: new Date('2024-11-03'),
      estimatedValue: 45000,
      priority: 'high',
    },
    {
      id: '3',
      companyName: 'Boutique Chain Australia',
      contactName: 'Emma Wilson',
      email: 'emma@boutiquechain.au',
      phone: '+61 7 7654 3210',
      website: 'www.boutiquechain.au',
      industry: 'Fashion',
      location: 'Brisbane, QLD',
      score: 78,
      status: 'qualified',
      source: 'manual',
      lastContact: new Date('2024-11-01'),
      estimatedValue: 32000,
      priority: 'medium',
    },
    {
      id: '4',
      companyName: 'Wellness Spa Network',
      contactName: 'David Brown',
      email: 'david@wellnessspa.com',
      phone: '+61 8 6543 2109',
      website: 'www.wellnessspa.com',
      industry: 'Wellness',
      location: 'Perth, WA',
      score: 85,
      status: 'new',
      source: 'ai-generated',
      lastContact: new Date('2024-10-30'),
      estimatedValue: 28000,
      priority: 'medium',
    },
  ];

  const industries = ['All', 'Retail', 'Hospitality', 'Fashion', 'Wellness', 'Healthcare', 'Corporate'];

  const leadStats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'info';
      case 'contacted': return 'warning';
      case 'qualified': return 'success';
      case 'converted': return 'primary';
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

  const handleGenerateLeads = () => {
    setIsGenerating(true);
    // Simulate AI lead generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setOpenLeadDetail(true);
  };

  const columns: GridColDef[] = [
    {
      field: 'companyName',
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
    {
      field: 'contactName',
      headerName: 'Contact',
      width: 150,
    },
    {
      field: 'industry',
      headerName: 'Industry',
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" />
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
      field: 'estimatedValue',
      headerName: 'Est. Value',
      width: 120,
      renderCell: (params) => `$${(params.value as number).toLocaleString()}`,
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
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => handleLeadClick(params.row)}>
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton size="small">
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small">
            <Star fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const renderLeadGeneration = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              AI Lead Generation
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Target Industry"
                  placeholder="e.g., Luxury Retail, Hospitality"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location"
                  placeholder="e.g., Sydney, Melbourne, Australia"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Size"
                  placeholder="e.g., 50-200 employees"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Revenue Range"
                  placeholder="e.g., $1M - $10M"
                />
              </Grid>
            </Grid>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Search Keywords
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Enter keywords related to your target market (e.g., premium fragrances, luxury retail, boutique stores)"
              />
            </Box>

            {isGenerating && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Generating leads... This may take a few minutes.
                </Typography>
                <LinearProgress />
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={handleGenerateLeads}
                disabled={isGenerating}
                size="large"
              >
                {isGenerating ? 'Generating...' : 'Generate Leads'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Schedule />}
                size="large"
              >
                Schedule Generation
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid xs={12} md={4}>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Generation Settings
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Lead Quality</InputLabel>
              <Select defaultValue="high" label="Lead Quality">
                <MenuItem value="high">High Quality (Score &gt; 80)</MenuItem>
                <MenuItem value="medium">Medium Quality (Score &gt; 60)</MenuItem>
                <MenuItem value="all">All Leads</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Max Results</InputLabel>
              <Select defaultValue="50" label="Max Results">
                <MenuItem value="25">25 leads</MenuItem>
                <MenuItem value="50">50 leads</MenuItem>
                <MenuItem value="100">100 leads</MenuItem>
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Generations
            </Typography>
            <List>
              <ListItem sx={{ px: 0 }}>
                <ListItemText
                  primary="Luxury Retail - Sydney"
                  secondary="45 leads generated"
                  primaryTypographyProps={{ fontSize: '0.875rem' }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
                <Chip label="Today" size="small" color="success" />
              </ListItem>
              <Divider />
              <ListItem sx={{ px: 0 }}>
                <ListItemText
                  primary="Hospitality - Melbourne"
                  secondary="32 leads generated"
                  primaryTypographyProps={{ fontSize: '0.875rem' }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
                <Chip label="Yesterday" size="small" />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderLeadManagement = () => (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {leadStats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Leads
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main" fontWeight="bold">
              {leadStats.new}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              New Leads
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {leadStats.contacted}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Contacted
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {leadStats.qualified}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Qualified
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {leadStats.converted}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Converted
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters and Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search leads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ minWidth: 300 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Industry</InputLabel>
          <Select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            label="Industry"
          >
            {industries.map((industry) => (
              <MenuItem key={industry} value={industry}>
                {industry}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="outlined" startIcon={<FilterList />}>
          More Filters
        </Button>
        <Button variant="outlined" startIcon={<Download />}>
          Export
        </Button>
        <Button variant="contained" startIcon={<Add />}>
          Add Lead
        </Button>
      </Box>

      {/* Data Grid */}
      <Card>
        <DataGrid
          rows={leads}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Card>
    </Box>
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
              <Badge badgeContent={leadStats.new} color="error">
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
      {activeTab === 2 && (
        <Typography variant="h6">Analytics Dashboard Coming Soon...</Typography>
      )}

      {/* Lead Detail Dialog */}
      <Dialog open={openLeadDetail} onClose={() => setOpenLeadDetail(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedLead?.companyName}
          <Chip
            label={`Score: ${selectedLead?.score}%`}
            size="small"
            color={selectedLead ? getScoreColor(selectedLead.score) as any : 'default'}
            sx={{ ml: 2 }}
          />
        </DialogTitle>
        <DialogContent>
          {selectedLead && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Contact Information</Typography>
                <Typography variant="body2">Name: {selectedLead.contactName}</Typography>
                <Typography variant="body2">Email: {selectedLead.email}</Typography>
                <Typography variant="body2">Phone: {selectedLead.phone}</Typography>
                <Typography variant="body2">Website: {selectedLead.website}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Company Details</Typography>
                <Typography variant="body2">Industry: {selectedLead.industry}</Typography>
                <Typography variant="body2">Location: {selectedLead.location}</Typography>
                <Typography variant="body2">Est. Value: ${selectedLead.estimatedValue.toLocaleString()}</Typography>
                <Typography variant="body2">Priority: {selectedLead.priority}</Typography>
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
    </Box>
  );
};

export default LeadGenerator;
