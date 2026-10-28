'use client';

import { useEffect, useState } from 'react';
import { User, X } from 'lucide-react';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { EmpresaService } from '@/services/empresa.service';
import { Button } from '@/components/ui/button';
import { Command, CommandCheck, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';


// Country data for phone number input
const countries = [{ code: 'PE', name: 'Peru', dialCode: '+51', flag: '🇵🇪' }];

// Customer Avatar Upload Component
function EmpresaAvatarUpload({ mode, preview, onFileChange, onRemove }) {
  const isEditMode = mode === 'edit';

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="w-full h-[200px] bg-accent/50 border border-border rounded-lg flex items-center justify-center">
          {preview ? (
            <div className="relative flex items-center justify-center w-full h-full">
              <img
                src={preview}
                alt="Logo Empresa"
                className="w-full h-full object-cover rounded-lg"
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute top-2 right-2 size-6"
                onClick={onRemove}
              >
                <X className="size-3" />
              </Button>

              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
                id="empresa-avatar-upload"
              />

              <label
                htmlFor="empresa-avatar-upload"
                className="absolute bottom-3 right-3"
              >
                <Button size="sm" variant="outline" asChild>
                  <span>{isEditMode ? 'Cambiar' : 'Subir'}</span>
                </Button>
              </label>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <User className="size-[35px] text-muted-foreground" />

              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
                id="empresa-avatar-upload"
              />

              <label
                htmlFor="empresa-avatar-upload"
                className="absolute bottom-3 right-3"
              >
                <Button size="sm" variant="outline" asChild>
                  <span>Subir</span>
                </Button>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Phone Number Input Component
function PhoneNumberInput({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default to Netherlands

  // Handle phone number input change
  const handlePhoneChange = (inputValue) => {
    // Remove any non-digit characters except + at the start
    const cleanValue = inputValue.replace(/[^\d+]/g, '');

    // Check if user is typing a country code
    if (cleanValue.startsWith('+')) {
      const matchedCountry = countries.find((country) =>
        cleanValue.startsWith(country.dialCode),
      );

      if (matchedCountry && matchedCountry.code !== selectedCountry.code) {
        setSelectedCountry(matchedCountry);
        onChange(cleanValue.slice(matchedCountry.dialCode.length));
        return;
      }
    }

    onChange(cleanValue.startsWith('+') ? cleanValue : cleanValue);
  };

  // Handle country selection
  const handleCountrySelect = (countryCode) => {
    const country = countries.find((c) => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      setOpen(false);
    }
  };

  return (
    <div className="flex items-center w-full">
      {/* Country Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-24 items-center justify-between rounded-e-none border-e-0 bg-transparent"
          >
            <span className="flex items-center gap-1.5">
              <span className="text-sm leading-none">
                {selectedCountry.flag}
              </span>
              <span className="text-xs leading-none">
                {selectedCountry.dialCode}
              </span>
            </span>
            <svg
              className="ml-2 h-4 w-4 shrink-0 opacity-50"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandList>
              <ScrollArea className="h-[300px]">
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {countries.map((country) => (
                    <CommandItem
                      key={country.code}
                      value={`${country.name} ${country.dialCode}`}
                      onSelect={() => handleCountrySelect(country.code)}
                    >
                      <span className="flex items-center gap-1.5 leading-none">
                        <span className="text-sm">{country.flag}</span>
                        <span className="text-sm text-foreground truncate">
                          {country.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {country.dialCode}
                        </span>
                      </span>
                      {selectedCountry.code === country.code && (
                        <CommandCheck />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Phone Number Input */}
      <Input
        type="tel"
        placeholder="Enter phone number"
        value={value.startsWith('+') ? value : value}
        onChange={(e) => handlePhoneChange(e.target.value)}
        className="rounded-l-none flex-1"
      />
    </div>
  );
}

export function EmpresaFormSheet({
  mode,
  open,
  onOpenChange,
  empresa,
  onUpdated,
}) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';

  // 📌 Campos de formulario
  const [razonSocial, setRazonSocial] = useState('');
  const [nombreComercial, setNombreComercial] = useState('');
  const [ruc, setRuc] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');

  const [imagen, setImagen] = useState(undefined);
  const [imagenPreview, setImagenPreview] = useState(null);

  // ✍️ Cargar datos en edición
  useEffect(() => {
    const fetchEmpresaCompleto = async () => {
      try {
        if (isEditMode && open && empresa?.id) {
          const empresaRefrescado = await EmpresaService.getById(empresa.id);

          setRazonSocial(empresaRefrescado.razonSocial || '');
          setNombreComercial(empresaRefrescado.nombreComercial || '');
          setRuc(empresaRefrescado.ruc || '');
          setDireccion(empresaRefrescado.direccion || '');
          setTelefono(empresaRefrescado.telefono || '');
          setCorreo(empresaRefrescado.correo || '');

          if (empresaRefrescado.imagen && empresaRefrescado.imagenTipo) {
            setImagenPreview(
              `data:${empresaRefrescado.imagenTipo};base64,${empresaRefrescado.imagen}`,
            );
          } else {
            setImagenPreview(null);
          }

          setImagen(undefined); // importante: aún no se ha tocado
        }
      } catch (error) {
        console.error('⚠️ Error al recargar empresa:', error);
        toast.error('No se pudo cargar la empresa.');
      }
    };

    fetchEmpresaCompleto();
  }, [open, isEditMode, empresa?.id]);

  // 🧼 Reset cuando cierras en modo nuevo
  useEffect(() => {
    if (!open) {
      if (isNewMode) {
        setRazonSocial('');
        setNombreComercial('');
        setRuc('');
        setDireccion('');
        setTelefono('');
        setCorreo('');
        setImagen(undefined);
        setImagenPreview(null);
      }
    }
  }, [open, isNewMode]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImagen(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagenPreview(e.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagen(null);
    setImagenPreview(null);
  };

  // 💾 Guardar
  const handleSave = async () => {
    if (!ruc.trim()) {
      toast.error('El RUC de la empresa es obligatorio.');
      return;
    }

    const empresaData = {
      razonSocial,
      nombreComercial,
      ruc,
      direccion,
      telefono,
      correo,
    };

    try {
      let result;

      if (isNewMode) {
        result = await EmpresaService.create(empresaData);

        if (imagen instanceof File) {
          await EmpresaService.updateImagen(result.id, imagen);
        }

        toast.success('🧾 Empresa creada correctamente');
      } else {
        result = await EmpresaService.update(empresa.id, {
          id: empresa.id,
          ...empresaData,
        });

        if (imagen instanceof File) {
          await EmpresaService.updateImagen(empresa.id, imagen);
        } else if (imagen === null) {
          await EmpresaService.updateImagen(empresa.id, null);
        }
        // si imagen es undefined => no tocar imagen

        toast.success('✏️ Empresa actualizada correctamente');
      }

      onUpdated?.(result);
      onOpenChange(false);
    } catch (error) {
      console.error('Error al guardar la empresa:', error);
      toast.error('❌ Error al guardar la empresa.');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 lg:w-[820px] sm:max-w-none inset-5 border start-auto h-auto rounded-lg p-0 [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        {/* Header */}
        <SheetHeader className="border-b py-3.5 px-5 border-border">
          <SheetTitle className="font-medium">
            {isNewMode ? 'Nueva Empresa' : 'Editar Empresa'}
          </SheetTitle>
        </SheetHeader>

        {/* Body */}
        <SheetBody className="p-0 grow">
          <ScrollArea
            className="flex flex-col h-[calc(100dvh-10rem)] mx-1.5"
            viewportClassName="[&>div]:h-full [&>div>div]:h-full"
          >
            <div className="flex flex-wrap lg:flex-nowrap px-3.5 grow">
              {/* Left Section - Avatar Upload */}
              <div className="w-full shrink-0 lg:w-[280px] py-5 lg:pe-5 space-y-4">
                <EmpresaAvatarUpload
                  mode={mode}
                  preview={imagenPreview}
                  onFileChange={handleImageChange}
                  onRemove={handleRemoveImage}
                />
              </div>

              {/* Right Section - Form Fields */}
              <div className="grow lg:border-s border-border space-y-5 py-5 lg:ps-5">
                {/* RUC */}
                <div className="flex items-center gap-10">
                  <Label className="text-xs font-medium w-24 shrink-0">
                    RUC
                  </Label>
                  <Input
                    placeholder="RUC"
                    value={ruc}
                    onChange={(e) => setRuc(e.target.value)}
                    className="flex-1"
                  />
                </div>

                {/* Razon Social */}
                <div className="flex items-center gap-10">
                  <Label className="text-xs font-medium w-24 shrink-0">
                    Razón Social
                  </Label>
                  <Input
                    placeholder="Razón social"
                    value={razonSocial}
                    onChange={(e) => setRazonSocial(e.target.value)}
                    className="flex-1"
                  />
                </div>

                {/* Nombre Comercial */}
                <div className="flex items-center gap-10">
                  <Label className="text-xs font-medium w-24 shrink-0">
                    Nombre comercial
                  </Label>
                  <Input
                    placeholder="Razón social"
                    value={nombreComercial}
                    onChange={(e) => setNombreComercial(e.target.value)}
                    className="flex-1"
                  />
                </div>

                {/* Dirección */}
                <div className="flex items-center gap-10">
                  <Label className="text-xs font-medium w-24 shrink-0">
                    Dirección
                  </Label>
                  <Input
                    placeholder="Razón social"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="flex-1"
                  />
                </div>

                {/* Email */}
                <div className="flex items-center gap-10">
                  <Label className="text-xs font-medium w-24 shrink-0">
                    Correo
                  </Label>
                  <Input
                    placeholder="Correo"
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="flex-1"
                  />
                </div>

                {/* Phone Number */}
                <div className="flex items-center gap-10">
                  <Label className="text-xs font-medium w-24 shrink-0">
                    Celular
                  </Label>
                  <div className="flex-1">
                    <PhoneNumberInput value={telefono} onChange={setTelefono} />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </SheetBody>

        {/* Footer */}
        <SheetFooter className="flex-row border-t pb-4 p-5 border-border gap-2.5 lg:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="mono" onClick={handleSave}>
            {isNewMode ? 'Crear' : 'Guardar'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}