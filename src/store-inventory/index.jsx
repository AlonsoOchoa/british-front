import { Navigate, Route, Routes } from 'react-router-dom';
import { DefaultLayout } from './layout';
import { AllStock } from './pages/all-stock/page';
import { CategoryDetails } from './pages/category-details/page';
import { CategoryList } from './pages/category-list/page';
import { Empresa } from './pages/empresa/page';
import { Sucursal } from './pages/sucursal/page';
import { Area } from './pages/area/page';
import { Puesto } from './pages/puesto/page';
import { Empleado } from './pages/empleado/page';
import { Vendedor } from './pages/vendedor/page';
import { Origen } from './pages/origen/page';
import { SubOrigen } from './pages/suborigen/page';
import { Horario } from './pages/horario/page';
import { HorarioDetalle } from './pages/horariodetalle/page';
import { Nivel } from './pages/nivel/page';
import { Venta } from './pages/venta/page';
import { TipoIdentidad } from './pages/tipoidentidad/page';
import { Almacen } from './pages/almacen/page';
import { Categoria } from './pages/categoria/page';
import { Color } from './pages/color/page';
import { Servicio } from './pages/servicio/page';
import { TipoProducto } from './pages/tipoproducto/page';
import { UnidadMedida } from './pages/unidadmedida/page';
import { Afectacion } from './pages/afectacion/page';
import { Producto } from './pages/producto/page';
import { Usuario } from './pages/usuario/page';
import { Rol } from './pages/rol/page';
import { CreateCategoryPage } from './pages/create-category/page';
import { CreateProductPage } from './pages/create-product/page';
import { CreateShippingLabelPage } from './pages/create-shipping-label/page';
import { CurrentStock } from './pages/current-stock/page';
import { CustomerListDetails } from './pages/customer-list-details/page';
import { CustomerList } from './pages/customer-list/page';
import { Dashboard } from './pages/dashboard/page';
import { EditCategoryPage } from './pages/edit-category/page';
import { EditProductPage } from './pages/edit-product/page';
import { InboundStock } from './pages/inbound-stock/page';
import { ManageVariantsPage } from './pages/manage-variants/page';
import { OrderDetailsPage } from './pages/order-detials/page';
import { OrderListProducts } from './pages/order-list-products/page';
import { OrderList } from './pages/order-list/page';
import { OrderTrackingPage } from './pages/order-tracking/page';
import { OutboundStock } from './pages/outbound-stock/page';
import { PerProductStockPage } from './pages/per-product-stock/page';
import { ProductDetailsPage } from './pages/product-details/page';
import { ProductInfoPage } from './pages/product-info/page';
import { ProductList } from './pages/product-list/page';
import SettingsGeneral from './pages/settings-general/page';
import { StockPlanner } from './pages/stock-planner/page';
import { TrackShippingPage } from './pages/track-shipping/page';

export default function StoreInventoryModule() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="dark-sidebar" element={<Dashboard />} />
        <Route path="all-stock" element={<AllStock />} />
        <Route path="current-stock" element={<CurrentStock />} />
        <Route path="inbound-stock" element={<InboundStock />} />
        <Route path="outbound-stock" element={<OutboundStock />} />
        <Route path="stock-planner" element={<StockPlanner />} />
        <Route path="product-list" element={<ProductList />} />
        <Route path="product-details" element={<ProductDetailsPage />} />
        <Route path="create-product" element={<CreateProductPage />} />
        <Route path="edit-product" element={<EditProductPage />} />
        <Route path="per-product-stock" element={<PerProductStockPage />} />
        <Route path="track-shipping" element={<TrackShippingPage />} />
        <Route path="product-info" element={<ProductInfoPage />} />
        <Route path="customer-list" element={<CustomerList />} />
        <Route path="customer-list-details" element={<CustomerListDetails />} />
        <Route path="settings-general" element={<SettingsGeneral />} />
        <Route
          path="create-shipping-label"
          element={<CreateShippingLabelPage />}
        />

        <Route path="manage-variants" element={<ManageVariantsPage />} />
        <Route path="category-list" element={<CategoryList />} />
        <Route path="empresa" element={<Empresa />} />
        <Route path="sucursal" element={<Sucursal />} />
        <Route path="area" element={<Area />} />
        <Route path="puesto" element={<Puesto />} />
        <Route path="empleado" element={<Empleado />} />
        <Route path="vendedor" element={<Vendedor />} />
        <Route path="origen" element={<Origen />} />
        <Route path="suborigen" element={<SubOrigen />} />
        <Route path="horario" element={<Horario />} />
        <Route path="horariodetalle" element={<HorarioDetalle />} />
        <Route path="nivel" element={<Nivel />} />
        <Route path="venta" element={<Venta />} />
        <Route path="tipoidentidad" element={<TipoIdentidad />} />
        <Route path="almacen" element={<Almacen />} />
        <Route path="categoria" element={<Categoria />} />
        <Route path="color" element={<Color />} />
        <Route path="servicio" element={<Servicio />} />
        <Route path="tipoproducto" element={<TipoProducto />} />
        <Route path="unidadmedida" element={<UnidadMedida />} />
        <Route path="afectacion" element={<Afectacion />} />
        <Route path="producto" element={<Producto />} />
        <Route path="usuario" element={<Usuario />} />
        <Route path="rol" element={<Rol />} />
        <Route path="create-category" element={<CreateCategoryPage />} />
        <Route path="edit-category" element={<EditCategoryPage />} />
        <Route path="category-details" element={<CategoryDetails />} />
        <Route path="order-list" element={<OrderList />} />
        <Route path="order-list-products" element={<OrderListProducts />} />
        <Route path="order-details" element={<OrderDetailsPage />} />
        <Route path="order-tracking" element={<OrderTrackingPage />} />
        <Route path="customer-list" element={<CustomerList />} />
      </Route>
    </Routes>
  );
}
