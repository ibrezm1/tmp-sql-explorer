import React from 'react';
import { Table, Filter, X, Link2, Share2 } from 'lucide-react';
import GraphView from './GraphView';

const ExplorerView = ({
    viewMode,
    tableSearchTerm,
    setTableSearchTerm,
    columnSearchTerm,
    setColumnSearchTerm,
    filteredTables,
    setSelectedTable,
    fkData
}) => {
    const getRelations = (tableName) => {
        return fkData.filter(fk =>
            fk.ParentTable === tableName || fk.ReferencedTable === tableName
        );
    };

    return (
        <>
            <div className={`grid gap-4 mb-8 bg-white p-5 rounded-2xl border transition-all ${tableSearchTerm || columnSearchTerm ? 'grid-cols-[1fr,1fr,auto]' : 'grid-cols-2'}`}>
                <div className="relative">
                    <Table size={16} className="absolute left-3 top-3.5 text-slate-400" />
                    <input type="text" placeholder="Table Name..." className="w-full bg-slate-50 border rounded-xl py-2.5 pl-10 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={tableSearchTerm} onChange={(e) => setTableSearchTerm(e.target.value)} />
                </div>
                <div className="relative">
                    <Filter size={16} className="absolute left-3 top-3.5 text-slate-400" />
                    <input type="text" placeholder="Column / Description..." className="w-full bg-slate-50 border rounded-xl py-2.5 pl-10 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={columnSearchTerm} onChange={(e) => setColumnSearchTerm(e.target.value)} />
                </div>
                {(tableSearchTerm || columnSearchTerm) && (
                    <button
                        onClick={() => { setTableSearchTerm(''); setColumnSearchTerm(''); }}
                        className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition-all h-full self-center whitespace-nowrap"
                    >
                        <X size={14} /> Clear Results
                    </button>
                )}
            </div>

            {viewMode === 'explorer' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTables.map(table => (
                        <div key={table.name} className="bg-white border rounded-2xl p-5 hover:border-indigo-200 shadow-sm cursor-pointer group transition-all" onClick={() => setSelectedTable(table)}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Table size={18} className="text-indigo-600" />
                                    <h3 className="font-bold group-hover:text-indigo-600 transition-colors uppercase tracking-tight text-sm">{table.name}</h3>
                                </div>
                                <div className="flex gap-1">
                                    {getRelations(table.name).length > 0 && (
                                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-1">
                                            <Link2 size={10} /> {getRelations(table.name).length}
                                        </span>
                                    )}
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-bold">{table.columns.length} Fields</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 mb-4">{table.description}</p>
                            <div className="space-y-2">
                                {table.columns.slice(0, 3).map(c => {
                                    const isMatch = columnSearchTerm && (
                                        (c.name || "").toLowerCase().includes(columnSearchTerm.toLowerCase()) ||
                                        (c.description || "").toLowerCase().includes(columnSearchTerm.toLowerCase())
                                    );
                                    return (
                                        <div key={c.name} className={`text-[11px] p-1.5 rounded-lg transition-colors ${isMatch ? 'bg-indigo-50 ring-1 ring-indigo-100' : ''}`}>
                                            <div className="flex justify-between mb-0.5">
                                                <span className={`font-bold ${isMatch ? 'text-indigo-700' : 'text-slate-700'}`}>{c.name}</span>
                                                <span className="text-slate-400 font-mono">{c.type}</span>
                                            </div>
                                            {c.description && c.description !== 'No description.' && (
                                                <p className={`text-[10px] italic line-clamp-1 ${isMatch ? 'text-indigo-500' : 'text-slate-400'}`}>
                                                    {c.description}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <GraphView
                    tables={filteredTables}
                    fks={fkData}
                    onTableClick={setSelectedTable}
                />
            )}
        </>
    );
};

export default ExplorerView;
