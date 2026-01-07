import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Stack,
  Typography,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Search,
  Visibility,
  Edit,
  Delete,
  Download,
  ContentCopy,
  Star,
  OpenInNew,
} from '@mui/icons-material';
import { Lead } from '../../services/api';

interface LeadResultsProps {
  leads: Lead[];
  loading?: boolean;
  onLeadSelect?: (lead: Lead) => void;
  onLeadUpdate?: (lead: Lead) => void;
  onLeadDelete?: (leadId: string) => void;
  onExport?: () => void;
}

const LeadResults: React.FC<LeadResultsProps> = ({
  leads,
  loading = false,
  onLeadSelect,
  onLeadUpdate,
  onLeadDelete,
  onExport,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>(leads);

  // Filter leads based on search query
  useEffect(() => {
    const filtered = leads.filter(
      (lead) =>
        lead.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone?.includes(searchQuery) ||
        lead.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredLeads(filtered);
    setPage(0);
  }, [searchQuery, leads]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setOpenDetails(true);
    onLeadSelect?.(lead);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedLead(null);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
      new: 'primary',
      contacted: 'primary',
      qualified: 'success',
      converted: 'success',
      lost: 'error',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
      high: 'error',
      medium: 'warning',
      low: 'default',
    };
    return colors[priority] || 'default';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    if (score >= 40) return '#ff5722';
    return '#999';
  };

  const getDisplayedLeads = () => filteredLeads.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (leads.length === 0) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">No leads found. Start a scraping job to generate leads.</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader
          title="Scraping Results"
          subheader={`${filteredLeads.length} leads found`}
          action={
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={onExport}
              size="small"
            >
              Export
            </Button>
          }
        />
        <CardContent>
          <Stack spacing={2}>
            {/* Search Bar */}
            <TextField
              placeholder="Search by company, email, phone, industry, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            {/* Stats */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" color="primary">
                    {filteredLeads.length}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total Leads
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" color="success.main">
                    {filteredLeads.filter((l) => l.score >= 70).length}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    High Quality
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" color="warning.main">
                    {filteredLeads.filter((l) => l.priority === 'high').length}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    High Priority
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6">
                    {(filteredLeads.reduce((sum, l) => sum + l.score, 0) / filteredLeads.length).toFixed(1)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Avg Score
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Results Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell>Company Name</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Industry</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getDisplayedLeads().map((lead) => (
                    <TableRow key={lead.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {lead.company_name}
                        </Typography>
                        {lead.location && (
                          <Typography variant="caption" color="textSecondary">
                            {lead.location}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {lead.contact_name || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color: lead.email ? 'primary.main' : 'textSecondary',
                            cursor: lead.email ? 'pointer' : 'default',
                          }}
                        >
                          {lead.email ? lead.email.substring(0, 25) + (lead.email.length > 25 ? '...' : '') : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {lead.phone || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {lead.industry && (
                          <Chip
                            label={lead.industry}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: `${getScoreColor(lead.score)}20`,
                              fontWeight: 600,
                              color: getScoreColor(lead.score),
                              fontSize: '0.875rem',
                            }}
                          >
                            {Math.round(lead.score)}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                          size="small"
                          color={getPriorityColor(lead.priority)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(lead)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {lead.website && (
                          <Tooltip title="Visit Website">
                            <IconButton
                              size="small"
                              href={lead.website}
                              target="_blank"
                            >
                              <OpenInNew fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Copy Email">
                          <IconButton
                            size="small"
                            onClick={() => {
                              if (lead.email) {
                                navigator.clipboard.writeText(lead.email);
                              }
                            }}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredLeads.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Lead Details Dialog */}
      <Dialog open={openDetails} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{selectedLead?.company_name}</Typography>
            <Chip
              label={selectedLead?.status}
              size="small"
              color={getStatusColor(selectedLead?.status || '')}
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {/* Score */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                Fit Score
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: `${getScoreColor(selectedLead?.score || 0)}20`,
                    fontWeight: 600,
                    color: getScoreColor(selectedLead?.score || 0),
                    fontSize: '1.5rem',
                  }}
                >
                  {Math.round(selectedLead?.score || 0)}
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {selectedLead?.score && selectedLead.score >= 70
                    ? '✨ High Potential Lead'
                    : selectedLead?.score && selectedLead.score >= 50
                    ? '⭐ Medium Potential Lead'
                    : '📋 Follow Up Required'}
                </Typography>
              </Box>
            </Box>

            {/* Contact Information */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Contact Information
              </Typography>
              <List dense>
                {selectedLead?.contact_name && (
                  <ListItem disableGutters>
                    <ListItemText
                      primary="Contact Name"
                      secondary={selectedLead.contact_name}
                      primaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                )}
                {selectedLead?.email && (
                  <ListItem disableGutters>
                    <ListItemText
                      primary="Email"
                      secondary={selectedLead.email}
                      primaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                )}
                {selectedLead?.phone && (
                  <ListItem disableGutters>
                    <ListItemText
                      primary="Phone"
                      secondary={selectedLead.phone}
                      primaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                )}
                {selectedLead?.website && (
                  <ListItem disableGutters>
                    <ListItemText
                      primary="Website"
                      secondary={selectedLead.website}
                      primaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                )}
              </List>
            </Box>

            {/* Business Information */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Business Information
              </Typography>
              <List dense>
                {selectedLead?.industry && (
                  <ListItem disableGutters>
                    <ListItemText
                      primary="Industry"
                      secondary={selectedLead.industry}
                      primaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                )}
                {selectedLead?.location && (
                  <ListItem disableGutters>
                    <ListItemText
                      primary="Location"
                      secondary={selectedLead.location}
                      primaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                )}
                {selectedLead?.address && (
                  <ListItem disableGutters>
                    <ListItemText
                      primary="Address"
                      secondary={selectedLead.address}
                      primaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                )}
                {selectedLead?.company_size && (
                  <ListItem disableGutters>
                    <ListItemText
                      primary="Company Size"
                      secondary={selectedLead.company_size}
                      primaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                )}
              </List>
            </Box>

            {/* AI Analysis */}
            {selectedLead?.ai_analysis && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  AI Analysis
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                    <strong>Fit Assessment:</strong> {selectedLead.ai_analysis.fit_assessment}
                  </Typography>
                  {selectedLead.ai_analysis.recommended_products && (
                    <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                      <strong>Products:</strong> {selectedLead.ai_analysis.recommended_products.join(', ')}
                    </Typography>
                  )}
                  {selectedLead.ai_analysis.talking_points && (
                    <Typography variant="caption" component="div">
                      <strong>Talking Points:</strong> {selectedLead.ai_analysis.talking_points.join(', ')}
                    </Typography>
                  )}
                </Paper>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
          {selectedLead?.email && (
            <Button
              variant="contained"
              href={`mailto:${selectedLead.email}`}
            >
              Email
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LeadResults;
