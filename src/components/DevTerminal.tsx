import React, { useState, useEffect, useRef } from 'react';
import { PerformanceMonitor } from '../utils/performanceMonitor';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'warning' | 'error' | 'success' | 'performance';
  message: string;
  details?: any;
}

export const DevTerminal = (): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const logContainerRef = useRef<HTMLDivElement>(null);
  const monitor = PerformanceMonitor.getInstance();

  // Auto-scroll to bottom when new logs added
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Monitor HMR updates
  useEffect(() => {
    if ((import.meta as any).hot) {
      (import.meta as any).hot.on('vite:beforeUpdate', () => {
        addLog('info', '🔄 Hot Module Replacement in progress...');
      });

      (import.meta as any).hot.on('vite:afterUpdate', () => {
        addLog('success', '✅ Hot Module Replacement completed');
      });

      (import.meta as any).hot.on('vite:error', (err: any) => {
        addLog('error', '❌ HMR Error', err);
      });
    }
  }, []);

  // Monitor performance
  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.log = (...args) => {
      if (args[0]?.includes('⚡') || args[0]?.includes('📦') || args[0]?.includes('🌐')) {
        addLog('performance', args.join(' '));
      }
      originalConsoleLog.apply(console, args);
    };

    console.error = (...args) => {
      addLog('error', args.join(' '), args);
      originalConsoleError.apply(console, args);
    };

    console.warn = (...args) => {
      addLog('warning', args.join(' '), args);
      originalConsoleWarn.apply(console, args);
    };

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);

  const addLog = (type: LogEntry['type'], message: string, details?: any) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      message,
      details
    };

    setLogs(prev => [...prev.slice(-99), newLog]); // Keep last 100 logs
  };

  const clearLogs = () => setLogs([]);

  const filteredLogs = logs.filter(log => 
    filter === 'all' || log.type === filter
  );

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      case 'performance': return 'text-blue-400';
      default: return 'text-gray-300';
    }
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'performance': return '⚡';
      default: return 'ℹ️';
    }
  };

  // Only show in development
  if (!(import.meta.env && import.meta.env.DEV)) {
    return <></>;
  }

  return (
    <>
      {/* Terminal Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
        title="פתח/סגור טרמינל פיתוח"
      >
        {isOpen ? '📟' : '🔧'}
      </button>

      {/* Terminal Panel */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 z-40 w-96 h-96 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl flex flex-col">
          {/* Header */}
          <div className="bg-gray-800 p-3 rounded-t-lg border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-mono text-sm">🔧 Dev Terminal</h3>
              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-gray-700 text-white text-xs px-2 py-1 rounded"
                >
                  <option value="all">הכל</option>
                  <option value="info">מידע</option>
                  <option value="performance">ביצועים</option>
                  <option value="warning">אזהרות</option>
                  <option value="error">שגיאות</option>
                  <option value="success">הצלחות</option>
                </select>
                <button
                  onClick={clearLogs}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
                >
                  נקה
                </button>
              </div>
            </div>
          </div>

          {/* Logs Container */}
          <div
            ref={logContainerRef}
            className="flex-1 overflow-y-auto p-2 bg-gray-900 font-mono text-xs"
          >
            {filteredLogs.length === 0 ? (
              <div className="text-gray-500 text-center mt-8">
                אין לוגים להצגה...
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="mb-2 leading-tight">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 shrink-0">
                      {log.timestamp.toLocaleTimeString('he-IL')}
                    </span>
                    <span className="shrink-0">{getLogIcon(log.type)}</span>
                    <span className={`flex-1 ${getLogColor(log.type)}`}>
                      {log.message}
                    </span>
                  </div>
                  {log.details && (
                    <div className="text-gray-400 text-xs mt-1 mr-16 bg-gray-800 p-1 rounded">
                      {JSON.stringify(log.details, null, 2)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Status Bar */}
          <div className="bg-gray-800 p-2 rounded-b-lg border-t border-gray-700 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>לוגים: {filteredLogs.length}</span>
              <span>HMR: {(import.meta as any).hot ? '🟢' : '🔴'}</span>
              <span>מצב: פיתוח</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 