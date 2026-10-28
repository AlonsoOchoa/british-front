import { Link, Outlet } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Card, CardContent } from '@/components/ui/card';

export function BrandedLayout() {
  return (
    <>
      <style>
        {`
          .branded-bg {
            background-image: url('/media/images/2600x1600/1.png');
          }
        `}
      </style>

      <div className="grid lg:grid-cols-2 grow h-screen">
        {/* LADO IZQUIERDO: FORM */}
        <div className="flex justify-center items-center p-8 lg:p-10 order-2 lg:order-1 bg-background">
          <Card className="w-full max-w-[420px] shadow-2xl">
            <CardContent className="p-6 lg:p-8">
              <Outlet />
            </CardContent>
          </Card>
        </div>

        {/* LADO DERECHO: IMAGEN */}
        <div className="lg:rounded-xl lg:border lg:border-border lg:m-5 order-1 lg:order-2 bg-cover bg-center bg-no-repeat branded-bg">
          <div className="flex flex-col p-8 lg:p-16 gap-4 text-black drop-shadow-xl">
            <Link to="/">
              <img
                src="/media/app/mini-logo.svg"
                className="h-[28px] max-w-none opacity-90"
                alt="Logo"
              />
            </Link>

            <div className="flex flex-col gap-3">
              <h3 className="text-2xl font-semibold text-mono">Bienvenido</h3>
              <p className="text-base text-black/90">
                Gestiona tu sistema con seguridad y eficiencia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
