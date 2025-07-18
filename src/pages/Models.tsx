import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Info, Delete } from '@mui/icons-material';

// Tipos basados en el JSON de la API
export type Model = {
  model_id: string;
  model_name: string;
  created_at: string;
  description: string;
  dimensions: string[];
  categories: string[];
  num_samples: number;
  label_distribution: Record<string, number>;
  training_type: string;
  training_results: {
    accuracy: number;
    classification_report: Record<string, any>;
    confusion_matrix: number[][];
  };
  age_ranges?: string[];
  genders?: string[];
  columns_used?: string[];
  labels?: string[];
};

type ModelsData = {
  models: Model[];
};

export const Models = () => {
  const theme = useTheme();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Fetch models
  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/api/models/list');
        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
        const data: ModelsData = await response.json();
        setModels(data.models);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error al obtener los modelos');
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  // Format date
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  // View details
  const handleViewDetails = (model: Model) => {
    setSelectedModel(model);
    setOpenDialog(true);
  };

  // Delete model
  const handleDelete = async (modelId: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/models/delete/${modelId}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      setModels(prev => prev.filter(m => m.model_id !== modelId));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al eliminar el modelo');
    } finally {
      setDeleteConfirm(false);
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'grey.900', color: 'white', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 3, color: theme.palette.warning.main }}>
        Modelos Guardados
      </Typography>

      {loading && <Typography>Cargando modelos...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      {!loading && !error && (
        <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#333' }}>
                <TableCell sx={{ color: 'white' }}>Nombre</TableCell>
                <TableCell sx={{ color: 'white' }}>Fecha</TableCell>
                <TableCell sx={{ color: 'white' }}>Descripción</TableCell>
                <TableCell sx={{ color: 'white' }}>Dimensiones</TableCell>
                <TableCell sx={{ color: 'white' }}>Muestras</TableCell>
                <TableCell sx={{ color: 'white' }}>Operaciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {models.map(model => (
                <TableRow key={model.model_id} sx={{ '&:nth-of-type(even)': { bgcolor: '#252525' } }}>
                  <TableCell sx={{ color: 'white' }}>{model.model_name}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{formatDate(model.created_at)}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{model.description}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {model.dimensions.map(dim => (
                        <Chip key={dim} label={dim} size="small" sx={{ bgcolor: theme.palette.warning.dark, color: 'white' }} />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>{model.num_samples}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Ver detalles">
                        <IconButton onClick={() => handleViewDetails(model)} sx={{ color: theme.palette.info.main }}>
                          <Info />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton onClick={() => { setSelectedModel(model); setDeleteConfirm(true); }} sx={{ color: theme.palette.error.main }}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Detalles Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: '#1e1e1e', color: 'white' } }}>
        <DialogTitle sx={{ color: theme.palette.warning.main }}>
          Detalles del Modelo: {selectedModel?.model_name}
        </DialogTitle>
        <DialogContent dividers>
          {selectedModel && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ color: theme.palette.warning.light }}>Descripción:</Typography>
                <Typography>{selectedModel.description}</Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 4 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ color: theme.palette.warning.light }}>Dimensiones:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                    {selectedModel.dimensions.map(dim => <Chip key={dim} label={dim} sx={{ bgcolor: theme.palette.warning.dark, color: 'white' }} />)}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle1" sx={{ color: theme.palette.warning.light }}>Categorías:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                    {selectedModel.categories.map(cat => (
                      <Chip key={cat} label={cat} sx={{
                        bgcolor: cat === 'Analista' ? '#3B8BEA' : cat === 'Diplomático' ? '#24B47E' : cat === 'Centinela' ? '#E6A600' : '#DD3E3E',
                        color: 'white'
                      }} />
                    ))}
                  </Box>
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ color: theme.palette.warning.light }}>Distribución de categorías:</Typography>
                <TableContainer component={Paper} sx={{ bgcolor: '#252525', mt: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: 'white' }}>Categoría</TableCell>
                        <TableCell sx={{ color: 'white' }} align="right">Cantidad</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(selectedModel.label_distribution).map(([label, count]) => (
                        <TableRow key={label}>
                          <TableCell sx={{ color: 'white' }}><Chip label={label} sx={{ bgcolor: label === 'Analista' ? '#3B8BEA' : label === 'Diplomático' ? '#24B47E' : label === 'Centinela' ? '#E6A600' : '#DD3E3E', color: 'white' }} /></TableCell>
                          <TableCell sx={{ color: 'white' }} align="right">{count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ color: theme.palette.warning.light }}>Métricas:</Typography>
                <Typography>Tipo: {selectedModel.training_type === 'classical' ? 'Clásico' : 'Clustering'}</Typography>
                <Typography>Muestras: {selectedModel.num_samples}</Typography>
                <Typography>Precisión: {(selectedModel.training_results.accuracy * 100).toFixed(2)}%</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: theme.palette.warning.main }}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)} PaperProps={{ sx: { bgcolor: '#1e1e1e', color: 'white' } }}>
        <DialogTitle sx={{ color: theme.palette.error.main }}>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar el modelo "{selectedModel?.model_name}"?</Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'grey.400' }}>Esta acción no se puede deshacer.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(false)} sx={{ color: 'grey.300' }}>Cancelar</Button>
          <Button onClick={() => selectedModel && handleDelete(selectedModel.model_id)} sx={{ color: theme.palette.error.main }}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
