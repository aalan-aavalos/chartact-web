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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";

// Tipos y datos constantes
type Dimension = "E/I" | "S/N" | "T/F" | "J/P";
type Cluster = "NT" | "NF" | "SJ" | "SP";

const DIMENSIONS: Dimension[] = ["E/I", "S/N", "T/F", "J/P"];
const CLUSTERS: Cluster[] = ["NT", "NF", "SJ", "SP"];

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
    if (!validateAndSubmit()) return;

    // Lógica para enviar al backend
    console.log("Datos válidos. Enviando...", {
      file: file?.name,
      modelName: newModelName,
      dimensions: selectedDimensions,
      clusters: selectedClusters,
      description: modelDescription
    });
    setOpenModal(false);
  };

  // Estilos personalizados para los dropdowns
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
    },
    '& .MuiSvgIcon-root': {
      color: '#b0b0b0',
    },
    '& .MuiSelect-select': {
      backgroundColor: '#1e1e1e',
    },
    '& .MuiPaper-root': {
      backgroundColor: '#1e1e1e',
      color: '#fff',
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
  };

  return (
    <Box sx={{
      p: 3,
      minHeight: "100vh",
      bgcolor: "grey.900",
      color: "white"
    }}>
      {/* Card para el área de drop */}
      <Card sx={{
        mb: 3,
        bgcolor: "#1e1e1e",
        border: "1px solid #444"
      }}>
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
                '&:hover': {
                  borderColor: theme.palette.warning.dark,
                }
              }}
            >
              <CloudUploadIcon sx={{
                fontSize: 50,
                color: theme.palette.warning.main,
                mb: 2
              }} />
              <Typography variant="h6">
                {isDragActive ? "¡Suelta tu archivo aquí!" : "Arrastra un archivo CSV o haz clic para seleccionar"}
              </Typography>
              <Typography sx={{ mt: 1, color: "grey.500" }}>
                Solo se aceptan archivos CSV generados desde Google Forms
              </Typography>
            </Box>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
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
            <Typography variant="h6" sx={{ color: theme.palette.warning.main }}>
              Archivo: {file?.name}
            </Typography>
            <Button
              onClick={() => setOpenModal(false)}
              sx={{
                color: "grey.500",
                minWidth: 'auto',
                '&:hover': {
                  backgroundColor: 'rgba(255, 167, 38, 0.08)'
                }
              }}
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
                '&:hover': {
                  bgcolor: action === "select" ? theme.palette.warning.dark : 'rgba(255, 167, 38, 0.08)',
                  borderColor: theme.palette.warning.dark
                }
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
                '&:hover': {
                  bgcolor: action === "create" ? theme.palette.warning.dark : 'rgba(255, 167, 38, 0.08)',
                  borderColor: theme.palette.warning.dark
                }
              }}
            >
              Crear Nuevo Modelo
            </Button>
          </Box>

          {action === "create" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                label="Nombre del modelo"
                variant="outlined"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                sx={{
                  ...selectStyles,
                  '& .MuiInputBase-input': {
                    color: '#fff'
                  }
                }}
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
                          sx={{
                            bgcolor: theme.palette.warning.main,
                            color: "grey.900",
                            fontWeight: 'bold'
                          }}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {DIMENSIONS.map((dim) => (
                    <MenuItem
                      key={dim}
                      value={dim}
                    >
                      {dim}
                    </MenuItem>
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
                          sx={{
                            bgcolor: theme.palette.warning.main,
                            color: "grey.900",
                            fontWeight: 'bold'
                          }}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {CLUSTERS.map((cluster) => (
                    <MenuItem
                      key={cluster}
                      value={cluster}
                    >
                      {cluster}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Campo de descripción agregado */}
              <TextField
                label="Descripción del modelo"
                multiline
                rows={3}
                value={modelDescription}
                onChange={(e) => setModelDescription(e.target.value)}
                sx={{
                  ...selectStyles,
                  '& .MuiInputBase-input': {
                    color: '#fff'
                  }
                }}
              />

              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{
                  mt: 2,
                  bgcolor: theme.palette.warning.main,
                  color: "grey.900",
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: theme.palette.warning.dark
                  }
                }}
              >
                Analizar y Crear
              </Button>
            </Box>
          )}
        </Card>
      </Modal>

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
            '& .MuiAlert-icon': {
              color: theme.palette.warning.main
            }
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};