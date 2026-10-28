import { BrandedLayout } from './branded';
import SignInPage from './page';

export const authRoutes = [
  {
    path: 'auth',
    element: <BrandedLayout />,
    children: [
      {
        path: 'signin',
        element: <SignInPage />,
      },
    ],
  },
];
