import React, { useState, useEffect, useCallback } from 'react';
import { Flame, Clock, Book, Star, Plus, Trash2, CheckCircle2, Circle, Filter, X, FileText, Link, FileQuestion, Award, AlertTriangle, Brain, CheckSquare, ArrowUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import confetti from 'canvas-confetti';
import Layout from './components/Layout';
import { useLocalStorage } from './hooks/useLocalStorage';

const INITIAL_SUBJECTS = [
  { id: 1, name: 'Frontend Development', progress: 80, icon: 'Code', notes: '', checkedMaterials: {} },
  { id: 2, name: 'Generative AI Masterclass', progress: 45, icon: 'Brain', notes: '', checkedMaterials: {} },
  { id: 3, name: 'UI/UX Design Principles', progress: 20, icon: 'Layout', notes: '', checkedMaterials: {} }
];

const INITIAL_TASKS = [
  { id: 1, taskName: 'Complete React Hooks module', subjectTag: 'Frontend Development', dueDate: 'Today', priority: 'High', completed: false },
  { id: 2, taskName: 'Design wireframes for portfolio', subjectTag: 'UI/UX Design', dueDate: 'Tomorrow', priority: 'High', completed: false },
];

const INITIAL_HISTORY = [
  { id: 101, text: 'React Study - 45m' },
  { id: 102, text: 'UI Design - 30m' },
  { id: 103, text: 'Focus Flow - 25m' }
];

const WEEKLY_DATA = [
  { day: 'Mon', hours: 4 }, { day: 'Tue', hours: 6 }, { day: 'Wed', hours: 3 },
  { day: 'Thu', hours: 7 }, { day: 'Fri', hours: 5 }, { day: 'Sat', hours: 8 }, { day: 'Sun', hours: 2 }
];

export default function App() {
  const [subjects, setSubjects] = useLocalStorage('skillorbit_subjects', INITIAL_SUBJECTS);
  const [tasks, setTasks] = useLocalStorage('skillorbit_tasks_final', INITIAL_TASKS);
  const [settings, setSettings] = useLocalStorage('skillorbit_settings', { isDarkMode: false, userName: 'Student', studyStreak: 12 });
  const [achievements, setAchievements] = useLocalStorage('skillorbit_achievements', [
    { id: 1, name: 'First Task Done', unlocked: false },
    { id: 2, name: 'Week Warrior', unlocked: false },
    { id: 3, name: 'Goal Crusher', unlocked: false }
  ]);
  const [focusHistory, setFocusHistory] = useLocalStorage('skillorbit_history_final', INITIAL_HISTORY);
  const [skillScore, setSkillScore] = useLocalStorage('skillorbit_score', 850);
  
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filterHighPriority, setFilterHighPriority] = useState(false);
  
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectProgress, setNewSubjectProgress] = useState(0);

  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskTag, setNewTaskTag] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const addToast = useCallback((message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    setAchievements(prev => {
      const next = prev.map(badge => {
        let isUnlocked = badge.unlocked;
        if (badge.name === 'First Task Done') {
          isUnlocked = isUnlocked || (tasks.filter(t => t.completed).length > 0);
        } else if (badge.name === 'Week Warrior') {
          isUnlocked = isUnlocked || ((settings.studyStreak || 12) >= 7);
        } else if (badge.name === 'Goal Crusher') {
          isUnlocked = isUnlocked || subjects.some(s => s.progress >= 100);
        }
        return { ...badge, unlocked: isUnlocked };
      });
      
      const hasChanges = prev.some((b, i) => b.unlocked !== next[i].unlocked);
      if (hasChanges) {
        next.forEach((b, i) => {
          if (!prev[i].unlocked && b.unlocked) {
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            addToast(`Badge Unlocked: ${b.name}!`);
          }
        });
        return next;
      }
      return prev;
    });
  }, [tasks, subjects, settings.studyStreak, setAchievements, addToast]);

  const handleTimerComplete = useCallback((elapsedSeconds) => {
    const mins = Math.max(1, Math.floor(elapsedSeconds / 60));
    const dateStr = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    setFocusHistory(prev => [{ id: Date.now(), text: `Focus Session - ${mins}m - ${dateStr}` }, ...prev].slice(0, 5));
    setSkillScore(score => score + 20);
    addToast(`Focus session recorded! +20 XP`);
  }, [setFocusHistory, setSkillScore, addToast]);

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (newSubjectName.trim() === '') return;
    setSubjects([...subjects, { id: Date.now(), name: newSubjectName, progress: Number(newSubjectProgress), icon: 'BookOpen', notes: '', checkedMaterials: {} }]);
    setNewSubjectName(''); setNewSubjectProgress(0); setShowSubjectForm(false);
    addToast('Subject added successfully!');
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTaskName.trim() === '') return;
    setTasks([...tasks, { id: Date.now(), taskName: newTaskName, subjectTag: newTaskTag, dueDate: newTaskDate, priority: newTaskPriority, completed: false }]);
    setNewTaskName(''); setNewTaskTag(''); setNewTaskDate(''); setNewTaskPriority('Medium');
    setShowQuickAdd(false);
    addToast('Task added successfully!');
  };

  const toggleTaskCompletion = (id) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        if (!t.completed) {
          addToast('Task completed! +50 XP');
          setSkillScore(score => score + 50);
        }
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  };

  const toggleMaterial = (subjectId, materialKey) => {
    setSubjects(subs => subs.map(s => {
      if (s.id === subjectId) {
        const checks = s.checkedMaterials || {};
        const isChecked = !checks[materialKey];
        const diff = isChecked ? 5 : -5;
        const newProgress = Math.min(100, Math.max(0, s.progress + diff));
        return { ...s, progress: newProgress, checkedMaterials: { ...checks, [materialKey]: isChecked } };
      }
      return s;
    }));
    
    if (selectedSubject && selectedSubject.id === subjectId) {
      setSelectedSubject(prev => {
        const checks = prev.checkedMaterials || {};
        const isChecked = !checks[materialKey];
        const diff = isChecked ? 5 : -5;
        const newProgress = Math.min(100, Math.max(0, prev.progress + diff));
        return { ...prev, progress: newProgress, checkedMaterials: { ...checks, [materialKey]: isChecked } };
      });
    }
  };
  
  const confirmDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'task') {
      setTasks(tasks.filter(t => t.id !== itemToDelete.id));
    } else if (itemToDelete.type === 'subject') {
      setSubjects(subjects.filter(s => s.id !== itemToDelete.id));
    }
    setItemToDelete(null);
  };

  const saveNotes = (id, notes) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, notes } : s));
    setSelectedSubject({ ...selectedSubject, notes });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // --- Theme Classes ---
  const cardBg = settings.isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const textMain = settings.isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = settings.isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const radiusClass = 'rounded-2xl'; // Consistent UI Polish

  // --- Views ---
  const renderDashboard = () => {
    const recentSubjects = [...subjects].sort((a, b) => b.progress - a.progress).slice(0, 3);
    const upcomingTasks = tasks.filter(t => !t.completed).sort((a, b) => (a.priority === 'High' ? -1 : 1)).slice(0, 3);
    const highPriorityMission = tasks.filter(t => !t.completed && t.priority === 'High').slice(0, 3);
    
    const adviceTips = [
      "Great progress in Frontend! Try a 25-min Focus session for AI today.",
      "Consistency is key! You studied well yesterday, keep it up.",
      "Break down your large tasks into smaller 25-minute Pomodoro chunks."
    ];
    const aiMessage = adviceTips[Math.floor(currentTime.getHours() % adviceTips.length)];

    return (
      <div className="flex flex-col min-h-full relative">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className={`text-3xl font-bold mb-1 ${textMain}`}>{getGreeting()}, {settings.userName || 'Student'}!</h1>
            <p className={`${textMuted} font-medium`}>Ready to conquer your goals today?</p>
          </div>
          <div className={`mt-4 md:mt-0 px-5 py-3 ${radiusClass} shadow-sm border flex flex-col items-end ${cardBg}`}>
            <span className={`text-sm font-medium ${textMuted}`}>{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className={`text-xl font-bold ${textMain}`}>{currentTime.toLocaleTimeString()}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { title: 'Study Streak', value: `${settings.studyStreak || 12} Days`, icon: Flame, color: 'text-orange-500', bg: settings.isDarkMode ? 'bg-orange-500/20' : 'bg-orange-100' },
            { title: 'Total Hours', value: '156 hrs', icon: Clock, color: 'text-blue-500', bg: settings.isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100' },
            { title: 'Active Courses', value: subjects.length.toString(), icon: Book, color: 'text-indigo-500', bg: settings.isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-100' },
            { title: 'Skill Score', value: skillScore.toString(), icon: Star, color: 'text-yellow-500', bg: settings.isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100' },
          ].map((stat, i) => (
            <div key={i} className={`${cardBg} p-6 ${radiusClass} shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border flex items-center space-x-4`}>
              <div className={`p-4 ${radiusClass} ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div>
                <p className={`text-sm font-medium mb-1 ${textMuted}`}>{stat.title}</p>
                <h3 className={`text-2xl font-bold ${textMain}`}>{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Smart Advice - Final UI Polish Premium Gradient */}
        <div className={`mb-10 p-6 ${radiusClass} shadow-sm border bg-gradient-to-r ${settings.isDarkMode ? 'from-purple-900/30 to-blue-900/30 border-purple-800/50' : 'from-purple-50 to-blue-50 border-purple-100'} flex items-center space-x-4`}>
          <div className={`p-3 rounded-full shrink-0 ${settings.isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <h3 className={`text-lg font-bold mb-1 ${settings.isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>Smart Advice</h3>
            <p className={`font-medium ${settings.isDarkMode ? 'text-blue-200/80' : 'text-blue-800/80'}`}>{aiMessage}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className={`lg:col-span-2 w-full p-6 ${radiusClass} shadow-sm border ${cardBg}`}>
            <h2 className={`text-xl font-bold mb-6 ${textMain}`}>Weekly Learning Activity</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WEEKLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIndigo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={settings.isDarkMode ? '#334155' : '#f1f5f9'} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip cursor={{fill: settings.isDarkMode ? '#1e293b' : '#f8fafc'}} contentStyle={{ backgroundColor: settings.isDarkMode ? '#0f172a' : '#fff', color: settings.isDarkMode ? '#fff' : '#000', borderRadius: '1rem', border: 'none' }} />
                  <Bar dataKey="hours" fill="url(#colorIndigo)" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`${cardBg} p-6 ${radiusClass} shadow-sm border flex flex-col`}>
            <h2 className={`text-xl font-bold mb-6 flex items-center space-x-2 ${textMain}`}>
              <Award className="w-6 h-6 text-yellow-500" />
              <span>Achievements</span>
            </h2>
            <div className="space-y-4 flex-1">
              {achievements.map((badge) => {
                const IconComp = badge.name === 'First Task Done' ? CheckCircle2 : badge.name === 'Week Warrior' ? Flame : Star;
                return (
                <div key={badge.id} className={`p-4 ${radiusClass} border flex items-center space-x-4 transition-all duration-500 ${badge.unlocked ? (settings.isDarkMode ? 'bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_15px_rgba(250,204,21,0.1)]' : 'bg-yellow-50 border-yellow-200 shadow-sm shadow-yellow-200') : (settings.isDarkMode ? 'bg-slate-800/50 border-slate-700 opacity-60 grayscale' : 'bg-slate-50 border-slate-200 opacity-60 grayscale')}`}>
                  <div className={`p-3 rounded-full transition-colors ${badge.unlocked ? 'bg-yellow-100 text-yellow-500 dark:bg-yellow-500/20' : 'bg-slate-300 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                    <IconComp className="w-6 h-6" style={badge.unlocked ? { color: '#FFD700' } : {}} />
                  </div>
                  <div>
                    <h3 className={`font-bold ${badge.unlocked ? (settings.isDarkMode ? 'text-yellow-400' : 'text-yellow-600') : textMuted}`}>{badge.name}</h3>
                    <p className={`text-xs font-bold ${badge.unlocked ? 'text-yellow-500' : textMuted}`}>
                      {badge.unlocked ? 'Unlocked' : 'Locked'}
                    </p>
                  </div>
                </div>
              )})}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
          
          {/* Today's Mission */}
          <div className={`${cardBg} p-6 ${radiusClass} shadow-sm border flex flex-col`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-lg font-bold flex items-center space-x-2 ${textMain}`}>
                <CheckSquare className="w-5 h-5 text-indigo-500" />
                <span>Today's Mission</span>
              </h2>
            </div>
            {highPriorityMission.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <CheckCircle2 className={`w-8 h-8 mb-2 ${textMuted} opacity-50`} />
                <p className={`text-sm ${textMuted}`}>Mission Accomplished!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {highPriorityMission.map((task) => (
                  <label key={`mission-${task.id}`} className={`p-4 ${radiusClass} border flex items-center space-x-3 cursor-pointer transition-colors ${settings.isDarkMode ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}>
                    <input 
                      type="checkbox" 
                      checked={task.completed} 
                      onChange={() => toggleTaskCompletion(task.id)} 
                      className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer" 
                    />
                    <span className={`font-medium text-sm ${task.completed ? 'text-slate-400 line-through' : textMain}`}>{task.taskName}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Focus Session History */}
          <div className={`${cardBg} p-6 ${radiusClass} shadow-sm border flex flex-col`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-lg font-bold flex items-center space-x-2 ${textMain}`}>
                <Clock className="w-5 h-5 text-indigo-500" />
                <span>Session History</span>
              </h2>
            </div>
            {focusHistory.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <Flame className={`w-8 h-8 mb-2 ${textMuted} opacity-50`} />
                <p className={`text-sm ${textMuted}`}>No sessions yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {focusHistory.map((h) => (
                  <div key={h.id} className={`p-4 ${radiusClass} border flex items-center justify-between font-medium text-sm transition-colors ${settings.isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}>
                    <span>{h.text}</span>
                    <CheckCircle2 className="w-4 h-4 opacity-70" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Subjects */}
          <div className={`${cardBg} p-6 ${radiusClass} shadow-sm border flex flex-col`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-lg font-bold ${textMain}`}>Recent Subjects</h2>
              <button onClick={() => setActiveTab('Subjects')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</button>
            </div>
            {recentSubjects.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <Book className={`w-8 h-8 mb-2 ${textMuted} opacity-50`} />
                <p className={`text-sm ${textMuted}`}>No active subjects.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentSubjects.map((subject) => (
                  <div key={subject.id} className={`p-4 ${radiusClass} border flex flex-col transition-colors ${settings.isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500"><Book className="w-5 h-5" /></div>
                        <h3 className={`font-bold ${textMain}`}>{subject.name}</h3>
                      </div>
                      <span className={`text-sm font-bold ${textMain}`}>{subject.progress}%</span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${settings.isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                      <div className="bg-indigo-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${subject.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Tasks */}
          <div className={`${cardBg} p-6 ${radiusClass} shadow-sm border flex flex-col`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-lg font-bold ${textMain}`}>Upcoming Tasks</h2>
              <button onClick={() => setActiveTab('Tasks')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</button>
            </div>
            {upcomingTasks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <CheckSquare className={`w-8 h-8 mb-2 ${textMuted} opacity-50`} />
                <p className={`text-sm ${textMuted}`}>All caught up!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingTasks.map((task) => {
                  const isUrgent = !task.completed && task.dueDate.toLowerCase() === 'today';
                  // Priority Glow for High
                  const isHighPriority = task.priority === 'High';
                  const priorityBorder = isHighPriority 
                    ? `border-l-4 border-l-red-500 shadow-[0_0_12px_rgba(239,68,68,0.2)] dark:shadow-[0_0_15px_rgba(239,68,68,0.15)]` 
                    : task.priority === 'Medium' ? 'border-l-4 border-l-yellow-500' : 'border-l-4 border-l-green-500';
                  
                  return (
                  <div key={task.id} className={`p-4 rounded-r-2xl border border-l-0 ${priorityBorder} flex items-center justify-between transition-colors ${isUrgent ? (settings.isDarkMode ? 'bg-red-900/20 border-y-red-900 border-r-red-900' : 'bg-red-50 border-y-red-100 border-r-red-100') : (settings.isDarkMode ? 'bg-slate-800/50 border-y-slate-700 border-r-slate-700' : 'bg-slate-50 border-y-slate-100 border-r-slate-100')}`}>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => toggleTaskCompletion(task.id)} className="text-slate-400 hover:text-indigo-600">
                        {task.completed ? <CheckCircle2 className="w-5 h-5 text-indigo-600" /> : <Circle className="w-5 h-5" />}
                      </button>
                      <div>
                        <p className={`font-medium ${task.completed ? 'text-slate-400 line-through' : textMain}`}>{task.taskName}</p>
                        <div className="flex items-center space-x-2 mt-0.5">
                          {isUrgent && <span className="flex w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                          <p className={`text-xs ${isUrgent ? 'text-red-500 font-bold' : textMuted}`}>{task.dueDate}</p>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                      isHighPriority ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                      task.priority === 'Medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' :
                      'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                )})}
              </div>
            )}
          </div>

        </div>
        
        <footer className={`mt-auto text-center py-6 border-t ${settings.isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
          <p className="text-sm font-medium tracking-wide">Built with ❤️ | SkillOrbit v1.0</p>
        </footer>
      </div>
    );
  };

  const getSubjectResources = (subjectName) => {
    const lowerName = subjectName.toLowerCase();
    if (lowerName.includes('frontend') || lowerName.includes('react') || lowerName.includes('web')) {
      return {
        slides: 'https://react.dev/learn',
        reading: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        quiz: 'https://www.w3schools.com/react/react_quiz.asp'
      };
    } else if (lowerName.includes('ai') || lowerName.includes('generative')) {
      return {
        slides: 'https://cloud.google.com/ai/generative-ai',
        reading: 'https://blog.google/technology/ai/',
        quiz: 'https://www.coursera.org/learn/generative-ai-for-everyone'
      };
    } else if (lowerName.includes('ui/ux') || lowerName.includes('design')) {
      return {
        slides: 'https://www.interaction-design.org/literature',
        reading: 'https://lawsofux.com/',
        quiz: 'https://uxcel.com/quizzes'
      };
    }
    return {
      slides: 'https://scholar.google.com/',
      reading: 'https://en.wikipedia.org/wiki/Education',
      quiz: 'https://quizlet.com/'
    };
  };

  const renderSubjects = () => (
    <div className="relative h-full min-h-[80vh] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-3xl font-bold ${textMain}`}>Subjects</h1>
      </div>
      
      {subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center flex-1">
          <div className={`p-6 ${settings.isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-50'} rounded-full mb-6`}>
            <Book className="w-16 h-16 text-indigo-500" />
          </div>
          <h3 className={`text-2xl font-bold mb-2 ${textMain}`}>Your slate is clean</h3>
          <p className={`${textMuted}`}>Ready to start learning? Add a new subject below.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {subjects.map((subject) => (
            <div key={subject.id} className={`${cardBg} p-6 ${radiusClass} shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border flex flex-col relative group`}>
              <button onClick={() => setItemToDelete({ id: subject.id, type: 'subject' })} className={`absolute top-4 right-4 p-2 ${settings.isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} rounded-lg text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all`}>
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="flex justify-between items-start mb-4 pr-10">
                <div className={`w-12 h-12 ${radiusClass} flex items-center justify-center ${settings.isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                  <Book className="w-6 h-6" />
                </div>
                <span className={`text-lg font-bold ${textMain}`}>{subject.progress}%</span>
              </div>
              <h3 className={`font-bold mb-4 flex-1 ${textMain}`}>{subject.name}</h3>
              <div className={`w-full rounded-full h-2.5 mb-6 ${settings.isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${subject.progress}%` }}></div>
              </div>
              <button 
                onClick={() => setSelectedSubject(subject)}
                className={`w-full py-2 font-medium transition-colors ${radiusClass} ${settings.isDarkMode ? 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'}`}
              >
                View Materials
              </button>
            </div>
          ))}
        </div>
      )}
      
      <button 
        onClick={() => setShowSubjectForm(true)}
        className="fixed bottom-10 right-10 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:shadow-indigo-500/50 hover:bg-indigo-700 flex items-center justify-center transition-all hover:scale-110"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showSubjectForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddSubject} className={`${cardBg} p-8 ${radiusClass} shadow-xl w-full max-w-md border animate-fade-in-down`}>
            <h2 className={`text-2xl font-bold mb-6 ${textMain}`}>Create New Subject</h2>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${textMuted}`}>Subject Name</label>
              <input required type="text" value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border ${settings.isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`} placeholder="e.g. Data Structures" />
            </div>
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-1 ${textMuted}`}>Initial Progress (%)</label>
              <input type="number" min="0" max="100" value={newSubjectProgress} onChange={e => setNewSubjectProgress(e.target.value)} className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border ${settings.isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`} />
            </div>
            <div className="flex space-x-3">
              <button type="button" onClick={() => setShowSubjectForm(false)} className={`flex-1 py-3 rounded-lg font-medium border ${settings.isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Cancel</button>
              <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">Create</button>
            </div>
          </form>
        </div>
      )}

      {selectedSubject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${cardBg} p-6 md:p-8 ${radiusClass} shadow-xl w-full max-w-2xl border animate-fade-in-down max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-start mb-6">
              <h2 className={`text-2xl font-bold ${textMain}`}>{selectedSubject.name} Materials</h2>
              <button onClick={() => setSelectedSubject(null)} className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${textMuted} transition-colors`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className={`text-lg font-bold mb-3 flex items-center space-x-2 ${textMain}`}>
                  <Link className="w-5 h-5 text-indigo-500" />
                  <span>Interactive Checklist</span>
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      checked={selectedSubject.checkedMaterials?.slides || false} 
                      onChange={() => toggleMaterial(selectedSubject.id, 'slides')} 
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer" 
                    />
                    <a href={getSubjectResources(selectedSubject.name).slides} target="_blank" rel="noopener noreferrer" className={`flex items-center space-x-2 transition-all ${selectedSubject.checkedMaterials?.slides ? 'text-indigo-400 line-through opacity-70' : 'text-indigo-600 dark:text-indigo-400 hover:underline'}`}>
                      <FileText className="w-4 h-4" /> <span>Lecture Slides & Docs</span>
                    </a>
                  </li>
                  <li className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      checked={selectedSubject.checkedMaterials?.reading || false} 
                      onChange={() => toggleMaterial(selectedSubject.id, 'reading')} 
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer" 
                    />
                    <a href={getSubjectResources(selectedSubject.name).reading} target="_blank" rel="noopener noreferrer" className={`flex items-center space-x-2 transition-all ${selectedSubject.checkedMaterials?.reading ? 'text-indigo-400 line-through opacity-70' : 'text-indigo-600 dark:text-indigo-400 hover:underline'}`}>
                      <Book className="w-4 h-4" /> <span>Reading List</span>
                    </a>
                  </li>
                  <li className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      checked={selectedSubject.checkedMaterials?.quiz || false} 
                      onChange={() => toggleMaterial(selectedSubject.id, 'quiz')} 
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer" 
                    />
                    <a href={getSubjectResources(selectedSubject.name).quiz} target="_blank" rel="noopener noreferrer" className={`flex items-center space-x-2 transition-all ${selectedSubject.checkedMaterials?.quiz ? 'text-indigo-400 line-through opacity-70' : 'text-indigo-600 dark:text-indigo-400 hover:underline'}`}>
                      <FileQuestion className="w-4 h-4" /> <span>Practice Quiz</span>
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className={`text-lg font-bold mb-3 flex items-center space-x-2 ${textMain}`}>
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>Key Topics</span>
                </h3>
                <ul className={`list-disc pl-5 space-y-1 ${textMuted}`}>
                  <li>Introduction to core concepts</li>
                  <li>Advanced methodologies</li>
                  <li>Real-world applications</li>
                  <li>Final project guidelines</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className={`text-lg font-bold mb-3 flex items-center space-x-2 ${textMain}`}>
                <FileText className="w-5 h-5 text-green-500" />
                <span>My Notes</span>
              </h3>
              <textarea 
                className={`w-full h-32 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border resize-none ${settings.isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                placeholder="Type your notes here..."
                value={selectedSubject.notes || ''}
                onChange={(e) => saveNotes(selectedSubject.id, e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTasks = () => {
    const filteredTasks = filterHighPriority 
      ? tasks.filter(t => t.priority === 'High') 
      : tasks;

    return (
      <div className="min-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${textMain}`}>Task Manager</h1>
          <button 
            onClick={() => setFilterHighPriority(!filterHighPriority)}
            className={`flex items-center space-x-2 px-4 py-2 ${radiusClass} transition-colors border ${filterHighPriority ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-400' : `${settings.isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}`}
          >
            <Filter className="w-4 h-4" />
            <span className="font-medium">High Priority</span>
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center flex-1">
            <div className={`p-6 ${settings.isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-50'} rounded-full mb-6`}>
              <CheckSquare className="w-16 h-16 text-indigo-500" />
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${textMain}`}>Your slate is clean</h3>
            <p className={`${textMuted}`}>Ready to start learning? Add a new task to begin.</p>
          </div>
        ) : (
          <div className={`${cardBg} ${radiusClass} shadow-sm border overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className={`${settings.isDarkMode ? 'bg-slate-800/50 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-500 border-slate-100'} text-sm border-b`}>
                    <th className="p-4 font-medium w-16">Status</th>
                    <th className="p-4 font-medium">Task Name</th>
                    <th className="p-4 font-medium w-40">Subject Tag</th>
                    <th className="p-4 font-medium w-32">Due Date</th>
                    <th className="p-4 font-medium w-32">Priority</th>
                    <th className="p-4 font-medium w-16">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => {
                    const isUrgent = !task.completed && task.dueDate.toLowerCase() === 'today';
                    // Priority glow
                    const isHighPriority = task.priority === 'High';
                    const priorityBorder = isHighPriority 
                      ? `border-l-4 border-l-red-500 shadow-[0_0_12px_rgba(239,68,68,0.2)] dark:shadow-[0_0_15px_rgba(239,68,68,0.15)]` 
                      : task.priority === 'Medium' ? 'border-l-4 border-l-yellow-500' : 'border-l-4 border-l-green-500';
                    
                    return (
                    <tr key={task.id} className={`border-b group transition-colors ${priorityBorder} ${isUrgent ? (settings.isDarkMode ? 'bg-red-900/20' : 'bg-red-50') : (settings.isDarkMode ? 'border-b-slate-800/50 hover:bg-slate-800' : 'border-b-slate-50 hover:bg-slate-50')}`}>
                      <td className="p-4">
                        <button onClick={() => toggleTaskCompletion(task.id)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                          {task.completed ? <CheckCircle2 className="w-6 h-6 text-indigo-600" /> : <Circle className="w-6 h-6" />}
                        </button>
                      </td>
                      <td className={`p-4 font-medium ${task.completed ? 'text-slate-400 line-through' : textMain}`}>
                        {task.taskName}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${settings.isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                          {task.subjectTag || 'General'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {isUrgent && <span className="flex w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                          <span className={`text-sm ${isUrgent ? 'text-red-500 font-bold' : textMuted}`}>{task.dueDate}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          isHighPriority ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                          task.priority === 'Medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' :
                          'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <button onClick={() => setItemToDelete({ id: task.id, type: 'task' })} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  )})}
                  {filteredTasks.length === 0 && tasks.length > 0 && (
                    <tr>
                      <td colSpan="6" className={`p-8 text-center ${textMuted}`}>
                        No tasks match the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => (
    <div className="max-w-2xl mx-auto min-h-[80vh]">
      <h1 className={`text-3xl font-bold mb-8 ${textMain}`}>Settings</h1>
      
      <div className={`${cardBg} p-8 ${radiusClass} shadow-sm border space-y-8`}>
        {/* Profile Section */}
        <div>
          <h2 className={`text-lg font-bold mb-4 ${textMain}`}>Profile Details</h2>
          <div className="flex flex-col space-y-2">
            <label className={`text-sm font-medium ${textMuted}`}>Display Name</label>
            <input 
              type="text" 
              value={settings.userName} 
              onChange={e => setSettings({ ...settings, userName: e.target.value })} 
              className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border transition-colors ${settings.isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:bg-slate-700' : 'bg-white border-slate-200'}`} 
            />
          </div>
        </div>

        <hr className={settings.isDarkMode ? 'border-slate-800' : 'border-slate-100'} />

        {/* Data & Export Section */}
        <div>
          <h2 className={`text-lg font-bold mb-4 ${textMain}`}>Data & Export</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${textMain}`}>Export Progress</p>
              <p className={`text-sm ${textMuted}`}>Download your learning activity as a text report.</p>
            </div>
            <button 
              onClick={() => {
                const report = `SkillOrbit Progress Report\n=========================\n\nStudy Streak: ${settings.studyStreak || 12} Days\nTotal Hours: 156 hrs\nActive Courses: ${subjects.length}\nSkill Score: ${skillScore}\n\nActive Subjects:\n` + 
                  subjects.map(s => `- ${s.name}: ${s.progress}%`).join('\n') + 
                  `\n\nPending Tasks:\n` + 
                  tasks.filter(t => !t.completed).map(t => `- [${t.priority}] ${t.taskName} (Due: ${t.dueDate})`).join('\n');
                
                const blob = new Blob([report], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'SkillOrbit_Progress.txt';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                addToast('Report downloaded successfully!');
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              Download Report
            </button>
          </div>
        </div>

        <hr className={settings.isDarkMode ? 'border-slate-800' : 'border-slate-100'} />

        {/* Preferences Section */}
        <div>
          <h2 className={`text-lg font-bold mb-4 ${textMain}`}>Preferences</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${textMain}`}>Dark Mode</p>
              <p className={`text-sm ${textMuted}`}>Toggle the appearance of the dashboard.</p>
            </div>
            <button 
              onClick={() => setSettings({ ...settings, isDarkMode: !settings.isDarkMode })}
              className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${settings.isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300 ${settings.isDarkMode ? 'translate-x-7' : ''}`}></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} isDarkMode={settings.isDarkMode} onQuickAdd={() => setShowQuickAdd(true)} onTimerComplete={handleTimerComplete}>
      {activeTab === 'Dashboard' && renderDashboard()}
      {activeTab === 'Subjects' && renderSubjects()}
      {activeTab === 'Tasks' && renderTasks()}
      {activeTab === 'Settings' && renderSettings()}
      
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center space-x-3 pointer-events-auto shadow-indigo-500/30">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium text-sm">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Back to Top Button */}
      <button 
        onClick={() => {
          const mainElement = document.querySelector('main');
          if (mainElement) mainElement.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="fixed bottom-10 left-10 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 hover:scale-110 transition-all z-40"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      {/* Global Quick Add Task Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddTask} className={`${cardBg} p-8 ${radiusClass} shadow-xl w-full max-w-md border animate-fade-in-down`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${textMain}`}>Quick Add Task</h2>
              <button type="button" onClick={() => setShowQuickAdd(false)} className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${textMuted} transition-colors`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-1 ${textMuted}`}>Task Name</label>
                <input required type="text" value={newTaskName} onChange={e => setNewTaskName(e.target.value)} className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border ${settings.isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`} placeholder="e.g. Read chapter 5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textMuted}`}>Subject</label>
                  <input type="text" value={newTaskTag} onChange={e => setNewTaskTag(e.target.value)} className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border ${settings.isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`} placeholder="e.g. React" />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textMuted}`}>Due Date</label>
                  <input type="text" value={newTaskDate} onChange={e => setNewTaskDate(e.target.value)} className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border ${settings.isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`} placeholder="e.g. Today" />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textMuted}`}>Priority</label>
                <select value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value)} className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border ${settings.isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3">
              <button type="button" onClick={() => setShowQuickAdd(false)} className={`flex-1 py-3 rounded-lg font-medium border ${settings.isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Cancel</button>
              <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">Add Task</button>
            </div>
          </form>
        </div>
      )}

      {/* Global Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${cardBg} p-8 ${radiusClass} shadow-xl w-full max-w-sm border animate-fade-in-down text-center`}>
            <div className="w-16 h-16 bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${textMain}`}>Are you sure?</h2>
            <p className={`mb-6 ${textMuted}`}>
              Do you really want to delete this {itemToDelete.type}? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button onClick={() => setItemToDelete(null)} className={`flex-1 py-3 rounded-lg font-medium border ${settings.isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
