
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  RefreshCw, 
  ExternalLink, 
  Database, 
  AlertCircle,
  FileSpreadsheet,
  ArrowUpDown,
  Info,
  Calendar
} from 'lucide-react';

interface MDBRecord {
  [key: string]: any;
}

const SHEET_ID = '1l8B6jdStatgm0sItoFHMHoQTNh7n5VjnuvNDVMR4d3A';
const GID = '128281966';
const FETCH_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID}`;
const RAW_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=${GID}`;

// Targeted Columns: C=2, D=3, F=5, G=6, N=13, S=18, W=22, Y=24, AC=28, AG=32
const TARGET_COLUMNS = [2, 3, 5, 6, 13, 18, 22, 24, 28, 32];
const DUE_CHECK_COLUMNS = [22, 24, 28, 32]; // W, Y, AC, AG

// Specific Header Overrides
const COLUMN_NAMES_OVERRIDE: Record<number, string> = {
  22: 'SA Requisition',
  24: 'Warehouse Delivery',
  28: 'Installation',
  32: 'Client Training'
};

const MDBMasterHub: React.FC = () => {
  const [data, setData] = useState<MDBRecord[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string>(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const response = await fetch(FETCH_URL);
      const text = await response.text();
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start === -1 || end === -1) throw new Error("Invalid response format");
      
      const json = JSON.parse(text.substring(start, end + 1));
      const allRows = json.table.rows;
      if (!allRows || allRows.length < 5) throw new Error("Insufficient data");

      // Header Row logic: Row 4 (index 3)
      const headerRowCells = allRows[3].c;
      const columnNames: Record<number, string> = {};
      
      TARGET_COLUMNS.forEach(idx => {
        const cell = headerRowCells[idx];
        const sheetHeader = cell?.f || cell?.v;
        
        let finalName = COLUMN_NAMES_OVERRIDE[idx] || (sheetHeader ? String(sheetHeader).trim() : `Col_${idx}`);
        if (finalName.startsWith('Col_') && COLUMN_NAMES_OVERRIDE[idx]) {
          finalName = COLUMN_NAMES_OVERRIDE[idx];
        }
        columnNames[idx] = finalName;
      });

      setHeaders(TARGET_COLUMNS.map(idx => columnNames[idx]));

      // Get rows starting from data area (index 4)
      const dataRows = allRows.slice(4); 
      
      const validRows = dataRows.filter((row: any) => {
        if (!row || !row.c) return false;
        
        const getVal = (idx: number) => {
          const cell = row.c[idx];
          if (!cell) return "";
          return String(cell.v || cell.f || "").trim();
        };

        const segment = getVal(2);   
        const ticketId = getVal(3);  
        const clientName = getVal(5); 

        const isEntryValid = 
          segment !== "" && segment !== "-" && 
          ticketId !== "" && ticketId !== "-" &&
          clientName !== "" && clientName !== "-";

        return isEntryValid;
      });

      const formattedData = validRows.map((row: any) => {
        const record: MDBRecord = {};
        TARGET_COLUMNS.forEach(idx => {
          const cell = row.c?.[idx];
          record[columnNames[idx]] = {
            value: cell?.f || cell?.v || "",
            index: idx
          };
        });
        return record;
      });

      setData(formattedData);
      setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 30000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter(row => 
      Object.values(row).some(cell => String(cell.value).toLowerCase().includes(lowerSearch))
    );
  }, [data, searchTerm]);

  const renderCell = (cellData: { value: any, index: number }) => {
    const { value, index } = cellData;
    const isEmpty = !value || String(value).trim() === "" || String(value).trim() === "-";

    if (DUE_CHECK_COLUMNS.includes(index) && isEmpty) {
      return (
        <span className="inline-flex items-center px-1 py-0.5 bg-rose-600 text-white text-[7px] font-black rounded uppercase animate-pulse border border-rose-700">
          DUE
        </span>
      );
    }

    if (isEmpty) return <span className="text-slate-300 text-[8px]">-</span>;

    const isId = String(value).includes('-') || (String(value).length === 4 && !isNaN(Number(value)));
    const isDate = String(value).includes('/') && (String(value).includes('-') || String(value).length > 6);
    
    return (
      <span className={`text-[9px] ${isId ? 'font-bold text-slate-800' : isDate ? 'font-bold text-indigo-600' : 'font-medium text-slate-700'}`}>
        {String(value)}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500 overflow-hidden bg-white border border-slate-200 rounded-lg">
      <div className="flex items-center justify-between px-6 py-2 border-b border-slate-100 shrink-0">
        <div className="flex items-center space-x-5">
          <h2 className="text-[10px] font-black text-slate-800 tracking-tight uppercase border-r border-slate-200 pr-5 h-5 flex items-center">
            Sales Ticket
          </h2>
          
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={10} />
            <input 
              type="text" 
              placeholder="Filter..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-100/80 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-xl pl-6 pr-3 py-1 text-[9px] font-semibold w-40 transition-all outline-none shadow-inner"
            />
          </div>

          <div className="flex items-center space-x-3">
            {/* Buttons moved before LIVE SYNC */}
            <button 
              onClick={() => fetchData()}
              disabled={isRefreshing}
              className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
              title="Refresh Sync"
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <a 
              href={RAW_SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-2 py-1 bg-slate-900 text-white rounded text-[9px] font-black uppercase tracking-tighter hover:bg-slate-800 transition-all shadow-md"
              title="View Source Sheet"
            >
              <FileSpreadsheet size={10} />
              <span>SHEET</span>
            </a>

            <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
              <div className={`w-1 h-1 rounded-full ${isRefreshing ? 'bg-amber-400 animate-spin' : 'bg-emerald-500'}`}></div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                LIVE SYNC • {lastSync}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">
            {filteredData.length} RECORDS
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
             <div className="p-6 text-center bg-rose-50 border border-rose-100 rounded-xl max-w-sm">
                <AlertCircle size={20} className="text-rose-500 mx-auto mb-2" />
                <p className="text-[9px] font-bold text-rose-900 mb-3">{error}</p>
                <button onClick={() => fetchData()} className="px-4 py-1.5 bg-rose-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Retry Connection</button>
             </div>
          </div>
        ) : (
          <div className="h-full overflow-auto custom-scrollbar bg-white">
            <table className="w-full text-left border-collapse table-fixed min-w-[1400px]">
              <thead className="sticky top-0 z-20">
                <tr className="bg-white border-b border-slate-100">
                  {headers.map((header, idx) => (
                    <th key={idx} className="px-5 py-2 text-[8px] font-black text-slate-400 uppercase tracking-tight first:pl-6">
                      <div className="flex items-center justify-between">
                        <span>{header}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  Array.from({ length: 20 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: TARGET_COLUMNS.length }).map((_, j) => (
                        <td key={j} className="px-5 py-2 first:pl-6">
                          <div className="h-1.5 bg-slate-50 rounded-full w-full animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  filteredData.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50 transition-colors group">
                      {headers.map((header, cIdx) => (
                        <td key={cIdx} className="px-5 py-2 first:pl-6">
                          {renderCell(row[header])}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-6 py-1.5 bg-white border-t border-slate-100 shrink-0">
        <div className="flex items-center space-x-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">
          <span>CLEAN DATA VIEW: SKIPPING BLANK OR PARTIAL ENTRIES</span>
          <span className="text-slate-300">•</span>
          <span>{data.length} ACTIVE RECORDS</span>
        </div>
        <div className="flex items-center space-x-2 text-[8px] font-bold text-slate-300">
          <Info size={9} />
          <span>Tipsoi ERP System</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
          border: 2px solid #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}} />
    </div>
  );
};

export default MDBMasterHub;
