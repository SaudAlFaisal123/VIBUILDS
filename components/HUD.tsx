'use client';

import { useState, useEffect, useRef } from 'react';

export default function HUD() {
  const [time, setTime] = useState('00:00');
  const [countdown, setCountdown] = useState({ d: 109, h: 18, m: 16, s: 32 });
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [activeTab, setActiveTab] = useState('start');

  useEffect(() => {
    setIsMounted(true);
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      setCountdown((prev) => {
        let { d, h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; d--; }
        return { d, h, m, s };
      });
    };
    
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleTabChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setActiveTab(customEvent.detail);
    };
    window.addEventListener('menuChange', handleTabChange);
    return () => window.removeEventListener('menuChange', handleTabChange);
  }, []);

  useEffect(() => {
    const tryPlayAudio = () => {
      if (audioRef.current && isPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn('Browser blocked auto-play. Waiting for user interaction.');
          setIsPlaying(false); 
          const onInteract = () => {
            if (audioRef.current) {
              audioRef.current.play();
              setIsPlaying(true);
            }
            document.removeEventListener('click', onInteract);
          };
          document.addEventListener('click', onInteract);
        });
      }
    };
    tryPlayAudio();
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Dynamically calculate star count, width percentage, and bar colors based on the current page
  const getStarConfig = () => {
    switch(activeTab) {
      case 'start': return { count: 1, width: '20%', color: 'text-hud-pink', barColor: 'from-pink-700 to-hud-pink' };
      case 'about': return { count: 2, width: '40%', color: 'text-hud-orange', barColor: 'from-orange-600 to-hud-orange' };
      case 'profile-saud': return { count: 3, width: '60%', color: 'text-hud-pink', barColor: 'from-pink-700 to-hud-pink' };
      case 'profile-rafay': return { count: 4, width: '80%', color: 'text-hud-orange', barColor: 'from-orange-600 to-hud-orange' };
      case 'contact': return { count: 5, width: '100%', color: 'text-cyan-400', barColor: 'from-blue-600 to-cyan-400' };
      default: return { count: 1, width: '20%', color: 'text-hud-pink', barColor: 'from-pink-700 to-hud-pink' };
    }
  };

  const { count: activeStars, color: starColor, width: barWidth, barColor } = getStarConfig();

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex h-full w-full flex-col justify-between p-8">
      <audio ref={audioRef} src="/assets/gta-theme-song.mp3" loop autoPlay />

      {/* TOP HUD SECTION */}
      <div className="flex w-full items-start justify-between">
        <div className="flex-1"></div>

        {/* Top Center: Music Player & Countdown */}
        <div className="-mt-2 flex flex-1 flex-col items-center justify-start">
          <div className="pointer-events-auto flex w-40 items-center justify-between rounded-full border border-white/10 bg-black/80 px-4 py-2 shadow-lg backdrop-blur-md">
            <div className="flex h-4 items-end gap-1">
              {[1, 2, 3, 4].map((bar) => (
                <div 
                  key={bar} 
                  className={`w-1 rounded-t-sm bg-hud-pink transition-all duration-75 ${
                    isPlaying ? 'animate-pulse' : 'h-1'
                  }`}
                  style={{
                    height: isMounted && isPlaying ? `${Math.random() * 100}%` : '4px',
                    animationDelay: `${bar * 0.15}s`
                  }}
                ></div>
              ))}
            </div>
            
            <button onClick={toggleMusic} className="text-white transition-colors hover:text-hud-pink">
              {isPlaying ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 10v4a2 2 0 002 2h2.586l3.707 3.707a1 1 0 001.707-.707V4.707a1 1 0 00-1.707-.707L9.586 8H7a2 2 0 00-2 2z"></path></svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path></svg>
              )}
            </button>
          </div>

          <div className="mt-8 flex flex-col items-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <span className="font-heroic text-sm uppercase tracking-[0.2em] text-hud-pink">
              LEONIDA DROPS IN
            </span>
            <div className="font-gendis mt-0.5 flex items-baseline gap-1.5 text-3xl text-white">
              <span>{countdown.d}</span><span className="text-xl text-white/70">d</span>
              <span>{countdown.h}</span><span className="text-xl text-white/70">h</span>
              <span>{countdown.m}</span><span className="text-xl text-white/70">m</span>
              <span>{countdown.s}</span><span className="text-xl text-white/70">s</span>
            </div>
          </div>
        </div>

        {/* Top Right: Stats & Profile Box */}
        <div className="flex flex-1 justify-end gap-3 text-right">
          <div className="flex flex-col items-end">
            
            <div className="font-triumvirate text-5xl tracking-widest text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
              {isMounted ? time : '00:00'}
            </div>
            
            <div className="font-triumvirate mt-1 text-4xl text-hud-green drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
              <span className="font-sans font-bold pr-1 text-3xl">$</span>
              {activeTab === 'profile-saud' ? '8,500,000' : activeTab === 'profile-rafay' ? '7,250,000' : activeTab === 'contact' ? '3,000,000' : activeTab === 'about' ? '1,425,000' : '1,250,000'}
            </div>
            
            <div className="font-grillmaster mt-1 flex items-center gap-1 text-2xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              <svg className={`h-4 w-4 fill-current ${activeTab === 'contact' ? 'text-cyan-400' : activeTab !== 'start' ? 'text-hud-orange' : 'text-hud-pink'}`} viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
              <span>100</span>
            </div>
            
            {/* DYNAMIC PROGRESS BAR */}
            <div className="mt-1 h-1.5 w-36 border border-white/20 bg-black/60 shadow-[0_0_5px_rgba(0,0,0,0.5)] overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r transition-all duration-500 ease-out ${barColor}`}
                style={{ width: barWidth }}
              ></div>
            </div>

            {/* Dynamic Star Loading System */}
            <div className="mt-2 flex gap-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {[...Array(6)].map((_, i) => (
                <StarIcon 
                  key={i} 
                  filled={i < activeStars} 
                  color={starColor} 
                />
              ))}
            </div>
          </div>

          <div className="pointer-events-auto group flex h-20 w-20 cursor-pointer items-center justify-center rounded border-2 border-white/30 bg-black/40 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-sm transition-all duration-300 hover:border-hud-pink hover:bg-hud-pink/20 hover:shadow-[0_0_25px_rgba(255,0,85,0.7)]">
            <span className="font-grillmaster text-4xl text-white/80 transition-all duration-300 group-hover:scale-110 group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
              VI
            </span>
          </div>
        </div>
      </div>

      {/* BOTTOM HUD SECTION */}
      <div className="flex w-full items-end justify-between">
        <div className="flex gap-4">
          <div className="relative h-32 w-48 overflow-hidden rounded-sm border-2 border-white/50 bg-slate-950/80 shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-xs">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:16px_16px]" />
            <div className={`absolute bottom-6 left-6 h-3.5 w-3.5 animate-pulse rounded-full border-2 border-white shadow-[0_0_10px_currentColor] ${activeTab === 'contact' ? 'bg-cyan-400 text-cyan-400' : 'bg-hud-pink text-hud-pink'}`} />
            <div className="absolute bottom-8 left-8 h-16 w-16 origin-bottom-left -rotate-45 border-l-2 border-t-2 border-white/20 bg-gradient-to-tr from-white/15 to-transparent" />
          </div>

          <div className="flex flex-col justify-end pb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <span className={`font-heroic text-base uppercase tracking-wider ${activeTab === 'contact' ? 'text-cyan-400' : 'text-hud-pink'}`}>
              CURRENT OBJECTIVE
            </span>
            <span className="font-heroic text-3xl uppercase leading-none tracking-wide text-white">
              {activeTab === 'contact' ? (
                <>OPEN A SECURE<br />LINE OF CONTACT</>
              ) : (
                <>BUILD NEXT LEVEL<br />DIGITAL EXPERIENCES</>
              )}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end pb-1 text-right drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          <p className="font-quietsickless text-2xl text-white/80">
            "Code is my weapon.<br />Creativity is my world."
          </p>
          <p className="font-quietsickless mt-1 text-5xl text-hud-pink">
            — VI
          </p>
        </div>
      </div>
    </div>
  );
}

function StarIcon({ filled, color = 'text-white' }: { filled: boolean, color?: string }) {
  return (
    <svg className={`h-4 w-4 ${filled ? color : 'text-white/20'}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}