/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { 
  Sparkles, 
  FolderClosed, 
  ClipboardList, 
  Compass,
  MessageCircle,
  Trash2, 
  CheckCircle2, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  ChevronRight,
  Flame,
  Award,
  Edit2,
  Tag,
  Paperclip,
  Download,
  Eye,
  Camera,
  X,
  FileText
} from 'lucide-react';
import { Task, CategoryType, PriorityType, User as UserType, CategoryInfo, LocationInfo } from '../types';
import AttachmentManager from './AttachmentManager';

interface TaskCardProps {
  key?: string | number;
  task: Task;
  currentUser: UserType;
  categories: CategoryInfo[];
  locations: LocationInfo[];
  onClaim: (taskId: string) => void;
  onUnclaim: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void; // Managers only
  onUpdateTask?: (taskId: string, data: Partial<Task>) => void;
}

// Map strings to Lucide components
const IconMap = {
  Sparkles: Sparkles,
  FolderClosed: FolderClosed,
  ClipboardList: ClipboardList,
  Compass: Compass,
  MessageCircle: MessageCircle
};

export default function TaskCard({ 
  task, 
  currentUser, 
  categories,
  locations,
  onClaim, 
  onUnclaim, 
  onComplete, 
  onEdit,
  onDelete,
  onUpdateTask
}: TaskCardProps) {
  const categoryInfo = categories.find(c => c.type === task.category) || {
    type: task.category,
    label: task.category,
    iconName: 'Tag',
    color: 'text-brand-gray border-brand-border bg-brand-bg',
    bgLight: 'bg-white text-brand-gray'
  };
  const IconComponent = IconMap[categoryInfo.iconName as keyof typeof IconMap] || Tag;
  
  // Swipe to complete logic (drag tracking)
  const dragConstraintsRef = useRef<HTMLDivElement>(null);
  const [isSuccessfullySwiped, setIsSuccessfullySwiped] = useState(false);
  const dragX = useMotionValue(0);
  
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);
  const [isAddingAttachments, setIsAddingAttachments] = useState(false);
  
  // Map drag position to background opacity / colors
  const opacity = useTransform(dragX, [0, 160], [0.1, 0.95]);

  const handleDragEnd = () => {
    const currentX = dragX.get();
    if (currentX >= 155) {
      setIsSuccessfullySwiped(true);
      // Trigger completion callback
      setTimeout(() => {
        onComplete(task.id);
      }, 300);
    }
  };

  // Check if current user is the manager or the person who claimed the task
  const isClaimedByMe = task.claimedByUserId === currentUser.id;
  const isManager = currentUser.role === 'Manager';
  const isCreator = task.createdByUserId === currentUser.id;

  // Translate priorities
  const priorityColor = {
    Laag: 'bg-brand-bg text-brand-gray-light border-brand-border',
    Gemiddeld: 'bg-brand-sage-lighter text-brand-olive border-brand-sage-light',
    Hoog: 'bg-brand-peach-light text-brand-gray-dark border-brand-peach/50 animate-pulse'
  };

  return (
    <motion.div
      layout
      id={`task-card-${task.id}`}
      initial={{ opacity: 0, y: 15 }}
      animate={task.status === 'Open' ? {
        opacity: 1,
        y: 0,
        boxShadow: ["0px 1px 3px rgba(0,0,0,0.05)", "0px 6px 20px rgba(100,116,139,0.12)", "0px 1px 3px rgba(0,0,0,0.05)"],
        scale: [1, 1.008, 1]
      } : {
        opacity: 1,
        y: 0,
        boxShadow: "0px 1px 3px rgba(0,0,0,0.05)",
        scale: 1
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={task.status === 'Open' ? {
        boxShadow: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        },
        scale: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        },
        default: { duration: 0.3 }
      } : {
        duration: 0.3
      }}
      className={`relative overflow-hidden bg-white border rounded-[32px] shadow-sm transition-all duration-300 ${
        task.status === 'Completed' 
          ? 'border-brand-sage bg-brand-sage-lighter shadow-none' 
          : task.status === 'Claimed'
          ? 'border-brand-peach ring-1 ring-brand-peach shadow-md'
          : 'border-brand-border hover:shadow-md hover:border-brand-gray-light'
      }`}
    >
      {/* Top Banner Accent */}
      <div className={`h-2 w-full ${
        task.status === 'Completed' 
          ? 'bg-brand-sage' 
          : task.status === 'Claimed' 
          ? 'bg-brand-peach' 
          : 'bg-brand-gray-light bg-emerald-500/80'
      }`} />

      <div className="p-5 sm:p-6">
        {/* Header tags */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            {task.status === 'Open' && (
              <span className="inline-flex items-center gap-1.5 text-[8px] xs:text-[10px] uppercase font-black tracking-[0.1em] px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Open 📣
              </span>
            )}

            <span className={`inline-flex items-center gap-1.5 text-[8px] xs:text-[10px] uppercase font-bold tracking-[0.1em] px-3.5 py-1.5 rounded-full border ${categoryInfo.color}`}>
              <IconComponent className="w-3.5 h-3.5" />
              {categoryInfo.label}
            </span>
            
            <span className={`inline-flex items-center text-[10px] uppercase font-bold tracking-[0.1em] px-3 py-1.5 rounded-full border ${priorityColor[task.priority]}`}>
              {task.priority} Prioriteit
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Edit button */}
            {task.status !== 'Completed' && (isManager || isCreator) && (
              <button
                id={`edit-task-${task.id}`}
                onClick={() => onEdit && onEdit(task)}
                className="p-2 text-brand-gray-light hover:text-brand-gray-dark rounded-full hover:bg-brand-bg transition-colors"
                title="Taak bewerken"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}

            {/* Delete button (Manager Only) */}
            {isManager && (
              <button
                id={`delete-task-${task.id}`}
                onClick={() => onDelete && onDelete(task.id)}
                className="p-2 text-brand-gray-light hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                title="Taak verwijderen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Title and description */}
        <div className="mb-6">
          <h3 className={`text-xl font-serif tracking-tight text-brand-gray-dark ${task.status === 'Completed' ? 'line-through opacity-60 text-brand-gray' : ''}`}>
            {task.title}
          </h3>
          <p className={`mt-2 text-sm leading-relaxed ${task.status === 'Completed' ? 'opacity-60 text-brand-gray' : 'text-brand-gray'}`}>
            {task.description}
          </p>
        </div>

        {/* Task Attachments Display */}
        {task.attachments && task.attachments.length > 0 && (
          <div className="mb-5 space-y-2">
            <h4 className="text-[10px] uppercase font-bold tracking-[0.1em] text-brand-gray-light flex items-center gap-1.5 mb-2">
              <Paperclip className="w-3.5 h-3.5" />
              Bijlagen & Foto's ({task.attachments.length})
            </h4>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2">
              {task.attachments.map((att) => (
                <div 
                  key={att.id} 
                  className="relative group border border-brand-border rounded-[16px] aspect-square overflow-hidden bg-brand-bg flex flex-col justify-between"
                >
                  {att.type === 'image' ? (
                    <>
                      <img 
                        src={att.url} 
                        alt={att.name} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveLightboxImage(att.url)}
                          className="p-1.5 bg-white rounded-full text-brand-gray-dark hover:bg-brand-bg transition"
                          title="Bekijken"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={att.url}
                          download={att.name}
                          className="p-1.5 bg-white rounded-full text-brand-gray-dark hover:bg-brand-bg transition"
                          title="Downloaden"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-3 text-center">
                      <FileText className="w-7 h-7 text-brand-gray-light mb-1" />
                      <span className="text-[10px] font-semibold text-brand-gray-dark truncate w-full" title={att.name}>
                        {att.name}
                      </span>
                      <a
                        href={att.url}
                        download={att.name}
                        className="mt-1 px-2 py-0.5 bg-white border border-brand-border rounded-full text-[8px] font-bold text-brand-gray-dark hover:bg-brand-bg hover:border-brand-gray-light transition flex items-center gap-1"
                      >
                        <Download className="w-2.5 h-2.5" /> Download
                      </a>
                    </div>
                  )}

                  <div className="absolute bottom-0 inset-x-0 bg-white/95 border-t border-brand-border py-1 px-2 text-[8px] font-semibold text-brand-gray truncate">
                    {att.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meta Indicators (Location, Group, Author) */}
        <div className="flex flex-col sm:flex-row gap-4 py-4 rounded-[24px] bg-brand-bg px-5 mb-5 text-xs text-brand-gray border border-brand-border">
          <div className="flex items-center gap-2 flex-wrap">
            <MapPin className="w-4 h-4 opacity-50 flex-shrink-0" />
            <span className="font-medium">
              {locations.find(l => l.id === task.locationId)?.name || 'Onbekende Locatie'}
              {task.groupId && ` • ${task.groupId}`}
            </span>
          </div>
          <div className="hidden sm:block text-brand-border">|</div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 opacity-50 flex-shrink-0" />
            <span className="font-medium">Gemaakt door: {task.createdByName}</span>
          </div>
        </div>

        {/* State Conditional Footer */}
        {task.status === 'Open' && (
          <div className="flex items-center justify-between gap-4 mt-6 pt-5 border-t border-brand-border">
            <div className="text-xs text-brand-gray-light font-bold uppercase tracking-[0.1em] flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Gemaakt {new Date(task.createdAt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            
            <button
              id={`claim-button-${task.id}`}
              onClick={() => onClaim(task.id)}
              className="px-6 py-3 rounded-full bg-brand-gray-dark hover:bg-black active:scale-95 text-white font-medium text-sm tracking-wide shadow-sm hover:shadow transition-all duration-150 flex items-center gap-2 cursor-pointer"
            >
              Taak Oppakken 🎒
            </button>
          </div>
        )}

        {task.status === 'Claimed' && (
          <div className="mt-6 pt-5 border-t border-brand-border">
            {/* Owner badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-peach-light border border-brand-peach/50 flex items-center justify-center text-sm shadow-sm">
                  {isClaimedByMe ? currentUser.avatar : '👤'}
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-[0.1em] text-brand-gray-light leading-none mb-1">Opgepakt door</p>
                  <p className="text-sm font-semibold text-brand-gray-dark">{isClaimedByMe ? 'Jijzelf' : task.claimedByName}</p>
                </div>
              </div>

              {/* Release Option */}
              {(isClaimedByMe || isManager) && (
                <button
                  id={`unclaim-button-${task.id}`}
                  onClick={() => onUnclaim(task.id)}
                  className="text-xs text-brand-gray-light hover:text-brand-gray font-bold uppercase tracking-[0.1em] underline cursor-pointer"
                >
                  Terugleggen ↩️
                </button>
              )}
            </div>

            {/* Slide to Complete Mechanism (Me-only interactive) */}
            {isClaimedByMe ? (
              <div className="space-y-4">
                {/* Inline attachment captured drawer on the card */}
                {onUpdateTask && (
                  <div className="bg-brand-bg p-3.5 rounded-[24px] border border-brand-border space-y-3 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-brand-gray flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-brand-olive animate-bounce" />
                        In-situ foto of bijlage toevoegen 📸
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddingAttachments(!isAddingAttachments)}
                        className="text-xs font-bold text-brand-olive hover:text-brand-gray-dark underline cursor-pointer"
                      >
                        {isAddingAttachments ? 'Sluiten' : 'Toevoegen'}
                      </button>
                    </div>

                    {isAddingAttachments && (
                      <div className="pt-2 border-t border-brand-border/40">
                        <AttachmentManager
                          attachments={task.attachments || []}
                          onChange={(newAttachments) => {
                            onUpdateTask(task.id, { attachments: newAttachments });
                          }}
                          label="Foto's of documenten"
                        />
                      </div>
                    )}
                  </div>
                )}

                <p className="text-[10px] uppercase font-bold tracking-[0.1em] text-center text-brand-peach animate-pulse flex items-center justify-center gap-2">
                  Swipe naar rechts om af te ronden <ChevronRight className="w-4 h-4" />
                </p>
                
                {/* Drag track wrapper */}
                <div 
                  ref={dragConstraintsRef}
                  className="h-14 bg-brand-bg rounded-full relative overflow-hidden flex items-center p-1.5 border border-brand-border"
                >
                  {/* Dynamic coloring on slider progress */}
                  <motion.div 
                    style={{ opacity }}
                    className="absolute inset-0 bg-brand-peach pointer-events-none"
                  />
                  
                  {/* Behind track instruction text */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] tracking-[0.1em] uppercase font-bold text-brand-gray-light select-none">Vastpakken en slepen 🌟</span>
                  </div>

                  {/* Drag handle */}
                  <motion.div
                    drag="x"
                    dragElastic={0.08}
                    dragConstraints={{ left: 0, right: 185 }}
                    onDragEnd={handleDragEnd}
                    id={`swipe-handle-${task.id}`}
                    style={{ x: dragX }}
                    animate={isSuccessfullySwiped ? { x: 185 } : undefined}
                    className="w-11 h-11 rounded-full bg-brand-gray-dark flex items-center justify-center text-white cursor-grab active:cursor-grabbing shadow-md z-10 transition-shadow hover:shadow-lg"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </motion.div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-[24px] bg-brand-bg border border-brand-border flex items-center justify-center gap-3 text-xs font-semibold text-brand-gray">
                <Clock className="w-5 h-5 text-brand-gray-light animate-spin" style={{ animationDuration: '4s' }} />
                <span>Collega werkt momenteel aan deze taak</span>
              </div>
            )}
          </div>
        )}

        {task.status === 'Completed' && (
          <div className="mt-6 pt-5 border-t border-brand-border/40">
            {/* Celebratory Banner */}
            <div className="p-5 bg-white rounded-[24px] border border-brand-sage flex items-start gap-4">
              <Award className="w-6 h-6 text-brand-olive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-serif italic text-brand-gray-dark leading-none">Voltooid en voldaan!</p>
                <p className="mt-3 text-sm text-brand-olive font-medium">
                  "{task.cheerMessage}"
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] uppercase font-bold tracking-[0.1em] text-brand-gray-light">
                  <span>Uitgevoerd door: <span className="text-brand-gray">{task.completedByName}</span></span>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-brand-gray">{new Date(task.completedAt!).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })} uur</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Lightbox Modal */}
      {activeLightboxImage && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]"
          onClick={() => setActiveLightboxImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-[24px] bg-white border border-brand-border shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveLightboxImage(null)}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white cursor-pointer transition z-50 shadow-md"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={activeLightboxImage} 
              alt="Bijlage preview" 
              className="max-w-full max-h-[80vh] object-contain block mx-auto" 
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
