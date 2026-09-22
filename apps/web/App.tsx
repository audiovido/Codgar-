import React, { useState, useEffect, useRef } from 'react';

export default function ModernCalculator() {
  // States
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isScientific, setIsScientific] = useState(false);
  const [theme, setTheme] = useState('dark'); // 'dark' | 'light'
  const [memory, setMemory] = useState(0);
  const [isCalculated, setIsCalculated] = useState(false);

  const historyEndRef = useRef(null);

  // Auto-scroll history to bottom
  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, showHistory]);

  // Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      if (/[0-9.]/.test(key)) {
        handleNumber(key);
      } else if (['+', '-', '*', '/'].includes(key)) {
        handleOperator(key === '*' ? '×' : key === '/' ? '÷' : key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculate();
      } else if (key === 'Backspace') {
        handleBackspace();
      } else if (key === 'Escape') {
        clearAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, equation, isCalculated]);

  // Actions
  const handleNumber = (num) => {
    if (isCalculated) {
      setDisplay(num);
      setIsCalculated(false);
    } else {
      if (display === '0' && num !== '.') {
        setDisplay(num);
      } else {
        if (num === '.' && display.includes('.')) return;
        setDisplay(display + num);
      }
    }
  };

  const handleOperator = (op) => {
    setIsCalculated(false);
    let currentInput = display;
    
    // If last char of equation is operator and display is empty, replace it
    if (equation && !display) {
      setEquation(equation.slice(0, -2) + ` ${op} `);
      return;
    }

    setEquation((prev) => prev + currentInput + ` ${op} `);
    setDisplay('0');
  };

  const handleBackspace = () => {
    if (isCalculated) {
      clearAll();
    } else {
      setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setEquation('');
    setIsCalculated(false);
  };

  const calculate = () => {
    if (!equation && !isCalculated) return;
    
    let finalEquation = equation + display;
    // Replace visual operators with JS operators
    let evalEquation = finalEquation
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, Math.PI)
      .replace(/e/g, Math.E);

    try {
      // Safe evaluation using Function constructor (standard client-side approach)
      const result = new Function(`return ${evalEquation}`)();
      
      if (isNaN(result) || !isFinite(result)) {
        setDisplay('Error');
      } else {
        const formattedResult = Number(result.toFixed(8)).toString(); // Avoid floating point issues
        setDisplay(formattedResult);
        setHistory((prev) => [
          ...prev,
          { eq: finalEquation, res: formattedResult, id: Date.now() }
        ]);
      }
    } catch (error) {
      setDisplay('Error');
    }
    setEquation('');
    setIsCalculated(true);
  };

  // Scientific Functions
  const handleScientific = (func) => {
    const current = parseFloat(display);
    if (isNaN(current)) return;

    let result = 0;
    switch (func) {
      case 'sin': result = Math.sin(current * Math.PI / 180); break; // Degrees
      case 'cos': result = Math.cos(current * Math.PI / 180); break;
      case 'tan': result = Math.tan(current * Math.PI / 180); break;
      case 'sqrt': result = Math.sqrt(current); break;
      case 'sqr': result = Math.pow(current, 2); break;
      case 'log': result = Math.log10(current); break;
      case 'ln': result = Math.log(current); break;
      case 'percentage': result = current / 100; break;
      case 'negate': result = -current; break;
      case 'pi': result = Math.PI; break;
      case 'e': result = Math.E; break;
      default: return;
    }

    const formattedResult = Number(result.toFixed(8)).toString();
    setDisplay(formattedResult);
    setIsCalculated(true);
    
    setHistory((prev) => [
      ...prev,
      { eq: `${func}(${current})`, res: formattedResult, id: Date.now() }
    ]);
  };

  // Memory Functions
  const handleMemory = (action) => {
    const current = parseFloat(display);
    if (isNaN(current)) return;

    switch (action) {
      case 'MC': setMemory(0); break;
      case 'MR': setDisplay(memory.toString()); setIsCalculated(true); break;
      case 'M+': setMemory(memory + current); setIsCalculated(true); break;
      case 'M-': setMemory(memory - current); setIsCalculated(true); break;
      default: break;
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 p-4 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'
    }`}>
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Calculator Container */}
      <div className={`relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-slate-900/80 border-slate-800 backdrop-blur-xl shadow-violet-950/20' 
          : 'bg-white/90 border-slate-200 backdrop-blur-xl shadow-slate-300/50'
      }`}>
        
        {/* Header / Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-500/10">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Scientific Toggle */}
            <button 
              onClick={() => setIsScientific(!isScientific)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${
                isScientific 
                  ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30' 
                  : theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              Scientific
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-lg hover:bg-slate-500/10 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 4.343l-.707.707M16.24 12a4.24 4.24 0 11-8.48 0 4.24 4.24 0 018.48 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* History Toggle */}
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`p-1.5 rounded-lg transition-colors ${
                showHistory 
                  ? 'bg-violet-500/20 text-violet-400' 
                  : 'hover:bg-slate-500/10 text-slate-400'
              }`}
              aria-label="Toggle History"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Display Screen */}
        <div className="px-6 py-8 flex flex-col items-end justify-end min-h-[140px] relative">
          <div className={`text-sm font-medium mb-1 tracking-wide h-6 transition-colors ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {equation}
          </div>
          <div className="text-5xl font-light tracking-tight overflow-x-auto whitespace-nowrap w-full text-right scrollbar-none">
            {display}
          </div>
          {memory !== 0 && (
            <span className="absolute left-6 bottom-2 text-xs font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400">
              M
            </span>
          )}
        </div>

        {/* History Panel (Sliding Drawer) */}
        {showHistory && (
          <div className={`absolute inset-x-0 bottom-0 top-[60px] z-20 flex flex-col transition-all duration-300 ${
            theme === 'dark' ? 'bg-slate-950/95' : 'bg-white/95'
          }`}>
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-500/10">
              <span className="font-semibold text-sm">Calculation History</span>
              <button 
                onClick={() => setHistory([])}
                className="text-xs text-red-500 hover:underline"
              >
                Clear All
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                  <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  No history yet
                </div>
              ) : (
                history.map((item) => (
                  <div 
                    key={item.id} 
                    className="text-right border-b border-slate-500/5 pb-2 cursor-pointer group"
                    onClick={() => {
                      setDisplay(item.res);
                      setEquation(item.eq);
                      setShowHistory(false);
                    }}
                  >
                    <div className="text-xs text-slate-500 group-hover:text-violet-400 transition-colors">{item.eq}</div>
                    <div className="text-lg font-semibold">{item.res}</div>
                  </div>
                ))
              )}
              <div ref={historyEndRef} />
            </div>
          </div>
        )}

        {/* Keypad */}
        <div className={`p-6 grid gap-3 transition-all duration-300 ${
          isScientific ? 'grid-cols-5' : 'grid-cols-4'
        } ${theme === 'dark' ? 'bg-slate-900/40' : 'bg-slate-50/50'}`}>
          
          {/* Scientific Keys Row 1 */}
          {isScientific && (
            <>
              <button onClick={() => handleScientific('sin')} className="btn-sci">sin</button>
              <button onClick={() => handleScientific('cos')} className="btn-sci">cos</button>
              <button onClick={() => handleScientific('tan')} className="btn-sci">tan</button>
              <button onClick={() => handleMemory('MC')} className="btn-mem">MC</button>
              <button onClick={() => handleMemory('MR')} className="btn-mem">MR</button>
            </>
          )}

          {/* Scientific Keys Row 2 */}
          {isScientific && (
            <>
              <button onClick={() => handleScientific('sqrt')} className="btn-sci">√</button>
              <button onClick={() => handleScientific('sqr')} className="btn-sci">x²</button>
              <button onClick={() => handleScientific('log')} className="btn-sci">log</button>
              <button onClick={() => handleMemory('M+')} className="btn-mem">M+</button>
              <button onClick={() => handleMemory('M-')} className="btn-mem">M-</button>
            </>
          )}

          {/* Standard Row 1 */}
          <button onClick={clearAll} className="btn-action col-span-2 text-amber-500">AC</button>
          <button onClick={handleBackspace} className="btn-action flex items-center justify-center text-amber-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414A2 2 0 0010.828 19H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
            </svg>
          </button>
          {isScientific && <button onClick={() => handleScientific('percentage')} className="btn-action">%</button>}
          <button onClick={() => handleOperator('÷')} className="btn-operator">÷</button>

          {/* Row 2 */}
          <button onClick={() => handleNumber('7')} className="btn-num">7</button>
          <button onClick={() => handleNumber('8')} className="btn-num">8</button>
          <button onClick={() => handleNumber('9')} className="btn-num">9</button>
          {isScientific && <button onClick={() => handleScientific('ln')} className="btn-sci">ln</button>}
          <button onClick={() => handleOperator('×')} className="btn-operator">×</button>

          {/* Row 3 */}
          <button onClick={() => handleNumber('4')} className="btn-num">4</button>
          <button onClick={() => handleNumber('5')} className="btn-num">5</button>
          <button onClick={() => handleNumber('6')} className="btn-num">6</button>
          {isScientific && <button onClick={() => handleScientific('pi')} className="btn-sci">π</button>}
          <button onClick={() => handleOperator('-')} className="btn-operator">-</button>

          {/* Row 4 */}
          <button onClick={() => handleNumber('1')} className="btn-num">1</button>
          <button onClick={() => handleNumber('2')} className="btn-num">2</button>
          <button onClick={() => handleNumber('3')} className="btn-num">3</button>
          {isScientific && <button onClick={() => handleScientific('e')} className="btn-sci">e</button>}
          <button onClick={() => handleOperator('+')} className="btn-operator">+</button>

          {/* Row 5 */}
          <button onClick={() => handleScientific('negate')} className="btn-num">+/-</button>
          <button onClick={() => handleNumber('0')} className="btn-num">0</button>
          <button onClick={() => handleNumber('.')} className="btn-num">.</button>
          <button onClick={calculate} className="btn-equals col-span-1 shadow-lg shadow-emerald-500/20">=</button>
        </div>
      </div>

      {/* Custom CSS classes injected for Tailwind */}
      <style dangerouslySetInnerHTML={{__html: `
        .btn-num {
          @apply py-4 rounded-2xl font-medium text-lg transition-all duration-150 active:scale-95;
          background-color: ${theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 0.8)'};
          color: ${theme === 'dark' ? '#f1f5f9' : '#1e293b'};
        }
        .btn-num:hover {
          background-color: ${theme === 'dark' ? 'rgba(51, 65, 85, 0.6)' : 'rgba(226, 232, 240, 0.9)'};
        }
        
        .btn-operator {
          @apply py-4 rounded-2xl font-semibold text-xl transition-all duration-150 active:scale-95;
          background-color: ${theme === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)'};
          color: #6366f1;
        }
        .btn-operator:hover {
          background-color: #6366f1;
          color: white;
        }

        .btn-action {
          @apply py-4 rounded-2xl font-semibold text-lg transition-all duration-150 active:scale-95;
          background-color: ${theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)'};
        }
        .btn-action:hover {
          background-color: rgba(245, 158, 11, 0.2);
        }

        .btn-sci {
          @apply py-3 rounded-xl text-sm font-medium transition-all duration-150 active:scale-95;
          background-color: ${theme === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.15)'};
          color: ${theme === 'dark' ? '#94a3b8' : '#475569'};
        }
        .btn-sci:hover {
          background-color: ${theme === 'dark' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.25)'};
        }

        .btn-mem {
          @apply py-3 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95;
          background-color: ${theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.08)'};
          color: #8b5cf6;
        }
        .btn-mem:hover {
          background-color: rgba(139, 92, 246, 0.2);
        }

        .btn-equals {
          @apply py-4 rounded-2xl font-bold text-xl text-white transition-all duration-150 active:scale-95 bg-emerald-500 hover:bg-emerald-600;
        }

        /* Hide scrollbar */
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}