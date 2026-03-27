import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PESInstance, PESModel, PESFormValues, MonitoringInstance, UserRole } from './types';
import { PlanForm } from './components/PlanForm';
import { db } from './services/database';

// Layout & Context
import { MainLayout } from './components/layout/MainLayout';
import { ToastProvider, useToast } from './context/ToastContext';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { useApplicationData } from './hooks/useApplicationData';



// Pages

import { PlanList } from './pages/PlanList';
import { PlanDetail } from './pages/PlanDetail';
import { MonitoringList } from './pages/MonitoringList';
import { MonitoringDetail } from './pages/MonitoringDetail';
import { AdminPanel } from './pages/AdminPanel';

// Mock Data
const MOCK_MODELS: PESModel[] = [
  { id: 'm1', name: 'Modelo Padrão', description: 'Modelo completo com Diretrizes, Objetivos, Metas, Ações e Indicadores.', structure: ['Diretrizes', 'Objetivos', 'Metas', 'Ações'] },
];

export const UNITS = [
  "Diretoria de Políticas Intersetoriais e Promoção à Saúde",
  "Unidade de Gestão de Tecnologia e Sistemas de Informação",
  "Diretoria de Planejamento",
  "SUVIGE (Subcoordenadoria de Vigilância)",
  "DAPS (Diretoria de Atenção Primária)",
  "Coordenação de RH / CPS"
];



const AppContent: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [creatingInitialValues, setCreatingInitialValues] = useState<Partial<PESFormValues> | undefined>();
  const [isCreating, setIsCreating] = useState(false);

  // Use Custom Hook for Data Logic
  const { plans, monitorings, loading, createPlan, updatePlan, deletePlan, createMonitoring, updateMonitoring, deleteMonitoring } = useApplicationData();

  const handleCreateClick = (initialValues?: Partial<PESFormValues>) => {
    setCreatingInitialValues(initialValues);
    setIsCreating(true);
  };

  return (
    <HashRouter>
      <MainLayout userRole={userRole} setUserRole={setUserRole} plans={plans}>
        {loading ? <LoadingScreen /> : (
          <Routes>
            <Route path="/" element={<Navigate to="/monitorings" />} />
            <Route path="/admin" element={userRole === 'admin' ? <AdminPanel /> : <Navigate to="/monitorings" />} />

            <Route
              path="/plans"
              element={
                userRole === 'admin' ? (
                  <PlanList
                    plans={plans}
                    models={MOCK_MODELS}
                    monitorings={monitorings}
                    onCreateClick={handleCreateClick}
                    onDeletePlan={deletePlan}
                  />
                ) : <Navigate to="/monitorings" />
              }
            />
            {/* ... other routes ... */}
            <Route
              path="/plan/:id"
              element={
                userRole === 'admin' ? (
                  <PlanDetail
                    plans={plans}
                    models={MOCK_MODELS}
                    monitorings={monitorings}
                    units={UNITS}
                    onUpdate={updatePlan}
                  />
                ) : <Navigate to="/monitorings" />
              }
            />



            <Route
              path="/monitorings"
              element={
                <MonitoringList
                  plans={plans}
                  units={UNITS}
                  userRole={userRole}
                  monitorings={monitorings}
                  onCreateMonitoring={createMonitoring}
                  onUpdateMonitoring={updateMonitoring}
                  onDeleteMonitoring={deleteMonitoring}
                />
              }
            />
            <Route
              path="/monitoring/:id"
              element={
                <MonitoringDetail
                  plans={plans}
                  monitorings={monitorings}
                  onUpdateMonitoring={updateMonitoring}
                  userRole={userRole}
                />
              }
            />
          </Routes>
        )}
      </MainLayout>

      {isCreating && (
        <PlanForm
          title="Novo Plano"
          models={MOCK_MODELS}
          plans={plans}
          initialValues={creatingInitialValues as PESFormValues}
          onCancel={() => { setIsCreating(false); setCreatingInitialValues(undefined); }}
          onSubmit={(values) => { createPlan(values); setIsCreating(false); setCreatingInitialValues(undefined); }}
        />
      )}
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
