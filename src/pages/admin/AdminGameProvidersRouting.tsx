import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminGameProviders from './AdminGameProviders';

const AdminGameProvidersRouting = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminGameProviders />} />
    </Routes>
  );
};

export default AdminGameProvidersRouting;