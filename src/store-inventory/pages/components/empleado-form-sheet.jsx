'use client';

import { useEffect, useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { AreaService } from '@/services/area.service';
import { EmpleadoService } from '@/services/empleado.service';
import { EmpresaService } from '@/services/empresa.service';
import { PuestoService } from '@/services/puesto.service';
import { SucursalService } from '@/services/sucursal.service';
import { TipoIdentidadService } from '@/services/tipoidentidad.service';
import { UsuarioService } from '@/services/usuario.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardToolbar } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';


export function EmpleadoFormSheet({
  mode,
  open,
  onOpenChange,
  empleado,
  onUpdated,
}) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';
  // 📌 Campos de formulario
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [direccion, setDireccion] = useState('');

  // 🔗 Relaciones (Select)
  const [empresaId, setEmpresaId] = useState('');
  const [sucursalId, setSucursalId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [puestoId, setPuestoId] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [supervisorId, setSupervisorId] = useState('');
  const [tipoIdentidadId, setTipoIdentidadId] = useState('');

  // 📋 Catálogos
  const [empresas, setEmpresas] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [areas, setAreas] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [supervisores, setSupervisores] = useState([]);
  const [tipoidentidades, setTipoIdentidades] = useState([]);

  // 🧭 Cargar catálogos al abrir modal
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empresa, suc, area, pue, usu, emp, tipo] = await Promise.all([
          EmpresaService.getAll(),
          SucursalService.getAll(),
          AreaService.getAll(),
          PuestoService.getAll(),
          UsuarioService.getAll(),
          EmpleadoService.getAll(),
          TipoIdentidadService.getAll(),
        ]);
        setEmpresas(empresa);
        setSucursales(suc);
        setAreas(area);
        setPuestos(pue);
        setUsuarios(usu);
        setSupervisores(emp);
        setTipoIdentidades(tipo);
      } catch (error) {
        console.error('Error cargando catálogos:', error);
        toast.error('⚠️ Error cargando catálogos.');
      }
    };

    if (open) fetchData();
  }, [open]);

  // ✍️ Cargar datos en edición
  useEffect(() => {
    const fetchEmpleadoCompleto = async () => {
      try {
        if (isEditMode && empleado?.id) {
          const empleadoRefrescado = await EmpleadoService.getById(empleado.id);

          // ✅ También actualiza campos básicos si cambian (opcional)
          setNumeroDocumento(empleadoRefrescado.numeroDocumento || '');
          setNombres(empleadoRefrescado.nombres || '');
          setApellidos(empleadoRefrescado.apellidos || '');
          setTelefono(empleadoRefrescado.telefono || '');
          setCorreo(empleadoRefrescado.correo || '');
          setDireccion(empleadoRefrescado.direccion || '');

          setEmpresaId(String(empleadoRefrescado.empresaId));
          setSucursalId(String(empleadoRefrescado.sucursalId));
          setAreaId(String(empleadoRefrescado.areaId));
          setPuestoId(String(empleadoRefrescado.puestoId));
          setUsuarioId(String(empleadoRefrescado.usuarioId));
          setSupervisorId(String(empleadoRefrescado.supervisorId));
          setTipoIdentidadId(String(empleadoRefrescado.tipoIdentidadId));
        }
      } catch (error) {
        console.error('⚠️ Error al recargar empleado:', error);
        toast.error('⚠️ Error cargando empleados.');
      }
    };

    fetchEmpleadoCompleto();
  }, [open, isEditMode, empleado?.id]);

  // 🧼 Reset cuando cierras en modo nuevo
  useEffect(() => {
    if (!open && isNewMode) {
      setNumeroDocumento('');
      setNombres('');
      setApellidos('');
      setTelefono('');
      setCorreo('');
      setDireccion('');
      setEmpresaId('');
      setSucursalId('');
      setAreaId('');
      setPuestoId('');
      setUsuarioId('');
      setSupervisorId('');
      setTipoIdentidadId('');
    }
  }, [open, isNewMode]);

  // 💾 Guardar
  const handleSave = async () => {
    if (!numeroDocumento.trim()) {
      toast.error('El número de documento del empleado es obligatorio.');
      return;
    }

    const empleadoData = {
      numeroDocumento,
      nombres,
      apellidos,
      telefono,
      correo,
      direccion,
      empresaId: Number(empresaId),
      sucursalId: Number(sucursalId),
      areaId: Number(areaId),
      puestoId: Number(puestoId),
      usuarioId: Number(usuarioId),
      supervisorId: supervisorId ? Number(supervisorId) : null,
      tipoIdentidadId: Number(tipoIdentidadId),
    };


    try {
      if (isNewMode) {
        const result = await EmpleadoService.create(empleadoData);
        toast.success('🧾 Empleado creado correctamente');
        onUpdated?.(result);
      } else {
        const result = await EmpleadoService.update(empleado.id, {
          Id: empleado.id,
          ...empleadoData,
        });
        toast.success('✏️ Empleado actualizado correctamente');
        onUpdated?.(result);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error al guardar el empleado:', error);
      toast.error('❌ Error al guardar el empleado.');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 lg:w-[1080px] sm:max-w-none inset-5 border start-auto h-auto rounded-lg p-0 [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-3.5 px-5 border-border">
          <SheetTitle className="font-medium">
            {isNewMode ? 'Nuevo Empleado' : 'Editar Empleado'}
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow">
          <ScrollArea className="flex flex-col h-[calc(100dvh-10rem)] mx-1.5 overflow-y-auto">
            <div className="flex flex-wrap lg:flex-nowrap px-3.5 grow">
              {/* 📝 Columna izquierda con tus campos */}
              <div className="grow lg:border-e border-border lg:pe-5 space-y-5 py-5">
                {/* 🧾 Información básica */}
                <Card className="rounded-md">
                  <CardHeader className="min-h-[38px] bg-accent/50">
                    <CardTitle className="text-2sm">
                      Información Básica
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Tipo Identidad</Label>
                        <Select
                          value={tipoIdentidadId}
                          onValueChange={setTipoIdentidadId}
                          indicatorPosition="right"
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo de indentidad" />
                          </SelectTrigger>
                          <SelectContent>
                            {tipoidentidades.map((a) => (
                              <SelectItem key={a.id} value={String(a.id)}>
                                {a.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Número documento</Label>
                        <Input
                          value={numeroDocumento}
                          onChange={(e) => setNumeroDocumento(e.target.value)}
                          placeholder="Número de documento"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Nombres</Label>
                        <Input
                          value={nombres}
                          onChange={(e) => setNombres(e.target.value)}
                          placeholder="Nombres"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Apellidos</Label>
                        <Input
                          value={apellidos}
                          onChange={(e) => setApellidos(e.target.value)}
                          placeholder="Apellidos"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Celular</Label>
                        <Input
                          value={telefono}
                          onChange={(e) => setTelefono(e.target.value)}
                          placeholder="Celular"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Correo</Label>
                        <Input
                          value={correo}
                          onChange={(e) => setCorreo(e.target.value)}
                          placeholder="Correo"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <Label className="text-xs">Dirección</Label>
                        <Input
                          value={direccion}
                          onChange={(e) => setDireccion(e.target.value)}
                          placeholder="Dirección"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 📊 Relaciones */}
                <Card className="rounded-md">
                  <CardHeader className="min-h-[38px] bg-accent/50">
                    <CardTitle className="text-2sm">Relaciones</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 grid grid-cols-2 gap-4">
                    {/* Todos tus selects tal cual */}
                    {/* Empresa */}
                    <div>
                      <Label className="text-xs">Empresa</Label>
                      <Select
                        value={empresaId}
                        onValueChange={setEmpresaId}
                        indicatorPosition="right"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar Empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {empresas.map((a) => (
                            <SelectItem key={a.id} value={String(a.id)}>
                              {a.nombreComercial}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sucursal */}
                    <div>
                      <Label className="text-xs">Sucursal</Label>
                      <Select
                        value={sucursalId}
                        onValueChange={setSucursalId}
                        indicatorPosition="right"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar Sucursal" />
                        </SelectTrigger>
                        <SelectContent>
                          {sucursales.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Área */}
                    <div>
                      <Label className="text-xs">Área</Label>
                      <Select
                        value={areaId}
                        onValueChange={setAreaId}
                        indicatorPosition="right"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar Área" />
                        </SelectTrigger>
                        <SelectContent>
                          {areas.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)}>
                              {t.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Puesto */}
                    <div>
                      <Label className="text-xs">Puesto</Label>
                      <Select
                        value={puestoId}
                        onValueChange={setPuestoId}
                        indicatorPosition="right"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar Puesto" />
                        </SelectTrigger>
                        <SelectContent>
                          {puestos.map((u) => (
                            <SelectItem key={u.id} value={String(u.id)}>
                              {u.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Supervisor */}
                    <div>
                      <Label className="text-xs">Supervisor</Label>
                      <Select
                        value={supervisorId || 'none'}
                        onValueChange={(value) => {
                          setSupervisorId(value === 'none' ? '' : value);
                        }}
                        indicatorPosition="right"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar Supervisor" />
                        </SelectTrigger>

                        <SelectContent>
                          {/* opción para limpiar */}
                          <SelectItem value="none">Sin supervisor</SelectItem>

                          {supervisores.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {`${c.nombres} ${c.apellidos ?? ''}`.trim()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Usuario */}
                    <div>
                      <Label className="text-xs">Usuario</Label>
                      <Select
                        value={usuarioId}
                        onValueChange={setUsuarioId}
                        indicatorPosition="right"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar Usuario" />
                        </SelectTrigger>
                        <SelectContent>
                          {usuarios.map((a) => (
                            <SelectItem key={a.id} value={String(a.id)}>
                              {a.nombreUsuario}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </ScrollArea>
        </SheetBody>

        <SheetFooter className="flex justify-end border-t items-center p-5 border-border gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="mono" onClick={handleSave}>
            {isNewMode ? 'Crear' : 'Guardar'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );

  function SwitchRow({ label, value, setValue }) {
    return (
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        <Switch checked={value} onCheckedChange={setValue} />
      </div>
    );
  }
}