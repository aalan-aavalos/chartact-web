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
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";

// Tipos y datos constantes
type Dimension = "E/I" | "S/N" | "T/F" | "J/P";
type Cluster = "NT" | "NF" | "SJ" | "SP";

const DIMENSIONS: Dimension[] = ["E/I", "S/N", "T/F", "J/P"];
const CLUSTERS: Cluster[] = ["NT", "NF", "SJ", "SP"];

type ModelData = {
  name: string;
  dimensions: Dimension[];
  clusters: Cluster[];
  description: string;
  totalResponses: number;
  clusterDistribution: Record<Cluster, number>;
  rawData: any[];
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

  // Dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    setOpenModal(true);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

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

  const handleSubmit = () => {
    if (!validateAndSubmit() || !file) return;

    setIsLoading(true);

    // Simulación del backend (tu amigo reemplazará esto)
    setTimeout(() => {
      const mockResponse: ModelData = {
        name: newModelName,
        dimensions: selectedDimensions,
        clusters: selectedClusters,
        description: modelDescription,
        totalResponses: 150,
        clusterDistribution: { NT: 50, NF: 40, SJ: 35, SP: 25 },
        rawData: [
          { name: "Juan", E: "20%", I: "80%", NT: "Analista" },
          { name: "Ana", E: "60%", I: "40%", NF: "Diplomático" },
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
              sx={{ bgcolor: "#4CAF50", "&:hover": { bgcolor: "#388E3C" } }}
            >
              Descargar CSV
            </Button>
            <Button
              variant="contained"
              sx={{ bgcolor: "#F44336", "&:hover": { bgcolor: "#D32F2F" } }}
            >
              Descargar PDF
            </Button>
          </Box>

          {/* Tabla de datos */}
          <Typography variant="h6" sx={{ color: theme.palette.warning.main, mb: 2 }}>
            Datos del archivo
          </Typography>
          <Box sx={{ maxHeight: 500, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#333" }}>
                  {Object.keys(modelData.rawData[0]).map((key) => (
                    <th key={key} style={{ padding: "8px", textAlign: "left", color: "white" }}>
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modelData.rawData.map((row, index) => (
                  <tr
                    key={index}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#1e1e1e" : "#252525",
                    }}
                  >
                    {Object.values(row).map((value, i) => (
                      <td key={i} style={{ padding: "8px", color: "white" }}>
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
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