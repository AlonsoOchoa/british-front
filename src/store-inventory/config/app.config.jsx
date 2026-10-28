import {
  Boxes,
  Car,
  CarFront,
  Castle,
  ClipboardList,
  LayoutGrid,
  LayoutList,
  Package,
  Settings2,
  ShieldUser,
  UsersRound,
} from 'lucide-react';

export const MENU_SIDEBAR = [
  {
    title: 'Dashboards',
    icon: LayoutGrid,
    children: [
      { title: 'Default', path: '/store-inventory/dashboard' },
      { title: 'Dark Sidebar', path: '/store-inventory/dark-sidebar' },
    ],
  },
  { heading: 'Store Inventory' },
  {
    title: 'Comercial',
    icon: Castle,
    children: [
      {
        title: 'Ajustes',
        children: [
          {
            title: 'Origen',
            path: '/store-inventory/origen',
            permiso: 'Origen.View',
          },
          {
            title: 'SubOrigen',
            path: '/store-inventory/suborigen',
            permiso: 'SubOrigen.View',
          },
          {
            title: 'Horario',
            path: '/store-inventory/horario',
            permiso: 'Horario.View',
          },
          {
            title: 'Horario Detalle',
            path: '/store-inventory/horariodetalle',
            permiso: 'HorarioDetalle.View',
          },
          {
            title: 'Nivel',
            path: '/store-inventory/nivel',
            permiso: 'Nivel.View',
          }
        ]
      },
      {
        title: 'Vendedor',
        path: '/store-inventory/vendedor',
        permiso: 'Vendedor.View',
      },
      {
        title: 'Venta',
        path: '/store-inventory/venta',
        permiso: 'Venta.View',
      },
    ]
  },
  {
    title: 'Compras',
    icon: CarFront,
    children: [
      {
        title: 'Ajustes',
        children: [
          {
            title: 'Tipo Identidad',
            path: '/store-inventory/tipoidentidad',
            permiso: 'TipoIdentidad.View',
          }
        ]
      }
    ]
  },
  {
    title: 'Inventario',
    icon: Boxes,
    children: [
      {
        title: 'Ajustes',
        children: [
          {
            title: 'Almacen',
            path: '/store-inventory/almacen',
            permiso: 'Almacen.View',
          },
          {
            title: 'Afectación',
            path: '/store-inventory/afectacion',
            permiso: 'Afectacion.View',
          },
          {
            title: 'Categoria',
            path: '/store-inventory/categoria',
            permiso: 'Categoria.View',
          },
          {
            title: 'Color',
            path: '/store-inventory/color',
            permiso: 'Color.View',
          },
          {
            title: 'Tipo de Producto',
            path: '/store-inventory/tipoproducto',
            permiso: 'TipoProducto.View',
          },
          {
            title: 'Unidad de Medida',
            path: '/store-inventory/unidadmedida',
            permiso: 'UnidadMedida.View',
          },
        ],
      },
      {
        title: 'Producto',
        path: '/store-inventory/producto',
        permiso: 'Producto.View',
      },
      {
        title: 'Servicio',
        path: '/store-inventory/servicio',
        permiso: 'Servicio.View',
      },
    ],
  },
  {
    title: 'Organizacion',
    icon: Castle,
    children: [
      {
        title: 'Empresa',
        path: '/store-inventory/empresa',
        permiso: 'Empresa.View',
      },
      {
        title: 'Sucursal',
        path: '/store-inventory/sucursal',
        permiso: 'Sucursal.View',
      },
      {
        title: 'Área',
        path: '/store-inventory/area',
        permiso: 'Area.View',
      },
      {
        title: 'Puesto',
        path: '/store-inventory/puesto',
        permiso: 'Puesto.View',
      },
      {
        title: 'Empleado',
        path: '/store-inventory/empleado',
        permiso: 'Empleado.View',
      },
    ]
  },
  {
    title: 'Seguridad',
    icon: ShieldUser,
    children: [
      {
        title: 'Usuario',
        path: '/store-inventory/usuario',
        permiso: 'Usuario.View',
      },
      {
        title: 'Rol',
        path: '/store-inventory/rol',
        permiso: 'Rol.View',
      },
    ],
  },
];
