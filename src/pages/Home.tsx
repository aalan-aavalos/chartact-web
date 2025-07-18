import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Modal,
  TextField,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme,
  MenuItem,
  Select,
  Switch,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";

// Tipos y datos constantes
type Dimension = "E/I" | "S/N" | "T/F" | "J/P";
type Cluster = "Analista" | "Diplomático" | "Centinela" | "Explorador";

type SavedModel = {
  id: string;
  name: string;
  dimensions: Dimension[];
  clusters: Cluster[];
  description: string;
  creationDate: string;
};

const DIMENSIONS: Dimension[] = ["E/I", "S/N", "T/F", "J/P"];
const CLUSTERS: Cluster[] = ["Analista", "Diplomático", "Centinela", "Explorador"];

type ModelData = {
  name: string;
  dimensions: Dimension[];
  clusters: Cluster[];
  description: string;
  totalResponses: number;
  clusterDistribution: Record<Cluster, number>;
  rawData: {
    name: string;
    genero: string;
    edad: number;
    tipo: Cluster;
  }[];
};

export const Home = () => {
  const theme = useTheme();

  // Estados
  const [file, setFile] = useState<File | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [action, setAction] = useState<"select" | "create">("select");
  const [selectedDimensions, setSelectedDimensions] = useState<Dimension[]>([]);
  const [selectedClusters, setSelectedClusters] = useState<Cluster[]>([]);
  const [newModelName, setNewModelName] = useState("");
  const [modelDescription, setModelDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [modelData, setModelData] = useState<ModelData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [creationMethod, setCreationMethod] = useState<"cluster" | "normal">("cluster");
  const [openCSVModal, setOpenCSVModal] = useState(false);
  const [openPDFModal, setOpenPDFModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<SavedModel | null>(null);

  // Dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    setOpenModal(true);
  }, []);

  const [filters, setFilters] = useState({
  genero: [] as string[],
  edad: { min: 18, max: 100 },
  tipos: [] as Cluster[],
  todosDatos: true,
  incluirInterpretacion: true,
  incluirGraficas: true
});

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });


  const GROUP_COLORS = {
  Analista: '#3B8BEA',      // Azul brillante (NT)
  Diplomático: '#24B47E',   // Verde esmeralda (NF)
  Centinela: '#E6A600',     // Amarillo dorado (SJ)
  Explorador: '#DD3E3E'     // Rojo coral (SP)
} as const;

  const StyledTable = ({ data }: { data: ModelData['rawData'] }) => {
  return (
    <Box sx={{
      maxHeight: 500,
      overflow: "auto",
      '& table': {
        width: '100%',
        borderCollapse: 'collapse',
        '& th, & td': {
          padding: '12px 16px',
          borderBottom: '1px solid #444'
        },
        '& th': {
          backgroundColor: '#333',
          color: 'white',
          textAlign: 'left',
          position: 'sticky',
          top: 0,
          zIndex: 1
        },
        '& tr:nth-of-type(even)': {
          backgroundColor: '#252525'
        },
        '& tr:hover': {
          backgroundColor: '#333'
        }
      }
    }}>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Género</th>
            <th>Edad</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.name}</td>
              <td>{row.genero}</td>
              <td>{row.edad}</td>
              <td>
                <Chip
  label={row.tipo}
  sx={{
    bgcolor: GROUP_COLORS[row.tipo],
    color: 'white',
    fontWeight: 'bold',
    minWidth: 100,
    transition: 'all 0.3s ease',
    '&.MuiChip-root': {
      backgroundColor: GROUP_COLORS[row.tipo],
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        opacity: 0.9
      }
    }
  }}
/>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
};

  const CSVDownloadModal = () => (
  <Modal open={openCSVModal} onClose={() => setOpenCSVModal(false)}>
    <Card sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 500,
      bgcolor: "#1e1e1e",
      border: "1px solid #444",
      p: 3,
      outline: "none"
    }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h6" sx={{ color: theme.palette.warning.main }}>
          Filtros para CSV
        </Typography>
        <Button onClick={() => setOpenCSVModal(false)} sx={{ color: "grey.500" }}>
          <CloseIcon />
        </Button>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Filtro de género */}
        <FormControl fullWidth sx={selectStyles}>
          <InputLabel>Género</InputLabel>
          <Select
            multiple
            value={filters.genero}
            onChange={(e) => setFilters({...filters, genero: e.target.value as string[]})}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", gap: 1 }}>
                {selected.length === 0 ? 'Todos' : selected.join(', ')}
              </Box>
            )}
          >
            <MenuItem value="Masculino">Masculino</MenuItem>
            <MenuItem value="Femenino">Femenino</MenuItem>
            <MenuItem value="Otro">Otro</MenuItem>
          </Select>
        </FormControl>

        {/* Filtro de edad */}
        <Box>
          <Typography gutterBottom sx={{ color: '#b0b0b0' }}>
            Rango de edad: {filters.edad.min} - {filters.edad.max}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              type="number"
              value={filters.edad.min}
              onChange={(e) => setFilters({...filters, edad: {...filters.edad, min: parseInt(e.target.value) || 0}})}
              sx={{ ...selectStyles, flex: 1 }}
            />
            <Typography sx={{ color: '#b0b0b0' }}>a</Typography>
            <TextField
              type="number"
              value={filters.edad.max}
              onChange={(e) => setFilters({...filters, edad: {...filters.edad, max: parseInt(e.target.value) || 100}})}
              sx={{ ...selectStyles, flex: 1 }}
            />
          </Box>
        </Box>

        {/* Filtro de tipos de personalidad */}
        <FormControl fullWidth sx={selectStyles}>
          <InputLabel>Tipo de personalidad</InputLabel>
          <Select
            multiple
            value={filters.tipos}
            onChange={(e) => setFilters({...filters, tipos: e.target.value as Cluster[]})}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", gap: 1 }}>
                {selected.length === 0 ? 'Todos' : selected.join(', ')}
              </Box>
            )}
          >
            {CLUSTERS.map((tipo) => (
              <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Cantidad de datos */}
        <FormControl fullWidth sx={selectStyles}>
          <InputLabel>Cantidad de datos</InputLabel>
          <Select
            value={filters.todosDatos ? 'all' : 'partial'}
            onChange={(e) => setFilters({...filters, todosDatos: e.target.value === 'all'})}
          >
            <MenuItem value="all">Todos los datos</MenuItem>
            <MenuItem value="partial">Solo una parte</MenuItem>
          </Select>
        </FormControl>

        {/* Botones de acción */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button 
            variant="outlined" 
            onClick={() => setOpenCSVModal(false)}
            sx={{ color: theme.palette.warning.main, borderColor: theme.palette.warning.main }}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained"
            sx={{ bgcolor: theme.palette.warning.main, color: "grey.900" }}
          >
            Descargar CSV
          </Button>
        </Box>
      </Box>
    </Card>
  </Modal>
);

const PDFDownloadModal = () => (
  <Modal open={openPDFModal} onClose={() => setOpenPDFModal(false)}>
    <Card sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 500,
      bgcolor: "#1e1e1e",
      border: "1px solid #444",
      p: 3,
      outline: "none"
    }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h6" sx={{ color: theme.palette.warning.main }}>
          Filtros para PDF
        </Typography>
        <Button onClick={() => setOpenPDFModal(false)} sx={{ color: "grey.500" }}>
          <CloseIcon />
        </Button>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Filtro de género (igual que en CSV) */}
        <FormControl fullWidth sx={selectStyles}>
          <InputLabel>Género</InputLabel>
          <Select
            multiple
            value={filters.genero}
            onChange={(e) => setFilters({...filters, genero: e.target.value as string[]})}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", gap: 1 }}>
                {selected.length === 0 ? 'Todos' : selected.join(', ')}
              </Box>
            )}
          >
            <MenuItem value="Masculino">Masculino</MenuItem>
            <MenuItem value="Femenino">Femenino</MenuItem>
            <MenuItem value="Otro">Otro</MenuItem>
          </Select>
        </FormControl>

        {/* Filtro de edad (igual que en CSV) */}
        <Box>
          <Typography gutterBottom sx={{ color: '#b0b0b0' }}>
            Rango de edad: {filters.edad.min} - {filters.edad.max}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              type="number"
              value={filters.edad.min}
              onChange={(e) => setFilters({...filters, edad: {...filters.edad, min: parseInt(e.target.value) || 0}})}
              sx={{ ...selectStyles, flex: 1 }}
            />
            <Typography sx={{ color: '#b0b0b0' }}>a</Typography>
            <TextField
              type="number"
              value={filters.edad.max}
              onChange={(e) => setFilters({...filters, edad: {...filters.edad, max: parseInt(e.target.value) || 100}})}
              sx={{ ...selectStyles, flex: 1 }}
            />
          </Box>
        </Box>

        {/* Filtro de tipos de personalidad (igual que en CSV) */}
        <FormControl fullWidth sx={selectStyles}>
          <InputLabel>Tipo de personalidad</InputLabel>
          <Select
            multiple
            value={filters.tipos}
            onChange={(e) => setFilters({...filters, tipos: e.target.value as Cluster[]})}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", gap: 1 }}>
                {selected.length === 0 ? 'Todos' : selected.join(', ')}
              </Box>
            )}
          >
            {CLUSTERS.map((tipo) => (
              <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Opciones de contenido para PDF */}
        <FormControl fullWidth sx={selectStyles}>
          <InputLabel>Contenido del PDF</InputLabel>
          <Select
            multiple
            value={[
              ...(filters.incluirInterpretacion ? ['interpretacion'] : []),
              ...(filters.incluirGraficas ? ['graficas'] : [])
            ]}
            onChange={(e) => {
              const value = e.target.value as string[];
              setFilters({
                ...filters,
                incluirInterpretacion: value.includes('interpretacion'),
                incluirGraficas: value.includes('graficas')
              });
            }}
            renderValue={(selected) => selected.join(', ').replace('interpretacion', 'Interpretación').replace('graficas', 'Gráficas')}
          >
            <MenuItem value="interpretacion">Interpretación</MenuItem>
            <MenuItem value="graficas">Gráficas</MenuItem>
          </Select>
        </FormControl>

        {/* Botones de acción */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button 
            variant="outlined" 
            onClick={() => setOpenPDFModal(false)}
            sx={{ color: theme.palette.warning.main, borderColor: theme.palette.warning.main }}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained"
            sx={{ bgcolor: theme.palette.warning.main, color: "grey.900" }}
          >
            Generar PDF
          </Button>
        </Box>
      </Box>
    </Card>
  </Modal>
);

  // Validación y envío
  const validateAndSubmit = () => {
    if (action === "create") {
      if (selectedDimensions.length < 2 || selectedClusters.length < 2) {
        setError("¡Debes seleccionar al menos 2 dimensiones y 2 clusters!");
        return false;
      }
      if (!newModelName.trim()) {
        setError("¡Debes ingresar un nombre para el modelo!");
        return false;
      }
    }
    return true;
  };

  const SAVED_MODELS: SavedModel[] = [
  {
    id: '1',
    name: 'Modelo MBTI Completo',
    dimensions: ['E/I', 'S/N', 'T/F', 'J/P'],
    clusters: ['Analista', 'Diplomático', 'Centinela', 'Explorador'],
    description: 'Modelo completo con las 4 dimensiones MBTI',
    creationDate: '2023-05-15'
  },
  {
    id: '2',
    name: 'Modelo Simplificado',
    dimensions: ['E/I', 'S/N'],
    clusters: ['Analista', 'Diplomático'],
    description: 'Modelo con solo 2 dimensiones básicas',
    creationDate: '2023-06-20'
  },
  // Puedes añadir más modelos aquí
];

  const handleSubmit = () => {
    if (!validateAndSubmit() || !file) return;

    setIsLoading(true);

    // Simulación del backend
    setTimeout(() => {
      const mockResponse: ModelData = {
        name: newModelName,
        dimensions: selectedDimensions,
        clusters: selectedClusters,
        description: modelDescription,
        totalResponses: 150,
        clusterDistribution: {
          Analista: 50,
          Diplomático: 40,
          Centinela: 35,
          Explorador: 25
        },
        rawData: [
          {
            name: "Juan",
            genero: "Masculino",
            edad: 28,
            tipo: "Analista"
          },
          {
            name: "Ana",
            genero: "Femenino",
            edad: 32,
            tipo: "Diplomático"
          },
          // ... más datos de ejemplo
        ],
      };

      setModelData(mockResponse);
      setOpenModal(false);
      setIsLoading(false);
    }, 2000);
  };

  // Estilos para los selects
  const selectStyles = {
  '& .MuiInputBase-root': {
    color: '#fff',
    '& fieldset': {
      borderColor: '#444',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.warning.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.warning.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: '#b0b0b0',
    '&.Mui-focused': {
      color: theme.palette.warning.main,
    },
  },
  '& .MuiSvgIcon-root': {
    color: '#b0b0b0',
  },
  '& .MuiSelect-select': {
    backgroundColor: '#1e1e1e',
    color: '#fff',
  },
  '& .MuiInputBase-input': {
    color: '#fff',
  },
  '& .MuiFormLabel-root.Mui-focused': {
    color: theme.palette.warning.main,
  }
};

  return (
    <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "grey.900", color: "white" }}>
      {/* Dropzone (solo visible si no hay datos) */}
      {!modelData && (
        <Card sx={{ mb: 3, bgcolor: "#1e1e1e", border: "1px solid #444" }}>
          <CardContent>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <Box
                sx={{
                  p: 4,
                  border: "2px dashed",
                  borderColor: theme.palette.warning.main,
                  bgcolor: isDragActive ? "#252526" : "#1e1e1e",
                  textAlign: "center",
                  cursor: "pointer",
                  '&:hover': { borderColor: theme.palette.warning.dark },
                }}
              >
                <CloudUploadIcon sx={{
                  fontSize: 50,
                  color: theme.palette.warning.main,
                  mb: 2
                }} />
                <Typography variant="h6" sx={{ color: '#fff' }}>
                  {isDragActive ? "¡Suelta tu archivo aquí!" : "Arrastra un archivo CSV o haz clic para seleccionar"}
                </Typography>
                <Typography sx={{ mt: 1, color: "grey.500" }}>
                  Solo se aceptan archivos CSV
                </Typography>
              </Box>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal para subir archivo */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Card sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          bgcolor: "#1e1e1e",
          border: "1px solid #444",
          p: 3,
          outline: "none"
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h6">
              <Box component="span" sx={{ color: theme.palette.warning.main }}>
                Archivo:
              </Box>{" "}
              <Box component="span" sx={{ color: '#fff' }}>
                {file?.name}
              </Box>
            </Typography>
            <Button
              onClick={() => setOpenModal(false)}
              sx={{ color: "grey.500", minWidth: 'auto' }}
            >
              <CloseIcon />
            </Button>
          </Box>

          {/* Selector de acción */}
          <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
            <Button
              variant={action === "select" ? "contained" : "outlined"}
              onClick={() => setAction("select")}
              sx={{
                flex: 1,
                color: action === "select" ? "grey.900" : theme.palette.warning.main,
                bgcolor: action === "select" ? theme.palette.warning.main : 'transparent',
                borderColor: theme.palette.warning.main,
                '&:hover': { bgcolor: action === "select" ? theme.palette.warning.dark : 'rgba(255, 167, 38, 0.08)' },
              }}
            >
              Seleccionar Modelo
            </Button>
            <Button
              variant={action === "create" ? "contained" : "outlined"}
              onClick={() => setAction("create")}
              sx={{
                flex: 1,
                color: action === "create" ? "grey.900" : theme.palette.warning.main,
                bgcolor: action === "create" ? theme.palette.warning.main : 'transparent',
                borderColor: theme.palette.warning.main,
                '&:hover': { bgcolor: action === "create" ? theme.palette.warning.dark : 'rgba(255, 167, 38, 0.08)' },
              }}
            >
              Crear Nuevo Modelo
            </Button>
          </Box>

          {/* Selector de método (solo visible en creación) */}
          {action === "create" && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography sx={{ mr: 2, color: '#fff' }}>Método Normal</Typography>
              <Switch
                checked={creationMethod === "cluster"}
                onChange={() => setCreationMethod(creationMethod === "cluster" ? "normal" : "cluster")}
                color="warning"
                inputProps={{ 'aria-label': 'Método de creación' }}
              />
              <Typography sx={{ ml: 2, color: '#fff' }}>Método Cluster</Typography>
            </Box>
          )}

          {action === "select" && (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
    <FormControl fullWidth sx={selectStyles}>
      <InputLabel>Modelos disponibles</InputLabel>
      <Select
        value={selectedModel?.id || ''}
        onChange={(e) => {
          const modelId = e.target.value;
          const model = SAVED_MODELS.find(m => m.id === modelId) || null;
          setSelectedModel(model);
        }}
        sx={selectStyles}
      >
        {SAVED_MODELS.map((model) => (
          <MenuItem key={model.id} value={model.id}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Typography>{model.name}</Typography>
              <Typography sx={{ color: 'grey.500' }}>
                {model.dimensions.length} dimensiones
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    {/* Información del modelo seleccionado */}
    {selectedModel && (
      <Card sx={{ bgcolor: '#252525', p: 2 }}>
        <Typography variant="subtitle1" sx={{ color: theme.palette.warning.main }}>
          {selectedModel.name}
        </Typography>
        <Typography variant="body2" sx={{ color: 'grey.300', mt: 1 }}>
          {selectedModel.description}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ color: 'grey.500' }}>
            Dimensiones incluidas:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
            {selectedModel.dimensions.map(dim => (
              <Chip
                key={dim}
                label={dim}
                size="small"
                sx={{ 
                  bgcolor: '#333', 
                  color: 'white',
                  '& .MuiChip-label': { fontSize: '0.75rem' }
                }}
              />
            ))}
          </Box>
        </Box>
        <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', mt: 1 }}>
          Creado: {new Date(selectedModel.creationDate).toLocaleDateString()}
        </Typography>
      </Card>
    )}

    <Button
      variant="contained"
      disabled={!selectedModel}
      onClick={() => {
        if (selectedModel) {
          // Lógica para analizar con el modelo seleccionado
          setIsLoading(true);
          setTimeout(() => {
            const mockResponse: ModelData = {
              name: selectedModel.name,
              dimensions: selectedModel.dimensions,
              clusters: selectedModel.clusters,
              description: selectedModel.description,
              totalResponses: 120,
              clusterDistribution: {
                Analista: 30,
                Diplomático: 40,
                Centinela: 25,
                Explorador: 25
              },
              rawData: [
                {
                  name: "Usuario Ejemplo",
                  genero: "Masculino",
                  edad: 30,
                  tipo: "Analista"
                }
              ]
            };
            setModelData(mockResponse);
            setOpenModal(false);
            setIsLoading(false);
          }, 1500);
        }
      }}
      sx={{
        mt: 2,
        bgcolor: theme.palette.warning.main,
        color: "grey.900",
        '&:hover': { bgcolor: theme.palette.warning.dark },
        '&:disabled': { bgcolor: '#555', color: '#999' }
      }}
    >
      Analizar con este modelo
    </Button>
  </Box>
)}

          {action === "create" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                label="Nombre del modelo"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                sx={{ ...selectStyles, '& .MuiInputBase-input': { color: '#fff' } }}
              />

              <FormControl fullWidth sx={selectStyles}>
                <InputLabel>Dimensiones MBTI</InputLabel>
                <Select
                  multiple
                  value={selectedDimensions}
                  onChange={(e) => setSelectedDimensions(e.target.value as Dimension[])}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={value}
                          sx={{ bgcolor: theme.palette.warning.main, color: "grey.900" }}
                        />
                      ))}
                    </Box>
                  )}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: "#1e1e1e",
                        color: "#fff",
                        '& .MuiMenuItem-root': {
                          '&:hover': {
                            backgroundColor: '#333',
                          },
                          '&.Mui-selected': {
                            backgroundColor: theme.palette.warning.dark,
                            color: '#fff',
                          },
                        },
                      },
                    },
                  }}
                >
                  {DIMENSIONS.map((dim) => (
                    <MenuItem key={dim} value={dim}>{dim}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={selectStyles}>
                <InputLabel>Clusters de Personalidad</InputLabel>
                <Select
                  multiple
                  value={selectedClusters}
                  onChange={(e) => setSelectedClusters(e.target.value as Cluster[])}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={value}
                          sx={{ bgcolor: theme.palette.warning.main, color: "grey.900" }}
                        />
                      ))}
                    </Box>
                  )}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: "#1e1e1e",
                        color: "#fff",
                        '& .MuiMenuItem-root': {
                          '&:hover': {
                            backgroundColor: '#333',
                          },
                          '&.Mui-selected': {
                            backgroundColor: theme.palette.warning.dark,
                            color: '#fff',
                          },
                        },
                      },
                    },
                  }}
                >
                  {CLUSTERS.map((cluster) => (
                    <MenuItem key={cluster} value={cluster}>{cluster}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Descripción del modelo"
                multiline
                rows={3}
                value={modelDescription}
                onChange={(e) => setModelDescription(e.target.value)}
                sx={{ ...selectStyles, '& .MuiInputBase-input': { color: '#fff' } }}
              />

              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{
                  mt: 2,
                  bgcolor: theme.palette.warning.main,
                  color: "grey.900",
                  '&:hover': { bgcolor: theme.palette.warning.dark },
                }}
              >
                Analizar y Crear
              </Button>
            </Box>
          )}
        </Card>
      </Modal>

      {/* Pantalla de resultados */}
      {modelData && (
        <Box sx={{ mt: 4 }}>
          {/* Encabezado del modelo */}
          <Card sx={{ bgcolor: "#1e1e1e", mb: 3, p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h4" sx={{ color: theme.palette.warning.main }}>
                {modelData.name}
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                {modelData.dimensions.map((dim) => (
                  <Chip
                    key={dim}
                    label={dim}
                    sx={{ bgcolor: theme.palette.warning.dark, color: "white" }}
                  />
                ))}
              </Box>
            </Box>
            <Typography sx={{ mt: 2, color: "grey.300" }}>
              {modelData.description}
            </Typography>
          </Card>

          {/* Estadísticas */}
          <Card sx={{ bgcolor: "#1e1e1e", mb: 3, p: 3 }}>
            <Typography variant="h6" sx={{ color: theme.palette.warning.main, mb: 2 }}>
              Estadísticas
            </Typography>
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <Box>
                <Typography sx={{ color: "grey.400" }}>Total de respuestas:</Typography>
                <Typography sx={{ fontSize: 24, color: "white" }}>
                  {modelData.totalResponses}
                </Typography>
              </Box>
              {Object.entries(modelData.clusterDistribution).map(([cluster, count]) => (
                <Box key={cluster}>
                  <Typography sx={{ color: "grey.400" }}>{cluster}:</Typography>
                  <Typography sx={{ fontSize: 24, color: "white" }}>
                    {count}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>

          {/* Botones de descarga */}
<Box sx={{ display: "flex", gap: 2, mb: 4 }}>
  <Button
    variant="contained"
    onClick={() => setOpenCSVModal(true)}
    sx={{ bgcolor: "#4CAF50", "&:hover": { bgcolor: "#388E3C" } }}
  >
    Descargar CSV
  </Button>
  <Button
    variant="contained"
    onClick={() => setOpenPDFModal(true)}
    sx={{ bgcolor: "#F44336", "&:hover": { bgcolor: "#D32F2F" } }}
  >
    Descargar PDF
  </Button>
</Box>

{/* Renderiza los modales */}
<CSVDownloadModal />
<PDFDownloadModal />

          {/* Tabla de datos */}
          <Typography variant="h6" sx={{ color: theme.palette.warning.main, mb: 2 }}>
            Datos del archivo
          </Typography>
          <StyledTable data={modelData.rawData} />
        </Box>
      )}

      {/* Spinner de carga */}
      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "rgba(0,0,0,0.5)",
            zIndex: 9999,
          }}
        >
          <CircularProgress size={60} sx={{ color: theme.palette.warning.main }} />
        </Box>
      )}

      {/* Notificación de error */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity="error"
          sx={{
            width: '100%',
            bgcolor: '#1e1e1e',
            color: theme.palette.warning.main,
            border: '1px solid',
            borderColor: theme.palette.warning.main,
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};