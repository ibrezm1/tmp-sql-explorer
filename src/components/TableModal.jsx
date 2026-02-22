import React from 'react';
import { X, ChevronRight, Link2 } from 'lucide-react';

const TableModal = ({ selectedTable, setSelectedTable, fkData, filteredTables }) => {
    if (!selectedTable) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setSelectedTable(null)}>
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between">
                    <h2 className="text-xl font-bold">{selectedTable.name}</h2>
                    <button onClick={() => setSelectedTable(null)}><X /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Table Description</span>
                        <div className="bg-indigo-50 p-4 rounded-xl text-xs italic text-slate-700 leading-relaxed">"{selectedTable.description}"</div>
                    </div>

                    <div className="space-y-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Relationships</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                                    <ChevronRight size={14} className="text-indigo-500" /> Outgoing (Parent of)
                                </h4>
                                <div className="space-y-2">
                                    {fkData.filter(fk => fk.ParentTable === selectedTable.name).length === 0 && <p className="text-[11px] text-slate-400 italic">No outgoing FKs.</p>}
                                    {fkData.filter(fk => fk.ParentTable === selectedTable.name).map((fk, idx) => (
                                        <button key={idx} onClick={() => {
                                            const target = Object.values(filteredTables).find(t => t.name === fk.ReferencedTable);
                                            if (target) setSelectedTable(target);
                                        }} className="w-full text-left p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all group">
                                            <div className="text-[11px] font-bold text-slate-700 group-hover:text-indigo-600 flex items-center justify-between">
                                                {fk.ReferencedTable} <Link2 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="text-[9px] text-slate-400 font-mono mt-0.5">{fk.ParentColumn} → {fk.ReferencedColumn}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                                    <ChevronRight size={14} className="text-indigo-500" /> Incoming (Referenced by)
                                </h4>
                                <div className="space-y-2">
                                    {fkData.filter(fk => fk.ReferencedTable === selectedTable.name).length === 0 && <p className="text-[11px] text-slate-400 italic">No incoming FKs.</p>}
                                    {fkData.filter(fk => fk.ReferencedTable === selectedTable.name).map((fk, idx) => (
                                        <button key={idx} onClick={() => {
                                            const target = Object.values(filteredTables).find(t => t.name === fk.ParentTable);
                                            if (target) setSelectedTable(target);
                                        }} className="w-full text-left p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all group">
                                            <div className="text-[11px] font-bold text-slate-700 group-hover:text-indigo-600 flex items-center justify-between">
                                                {fk.ParentTable} <Link2 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="text-[9px] text-slate-400 font-mono mt-0.5">{fk.ReferencedColumn} ← {fk.ParentColumn}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Columns</span>
                        <table className="w-full text-sm">
                            <thead><tr className="text-left text-slate-400 uppercase text-[10px] font-bold"><th className="pb-2">Name</th><th className="pb-2">Type</th><th className="pb-2">Description</th></tr></thead>
                            <tbody>{selectedTable.columns.map(c => <tr key={c.name} className="border-t"><td className="py-3 font-bold">{c.name}</td><td>{c.type}</td><td className="text-slate-500">{c.description}</td></tr>)}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TableModal;
