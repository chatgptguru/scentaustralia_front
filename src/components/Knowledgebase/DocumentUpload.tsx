import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  PictureAsPdf,
  Description,
  VideoLibrary,
  Image,
  InsertDriveFile,
  CheckCircle,
  Error,
} from '@mui/icons-material';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: string;
  uploadDate: Date;
  status: 'uploading' | 'completed' | 'error';
  progress?: number;
}

interface DocumentUploadProps {
  onFileUpload?: (files: UploadedFile[]) => void;
  onFileDelete?: (fileId: string) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onFileUpload, onFileDelete }) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [openMetadataDialog, setOpenMetadataDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileCategory, setFileCategory] = useState('');
  const [fileDescription, setFileDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Products',
    'Processes',
    'Market Research',
    'Technology',
    'Support',
    'Training',
    'Policies',
  ];

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <PictureAsPdf color="error" />;
    if (type.includes('video')) return <VideoLibrary color="info" />;
    if (type.includes('image')) return <Image color="success" />;
    if (type.includes('document') || type.includes('word')) return <Description color="primary" />;
    return <InsertDriveFile color="action" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle color="success" />;
      case 'error': return <Error color="error" />;
      default: return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFileSelection(files);
    }
  };

  const handleFileSelection = (files: File[]) => {
    setSelectedFiles(files);
    setOpenMetadataDialog(true);
  };

  const handleUploadConfirm = () => {
    const newFiles: UploadedFile[] = selectedFiles.map((file, index) => ({
      id: Date.now().toString() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      category: fileCategory,
      uploadDate: new Date(),
      status: 'uploading' as const,
      progress: 0,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setOpenMetadataDialog(false);
    setSelectedFiles([]);
    setFileCategory('');
    setFileDescription('');

    // Simulate upload progress
    newFiles.forEach((file, index) => {
      simulateUpload(file.id, index * 500);
    });

    if (onFileUpload) {
      onFileUpload(newFiles);
    }
  };

  const simulateUpload = (fileId: string, delay: number) => {
    setTimeout(() => {
      const interval = setInterval(() => {
        setUploadedFiles(prev => prev.map(file => {
          if (file.id === fileId) {
            const newProgress = (file.progress || 0) + 10;
            if (newProgress >= 100) {
              clearInterval(interval);
              return { ...file, status: 'completed' as const, progress: 100 };
            }
            return { ...file, progress: newProgress };
          }
          return file;
        }));
      }, 200);
    }, delay);
  };

  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    if (onFileDelete) {
      onFileDelete(fileId);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Upload Documents
          </Typography>
          
          {/* Upload Area */}
          <Box
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
              border: 2,
              borderStyle: 'dashed',
              borderColor: dragOver ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              bgcolor: dragOver ? 'primary.light' : 'grey.50',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.light',
              },
            }}
            onClick={handleBrowseClick}
          >
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drag & drop files here or click to browse
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supported formats: PDF, DOC, DOCX, TXT, Images, Videos
            </Typography>
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              sx={{ mt: 2 }}
              onClick={(e) => {
                e.stopPropagation();
                handleBrowseClick();
              }}
            >
              Browse Files
            </Button>
          </Box>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi"
            style={{ display: 'none' }}
            onChange={handleFileInputChange}
          />
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Uploaded Documents ({uploadedFiles.length})
            </Typography>
            <List>
              {uploadedFiles.map((file, index) => (
                <ListItem key={file.id} divider={index < uploadedFiles.length - 1}>
                  <ListItemIcon>
                    {getFileIcon(file.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1">{file.name}</Typography>
                        <Chip label={file.category} size="small" variant="outlined" />
                        {getStatusIcon(file.status)}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(file.size)} • Uploaded {file.uploadDate.toLocaleDateString()}
                        </Typography>
                        {file.status === 'uploading' && (
                          <LinearProgress
                            variant="determinate"
                            value={file.progress || 0}
                            sx={{ mt: 1, height: 4, borderRadius: 2 }}
                          />
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteFile(file.id)}
                      disabled={file.status === 'uploading'}
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Metadata Dialog */}
      <Dialog open={openMetadataDialog} onClose={() => setOpenMetadataDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Document Information</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Adding metadata helps organize and search your documents more effectively.
            </Alert>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={fileCategory}
                onChange={(e) => setFileCategory(e.target.value)}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Description (Optional)"
              multiline
              rows={3}
              value={fileDescription}
              onChange={(e) => setFileDescription(e.target.value)}
              placeholder="Brief description of the document content..."
            />

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Files to upload: {selectedFiles.length}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMetadataDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUploadConfirm}
            variant="contained"
            disabled={!fileCategory}
          >
            Upload Files
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentUpload;
