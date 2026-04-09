import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Coins, Users, UserPlus, Building2, Bell } from 'lucide-react';

const AdminCard: React.FC<{
  title: string;
  description: string;
  icon: React.ElementType;
  colorClass: string;
  onClick?: () => void;
}> = ({ title, description, icon: Icon, colorClass, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`group bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer shadow-sm ${onClick ? 'hover:border-brand-purple/30' : 'opacity-80'}`}
    >
      <div className={`w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 shadow-inner ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold text-black group-hover:text-brand-purple transition-colors leading-tight">{title}</h3>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-snug font-medium">{description}</p>
      </div>
    </div>
  );
};

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Planos e Instrumentos",
      description: "Configurar modelos, vigências e estruturas dos planos.",
      icon: Network, 
      colorClass: "bg-purple-600 text-white font-bold",
      action: () => navigate('/plans')
    },
    {
      title: "Informações Orçamentárias",
      description: "Gerenciar Fontes, Subfunções, Subações e Elementos.",
      icon: Coins, 
      colorClass: "bg-amber-100 text-amber-900 font-bold",
      action: undefined
    },
    {
      title: "Usuários",
      description: "Gerenciar usuários e permissões.",
      icon: Users, 
      colorClass: "bg-orange-100 text-orange-900 font-bold",
      action: undefined
    },
    {
        title: "Autocadastros",
        description: "Gerenciar usuários pré-cadastrados.",
        icon: UserPlus, 
        colorClass: "bg-blue-100 text-blue-900 font-bold",
        action: undefined
    },
    {
        title: "Unidades",
        description: "Gerenciar unidades do sistema.",
        icon: Building2, 
        colorClass: "bg-emerald-100 text-emerald-900 font-bold",
        action: undefined
    },
    {
        title: "Avisos",
        description: "Gerenciar avisos do sistema.",
        icon: Bell, 
        colorClass: "bg-sky-100 text-sky-900 font-bold",
        action: undefined
    }
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[600px] flex flex-col">
        <div className="mb-10 border-b border-gray-100 pb-5">
            <h2 className="text-xl font-bold text-black">Painel Administrativo</h2>
            <p className="text-sm text-gray-500 mt-1">Central de controle e configurações do sistema SIPLAN</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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
        </div>
      </div>
    </div>
  );
};
