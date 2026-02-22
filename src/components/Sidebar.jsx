import React from 'react';
import {
    Database,
    Layers,
    Share2,
    MessageSquare,
    HelpCircle,
    Beaker,
    Download,
    FileText,
    Link2,
    CheckCircle2
} from 'lucide-react';

const Sidebar = ({
    databases,
    selectedDb,
    setSelectedDb,
    viewMode,
    setViewMode,
    loadSamplePharmacyData,
    downloadCSVTemplate,
    handleFileUpload,
    tablesData,
    fkData,
    aiProvider,
    setAiProvider,
    vertexProject,
    setVertexProject,
    vertexLocation,
    setVertexLocation,
    vertexToken,
    setVertexToken
}) => {
    return (
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-6">
                    <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg"><Database size={20} /></div>
                    <h1 className="font-bold text-lg tracking-tight">SQL Architect</h1>
                </div>

                <div className="mb-6 space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">AI Provider</label>
                        <div className="flex p-1 bg-slate-100 rounded-lg">
                            <button
                                onClick={() => setAiProvider('gemini')}
                                className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${aiProvider === 'gemini' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                AI Studio
                            </button>
                            <button
                                onClick={() => setAiProvider('vertex')}
                                className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${aiProvider === 'vertex' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Vertex AI
                            </button>
                        </div>
                    </div>

                    {aiProvider === 'vertex' && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Project ID</label>
                                <input
                                    type="text"
                                    value={vertexProject}
                                    onChange={(e) => setVertexProject(e.target.value)}
                                    placeholder="gcp-project-id"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Location</label>
                                <input
                                    type="text"
                                    value={vertexLocation}
                                    onChange={(e) => setVertexLocation(e.target.value)}
                                    placeholder="us-central1"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Access Token</label>
                                <input
                                    type="password"
                                    value={vertexToken}
                                    onChange={(e) => setVertexToken(e.target.value)}
                                    placeholder="ya29.a0AfH..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                            <p className="text-[9px] text-slate-400 leading-tight">
                                Run <code className="bg-slate-100 px-1 rounded">gcloud auth print-access-token</code> to get a temporary token.
                            </p>
                        </div>
                    )}
                </div>

                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Select Database</label>
                <div className="relative mb-6">
                    <select className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm font-medium"
                        value={selectedDb || ''} onChange={(e) => setSelectedDb(e.target.value)}>
                        {databases.length === 0 && <option>No Data Loaded</option>}
                        {databases.map(db => <option key={db} value={db}>{db}</option>)}
                    </select>
                </div>
                <nav className="space-y-1 text-sm font-semibold">
                    <button onClick={() => setViewMode('explorer')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${viewMode === 'explorer' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500'}`}><Layers size={18} /> Explorer</button>
                    <button onClick={() => setViewMode('graph')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${viewMode === 'graph' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500'}`}><Share2 size={18} /> Graph View</button>
                    <button onClick={() => setViewMode('chat')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${viewMode === 'chat' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500'}`}><MessageSquare size={18} /> Architecture AI</button>
                    <button onClick={() => setViewMode('help')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${viewMode === 'help' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500'}`}><HelpCircle size={18} /> Query Guide</button>
                </nav>
            </div>
            <div className="p-6 mt-6 space-y-4">
                <button onClick={loadSamplePharmacyData} className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-lg text-xs font-bold"><Beaker size={14} /> Load Pharmacy Sample</button>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => downloadCSVTemplate('tables')} className="flex items-center justify-center gap-1 text-[10px] font-bold p-2 border rounded-lg hover:bg-slate-50 transition-colors">
                        <Download size={12} /> Schema
                    </button>
                    <button onClick={() => downloadCSVTemplate('fk')} className="flex items-center justify-center gap-1 text-[10px] font-bold p-2 border rounded-lg hover:bg-slate-50 transition-colors">
                        <Download size={12} /> FKs
                    </button>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Upload Data</label>
                    <div className="grid grid-cols-2 gap-2">
                        <label className="flex flex-col items-center justify-center h-12 border border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-indigo-50 text-[10px] font-bold text-slate-500 uppercase transition-all">
                            <FileText size={14} className="mb-0.5" /> Schema
                            <input type="file" className="hidden" accept=".csv" onChange={(e) => handleFileUpload(e, 'tables')} />
                        </label>
                        <label className="flex flex-col items-center justify-center h-12 border border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-indigo-50 text-[10px] font-bold text-slate-500 uppercase transition-all">
                            <Link2 size={14} className="mb-0.5" /> FKs
                            <input type="file" className="hidden" accept=".csv" onChange={(e) => handleFileUpload(e, 'fk')} />
                        </label>
                    </div>
                    {tablesData.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 px-2 py-1 bg-green-50 text-green-700 rounded text-[10px] font-bold">
                            <CheckCircle2 size={10} /> {tablesData.length} rows loaded
                        </div>
                    )}
                    {fkData.length > 0 && (
                        <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">
                            <Link2 size={10} /> {fkData.length} relations loaded
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
