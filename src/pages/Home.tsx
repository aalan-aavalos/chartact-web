import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Radio, RadioGroup, FormControlLabel } from "@mui/material";

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

type ApiModel = {
  model_id: string;
  model_name: string;
  created_at: string;
  description: string;
  dimensions: string[];
  categories: Cluster[];
};

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

  // Estados principales
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

  // Estados para integración API
  const [apiModels, setApiModels] = useState<ApiModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<ApiModel | null>(null);

  // Carga de modelos desde API
  useEffect(() => {
    if (action === "select") {
      fetch("http://localhost:8000/api/models/list")
        .then(res => res.json())
        .then(data => setApiModels(data.models))
        .catch(err => console.error("Error listando modelos:", err));
    }
  }, [action]);

  // Dropzone settings
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    setOpenModal(true);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

  // Filtros para CSV/PDF
  const [filters, setFilters] = useState({
    genero: [] as string[],
    edad: { min: 18, max: 100 },
    tipos: [] as Cluster[],
    todosDatos: true,
    incluirInterpretacion: true,
    incluirGraficas: true
  });

  const GROUP_COLORS = {
    Analista: '#3B8BEA',
    Diplomático: '#24B47E',
    Centinela: '#E6A600',
    Explorador: '#DD3E3E'
  } as const;

  // Estilos comunes para selects
  const selectStyles = {
    '& .MuiInputBase-root': {
      color: '#fff',
      '& fieldset': { borderColor: '#444' },
      '&:hover fieldset': { borderColor: theme.palette.warning.main },
      '&.Mui-focused fieldset': { borderColor: theme.palette.warning.main }
    },
    '& .MuiInputLabel-root': { color: '#b0b0b0', '&.Mui-focused': { color: theme.palette.warning.main } },
    '& .MuiSvgIcon-root': { color: '#b0b0b0' },
    '& .MuiSelect-select': { backgroundColor: '#1e1e1e', color: '#fff' },
    '& .MuiInputBase-input': { color: '#fff' },
    '& .MuiFormLabel-root.Mui-focused': { color: theme.palette.warning.main }
  };

  // Validación
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

  // Crear nuevo modelo según creación seleccionada
  const handleSubmit = async () => {
    if (!validateAndSubmit() || !file) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("model_name", newModelName);
    // Enviar solo la primera letra de cada dimensión seleccionada (E, S, T, J)
    const dims = selectedDimensions.map(d => d.charAt(0));
    formData.append("dimensions", JSON.stringify(dims));
    // Categorías MBTI
    formData.append("mbti_categories", JSON.stringify(selectedClusters));
    formData.append("description", modelDescription);

    const url = creationMethod === "cluster"
      ? "http://localhost:8000/api/models/create"
      : "http://localhost:8000/api/models/create_classical";

    try {
      const res = await fetch(url, { method: 'POST', body: formData });
      const result = await res.json();
      // Mapeo de respuesta a ModelData
      const mapped: ModelData = {
        name: result.model_name,
        dimensions: (result.dimensions as string[]).map(d => {
          if (d === 'E' || d === 'I') return 'E/I';
          if (d === 'S' || d === 'N') return 'S/N';
          if (d === 'T' || d === 'F') return 'T/F';
          return 'J/P';
        }),
        clusters: result.clusters_used as Cluster[],
        description: result.description || result.model_name,
        totalResponses: result.data.length,
        clusterDistribution: result.label_distribution,
        rawData: result.data.map((row: any) => ({
          name: row.name,
          genero: row.gender === 'M' ? 'Masculino' : 'Femenino',
          edad: parseInt(row.age_range.split(' - ')[0], 10),
          tipo: row.mbti_label as Cluster
        }))
      };
      setModelData(mapped);
      setOpenModal(false);
    } catch (err) {
      console.error('Error creando modelo:', err);
      setError('Error al crear el modelo');
    } finally {
      setIsLoading(false);
    }
  };

  // Aplicar modelo existente
  const handleApply = async () => {
    if (!selectedModel || !file) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(
        `http://localhost:8000/api/models/apply/${selectedModel.model_id}`,
        { method: 'POST', body: formData }
      );
      const result = await res.json();
      const mapped: ModelData = {
        name: result.model_name,
        dimensions: (result.dimensions as string[]).map(d => {
          if (d === 'E' || d === 'I') return 'E/I';
          if (d === 'S' || d === 'N') return 'S/N';
          if (d === 'T' || d === 'F') return 'T/F';
          return 'J/P';
        }),
        clusters: result.clusters_used as Cluster[],
        description: result.description || "",
        totalResponses: result.data.length,
        clusterDistribution: result.label_distribution,
        rawData: result.data.map((row: any) => ({
          name: row.name,
          genero: row.gender === 'M' ? 'Masculino' : 'Femenino',
          edad: parseInt(row.age_range.split(' - ')[0], 10),
          tipo: row.mbti_label as Cluster
        }))
      };
      setModelData(mapped);
      setOpenModal(false);
    } catch (err) {
      console.error('Error aplicando modelo:', err);
      setError('Error al aplicar el modelo');
    } finally {
      setIsLoading(false);
    }
  };

  // Componente para tabla estilizada
  const StyledTable = ({ data }: { data: ModelData['rawData'] }) => (
    <Box sx={{
      maxHeight: 500,
      overflow: 'auto',
      '& table': {
        width: '100%', borderCollapse: 'collapse',
        '& th, & td': { padding: '12px 16px', borderBottom: '1px solid #444' },
        '& th': { backgroundColor: '#333', color: 'white', textAlign: 'left', position: 'sticky', top: 0, zIndex: 1 },
        '& tr:nth-of-type(even)': { backgroundColor: '#252525' },
        '& tr:hover': { backgroundColor: '#333' }
      }
    }}>
      <table>
        <thead>
          <tr><th>Nombre</th><th>Género</th><th>Edad</th><th>Tipo</th></tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td>{row.name}</td>
              <td>{row.genero}</td>
              <td>{row.edad}</td>
              <td>
                <Chip label={row.tipo} sx={{ bgcolor: GROUP_COLORS[row.tipo], color: 'white', fontWeight: 'bold', minWidth: 100, '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', opacity: 0.9 } }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );

  // Modal de descarga CSV
  // Dentro de tu componente Home, reemplaza el CSVDownloadModal:

  const CSVDownloadModal = () => {
    // Extrae dinámicamente las opciones de rango y categorías
    const ageRanges = [...new Set(modelData?.rawData.map(r => r.edad))]  // si prefieres usar strings, ajusta este mapeo
      .sort((a, b) => a - b)
      .map(n => {
        if (n >= 17 && n <= 20) return "17 - 20";
        if (n >= 21 && n <= 25) return "21 - 25";
        // …añade los demás rangos según tu lógica
      })
      .filter(Boolean) as string[];

    const categories = Object.keys(modelData?.clusterDistribution || {}) as Cluster[];

    // Estado local del modal
    const [format, setFormat] = useState<"csv" | "excel" | "both">("csv");
    const [genderFilter, setGenderFilter] = useState<"M" | "F" | "all">("all");
    const [selectedAges, setSelectedAges] = useState<string[]>([]);
    const [selectedCats, setSelectedCats] = useState<Cluster[]>([]);
    const [allData, setAllData] = useState(true);
    const [limit, setLimit] = useState<number | "">(modelData?.totalResponses || "");
    const [limitError, setLimitError] = useState("");

    // Validación del límite
    useEffect(() => {
      if (!allData && typeof limit === "number" && limit > (modelData?.totalResponses || 0)) {
        setLimitError(`No puede exceder ${modelData?.totalResponses}`);
      } else {
        setLimitError("");
      }
    }, [allData, limit]);

    return (
      <Modal open={openCSVModal} onClose={() => setOpenCSVModal(false)}>
        <Card sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 550, p: 3, bgcolor: "#1e1e1e" }}>
          <Typography variant="h6" sx={{ mb: 2, color: theme.palette.warning.main }}>Configuración de descarga</Typography>

          {/* Formato */}
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <Typography sx={{ color: "#fff" }}>Formato:</Typography>
            <Box>
              {["csv", "excel", "both"].map(opt => (
                <FormControlLabel
                  key={opt}
                  control={
                    <Radio
                      checked={format === opt}
                      onChange={() => setFormat(opt as any)}
                      value={opt}
                      sx={{ color: theme.palette.warning.main }}
                    />
                  }
                  label={opt.toUpperCase()}
                />
              ))}
            </Box>
          </FormControl>

          {/* Género */}
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <Typography sx={{ color: "#fff" }}>Género:</Typography>
            <Box>
              {["all", "M", "F"].map(g => (
                <FormControlLabel
                  key={g}
                  control={
                    <Radio
                      checked={genderFilter === g}
                      onChange={() => setGenderFilter(g as any)}
                      value={g}
                      sx={{ color: theme.palette.warning.main }}
                    />
                  }
                  label={g === "all" ? "Todos" : g === "M" ? "Masculino" : "Femenino"}
                />
              ))}
            </Box>
          </FormControl>

          {/* Rango de edades */}
          <FormControl fullWidth sx={{ mb: 2 }} variant="outlined">
            <InputLabel sx={{ color: "#b0b0b0" }}>Edad</InputLabel>
            <Select
              multiple
              value={selectedAges}
              onChange={e => setSelectedAges(e.target.value as string[])}
              label="Edad"
              sx={selectStyles}
              renderValue={vals => vals.join(", ")}
            >
              {ageRanges.map(r => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Categorías */}
          <FormControl fullWidth sx={{ mb: 2 }} variant="outlined">
            <InputLabel sx={{ color: "#b0b0b0" }}>Personalidad</InputLabel>
            <Select
              multiple
              value={selectedCats}
              onChange={e => setSelectedCats(e.target.value as Cluster[])}
              label="Personalidad"
              sx={selectStyles}
              renderValue={vals => vals.join(", ")}
            >
              {categories.map(c => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Cantidad de datos */}
          <FormControl fullWidth sx={{ mb: 2 }} variant="outlined">
            <Typography sx={{ color: "#fff", mb: 1 }}>¿Cuántos datos?</Typography>
            <RadioGroup
              value={allData ? "all" : "limit"}
              onChange={(_, v) => setAllData(v === "all")}
              row
            >
              <FormControlLabel value="all" control={<Radio sx={{ color: theme.palette.warning.main }} />} label="Todos" />
              <FormControlLabel value="limit" control={<Radio sx={{ color: theme.palette.warning.main }} />} label="Cantidad" />
            </RadioGroup>
            {!allData && (
              <TextField
                type="number"
                value={limit}
                onChange={e => setLimit(e.target.value === "" ? "" : parseInt(e.target.value))}
                error={!!limitError}
                helperText={limitError}
                sx={{ mt: 1, ...selectStyles }}
              />
            )}
          </FormControl>

          {/* Botones */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={() => setOpenCSVModal(false)} sx={{ color: theme.palette.warning.main, borderColor: theme.palette.warning.main }}>Cancelar</Button>
            <Button
              variant="contained"
              disabled={!!limitError}
              sx={{ bgcolor: theme.palette.warning.main, color: "#000" }}
              onClick={() => {
                // aquí iría la lógica de descarga, pasando todos los filtros
              }}
            >
              Descargar
            </Button>
          </Box>
        </Card>
      </Modal>
    );
  };


  // Modal de descarga PDF
  const PDFDownloadModal = () => (
    <Modal open={openPDFModal} onClose={() => setOpenPDFModal(false)}>
      <Card sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, bgcolor: '#1e1e1e', border: '1px solid #444', p: 3, outline: 'none' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" sx={{ color: theme.palette.warning.main }}>Filtros para PDF</Typography>
          <Button onClick={() => setOpenPDFModal(false)} sx={{ color: 'grey.500' }}><CloseIcon /></Button>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* repetir filtros de CSV */}
          <FormControl fullWidth sx={selectStyles}>
            <InputLabel>Género</InputLabel>
            <Select multiple value={filters.genero} onChange={e => setFilters({ ...filters, genero: e.target.value as string[] })} renderValue={sel => <Box sx={{ display: 'flex', gap: 1 }}>{sel.length ? sel.join(', ') : 'Todos'}</Box>}>
              <MenuItem value="Masculino">Masculino</MenuItem>
              <MenuItem value="Femenino">Femenino</MenuItem>
              <MenuItem value="Otro">Otro</MenuItem>
            </Select>
          </FormControl>
          <Box>
            <Typography gutterBottom sx={{ color: '#b0b0b0' }}>Rango de edad: {filters.edad.min} - {filters.edad.max}</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField type="number" value={filters.edad.min} onChange={e => setFilters({ ...filters, edad: { ...filters.edad, min: parseInt(e.target.value) || 0 } })} sx={{ ...selectStyles, flex: 1 }} />
              <Typography sx={{ color: '#b0b0b0' }}>a</Typography>
              <TextField type="number" value={filters.edad.max} onChange={e => setFilters({ ...filters, edad: { ...filters.edad, max: parseInt(e.target.value) || 100 } })} sx={{ ...selectStyles, flex: 1 }} />
            </Box>
          </Box>
          <FormControl fullWidth sx={selectStyles}>
            <InputLabel>Tipo de personalidad</InputLabel>
            <Select multiple value={filters.tipos} onChange={e => setFilters({ ...filters, tipos: e.target.value as Cluster[] })} renderValue={sel => <Box sx={{ display: 'flex', gap: 1 }}>{sel.length ? sel.join(', ') : 'Todos'}</Box>}>
              {["Analista", "Diplomático", "Centinela", "Explorador"].map(tipo => <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>)}
            </Select>
          </FormControl>
          {/* opciones PDF */}
          <FormControl fullWidth sx={selectStyles}>
            <InputLabel>Contenido del PDF</InputLabel>
            <Select multiple value={[...(filters.incluirInterpretacion ? ['interpretacion'] : []), ...(filters.incluirGraficas ? ['graficas'] : [])]} onChange={e => {
              const v = e.target.value as string[];
              setFilters({ ...filters, incluirInterpretacion: v.includes('interpretacion'), incluirGraficas: v.includes('graficas') });
            }} renderValue={sel => sel.join(', ').replace('interpretacion', 'Interpretación').replace('graficas', 'Gráficas')}>
              <MenuItem value="interpretacion">Interpretación</MenuItem>
              <MenuItem value="graficas">Gráficas</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={() => setOpenPDFModal(false)} sx={{ color: theme.palette.warning.main, borderColor: theme.palette.warning.main }}>Cancelar</Button>
            <Button variant="contained" sx={{ bgcolor: theme.palette.warning.main, color: 'grey.900' }}>Generar PDF</Button>
          </Box>
        </Box>
      </Card>
    </Modal>
  );

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'grey.900', color: 'white' }}>
      {/* Dropzone inicial */}
      {!modelData && (
        <Card sx={{ mb: 3, bgcolor: '#1e1e1e', border: '1px solid #444' }}>
          <CardContent>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <Box sx={{ p: 4, border: '2px dashed', borderColor: theme.palette.warning.main, bgcolor: isDragActive ? '#252526' : '#1e1e1e', textAlign: 'center', cursor: 'pointer', '&:hover': { borderColor: theme.palette.warning.dark } }}>
                <CloudUploadIcon sx={{ fontSize: 50, color: theme.palette.warning.main, mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#fff' }}>{isDragActive ? '¡Suelta tu archivo aquí!' : 'Arrastra un archivo CSV o haz clic para seleccionar'}</Typography>
                <Typography sx={{ mt: 1, color: 'grey.500' }}>Solo se aceptan archivos CSV</Typography>
              </Box>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de selección/creación */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Card sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: action === 'create' ? 600 : 500, bgcolor: '#1e1e1e', border: '1px solid #444', p: 3, outline: 'none' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6"><Box component="span" sx={{ color: theme.palette.warning.main }}>Archivo:</Box> <Box component="span" sx={{ color: '#fff' }}>{file?.name}</Box></Typography>
            <Button onClick={() => setOpenModal(false)} sx={{ color: 'grey.500', minWidth: 'auto' }}><CloseIcon /></Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <Button variant={action === 'select' ? 'contained' : 'outlined'} onClick={() => setAction('select')} sx={{ flex: 1, color: action === 'select' ? 'grey.900' : theme.palette.warning.main, bgcolor: action === 'select' ? theme.palette.warning.main : 'transparent', borderColor: theme.palette.warning.main, '&:hover': { bgcolor: action === 'select' ? theme.palette.warning.dark : 'rgba(255,167,38,0.08)' } }}>Seleccionar Modelo</Button>
            <Button variant={action === 'create' ? 'contained' : 'outlined'} onClick={() => setAction('create')} sx={{ flex: 1, color: action === 'create' ? 'grey.900' : theme.palette.warning.main, bgcolor: action === 'create' ? theme.palette.warning.main : 'transparent', borderColor: theme.palette.warning.main, '&:hover': { bgcolor: action === 'create' ? theme.palette.warning.dark : 'rgba(255,167,38,0.08)' } }}>Crear Nuevo Modelo</Button>
          </Box>

          {action === 'select' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControl fullWidth sx={selectStyles}>
                <InputLabel>Modelos disponibles</InputLabel>
                <Select value={selectedModel?.model_id || ''} onChange={e => {
                  const m = apiModels.find(x => x.model_id === e.target.value); setSelectedModel(m || null);
                }}> {apiModels.map(m => <MenuItem key={m.model_id} value={m.model_id}>{m.model_name}</MenuItem>)} </Select>
              </FormControl>
              {selectedModel && (<Card sx={{ bgcolor: '#252525', p: 2 }}><Typography variant="subtitle1" sx={{ color: theme.palette.warning.main }}>{selectedModel.model_name}</Typography><Typography variant="body2" sx={{ color: 'grey.300', mt: 1 }}>{selectedModel.description}</Typography><Typography variant="caption" sx={{ color: 'grey.500', display: 'block', mt: 1 }}>Creado: {new Date(selectedModel.created_at).toLocaleDateString()}</Typography></Card>)}
              <Button variant="contained" disabled={!selectedModel} onClick={handleApply} sx={{ mt: 2, bgcolor: theme.palette.warning.main, color: 'grey.900', '&:hover': { bgcolor: theme.palette.warning.dark }, '&:disabled': { bgcolor: '#555', color: '#999' } }}>Analizar con este modelo</Button>
            </Box>
          )}

          {action === 'create' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField label="Nombre del modelo" value={newModelName} onChange={e => setNewModelName(e.target.value)} sx={{ ...selectStyles, '& .MuiInputBase-input': { color: '#fff' } }} />
              <FormControl fullWidth sx={selectStyles}><InputLabel>Dimensiones MBTI</InputLabel><Select multiple value={selectedDimensions} onChange={e => setSelectedDimensions(e.target.value as Dimension[])} renderValue={sel => <Box sx={{ display: 'flex', gap: 1 }}>{sel.map(v => <Chip key={v} label={v} sx={{ bgcolor: theme.palette.warning.main, color: 'grey.900' }} />)}</Box>} MenuProps={{ PaperProps: { sx: { bgcolor: '#1e1e1e', color: '#fff', '& .MuiMenuItem-root': { '&:hover': { backgroundColor: '#333' }, '&.Mui-selected': { backgroundColor: theme.palette.warning.dark, color: '#fff' } } } } }}>{["E/I", "S/N", "T/F", "J/P"].map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}</Select></FormControl>
              <FormControl fullWidth sx={selectStyles}><InputLabel>Clusters de Personalidad</InputLabel><Select multiple value={selectedClusters} onChange={e => setSelectedClusters(e.target.value as Cluster[])} renderValue={sel => <Box sx={{ display: 'flex', gap: 1 }}>{sel.map(v => <Chip key={v} label={v} sx={{ bgcolor: theme.palette.warning.main, color: 'grey.900' }} />)}</Box>} MenuProps={{ PaperProps: { sx: { bgcolor: '#1e1e1e', color: '#fff', '& .MuiMenuItem-root': { '&:hover': { backgroundColor: '#333' }, '&.Mui-selected': { backgroundColor: theme.palette.warning.dark, color: '#fff' } } } } }}>{["Analista", "Diplomático", "Centinela", "Explorador"].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}</Select></FormControl>
              <TextField label="Descripción del modelo" multiline rows={3} value={modelDescription} onChange={e => setModelDescription(e.target.value)} sx={{ ...selectStyles, '& .MuiInputBase-input': { color: '#fff' } }} />
              <Box sx={{ display: 'flex', alignItems: 'center' }}><Typography sx={{ mr: 2, color: '#fff' }}>Método Normal</Typography><Switch checked={creationMethod === 'cluster'} onChange={() => setCreationMethod(creationMethod === 'cluster' ? 'normal' : 'cluster')} color="warning" /><Typography sx={{ ml: 2, color: '#fff' }}>Método Cluster</Typography></Box>
              <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2, bgcolor: theme.palette.warning.main, color: 'grey.900', '&:hover': { bgcolor: theme.palette.warning.dark } }}>Analizar y Crear</Button>
            </Box>
          )}
        </Card>
      </Modal>

      {/* Resultados */}
      {modelData && (
        <Box sx={{ mt: 4 }}>
          <Card sx={{ bgcolor: '#1e1e1e', mb: 3, p: 3 }}><Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="h4" sx={{ color: theme.palette.warning.main }}>{modelData.name}</Typography><Box sx={{ display: 'flex', gap: 1 }}>{modelData.dimensions.map(d => <Chip key={d} label={d} sx={{ bgcolor: theme.palette.warning.dark, color: 'white' }} />)}</Box></Box><Typography sx={{ mt: 2, color: 'grey.300' }}>{modelData.description}</Typography></Card>
          <Card sx={{ bgcolor: '#1e1e1e', mb: 3, p: 3 }}><Typography variant="h6" sx={{ color: theme.palette.warning.main, mb: 2 }}>Estadísticas</Typography><Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}><Box><Typography sx={{ color: 'grey.400' }}>Total de respuestas:</Typography><Typography sx={{ fontSize: 24, color: 'white' }}>{modelData.totalResponses}</Typography></Box>{Object.entries(modelData.clusterDistribution).map(([cluster, count]) => <Box key={cluster}><Typography sx={{ color: 'grey.400' }}>{cluster}:</Typography><Typography sx={{ fontSize: 24, color: 'white' }}>{count}</Typography></Box>)}</Box></Card>
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}><Button variant="contained" onClick={() => setOpenCSVModal(true)} sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388E3C' } }}>Descargar CSV / Excel</Button><Button variant="contained" onClick={() => setOpenPDFModal(true)} sx={{ bgcolor: '#F44336', '&:hover': { bgcolor: '#D32F2F' } }}>Descargar PDF</Button></Box>
          <CSVDownloadModal />
          <PDFDownloadModal />
          <Typography variant="h6" sx={{ color: theme.palette.warning.main, mb: 2 }}>Datos del archivo</Typography>
          <StyledTable data={modelData.rawData} />
        </Box>
      )}

      {/* Spinner */}
      {isLoading && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}><CircularProgress size={60} sx={{ color: theme.palette.warning.main }} /></Box>
      )}

      {/* Error */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="error" sx={{ width: '100%', bgcolor: '#1e1e1e', color: theme.palette.warning.main, border: '1px solid', borderColor: theme.palette.warning.main }}>{error}</Alert>
      </Snackbar>
    </Box>
  );
};
