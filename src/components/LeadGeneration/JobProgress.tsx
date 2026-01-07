import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  LinearProgress,
  Typography,
  Stack,
  Chip,
  Alert,
  Button,
  CircularProgress,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Error as ErrorIcon,
  Schedule,
  TrendingUp,
  Refresh,
  Download,
  Close,
} from '@mui/icons-material';
import { scraperApi, ScrapingJob } from '../../services/api';

interface JobProgressProps {
  jobId: string;
  onCompleted?: (job: ScrapingJob) => void;
  onFailed?: (job: ScrapingJob) => void;
  onClose?: () => void;
}

const JobProgress: React.FC<JobProgressProps> = ({
  jobId,
  onCompleted,
  onFailed,
  onClose,
}) => {
  const [job, setJob] = useState<ScrapingJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch job status
  const fetchJobStatus = async () => {
    try {
      const response = await scraperApi.getJobStatus(jobId);
      if (response.success && response.data) {
        setJob(response.data);
        setError(null);

        // Call callbacks when status changes
        if (response.data.status === 'completed') {
          onCompleted?.(response.data);
          setAutoRefresh(false);
        } else if (response.data.status === 'failed') {
          onFailed?.(response.data);
          setAutoRefresh(false);
        }
      } else {
        throw new Error(response.error || 'Failed to fetch job status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job status');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchJobStatus();
  }, [jobId]);

  // Auto-refresh while running
  useEffect(() => {
    if (!autoRefresh || !job || job.status !== 'running') {
      return;
    }

    const interval = setInterval(fetchJobStatus, 2000);
    return () => clearInterval(interval);
  }, [autoRefresh, job?.status]);

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error || !job) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            {error || 'Failed to load job details'}
          </Alert>
          <Button onClick={fetchJobStatus} variant="outlined" sx={{ mt: 2 }}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const progressPercent =
    job.total_leads > 0 ? Math.round((job.processed_leads / job.total_leads) * 100) : 0;
  const isComplete = job.status === 'completed' || job.status === 'failed';

  const getStatusChip = () => {
    const statusConfig: Record<string, { color: any; icon: any }> = {
      running: { color: 'info', icon: <Schedule /> },
      completed: { color: 'success', icon: <CheckCircle /> },
      failed: { color: 'error', icon: <ErrorIcon /> },
      stopped: { color: 'warning', icon: <Close /> },
      pending: { color: 'default', icon: <Schedule /> },
    };

    const config = statusConfig[job.status] || statusConfig.pending;
    return (
      <Chip
        icon={config.icon}
        label={job.status.charAt(0).toUpperCase() + job.status.slice(1)}
        color={config.color}
        variant="outlined"
      />
    );
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  const getDuration = () => {
    if (!job.completed_at) return 'In Progress';
    const start = new Date(job.started_at);
    const end = new Date(job.completed_at);
    const durationSeconds = Math.round((end.getTime() - start.getTime()) / 1000);

    if (durationSeconds < 60) return `${durationSeconds}s`;
    if (durationSeconds < 3600) return `${Math.round(durationSeconds / 60)}m`;
    return `${Math.round(durationSeconds / 3600)}h ${Math.round((durationSeconds % 3600) / 60)}m`;
  };

  return (
    <Card>
      <CardHeader
        title="Scraping Job Progress"
        subheader={`Job ID: ${jobId}`}
        action={
          <Button
            size="small"
            variant="outlined"
            startIcon={<Close />}
            onClick={onClose}
          >
            Close
          </Button>
        }
      />
      <CardContent>
        <Stack spacing={3}>
          {/* Status Section */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Status
              </Typography>
              {getStatusChip()}
            </Box>
          </Box>

          {/* Progress Bar */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Progress: {job.processed_leads} / {job.total_leads} leads
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {progressPercent}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={progressPercent} />
          </Box>

          {/* Stats Grid */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  {job.total_leads}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Total Leads
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="success.main">
                  {job.processed_leads}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Processed
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="error">
                  {job.errors.length}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Errors
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{getDuration()}</Typography>
                <Typography variant="caption" color="textSecondary">
                  Duration
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Divider />

          {/* Timeline */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
              Timeline
            </Typography>
            <List dense>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
                  <Schedule fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Started"
                  secondary={formatTime(job.started_at)}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
              {job.completed_at && (
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
                    {job.status === 'completed' ? <CheckCircle color="success" /> : <ErrorIcon color="error" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={job.status === 'completed' ? 'Completed' : 'Failed'}
                    secondary={formatTime(job.completed_at)}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              )}
            </List>
          </Box>

          {/* Errors List */}
          {job.errors.length > 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Errors ({job.errors.length})
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'error.light' }}>
                <List dense>
                  {job.errors.slice(0, 5).map((error, index) => (
                    <ListItem key={index} disableGutters>
                      <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                        <ErrorIcon fontSize="small" color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={error}
                        primaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                  {job.errors.length > 5 && (
                    <Typography variant="caption" color="textSecondary" sx={{ ml: 4 }}>
                      ... and {job.errors.length - 5} more
                    </Typography>
                  )}
                </List>
              </Paper>
            </Box>
          )}

          {/* Parameters */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Parameters
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" component="div">
                <strong>Keywords:</strong> {job.parameters.keywords.join(', ')}
              </Typography>
              <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
                <strong>Locations:</strong> {job.parameters.locations.join(', ')}
              </Typography>
              <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
                <strong>Sources:</strong> {job.parameters.sources.join(', ')}
              </Typography>
              <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
                <strong>AI Analysis:</strong> {job.parameters.analyze_with_ai ? 'Enabled' : 'Disabled'}
              </Typography>
            </Paper>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchJobStatus}
              disabled={loading}
              fullWidth
            >
              Refresh
            </Button>
            {isComplete && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Download />}
                fullWidth
              >
                Export Results
              </Button>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default JobProgress;
