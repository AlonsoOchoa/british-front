import { Helmet } from 'react-helmet-async';
import { LayoutProvider } from './components/context';
import { Main } from './components/main';

export function DefaultLayout() {
  return (
    <>
      <Helmet>
        <title>System</title>
      </Helmet>

      <LayoutProvider>
        <Main />
      </LayoutProvider>
    </>
  );
}
