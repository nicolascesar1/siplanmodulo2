
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReportInstance, UserRole } from '../types';
import { Save, ArrowLeft, Send, FileText, Image as ImageIcon, AlertCircle, Copy } from 'lucide-react';

interface ReportEditorProps {
    reports: ReportInstance[];
    onUpdateReport: (r: ReportInstance) => void;
    userRole: UserRole;
}

export const ReportEditor: React.FC<ReportEditorProps> = ({ reports, onUpdateReport, userRole }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [report, setReport] = useState<ReportInstance | undefined>(
        reports.find(r => r.id === id)
    );

    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (report) {
            setContent(report.content || '');
        }
    }, [report]);

    if (!report) return <div className="p-8 text-center text-gray-500">Relatório não encontrado.</div>;

    const handleSave = (newStatus?: ReportInstance['status']) => {
        setIsSaving(true);
        const updatedReport: ReportInstance = {
            ...report,
            content: content,
            status: newStatus || report.status, // Se não passar status, mantem o atual
            lastUpdated: new Date().toISOString()
        };

        onUpdateReport(updatedReport);
        setReport(updatedReport);

        setTimeout(() => {
            setIsSaving(false);
            if (newStatus === 'Concluído') {
                navigate('/reports');
            }
        }, 500);
    };

    // Simulação de "Importar Anterior"
    const handleImportPrevious = () => {
        if (confirm("Deseja importar a estrutura do relatório anterior? Isso substituirá o conteúdo atual.")) {
            setContent("1. INTRODUÇÃO\n[Texto importado...]\n\n2. RESULTADOS ALCANÇADOS\n[Dados importados...]\n\n3. CONCLUSÃO\n[...]");
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-in slide-in-from-bottom-2 duration-300">

            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button onClick={() => navigate('/reports')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-black">{report.type} {report.year}</h1>
                        <p className="text-xs text-black font-medium">{report.period} • {report.unitName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded border mr-2 ${report.status === 'Concluído' ? 'bg-emerald-50 text-emerald-900 border-emerald-100' : 'bg-gray-100 text-black border-gray-200'
                        }`}>
                        {report.status}
                    </span>

                    <button
                        onClick={() => handleSave('Em Andamento')}
                        disabled={isSaving || report.status === 'Concluído'}
                        className="flex items-center px-4 py-2 bg-white border border-gray-200 text-black rounded-lg hover:border-brand-purple/30 hover:bg-gray-50 transition-colors text-sm font-bold shadow-sm disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Rascunho
                    </button>

                    <button
                        onClick={() => handleSave('Concluído')}
                        disabled={isSaving || report.status === 'Concluído'}
                        className="flex items-center px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 active:scale-95 transition-all text-sm font-bold shadow-md shadow-brand-purple/20 disabled:opacity-50"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        Finalizar
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 text-blue-800 text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 text-blue-500" />
                        <div>
                            <p className="font-black mb-1">Instruções de Preenchimento</p>
                            <p className="font-bold leading-relaxed">
                                Insira a análise qualitativa referente ao período. Destaque os principais avanços, desafios enfrentados e medidas corretivas adotadas. Este texto será consolidado no relatório final da Secretaria.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                        <div className="border-b border-gray-100 bg-gray-50/50 p-2 flex gap-2">
                            {/* Toolbar Simples */}
                            <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="Negrito"><b>B</b></button>
                            <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600 italic" title="Itálico">I</button>
                            <div className="w-px bg-gray-300 mx-1"></div>
                            <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600 flex items-center gap-1 text-xs"><ImageIcon className="w-3 h-3" /> Imagem</button>
                        </div>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            disabled={report.status === 'Concluído'}
                            className="flex-1 p-4 w-full h-full resize-none outline-none text-sm text-black font-medium leading-relaxed"
                            placeholder="Escreva seu relatório aqui..."
                        />
                    </div>
                </div>

                {/* Sidebar / Context */}
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Dados de Referência
                        </h3>

                        <div className="space-y-3">
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-[10px] text-gray-500 font-bold block uppercase">Meta Anual</span>
                                <span className="text-sm font-bold text-black font-black">90% de Execução</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-[10px] text-gray-500 font-bold block uppercase">Executado (Q1)</span>
                                <span className="text-sm font-bold text-black font-black">85%</span>
                            </div>
                        </div>

                        <button
                            onClick={handleImportPrevious}
                            className="mt-4 w-full flex items-center justify-center px-3 py-2 text-xs font-bold text-black bg-brand-purple/20 hover:bg-brand-purple/30 rounded-lg transition-colors border border-brand-purple/30 shadow-sm"
                        >
                            <Copy className="w-3 h-3 mr-1.5" />
                            Importar Modelo Anterior
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
