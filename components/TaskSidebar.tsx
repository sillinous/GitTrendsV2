import React from 'react';
import { Task } from '../types';
import { X, CheckCircle2, Circle, Trash2, ListTodo, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaskSidebarProps {
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskSidebar: React.FC<TaskSidebarProps> = ({ 
  tasks, 
  isOpen, 
  onClose, 
  onToggleTask, 
  onDeleteTask 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
          />
          
          {/* Sidebar */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-surface border-l border-white/10 z-[80] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-900/30">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-accent-blue/20 rounded-2xl flex items-center justify-center border border-accent-blue/30">
                  <ListTodo className="text-accent-blue" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight italic">Task Terminal</h2>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Active Monitoring Queue</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-zinc-800/50 hover:bg-zinc-700 rounded-xl text-zinc-500 hover:text-white transition-all border border-white/5"
              >
                <X size={20} />
              </button>
            </div>

            {/* Task List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
                  <ListTodo size={64} className="mb-4" />
                  <p className="text-sm font-black uppercase tracking-[0.3em]">Queue Empty</p>
                  <p className="text-xs mt-2">Add repositories to track development tasks.</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <motion.div 
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`group p-4 rounded-2xl border transition-all ${
                      task.status === 'completed' 
                        ? 'bg-zinc-900/30 border-white/5 opacity-60' 
                        : 'bg-zinc-800/40 border-white/10 hover:border-accent-blue/30'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <button 
                        onClick={() => onToggleTask(task.id)}
                        className={`mt-1 transition-colors ${
                          task.status === 'completed' ? 'text-accent-green' : 'text-zinc-600 hover:text-white'
                        }`}
                      >
                        {task.status === 'completed' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </button>
                      
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-accent-green' : 'bg-accent-blue animate-pulse'}`} />
                          <h4 className={`text-sm font-bold truncate ${
                            task.status === 'completed' ? 'text-zinc-500 line-through' : 'text-white'
                          }`}>
                            {task.repoName}
                          </h4>
                        </div>
                        <p className="text-[10px] text-zinc-500 truncate mb-2 mt-1">{task.repoFullName}</p>
                        
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                            <Clock size={10} />
                            <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                            task.status === 'completed' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-blue/10 text-accent-blue'
                          }`}>
                            {task.status}
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => onDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-zinc-600 hover:text-accent-red transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-zinc-900/50 border-t border-white/5">
              <div className="flex justify-between items-center text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                <span>Total Tasks: {tasks.length}</span>
                <span>Completed: {tasks.filter(t => t.status === 'completed').length}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
