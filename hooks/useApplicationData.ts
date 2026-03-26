import { useState, useEffect, useCallback } from 'react';
import { PESInstance, MonitoringInstance, PESFormValues } from '../types';
import { db } from '../services/database';
import { useToast } from '../context/ToastContext';

export const useApplicationData = () => {
    const [plans, setPlans] = useState<PESInstance[]>([]);
    const [monitorings, setMonitorings] = useState<MonitoringInstance[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const refreshData = useCallback(async () => {
        setLoading(true);
        try {
            const [p, m] = await Promise.all([
                db.plans.getAll(),
                db.monitorings.getAll()
            ]);
            setPlans(p);
            setMonitorings(m);
        } catch (error) {
            console.error("Erro de conexão com o banco:", error);
            showToast("Erro ao carregar dados do sistema", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const createPlan = async (values: PESFormValues) => {
        const newPlan: PESInstance = {
            id: Date.now().toString(),
            ...values,
            components: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        // Optimistic
        setPlans(prev => [...prev, newPlan]);
        await db.plans.create(newPlan);
        showToast('Plano criado com sucesso!', 'success');
    };

    const updatePlan = async (updatedPlan: PESInstance) => {
        setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
        await db.plans.update(updatedPlan);
    };

    const createMonitoring = async (newMonitoring: MonitoringInstance) => {
        setMonitorings(prev => [newMonitoring, ...prev]);
        await db.monitorings.create(newMonitoring);
        showToast('Monitoramento iniciado', 'success');
    };

    const updateMonitoring = async (updatedMonitoring: MonitoringInstance) => {
        setMonitorings(prev => prev.map(m => m.id === updatedMonitoring.id ? updatedMonitoring : m));
        await db.monitorings.update(updatedMonitoring);
        showToast('Monitoramento salvo!', 'success');
    };

    const deletePlan = async (id: string) => {
        setPlans(prev => prev.filter(p => p.id !== id));
        await db.plans.delete(id);
        showToast('Plano excluído', 'success');
    };

    const deleteMonitoring = async (id: string) => {
        setMonitorings(prev => prev.filter(m => m.id !== id));
        await db.monitorings.delete(id);
        showToast('Monitoramento excluído', 'success');
    };

    return {
        plans,
        monitorings,
        loading,
        createPlan,
        updatePlan,
        deletePlan,
        createMonitoring,
        updateMonitoring,
        deleteMonitoring,
        refreshData
    };
};
