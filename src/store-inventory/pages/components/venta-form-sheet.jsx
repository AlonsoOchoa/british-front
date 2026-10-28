'use client';

import { useEffect, useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { HorarioService } from '@/services/horario.service';
import { HorarioDetalleService } from '@/services/horariodetalle.service';
import { NivelService } from '@/services/nivel.service';
import { OrigenService } from '@/services/origen.service';
import { SubOrigenService } from '@/services/suborigen.service';
import { VendedorService } from '@/services/vendedor.service';
import { VentaService } from '@/services/venta.service';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { VentaFormImageUpload } from './venta-form-image-upload';

export function VentaFormSheet({ mode, open, onOpenChange, venta, onUpdated }) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';
  // Campos principales
  const [nombre, setNombre] = useState('');
  const [nroDocumento, setNroDocumento] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [edad, setEdad] = useState('');
  const [gradoEstudio, setGradoEstudio] = useState('');
  const [celular, setCelular] = useState('');
  const [lugarResidencia, setLugarResidencia] = useState('');
  const [apoderado, setApoderado] = useState('');
  const [correo, setCorreo] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [matricula, setMatricula] = useState('');
  const [pension, setPension] = useState('');
  const [multiplicador, setMultiplicador] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [contactado, setContactado] = useState(false);
  const [estado, setEstado] = useState('');

  const [vendedorActualNombre, setVendedorActualNombre] = useState('');
  const [origenId, setOrigenId] = useState('');
  const [subOrigenId, setSubOrigenId] = useState('');
  const [horarioId, setHorarioId] = useState('');
  const [horarioDetalleId, setHorarioDetalleId] = useState('');
  const [nivelId, setNivelId] = useState('');

  const [origenes, setOrigenes] = useState([]);
  const [subOrigenes, setSubOrigenes] = useState([]);
  const [subOrigenesFiltrados, setSubOrigenesFiltrados] = useState([]);

  const [horarios, setHorarios] = useState([]);
  const [horariosDetalle, setHorariosDetalle] = useState([]);
  const [horariosDetalleFiltrados, setHorariosDetalleFiltrados] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [catalogosCargados, setCatalogosCargados] = useState(false);

  const [comprobantesActuales, setComprobantesActuales] = useState([]);
  const [nuevosComprobantes, setNuevosComprobantes] = useState([]);
  const [comprobantesEliminarIds, setComprobantesEliminarIds] = useState([]);
  const isReadOnlyEdit = isEditMode;

  const calcularEdad = (fecha) => {
    if (!fecha) return '';

    const hoy = new Date();
    const nacimiento = new Date(fecha);

    let edadCalculada = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edadCalculada--;
    }

    return edadCalculada.toString();
  };

  const cargarVendedorActual = async () => {
    try {
      const response = await VendedorService.getVendedorActual();
      setVendedorActualNombre(response?.nombre ?? '');
    } catch (error) {
      console.error(error);
      setVendedorActualNombre('');
      toast.error('No se pudo cargar el vendedor actual');
    }
  };

  const handleFechaNacimientoChange = (value) => {
    setFechaNacimiento(value);
    setEdad(calcularEdad(value));
  };
  const cargarCatalogos = async () => {
    try {
      const [
        origenesRes,
        subOrigenesRes,
        horariosRes,
        horariosDetalleRes,
        nivelesRes,
      ] = await Promise.all([
        OrigenService.getAll(),
        SubOrigenService.getAll(),
        HorarioService.getAll(),
        HorarioDetalleService.getAll(),
        NivelService.getAll(),
      ]);

      setOrigenes(origenesRes ?? []);
      setSubOrigenes(subOrigenesRes ?? []);
      setHorarios(horariosRes ?? []);
      setHorariosDetalle(horariosDetalleRes ?? []);
      setNiveles(nivelesRes ?? []);
      setCatalogosCargados(true);
    } catch (error) {
      console.error(error);
      toast.error('No se pudieron cargar los catálogos');
    }
  };

  useEffect(() => {
    if (!open) return;
    cargarCatalogos();
  }, [open]);

  useEffect(() => {
    if (!origenId) {
      setSubOrigenesFiltrados([]);
      setSubOrigenId('');
      return;
    }

    const filtrados = subOrigenes.filter(
      (item) => item.origenId?.toString() === origenId.toString(),
    );

    setSubOrigenesFiltrados(filtrados);

    const existeSeleccionado = filtrados.some(
      (item) => item.id?.toString() === subOrigenId.toString(),
    );

    if (!existeSeleccionado) {
      setSubOrigenId('');
      setMultiplicador('');
    }
  }, [origenId, subOrigenes]);

  const handleSubOrigenChange = async (value) => {
    setSubOrigenId(value);

    if (!value) {
      setMultiplicador('');
      return;
    }

    try {
      const suborigen = await SubOrigenService.getById(value);
      setMultiplicador(suborigen.multiplicador?.toString() ?? '');
    } catch (error) {
      console.error('Error al obtener suborigen:', error);
      setMultiplicador('');
    }
  };

  useEffect(() => {
    if (!horarioId) {
      setHorariosDetalleFiltrados([]);
      setHorarioDetalleId('');
      return;
    }

    const filtrados = horariosDetalle.filter(
      (item) => item.horarioId?.toString() === horarioId.toString(),
    );

    setHorariosDetalleFiltrados(filtrados);

    const existeSeleccionado = filtrados.some(
      (item) => item.id?.toString() === horarioDetalleId.toString(),
    );

    if (!existeSeleccionado) {
      setHorarioDetalleId('');
    }
  }, [horarioId, horariosDetalle]);



  //
useEffect(() => {
  const fetchVentaCompleta = async () => {
    try {
      if (!catalogosCargados || !open || !isEditMode || !venta?.id) return;

      const ventaRefrescada = await VentaService.getById(venta.id);

      setNombre(ventaRefrescada.nombre ?? '');
      setNroDocumento(ventaRefrescada.nroDocumento ?? '');
      setFechaNacimiento(
        ventaRefrescada.fechaNacimiento
          ? new Date(ventaRefrescada.fechaNacimiento).toISOString().split('T')[0]
          : '',
      );
      setEdad(ventaRefrescada.edad?.toString() ?? '');
      setGradoEstudio(ventaRefrescada.gradoEstudio ?? '');
      setCelular(ventaRefrescada.celular ?? '');
      setLugarResidencia(ventaRefrescada.lugarResidencia ?? '');
      setApoderado(ventaRefrescada.apoderado ?? '');
      setCorreo(ventaRefrescada.correo ?? '');
      setObjetivo(ventaRefrescada.objetivo ?? '');
      setMatricula(ventaRefrescada.matricula?.toString() ?? '');
      setPension(ventaRefrescada.pension?.toString() ?? '');
      setMultiplicador(ventaRefrescada.multiplicador?.toString() ?? '');
      setComentarios(ventaRefrescada.comentarios ?? '');
      setContactado(ventaRefrescada.contactado ?? false);
      setEstado(ventaRefrescada.estado ?? '');

      setVendedorActualNombre(
        ventaRefrescada?.vendedor?.empleado
          ? `${ventaRefrescada.vendedor.empleado.nombres ?? ''} ${ventaRefrescada.vendedor.empleado.apellidos ?? ''}`.trim()
          : (ventaRefrescada?.vendedor?.codigo ?? '')
      );

      setOrigenId(ventaRefrescada.origenId?.toString() ?? '');
      setHorarioId(ventaRefrescada.horarioId?.toString() ?? '');
      setNivelId(ventaRefrescada.nivelId?.toString() ?? '');
      setSubOrigenId(ventaRefrescada.subOrigenId?.toString() ?? '');
      setHorarioDetalleId(ventaRefrescada.horarioDetalleId?.toString() ?? '');

      setComprobantesActuales(ventaRefrescada.ventaComprobantes ?? []);
      setNuevosComprobantes([]);
      setComprobantesEliminarIds([]);
    } catch (error) {
      console.error('Error al obtener venta:', error);
      toast.error('No se pudo cargar la venta.');
    }
  };

  if (isEditMode) {
    fetchVentaCompleta();
  }

  if (isNewMode && open) {
    limpiarFormulario();
    cargarVendedorActual();
  }
}, [catalogosCargados, open, isEditMode, isNewMode, venta?.id]);





  //

  const limpiarFormulario = () => {
    setNombre('');
    setNroDocumento('');
    setFechaNacimiento('');
    setEdad('');
    setGradoEstudio('');
    setCelular('');
    setLugarResidencia('');
    setApoderado('');
    setCorreo('');
    setObjetivo('');
    setMatricula('');
    setPension('');
    setMultiplicador('');
    setComentarios('');
    setEstado('');
    setContactado(false);
    setOrigenId('');
    setSubOrigenId('');
    setHorarioId('');
    setHorarioDetalleId('');
    setNivelId('');

    setComprobantesActuales([]);
    setNuevosComprobantes([]);
    setComprobantesEliminarIds([]);
  };

  const validarFormulario = () => {
    if (!nombre.trim()) {
      toast.error('Ingresa el nombre');
      return false;
    }

    if (!nroDocumento.trim()) {
      toast.error('Ingresa el número de documento');
      return false;
    }

    if (!fechaNacimiento) {
      toast.error('Selecciona la fecha de nacimiento');
      return false;
    }

    if (!celular.trim()) {
      toast.error('Ingresa el celular');
      return false;
    }

    if (!gradoEstudio.trim()) {
      toast.error('Ingresa el grado de estudio');
      return false;
    }

    if (!lugarResidencia.trim()) {
      toast.error('Ingresa el lugar de residencia');
      return false;
    }

    if (!origenId) {
      toast.error('Selecciona un origen');
      return false;
    }

    if (!subOrigenId) {
      toast.error('Selecciona un sub origen');
      return false;
    }

    if (!horarioId) {
      toast.error('Selecciona un horario');
      return false;
    }

    if (!horarioDetalleId) {
      toast.error('Selecciona un detalle de horario');
      return false;
    }

    if (!nivelId) {
      toast.error('Selecciona un nivel');
      return false;
    }

    if (!estado.trim()) {
      toast.error('Selecciona el estado');
      return false;
    }

    if (isNewMode && nuevosComprobantes.length === 0) {
      toast.error('Debes subir al menos un comprobante');
      return false;
    }

    if (
      isEditMode &&
      comprobantesActuales.length + nuevosComprobantes.length === 0
    ) {
      toast.error('La venta debe tener al menos un comprobante');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validarFormulario()) return;

      const formData = new FormData();

      // 🔹 Campos normales
      formData.append('Nombre', nombre.trim());
      formData.append('NroDocumento', nroDocumento.trim());
      formData.append('FechaNacimiento', fechaNacimiento);
      formData.append('Edad', edad ? parseInt(edad) : 0);
      formData.append('GradoEstudio', gradoEstudio.trim());
      formData.append('Celular', celular.trim());
      formData.append('LugarResidencia', lugarResidencia.trim());
      formData.append('Apoderado', apoderado.trim() || '');
      formData.append('Correo', correo.trim() || '');
      formData.append('Objetivo', objetivo.trim() || '');
      formData.append('Matricula', matricula ? parseFloat(matricula) : 0);
      formData.append('Pension', pension ? parseFloat(pension) : 0);
      formData.append(
        'Multiplicador',
        multiplicador ? parseFloat(multiplicador) : 0,
      );
      formData.append('Comentarios', comentarios.trim() || '');
      formData.append('OrigenId', parseInt(origenId));
      formData.append('SubOrigenId', parseInt(subOrigenId));
      formData.append('HorarioId', parseInt(horarioId));
      formData.append('HorarioDetalleId', parseInt(horarioDetalleId));
      formData.append('NivelId', parseInt(nivelId));
      formData.append('Estado', estado);
      formData.append('Contactado', contactado);

      // 🔥 ARCHIVOS (LO IMPORTANTE)
      

      if (isNewMode) {

        nuevosComprobantes.forEach((item) => {
        formData.append('Comprobantes', item.file);
      });

        const result = await VentaService.create(formData);
        toast.success('Venta registrada correctamente');
        onUpdated?.(result);
      } else {
        // 👉 UPDATE (luego lo mejoramos, pero te dejo base)
        formData.append('Id', venta.id);

        comprobantesEliminarIds.forEach((id) => {
          formData.append('ComprobantesEliminarIds', id);
        });

        nuevosComprobantes.forEach((item) => {
          formData.append('NuevosComprobantes', item.file);
        });

        const result = await VentaService.update(venta.id, formData);
        toast.success('Venta actualizada correctamente');
        onUpdated?.(result);
      }

      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error al guardar la venta');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 lg:w-[1180px] sm:max-w-none inset-5 border start-auto h-auto rounded-lg p-0">
        <SheetHeader className="border-b py-3.5 px-5 border-border">
          <SheetTitle className="font-medium">
            {isNewMode ? 'Nueva Venta' : 'Editar Venta'}
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow">
          <ScrollArea className="flex flex-col h-[calc(100dvh-15.2rem)] mx-1.5">
            <div className="flex flex-wrap lg:flex-nowrap px-3.5 grow">
              <div className="grow lg:border-e border-border lg:pe-5 space-y-5 py-5">
                <Card className="rounded-md">
                  <CardHeader className="min-h-[38px] bg-accent/50">
                    <CardTitle className="text-2sm">Datos Generales</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-5">
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs">Nombre</Label>
                        <Input
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          readOnly={isReadOnlyEdit}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs">Nro. Documento</Label>
                        <Input
                          value={nroDocumento}
                          onChange={(e) => setNroDocumento(e.target.value)}
                          readOnly={isReadOnlyEdit}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-5">
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs">Fecha Nacimiento</Label>
                        <Input
                          type="date"
                          value={fechaNacimiento}
                          onChange={(e) =>
                            handleFechaNacimientoChange(e.target.value)
                          }
                          readOnly={isReadOnlyEdit}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs">Edad</Label>
                        <Input value={edad} readOnly />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs">Grado Estudio</Label>
                        <Input
                          value={gradoEstudio}
                          onChange={(e) => setGradoEstudio(e.target.value)}
                          readOnly={isReadOnlyEdit}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs">Celular</Label>
                        <Input
                          value={celular}
                          onChange={(e) => setCelular(e.target.value)}
                          readOnly={isReadOnlyEdit}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs">Correo</Label>
                        <Input
                          value={correo}
                          onChange={(e) => setCorreo(e.target.value)}
                          readOnly={isReadOnlyEdit}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs">Lugar Residencia</Label>
                        <Input
                          value={lugarResidencia}
                          onChange={(e) => setLugarResidencia(e.target.value)}
                          readOnly={isReadOnlyEdit}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs">Apoderado</Label>
                        <Input
                          value={apoderado}
                          onChange={(e) => setApoderado(e.target.value)}
                          readOnly={isReadOnlyEdit}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-md">
                  <CardHeader className="min-h-[38px] bg-accent/50">
                    <CardTitle className="text-2sm">
                      Datos Comerciales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs">Objetivo</Label>
                      <Textarea
                        value={objetivo}
                        onChange={(e) => setObjetivo(e.target.value)}
                        disabled={isReadOnlyEdit}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-5">
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs">Matrícula</Label>
                        <Input
                          value={matricula}
                          onChange={(e) => setMatricula(e.target.value)}
                          placeholder="0.00"
                          type="number"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs">Pensión</Label>
                        <Input
                          value={pension}
                          onChange={(e) => setPension(e.target.value)}
                          placeholder="0.00"
                          type="number"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs">Multiplicador</Label>
                        <Input
                          value={multiplicador}
                          onChange={(e) => setMultiplicador(e.target.value)}
                          placeholder="0.00"
                          type="number"
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label className="text-xs">Comentarios</Label>
                      <Textarea
                        className="min-h-[120px]"
                        value={comentarios}
                        onChange={(e) => setComentarios(e.target.value)}
                        disabled={isReadOnlyEdit}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-md">
                  <CardHeader className="min-h-[38px] bg-accent/50">
                    <CardTitle className="text-2sm">Relaciones</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-5">
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs">Vendedor</Label>
                        <Input value={vendedorActualNombre} readOnly />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label className="text-xs">Nivel</Label>
                        <Select
                          value={nivelId}
                          onValueChange={setNivelId}
                          disabled={isReadOnlyEdit}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona nivel" />
                          </SelectTrigger>
                          <SelectContent>
                            {niveles.map((item) => (
                              <SelectItem
                                key={item.id}
                                value={item.id.toString()}
                              >
                                {item.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs">Origen</Label>
                        <Select
                          value={origenId}
                          onValueChange={setOrigenId}
                          disabled={isReadOnlyEdit}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona origen" />
                          </SelectTrigger>
                          <SelectContent>
                            {origenes.map((item) => (
                              <SelectItem
                                key={item.id}
                                value={item.id.toString()}
                              >
                                {item.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label className="text-xs">Sub Origen</Label>
                        <Select
                          value={subOrigenId}
                          onValueChange={handleSubOrigenChange}
                          disabled={isReadOnlyEdit || !origenId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona sub origen" />
                          </SelectTrigger>
                          <SelectContent>
                            {subOrigenesFiltrados.map((item) => (
                              <SelectItem
                                key={item.id}
                                value={item.id.toString()}
                              >
                                {item.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs">Horario</Label>
                        <Select
                          value={horarioId}
                          onValueChange={setHorarioId}
                          disabled={isReadOnlyEdit}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona horario" />
                          </SelectTrigger>
                          <SelectContent>
                            {horarios.map((item) => (
                              <SelectItem
                                key={item.id}
                                value={item.id.toString()}
                              >
                                {item.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label className="text-xs">Horario Detalle</Label>
                        <Select
                          value={horarioDetalleId}
                          onValueChange={setHorarioDetalleId}
                          disabled={isReadOnlyEdit || !horarioId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona detalle horario" />
                          </SelectTrigger>
                          <SelectContent>
                            {horariosDetalleFiltrados.map((item) => (
                              <SelectItem
                                key={item.id}
                                value={item.id.toString()}
                              >
                                {item.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="w-full lg:w-[420px] shrink-0 lg:mt-5 space-y-5 lg:ps-5">
                <Card className="rounded-md">
                  <CardHeader className="min-h-[38px] bg-accent/50">
                    <CardTitle className="text-2sm">Comprobantes</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <VentaFormImageUpload
                      mode={mode}
                      comprobantesActuales={comprobantesActuales}
                      setComprobantesActuales={setComprobantesActuales}
                      nuevosComprobantes={nuevosComprobantes}
                      setNuevosComprobantes={setNuevosComprobantes}
                      comprobantesEliminarIds={comprobantesEliminarIds}
                      setComprobantesEliminarIds={setComprobantesEliminarIds}
                      maxFiles={3}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </ScrollArea>
        </SheetBody>

        <SheetFooter className="flex-row border-t not-only-of-type:justify-end items-center p-5 border-border gap-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Completa</SelectItem>
                  <SelectItem value="1">Parcial</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Label className="text-xs">Contactado</Label>
                <Switch checked={contactado} onCheckedChange={setContactado} />
              </div>
            </div>
            {/* 🔹 IZQUIERDA: COMBO */}

            {/* 🔹 DERECHA: BOTONES */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Salir
              </Button>
              <Button variant="mono" onClick={handleSubmit}>
                {isNewMode ? 'Crear' : 'Guardar'}
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
