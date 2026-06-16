/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  X,
  Calendar,
  User,
  Clock,
  MapPin,
  Tag,
  Award,
  Download,
  CheckCircle,
  Eye,
  FileText,
  Bookmark
} from "lucide-react";
import { Task, CategoryInfo, LocationInfo } from "../types";

interface TaskDetailsModalProps {
  task: Task;
  locations: LocationInfo[];
  categories: CategoryInfo[];
  onClose: () => void;
}

export default function TaskDetailsModal({
  task,
  locations,
  categories,
  onClose,
}: TaskDetailsModalProps) {
  const [previewingImageUrl, setPreviewingImageUrl] = useState<string | null>(null);

  const loc = locations.find((l) => l.id === task.locationId);
  const cat = categories.find((c) => c.type === task.category);

  // Helper function to format timestamp beautifully
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("nl-NL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-[1100] overflow-y-auto">
      <div
        className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl max-h-[calc(100vh-32px)] overflow-hidden border border-brand-border flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        id="task-details-modal"
      >
        {/* Header with category colors */}
        <div
          className={`px-8 py-6 text-white flex items-center justify-between relative ${
            cat?.color ? cat.color.replace("text-", "bg-") : "bg-brand-gray-dark"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
              {task.status === "Completed" ? "🎉" : "📋"}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-white/80 block">
                {cat?.label || task.category}
              </span>
              <h2 className="text-xl font-serif text-white truncate max-w-[320px] sm:max-w-[400px]">
                {task.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer text-white"
            title="Sluiten"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Container */}
        <div className="p-8 space-y-6 flex-1 overflow-y-auto scrollbar-thin">
          
          {/* Main Info Box */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold leading-none ${
                  task.priority === "Hoog"
                    ? "bg-red-100 text-red-700"
                    : task.priority === "Gemiddeld"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700"
                }`}
              >
                Prioriteit: {task.priority || "Geen"}
              </span>

              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold leading-none ${
                  task.status === "Open"
                    ? "bg-slate-100 text-slate-600"
                    : task.status === "Claimed"
                      ? "bg-brand-peach-light text-brand-peach border border-brand-peach/20"
                      : "bg-brand-sage-light text-brand-olive"
                }`}
              >
                Status: {task.status === "Open" ? "Openstaand" : task.status === "Claimed" ? "Geclaimd" : "Voltooid"}
              </span>
            </div>

            <div className="bg-brand-bg rounded-2xl p-5 border border-brand-border">
              <h4 className="text-[10px] uppercase font-bold tracking-[0.1em] text-brand-gray-light mb-1.5 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 opacity-60" /> Beschrijving / Instructies
              </h4>
              <p className="text-sm font-medium text-brand-gray-dark whitespace-pre-line leading-relaxed">
                {task.description || "Geen extra beschrijving of details achtergelaten voor deze taak."}
              </p>
            </div>
          </div>

          {/* Location details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-brand-border/60">
              <MapPin className="w-5 h-5 text-brand-gray-light flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold tracking-[0.1em] text-brand-gray-light leading-none mb-1">
                  Locatie
                </p>
                <p className="text-xs font-semibold text-brand-gray-dark">
                  {loc?.name || "Onbekende locatie"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-brand-border/60">
              <Tag className="w-5 h-5 text-brand-gray-light flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold tracking-[0.1em] text-brand-gray-light leading-none mb-1">
                  Specifieke Groep / Doelgroep
                </p>
                <p className="text-xs font-semibold text-brand-gray-dark">
                  {task.groupId || "Boventallig / Algemeen"}
                </p>
              </div>
            </div>
          </div>

          {/* Audit Timeline */}
          <div className="space-y-3.5">
            <h3 className="text-xs uppercase font-extrabold tracking-[0.12em] text-brand-gray-dark">
              Tijdlijn &amp; Uitvoering
            </h3>

            <div className="relative pl-6 border-l-2 border-brand-border space-y-5">
              
              {/* Created */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-white border-2 border-brand-gray-light flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-gray-light" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-[0.1em] text-brand-gray-light leading-none mb-1">
                    Taak Gemaakt
                  </p>
                  <p className="text-xs font-semibold text-brand-gray-dark">
                    Door {task.createdByName}
                  </p>
                  <p className="text-[11px] text-brand-gray-light mt-0.5">
                    {formatDateTime(task.createdAt)}
                  </p>
                </div>
              </div>

              {/* Claimed */}
              {task.claimedByName && (
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-white border-2 border-brand-peach flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-peach" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-[0.1em] text-brand-peach leading-none mb-1">
                      Taak Opgepakt
                    </p>
                    <p className="text-xs font-semibold text-brand-gray-dark">
                      Door {task.claimedByName}
                    </p>
                    {task.claimedAt && (
                      <p className="text-[11px] text-brand-gray-light mt-0.5">
                        {formatDateTime(task.claimedAt)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Completed */}
              {task.status === "Completed" && task.completedByName && (
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-white border-2 border-brand-sage flex items-center justify-center">
                    <CheckCircle className="w-3.5 h-3.5 text-brand-sage fill-white" />
                  </div>
                  <div className="bg-brand-sage/5 border border-brand-sage/20 rounded-2xl p-4 mt-1">
                    <p className="text-[10px] uppercase font-bold tracking-[0.1em] text-brand-olive leading-none mb-1 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Taak Succesvol Voltooid
                    </p>
                    <p className="text-sm font-bold text-brand-gray-dark">
                      Uitgevoerd door: <span className="text-brand-olive font-serif font-semibold">{task.completedByName}</span>
                    </p>
                    {task.completedAt && (
                      <p className="text-[11px] text-brand-gray-light mt-0.5">
                        Voltooid op: {formatDateTime(task.completedAt)}
                      </p>
                    )}
                    
                    {task.cheerMessage && (
                      <div className="mt-3 pt-3 border-t border-brand-sage/20">
                        <p className="text-[10px] uppercase font-bold tracking-[0.1em] text-brand-gray-light leading-none mb-2">
                          Voltooid bericht
                        </p>
                        <p className="text-xs font-medium text-brand-olive italic">
                          "{task.cheerMessage}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Attachments (if any) */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs uppercase font-extrabold tracking-[0.12em] text-brand-gray-dark">
                Bijlagen van de uitvoering ({task.attachments.length})
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {task.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="group relative bg-brand-bg border border-brand-border rounded-2xl overflow-hidden hover:border-brand-gray-light transition flex flex-col h-28"
                  >
                    {att.type === "image" ? (
                      <>
                        <img
                          src={att.url}
                          alt={att.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewingImageUrl(att.url)}
                            className="p-1.5 bg-white rounded-full text-brand-gray-dark hover:bg-brand-bg transition cursor-pointer"
                            title="Bekijken"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={att.url}
                            download={att.name}
                            className="p-1.5 bg-white rounded-full text-brand-gray-dark hover:bg-brand-bg transition cursor-pointer"
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
                          className="mt-1 px-2.5 py-1 bg-white border border-brand-border rounded-full text-[9px] font-bold text-brand-gray-dark hover:bg-brand-bg hover:border-brand-gray-light transition flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" /> Downloaden
                        </a>
                      </div>
                    )}

                    <div className="absolute bottom-0 inset-x-0 bg-white/95 border-t border-brand-border/60 py-1 px-2.5 text-[9px] font-semibold text-brand-gray truncate">
                      {att.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-brand-bg border-t border-brand-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full border border-brand-border bg-white text-sm font-bold text-brand-gray hover:bg-slate-150 transition cursor-pointer active:scale-95"
          >
            Sluiten
          </button>
        </div>
      </div>

      {/* Image zoom light-box */}
      {previewingImageUrl && (
        <div
          className="fixed inset-0 bg-slate-900/80 z-[1200] flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setPreviewingImageUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col">
            <button
              onClick={() => setPreviewingImageUrl(null)}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center cursor-pointer mb-2"
              title="Sluiten"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewingImageUrl}
              alt="Bijlage voorbeeld"
              className="object-contain max-h-[80vh] rounded-xl outline outline-1 outline-white/20"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
