import React, { useEffect, useRef } from 'react';
import { LayoutDashboard, BookOpen, CheckSquare, Settings, LogOut, Orbit, Plus, Timer, Play, Pause, RotateCcw, Music } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function Layout({ children, activeTab, setActiveTab, isDarkMode, onQuickAdd, onTimerComplete }) {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Subjects', icon: BookOpen },
    { name: 'Tasks', icon: CheckSquare },
  ];

  const [timeLeft, setTimeLeft] = useLocalStorage('skillorbit_timer', 25 * 60);
  const [isActive, setIsActive] = useLocalStorage('skillorbit_timer_active', false);
  const [selectedSound, setSelectedSound] = useLocalStorage('skillorbit_sound', 'None');

  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }

    if (isActive && selectedSound !== 'None') {
      const soundUrls = {
        'Lo-fi Music': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        'Rain': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        'Forest Sounds': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
      };
      
      if (audioRef.current.src !== soundUrls[selectedSound]) {
        audioRef.current.src = soundUrls[selectedSound];
      }
      
      audioRef.current.play().catch(e => console.log("Audio auto-play prevented by browser:", e));
    } else {
      audioRef.current.pause();
    }
  }, [isActive, selectedSound]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
      if (onTimerComplete) onTimerComplete(25 * 60);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, setTimeLeft, setIsActive, onTimerComplete]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { 
    if (isActive || timeLeft < 25 * 60) {
      const elapsedSeconds = (25 * 60) - timeLeft;
      if (elapsedSeconds > 0 && onTimerComplete) {
        onTimerComplete(elapsedSeconds);
      }
    }
    setIsActive(false); 
    setTimeLeft(25 * 60); 
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-50 text-slate-900'}`}>
      {/* Sidebar */}
      <aside className={`w-64 flex flex-col hidden md:flex transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-r border-slate-800' : 'bg-slate-900'}`}>
        <div className="p-6 flex items-center space-x-3 text-indigo-400">
          <Orbit className="w-8 h-8" />
          <span className="text-2xl font-bold text-white tracking-wide">SkillOrbit</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <button 
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === item.name 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Focus Timer */}
        <div className="px-4 py-2 mt-auto">
          <div className={`p-4 rounded-xl border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-indigo-50 border-indigo-100'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Timer className={`w-5 h-5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-indigo-900'}`}>Focus Mode</span>
              </div>
            </div>
            
            <div className={`text-3xl font-bold mb-3 tracking-wider text-center ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {formatTime(timeLeft)}
            </div>

            <div className="mb-4">
              <div className={`flex items-center px-2 py-1.5 rounded-lg border text-xs ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-indigo-100'}`}>
                <Music className={`w-3 h-3 mr-2 ${isDarkMode ? 'text-slate-400' : 'text-indigo-400'}`} />
                <select 
                  value={selectedSound} 
                  onChange={(e) => setSelectedSound(e.target.value)}
                  className={`w-full bg-transparent focus:outline-none ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}
                >
                  <option value="None">No Sound</option>
                  <option value="Lo-fi Music">Lo-fi Music</option>
                  <option value="Rain">Rain</option>
                  <option value="Forest Sounds">Forest</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-2">
              <button onClick={toggleTimer} className={`flex-1 py-2 rounded-lg flex items-center justify-center transition-colors ${isActive ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button onClick={resetTimer} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm'}`}>
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => setActiveTab('Settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              activeTab === 'Settings' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-red-400 rounded-xl transition-all duration-300 mt-2">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Global Top Header */}
        <header className={`h-16 flex items-center justify-end px-4 md:px-8 lg:px-10 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <button 
            onClick={onQuickAdd}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Add Task</span>
          </button>
        </header>

        <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
