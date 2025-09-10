import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import BonusesList from './pages/admin/bonuses/BonusesList';
import BonusForm from './pages/admin/bonuses/BonusForm';
import MyBonuses from './pages/user/bonuses/MyBonuses';
import BonusProgress from './pages/user/bonuses/BonusProgress';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'admin/bonuses',
        element: <BonusesList />
      },
      {
        path: 'admin/bonuses/create',
        element: <BonusForm />
      },
      {
        path: 'admin/bonuses/:id/edit',
        element: <BonusForm />
      },
      {
        path: 'user/bonuses',
        element: <MyBonuses />
      },
      {
        path: 'user/bonuses/progress',
        element: <BonusProgress />
      }
    ]
  }
]);