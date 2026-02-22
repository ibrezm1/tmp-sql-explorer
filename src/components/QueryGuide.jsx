import React from 'react';
import { Terminal } from 'lucide-react';

const QueryGuide = ({ SQL_TABLE_QUERY, SQL_FK_QUERY, copyToClipboard, copyStatus }) => {
    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-black flex items-center gap-3"><Terminal size={28} className="text-indigo-600" /> Query Guide</h2>
                <p className="text-slate-500 text-sm">Run these queries in SQL Server Management Studio (SSMS) and export the results as CSV.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="p-6 bg-white border rounded-3xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="font-bold text-slate-800">1. Table & Column Metadata</h3>
                            <p className="text-xs text-slate-400">Extracts tables, columns, data types, and descriptions.</p>
                        </div>
                        <button onClick={() => copyToClipboard(SQL_TABLE_QUERY, 'q1')} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
                            {copyStatus === 'q1' ? 'Copied!' : 'Copy Query'}
                        </button>
                    </div>
                    <pre className="bg-slate-50 border text-slate-600 p-4 rounded-xl text-[11px] overflow-x-auto font-mono max-h-64">{SQL_TABLE_QUERY}</pre>
                </div>

                <div className="p-6 bg-white border rounded-3xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="font-bold text-slate-800">2. Foreign Key Relationships</h3>
                            <p className="text-xs text-slate-400">Extracts parent-child links between tables.</p>
                        </div>
                        <button onClick={() => copyToClipboard(SQL_FK_QUERY, 'q2')} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
                            {copyStatus === 'q2' ? 'Copied!' : 'Copy Query'}
                        </button>
                    </div>
                    <pre className="bg-slate-50 border text-slate-600 p-4 rounded-xl text-[11px] overflow-x-auto font-mono max-h-64">{SQL_FK_QUERY}</pre>
                </div>
            </div>
        </div>
    );
};

export default QueryGuide;
