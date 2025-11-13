import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Description,
  Add,
  Edit,
  Delete,
  Download,
  Preview,
  Send,
  Business,
  Email,
  Phone,
  LocationOn,
  AttachMoney,
  Schedule,
} from '@mui/icons-material';

interface DocumentTemplate {
  id: string;
  name: string;
  type: 'quote' | 'proposal' | 'contract' | 'report';
  description: string;
  lastUsed: Date;
  usageCount: number;
}

interface ClientInfo {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
}

const DocumentGenerator: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
  });
  const [activeStep, setActiveStep] = useState(0);
  const [openPreview, setOpenPreview] = useState(false);
  const [documentContent, setDocumentContent] = useState('');

  const templates: DocumentTemplate[] = [
    {
      id: '1',
      name: 'Premium Fragrance Quote',
      type: 'quote',
      description: 'Standard quote template for premium fragrance solutions',
      lastUsed: new Date('2024-11-01'),
      usageCount: 45,
    },
    {
      id: '2',
      name: 'Retail Partnership Proposal',
      type: 'proposal',
      description: 'Comprehensive proposal for retail partnerships',
      lastUsed: new Date('2024-10-28'),
      usageCount: 23,
    },
    {
      id: '3',
      name: 'Service Agreement Contract',
      type: 'contract',
      description: 'Standard service agreement template',
      lastUsed: new Date('2024-10-25'),
      usageCount: 12,
    },
    {
      id: '4',
      name: 'Market Analysis Report',
      type: 'report',
      description: 'Detailed market analysis and insights report',
      lastUsed: new Date('2024-10-20'),
      usageCount: 8,
    },
  ];

  const recentDocuments = [
    { name: 'Quote - Luxury Retail Group', date: '2024-11-05', status: 'Sent' },
    { name: 'Proposal - Boutique Chain', date: '2024-11-04', status: 'Draft' },
    { name: 'Contract - Premium Solutions', date: '2024-11-03', status: 'Signed' },
    { name: 'Report - Q3 Analysis', date: '2024-11-01', status: 'Completed' },
  ];

  const steps = ['Select Template', 'Client Information', 'Content Customization', 'Review & Generate'];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quote': return 'primary';
      case 'proposal': return 'secondary';
      case 'contract': return 'success';
      case 'report': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sent': return 'info';
      case 'Draft': return 'warning';
      case 'Signed': return 'success';
      case 'Completed': return 'success';
      default: return 'default';
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleGenerateDocument = () => {
    // Simulate document generation
    const template = templates.find(t => t.id === selectedTemplate);
    setDocumentContent(`
      Generated ${template?.name}
      
      Client: ${clientInfo.name}
      Company: ${clientInfo.company}
      Email: ${clientInfo.email}
      Phone: ${clientInfo.phone}
      Address: ${clientInfo.address}
      
      This is a preview of the generated document content...
    `);
    setOpenPreview(true);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            {templates.map((template) => (
              <Grid item xs={12} md={6} key={template.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedTemplate === template.id ? 2 : 1,
                    borderColor: selectedTemplate === template.id ? 'primary.main' : 'grey.300',
                    '&:hover': { boxShadow: 4 },
                  }}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: `${getTypeColor(template.type)}.main`, mr: 2 }}>
                        <Description />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">{template.name}</Typography>
                        <Chip
                          label={template.type.toUpperCase()}
                          size="small"
                          color={getTypeColor(template.type) as any}
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {template.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Used {template.usageCount} times
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Last used: {template.lastUsed.toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Client Name"
                value={clientInfo.name}
                onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Company Name"
                value={clientInfo.company}
                onChange={(e) => setClientInfo({ ...clientInfo, company: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={clientInfo.email}
                onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={clientInfo.phone}
                onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={4}
                value={clientInfo.address}
                onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Customize Document Content
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  multiline
                  rows={12}
                  label="Document Content"
                  placeholder="AI will generate content based on your template and client information..."
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    AI Suggestions
                  </Typography>
                  <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
                    Add Product Recommendations
                  </Button>
                  <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
                    Include Market Insights
                  </Button>
                  <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
                    Add Pricing Options
                  </Button>
                </Paper>
                
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Document Settings
                  </Typography>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Include Company Logo"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Add Digital Signature"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Include Terms & Conditions"
                  />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review & Generate Document
            </Typography>
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Template: {templates.find(t => t.id === selectedTemplate)?.name}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Client: {clientInfo.name} ({clientInfo.company})
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Email: {clientInfo.email}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Phone: {clientInfo.phone}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<Preview />}
                onClick={handleGenerateDocument}
                size="large"
              >
                Generate & Preview
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                size="large"
              >
                Generate PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<Send />}
                size="large"
              >
                Generate & Send
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Document Generator
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create professional quotes, proposals, and reports with AI assistance
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {renderStepContent(activeStep)}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  variant="contained"
                  disabled={activeStep === steps.length - 1 || (activeStep === 0 && !selectedTemplate)}
                >
                  {activeStep === steps.length - 1 ? 'Generate' : 'Next'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Add />}
                sx={{ mb: 2 }}
              >
                New Template
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Business />}
                sx={{ mb: 2 }}
              >
                Import Client Data
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Schedule />}
              >
                Schedule Generation
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Documents
              </Typography>
              <List>
                {recentDocuments.map((doc, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                          <Description />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={doc.name}
                        secondary={doc.date}
                        primaryTypographyProps={{ fontSize: '0.875rem' }}
                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                      />
                      <Chip
                        label={doc.status}
                        size="small"
                        color={getStatusColor(doc.status) as any}
                        variant="outlined"
                      />
                    </ListItem>
                    {index < recentDocuments.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Preview Dialog */}
      <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="md" fullWidth>
        <DialogTitle>Document Preview</DialogTitle>
        <DialogContent>
          <Paper sx={{ p: 3, bgcolor: 'grey.50', minHeight: 400 }}>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
              {documentContent}
            </pre>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>Close</Button>
          <Button variant="outlined" startIcon={<Edit />}>
            Edit
          </Button>
          <Button variant="contained" startIcon={<Download />}>
            Download PDF
          </Button>
          <Button variant="contained" startIcon={<Send />}>
            Send to Client
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentGenerator;
