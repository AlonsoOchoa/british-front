'use client';

import { useEffect, useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { AfectacionService } from '@/services/afectacion.service';
import { AlmacenService } from '@/services/almacen.service';
import { CategoriaService } from '@/services/categoria.service';
import { ColorService } from '@/services/color.service';
import { ProductoService } from '@/services/producto.service';
import { TipoProductoService } from '@/services/tipoproducto.service';
import { UnidadMedidaService } from '@/services/unidadmedida.service';
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
import { ProductoFormImageUpload } from './producto-form-image-upload';


export function ProductoFormSheet({
  mode,
  open,
  onOpenChange,
  producto,
  onUpdated,
}) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';
  // 📌 Campos de formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [codigo, setCodigo] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ubicacion, setUbicacion] = useState('');

  // 🪄 Switches
  const [controlaStock, setControlaStock] = useState(false);
  const [destacado, setDestacado] = useState(false);
  const [esVenta, setEsVenta] = useState(false);
  const [comisiona, setComisiona] = useState(false);
  const [receta, setReceta] = useState(false);

  // 💰 Precios
  const [precioCosto, setPrecioCosto] = useState('');
  const [precioVentaContado, setPrecioVentaContado] = useState('');
  const [precioVentaMayor, setPrecioVentaMayor] = useState('');
  const [precioVentaCredito, setPrecioVentaCredito] = useState('');

  // 🔗 Relaciones (Select)
  const [almacenId, setAlmacenId] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [tipoProductoId, setTipoProductoId] = useState('');
  const [unidadMedidaId, setUnidadMedidaId] = useState('');
  const [colorId, setColorId] = useState('');
  const [afectacionId, setAfectacionId] = useState('');

  // 📋 Catálogos
  const [almacenes, setAlmacenes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [tiposProducto, setTiposProducto] = useState([]);
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [colores, setColores] = useState([]);
  const [afectaciones, setAfectaciones] = useState([]);

  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);

  // 🧭 Cargar catálogos al abrir modal
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alm, cat, tip, uni, col, afe] = await Promise.all([
          AlmacenService.getAll(),
          CategoriaService.getAll(),
          TipoProductoService.getAll(),
          UnidadMedidaService.getAll(),
          ColorService.getAll(),
          AfectacionService.getAll(),
        ]);
        setAlmacenes(alm);
        setCategorias(cat);
        setTiposProducto(tip);
        setUnidadesMedida(uni);
        setColores(col);
        setAfectaciones(afe);
      } catch (error) {
        console.error('Error cargando catálogos:', error);
        toast.error('⚠️ Error cargando catálogos.');
      }
    };

    if (open) fetchData();
  }, [open]);

  // ✍️ Cargar datos en edición
  useEffect(() => {
    const fetchProductoCompleto = async () => {
      try {
        if (isEditMode && producto?.id) {
          const productoRefrescado = await ProductoService.getById(producto.id);

          // ✅ Sobrescribe imagen y preview actualizadas
          if (productoRefrescado.imagen && productoRefrescado.imagenTipo) {
            setImagenPreview(
              `data:${productoRefrescado.imagenTipo};base64,${productoRefrescado.imagen}`,
            );
          } else {
            setImagenPreview(null);
          }

          // ✅ También actualiza campos básicos si cambian (opcional)
          setNombre(productoRefrescado.nombre || '');
          setDescripcion(productoRefrescado.descripcion || '');
          setCodigo(productoRefrescado.codigo || '');
          setCodigoBarras(productoRefrescado.codigoBarras || '');
          setMarca(productoRefrescado.marca || '');
          setModelo(productoRefrescado.modelo || '');
          setUbicacion(productoRefrescado.ubicacion || '');

          setControlaStock(productoRefrescado.controlaStock);
          setDestacado(productoRefrescado.destacado);
          setEsVenta(productoRefrescado.esVenta);
          setComisiona(productoRefrescado.comisiona);
          setReceta(productoRefrescado.receta);

          setPrecioCosto(productoRefrescado.precioCosto || '');
          setPrecioVentaContado(productoRefrescado.precioVentaContado || '');
          setPrecioVentaMayor(productoRefrescado.precioVentaMayor || '');
          setPrecioVentaCredito(productoRefrescado.precioVentaCredito || '');

          setAlmacenId(String(productoRefrescado.almacenId));
          setCategoriaId(String(productoRefrescado.categoriaId));
          setTipoProductoId(String(productoRefrescado.tipoProductoId));
          setUnidadMedidaId(String(productoRefrescado.unidadMedidaId));
          setColorId(String(productoRefrescado.colorId));
          setAfectacionId(String(productoRefrescado.afectacionId));
        }
      } catch (error) {
        console.error('⚠️ Error al recargar producto:', error);
        toast.error('No se pudo actualizar la imagen del producto.');
      }
    };

    fetchProductoCompleto();
  }, [open, isEditMode, producto?.id]);

  // 🧼 Reset cuando cierras en modo nuevo
  useEffect(() => {
    if (!open && isNewMode) {
      setNombre('');
      setDescripcion('');
      setCodigo('');
      setCodigoBarras('');
      setMarca('');
      setModelo('');
      setUbicacion('');
      setControlaStock(false);
      setDestacado(false);
      setEsVenta(false);
      setComisiona(false);
      setReceta(false);
      setPrecioCosto('');
      setPrecioVentaContado('');
      setPrecioVentaMayor('');
      setPrecioVentaCredito('');
      setAlmacenId('');
      setCategoriaId('');
      setTipoProductoId('');
      setUnidadMedidaId('');
      setColorId('');
      setAfectacionId('');
      setImagen(null);
      setImagenPreview(null);
    }
  }, [open, isNewMode]);

  // 💾 Guardar
  const handleSave = async () => {
    if (!nombre.trim()) {
      toast.error('El nombre del producto es obligatorio.');
      return;
    }

    const productoData = {
      nombre,
      descripcion,
      codigo,
      codigoBarras,
      marca,
      modelo,
      ubicacion,
      controlaStock,
      destacado,
      esVenta,
      comisiona,
      receta,
      precioCosto: parseFloat(precioCosto) || 0,
      precioVentaContado: parseFloat(precioVentaContado) || 0,
      precioVentaMayor: parseFloat(precioVentaMayor) || 0,
      precioVentaCredito: parseFloat(precioVentaCredito) || 0,
      almacenId: Number(almacenId),
      categoriaId: Number(categoriaId),
      tipoProductoId: Number(tipoProductoId),
      unidadMedidaId: Number(unidadMedidaId),
      colorId: Number(colorId),
      afectacionId: Number(afectacionId),
    };


    try {
      if (isNewMode) {
        const result = await ProductoService.create(productoData);
        if (imagen instanceof File) {
          await ProductoService.updateImagen(result.id, imagen);
        } else {
          // 🗑️ Si no se subió nada, aseguramos que quede imagen = null
          await ProductoService.updateImagen(result.id, null);
        }
        toast.success('🧾 Producto creado correctamente');
        onUpdated?.(result);
      } else {
        const result = await ProductoService.update(producto.id, {
          Id: producto.id,
          ...productoData,
        });
        if (imagen instanceof File) {
          // Subir nueva imagen
          await ProductoService.updateImagen(producto.id, imagen);
        } else if (imagen === null) {
          // Eliminar imagen
          await ProductoService.updateImagen(producto.id, null);
        }
        toast.success('✏️ Producto actualizado correctamente');
        onUpdated?.(result);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      toast.error('❌ Error al guardar el producto.');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 lg:w-[1080px] sm:max-w-none inset-5 border start-auto h-auto rounded-lg p-0 [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-3.5 px-5 border-border">
          <SheetTitle className="font-medium">
            {isNewMode ? 'Nuevo Producto' : 'Editar Producto'}
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
                    <div>
                      <Label className="text-xs">Nombre</Label>
                      <Input
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Nombre del producto"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Código</Label>
                        <Input
                          value={codigo}
                          onChange={(e) => setCodigo(e.target.value)}
                          placeholder="Código interno"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Código de Barras</Label>
                        <Input
                          value={codigoBarras}
                          onChange={(e) => setCodigoBarras(e.target.value)}
                          placeholder="Código de barras"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Descripción</Label>
                      <Textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Descripción del producto"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <Label className="text-xs">Marca</Label>
                        <Input
                          value={marca}
                          onChange={(e) => setMarca(e.target.value)}
                          placeholder="Marca del producto"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Modelo</Label>
                        <Input
                          value={modelo}
                          onChange={(e) => setModelo(e.target.value)}
                          placeholder="Modelo del producto"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <Label className="text-xs">Ubicación</Label>
                      <Input
                        value={ubicacion}
                        onChange={(e) => setUbicacion(e.target.value)}
                        placeholder="Ubicación en almacén"
                      />
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
                    {/* Almacén */}
                    <div>
                      <Label className="text-xs">Almacén</Label>
                      <Select
                        value={almacenId}
                        onValueChange={setAlmacenId}
                        indicatorPosition="right"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar Almacén" />
                        </SelectTrigger>
                        <SelectContent>
                          {almacenes.map((a) => (
                            <SelectItem key={a.id} value={String(a.id)}>
                              {a.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Categoría */}
                    <div>
                      <Label className="text-xs">Categoría</Label>
                      <Select
                        value={categoriaId}
                        onValueChange={setCategoriaId}
                        indicatorPosition="right"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar Categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tipo de producto */}
                    <div>
                      <Label className="text-xs">Tipo de Producto</Label>
                      <Select
                        value={tipoProductoId}
                        onValueChange={setTipoProductoId}
                        indicatorPosition="right"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposProducto.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)}>
                              {t.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Unidad de medida */}
                    <div>
                      <Label className="text-xs">Unidad de Medida</Label>
                      <Select
                        value={unidadMedidaId}
                        onValueChange={setUnidadMedidaId}
                        indicatorPosition="right"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar Unidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {unidadesMedida.map((u) => (
                            <SelectItem key={u.id} value={String(u.id)}>
                              {u.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Color */}
                    <div>
                      <Label className="text-xs">Color</Label>
                      <Select
                        value={colorId}
                        onValueChange={setColorId}
                        indicatorPosition="right"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar Color" />
                        </SelectTrigger>
                        <SelectContent>
                          {colores.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Afectación */}
                    <div>
                      <Label className="text-xs">Afectación</Label>
                      <Select
                        value={afectacionId}
                        onValueChange={setAfectacionId}
                        indicatorPosition="right"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar Afectación" />
                        </SelectTrigger>
                        <SelectContent>
                          {afectaciones.map((a) => (
                            <SelectItem key={a.id} value={String(a.id)}>
                              {a.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* 💰 Precios */}
                <Card className="rounded-md">
                  <CardHeader className="min-h-[38px] bg-accent/50">
                    <CardTitle className="text-2sm">Precios</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Precio Costo</Label>
                      <Input
                        value={precioCosto}
                        onChange={(e) => setPrecioCosto(e.target.value)}
                        placeholder="0.00"
                        type="number"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Precio Contado</Label>
                      <Input
                        value={precioVentaContado}
                        onChange={(e) => setPrecioVentaContado(e.target.value)}
                        placeholder="0.00"
                        type="number"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Precio Mayor</Label>
                      <Input
                        value={precioVentaMayor}
                        onChange={(e) => setPrecioVentaMayor(e.target.value)}
                        placeholder="0.00"
                        type="number"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Precio Crédito</Label>
                      <Input
                        value={precioVentaCredito}
                        onChange={(e) => setPrecioVentaCredito(e.target.value)}
                        placeholder="0.00"
                        type="number"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 🧭 Switches */}
                <Card className="rounded-md">
                  <CardHeader className="min-h-[38px] bg-accent/50">
                    <CardTitle className="text-2sm">Opciones</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 grid grid-cols-2 gap-3">
                    <SwitchRow
                      label="Controla Stock"
                      value={controlaStock}
                      setValue={setControlaStock}
                    />
                    <SwitchRow
                      label="Destacado"
                      value={destacado}
                      setValue={setDestacado}
                    />
                    <SwitchRow
                      label="Es Venta"
                      value={esVenta}
                      setValue={setEsVenta}
                    />
                    <SwitchRow
                      label="Comisiona"
                      value={comisiona}
                      setValue={setComisiona}
                    />
                    <SwitchRow
                      label="Receta"
                      value={receta}
                      setValue={setReceta}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* 🖼️ Columna derecha para imagen */}
              <div className="w-full lg:w-[420px] shrink-0 lg:mt-5 space-y-5 lg:ps-5">
                <ProductoFormImageUpload
                  mode={mode}
                  producto={producto}
                  imagenPreview={imagenPreview}
                  onImageChange={(file) => {
                    setImagen(file);
                    if (file === null) {
                      // ⚡ si se elimina la imagen, también limpiamos la vista previa
                      setImagenPreview(null);
                    }
                  }}
                />
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