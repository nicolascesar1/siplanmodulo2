
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Download, Upload, AlertCircle } from 'lucide-react';

const AdminCard: React.FC<{
  title: string;
  description: string;
  icon: React.ElementType;
  colorClass: string;
  onClick?: () => void;
  customAction?: React.ReactNode;
}> = ({ title, description, icon: Icon, colorClass, onClick, customAction }) => {
  return (
    <div 
      onClick={onClick}
      className={`group bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden ${onClick ? 'hover:border-indigo-300' : ''}`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{title}</h3>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>
      </div>
      
      {customAction && (
          <div className="mt-auto pt-2">{customAction}</div>
      )}
    </div>
  );
};

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- BACKUP ACTIONS ---
  const handleExportBackup = () => {
      const data = {
          plans: JSON.parse(localStorage.getItem('pes_plans') || '[]'),
          monitorings: JSON.parse(localStorage.getItem('pes_monitorings') || '[]'),
          backupDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `siplan_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const content = e.target?.result as string;
              const data = JSON.parse(content);
              
              if (Array.isArray(data.plans)) {
                  localStorage.setItem('pes_plans', JSON.stringify(data.plans));
              }
              if (Array.isArray(data.monitorings)) {
                  localStorage.setItem('pes_monitorings', JSON.stringify(data.monitorings));
              }

              alert('Backup restaurado com sucesso! A página será recarregada.');
              window.location.reload();
          } catch (error) {
              alert('Erro ao ler arquivo de backup. Verifique se o formato é válido.');
              console.error(error);
          }
      };
      reader.readAsText(file);
  };

  // Mantive apenas o que tem navegação real ou função crítica (Backup)
  const cards = [
    {
      title: "Modelos de Plano ou Projeto",
      description: "Configurar modelos, vigências e estruturas dos planos.",
      icon: Network, 
      colorClass: "bg-indigo-50 text-indigo-600",
      action: () => navigate('/plans')
    }
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[600px]">
        <div className="mb-8 border-b border-gray-100 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Painel Administrativo</h2>
            <p className="text-sm text-gray-500 mt-1">Central de controle do sistema SIPLAN</p>
          </div>
        </div>

        {/* BACKUP SECTION - Funcionalidade Crítica */}
        <div className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-3">
                 <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm text-gray-600">
                     <AlertCircle className="w-5 h-5"/>
                 </div>
                 <div>
                     <h4 className="font-bold text-gray-800 text-sm">Backup e Segurança de Dados</h4>
                     <p className="text-xs text-gray-500">Exporte seus dados regularmente para evitar perdas (armazenamento local).</p>
                 </div>
             </div>
             <div className="flex gap-3">
                 <button onClick={handleExportBackup} className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors shadow-sm">
                     <Download className="w-4 h-4 mr-2" />
                     Exportar Dados (JSON)
                 </button>
                 <button onClick={() => fileInputRef.current?.click()} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                     <Upload className="w-4 h-4 mr-2" />
                     Restaurar Backup
                 </button>
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImportBackup} 
                    accept=".json" 
                    className="hidden" 
                 />
             </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <AdminCard
              key={index}
              title={card.title}
              description={card.description}
              icon={card.icon}
              colorClass={card.colorClass}
              onClick={card.action}
            />
          ))}
          
          {/* Placeholder para indicar expansão futura sem poluir com botões falsos */}
          <div className="border-2 border-dashed border-gray-100 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2 opacity-60">
              <p className="text-sm font-bold text-gray-400">Novos Módulos</p>
              <p className="text-xs text-gray-400">Funcionalidades de Orçamento e Usuários em breve.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
