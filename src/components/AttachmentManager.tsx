import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Trash2, X, FileText, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { Attachment } from '../types';

interface AttachmentManagerProps {
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
  label?: string;
}

export default function AttachmentManager({ attachments = [], onChange, label = 'Bijlagen & Bewijsfoto\'s' }: AttachmentManagerProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream when component unmounts or camera is closed
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setCapturedPhoto(null);
    setIsCameraActive(true);

    try {
      if (streamRef.current) {
        stopCamera();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Kan geen toegang krijgen tot de camera. Controleer je instellingen en machtigingen.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const switchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    // Restart camera with new facingMode
    setTimeout(() => {
      if (isCameraActive) {
        startCamera();
      }
    }, 100);
  };

  // Re-start camera when facingMode changes
  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    }
  }, [facingMode]);

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedPhoto(dataUrl);
    }
  };

  const acceptPhoto = () => {
    if (!capturedPhoto) return;

    const newAttachment: Attachment = {
      id: `att-${Date.now()}`,
      name: `Foto_${new Date().toLocaleDateString('nl-NL').replace(/\//g, '-')}_${Math.floor(Math.random() * 1000)}.jpg`,
      url: capturedPhoto,
      type: 'image',
      createdAt: new Date().toISOString()
    };

    onChange([...attachments, newAttachment]);
    stopCamera();
    setCapturedPhoto(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: any) => {
      const reader = new FileReader();
      const isImage = file.type.startsWith('image/');
      
      reader.onload = (event) => {
        if (event.target?.result) {
          const newAttachment: Attachment = {
            id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: file.name,
            url: event.target.result as string,
            type: isImage ? 'image' : 'file',
            createdAt: new Date().toISOString()
          };
          
          onChange([...attachments, newAttachment]);
        }
      };
      
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    onChange(attachments.filter(att => att.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase font-bold tracking-[0.1em] text-brand-gray-light block">
          {label}
        </label>
        <span className="text-xs text-brand-gray-light">{attachments.length} toegevoegd</span>
      </div>

      {/* Upload triggers row */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-3 bg-brand-bg hover:bg-brand-sage-lighter hover:text-brand-olive hover:border-brand-sage-light border border-brand-border rounded-[16px] text-xs font-bold text-brand-gray-dark transition cursor-pointer active:scale-95"
        >
          <Upload className="w-4 h-4 text-brand-gray-light" />
          <span>Bestand Kiezen</span>
        </button>

        <button
          type="button"
          onClick={startCamera}
          className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-3 bg-brand-bg hover:bg-brand-sage-lighter hover:text-brand-olive hover:border-brand-sage-light border border-brand-border rounded-[16px] text-xs font-bold text-brand-gray-dark transition cursor-pointer active:scale-95"
        >
          <Camera className="w-4 h-4 text-brand-gray-light" />
          <span>Foto Maken 📸</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
      </div>

      {/* Live Camera Feed Panel */}
      {isCameraActive && (
        <div className="relative rounded-[24px] overflow-hidden border border-brand-border bg-black aspect-video flex flex-col items-center justify-center shadow-lg">
          {!capturedPhoto ? (
            <>
              {/* Active Camera View */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Camera Overlays / Control Buttons */}
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  type="button"
                  onClick={switchCamera}
                  title="Camera omdraaien"
                  className="p-2.5 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-xs transition"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="p-2.5 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-xs transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {cameraError && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center text-white">
                  <AlertCircle className="w-8 h-8 text-brand-peach mb-2" />
                  <p className="text-xs font-semibold">{cameraError}</p>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-xs font-bold text-white transition"
                  >
                    Sluiten
                  </button>
                </div>
              )}

              {/* Shutter Button */}
              {!cameraError && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="w-14 h-14 rounded-full border-4 border-white bg-red-500 hover:bg-red-600 active:scale-95 transition shadow-lg flex items-center justify-center cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full border-2 border-transparent bg-white/40" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Photo Preview View */}
              <img
                src={capturedPhoto}
                alt="Captured placeholder"
                className="w-full h-full object-cover"
              />

              {/* Action options */}
              <div className="absolute inset-0 bg-black/30 flex flex-col justify-between p-4">
                <span className="self-start text-[10px] tracking-wider uppercase font-bold text-white bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-xs">
                  Foto Preview
                </span>
                
                <div className="flex gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => setCapturedPhoto(null)}
                    className="px-5 py-2.5 rounded-full bg-red-500 hover:bg-red-650 text-white text-xs font-bold shadow-md transition active:scale-95 flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Opnieuw
                  </button>
                  <button
                    type="button"
                    onClick={acceptPhoto}
                    className="px-5 py-2.5 rounded-full bg-brand-sage hover:bg-brand-sage/90 text-white text-xs font-bold shadow-md transition active:scale-95 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Toevoegen
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Attachments list / grid */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="relative group border border-brand-border rounded-[16px] aspect-square overflow-hidden bg-brand-bg flex flex-col justify-between"
            >
              {att.type === 'image' ? (
                <img
                  src={att.url}
                  alt={att.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-3 text-center">
                  <FileText className="w-8 h-8 text-brand-gray-light mb-1" />
                  <span className="text-[10px] font-semibold text-brand-gray-dark truncate w-full" title={att.name}>
                    {att.name}
                  </span>
                </div>
              )}

              {/* Delete Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 active:scale-95 transition"
                  title="Bijlage verwijderen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Label bar on normal view */}
              <div className="absolute bottom-0 inset-x-0 bg-white/90 border-t border-brand-border py-1 px-2 flex items-center justify-between text-[8px] font-bold text-brand-gray truncate">
                <span className="truncate">{att.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
