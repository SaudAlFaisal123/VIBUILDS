'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

const MENU_ITEMS = [
  { id: 'start', label: 'START GAME' },
  { id: 'about', label: 'ABOUT US' },
  { id: 'profile-saud', label: 'PROFILE: SAUD' },
  { id: 'profile-rafay', label: 'PROFILE: RAFAY' },
  { id: 'contact', label: 'CONTACT' },
  { id: 'exit', label: 'EXIT GAME' },
];

export default function Home() {
  // Navigation & Exit States
  const [activeTab, setActiveTab] = useState('start');
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [hasExited, setHasExited] = useState(false);

  // Cinematic Loading Screen States
  const [appState, setAppState] = useState<'loading' | 'waiting' | 'fadingToBlack' | 'blackScreen' | 'fadingToGame' | 'ready'>('loading');
  const [progress, setProgress] = useState(0);

  // 1. Fake Loading Bar Logic (Random jumps and pauses)
  useEffect(() => {
    if (appState !== 'loading') return;
    let currentProgress = 0;

    const loadStep = () => {
      // Jump forward a random amount between 2% and 15%
      const jump = Math.floor(Math.random() * 14) + 2;
      currentProgress += jump;
      if (currentProgress >= 100) currentProgress = 100;
      setProgress(currentProgress);

      if (currentProgress < 100) {
        // 30% chance the loading bar "gets stuck" to make it feel real
        const isStuck = Math.random() > 0.7;
        const delay = isStuck
          ? Math.floor(Math.random() * 1500) + 1000 // Stuck for 1 to 2.5 seconds
          : Math.floor(Math.random() * 300) + 50;   // Fast jump

        setTimeout(loadStep, delay);
      } else {
        // When it hits 100%, wait half a second then show "PRESS ENTER"
        setTimeout(() => setAppState('waiting'), 500);
      }
    };

    setTimeout(loadStep, 800); // Initial delay before bar starts moving
  }, [appState]);

  // 2. Cinematic Enter Key Logic
  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && appState === 'waiting') {
        // Step 1: Fade out the loading image
        setAppState('fadingToBlack');
        
        setTimeout(() => {
          // Step 2: Hold pure black screen
          setAppState('blackScreen');
          
          setTimeout(() => {
            // Step 3: Fade the black screen to reveal the Main Menu
            setAppState('fadingToGame');
            
            setTimeout(() => {
              // Step 4: Done.
              setAppState('ready');
            }, 1000); 
          }, 2000); // 2 second black screen hold
        }, 1000); // 1 second image fade
      }
    };
    window.addEventListener('keydown', handleEnter);
    return () => window.removeEventListener('keydown', handleEnter);
  }, [appState]);

  // Handle Menu Navigation
  const changeTab = (tabId: string) => {
    if (tabId === 'exit') {
      setShowExitConfirm(true);
      return;
    }
    setActiveTab(tabId);
    if (tabId === 'about') setSelectedChar(null);
    window.dispatchEvent(new CustomEvent('menuChange', { detail: tabId }));
  };

  const checkIsActive = (itemId: string) => {
    if (itemId === 'about') return activeTab === 'about' && selectedChar === null;
    return activeTab === itemId;
  };

  const handleExitGame = () => {
    window.close();
    setHasExited(true);
  };

  // Listen for Escape and Backspace to return to menu (Only works if loading is done)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (appState !== 'ready') return; // Disable during loading screen
      
      if (e.key === 'Escape' || e.key === 'Backspace') {
        if (activeTab !== 'start' && !showExitConfirm) {
          changeTab('start');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, showExitConfirm, appState]);

  if (hasExited) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <p className="font-grillmaster text-2xl tracking-[0.3em] text-white/30 uppercase animate-pulse">
          Connection Terminated. You may close this tab.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ========================================== */}
      {/* CINEMATIC LOADING OVERLAY                  */}
      {/* ========================================== */}
      {appState !== 'ready' && (
        <div 
          className={`fixed inset-0 z-[999] bg-black transition-opacity duration-1000 ease-in-out ${
            appState === 'fadingToGame' ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Loading Background Image */}
          <div
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              appState === 'fadingToBlack' || appState === 'blackScreen' || appState === 'fadingToGame' 
                ? 'opacity-0' 
                : 'opacity-100'
            }`}
          >
            <Image src="/assets/loading-page.png" alt="Loading" fill className="object-cover" priority />
          </div>
          
          {/* Bottom HUD: Progress Bar or Enter Text */}
          {(appState === 'loading' || appState === 'waiting') && (
            <div className="absolute bottom-[16%] left-1/2 -translate-x-1/2 flex w-[35%] max-w-[500px] flex-col items-center justify-center z-10 transition-opacity duration-300">
              {appState === 'loading' ? (
                <div className="h-3 w-full rounded-sm border border-white/20 bg-black/80 p-0.5 shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-sm">
                  <div
                    className="h-full bg-hud-pink shadow-[0_0_10px_rgba(255,0,85,0.8)] transition-all duration-[400ms] ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              ) : (
                <p className="font-triumvirate text-3xl text-white mt-12 whitespace-nowrap animate-pulse">
                  PRESS ENTER TO CONTINUE
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* MAIN GAME APPLICATION                      */}
      {/* ========================================== */}
      <main className="relative h-screen w-screen overflow-hidden">
        
        {/* EXIT CONFIRMATION MODAL */}
        {showExitConfirm && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="flex flex-col items-center rounded border border-white/20 bg-black/80 px-12 py-10 shadow-[0_0_30px_rgba(255,0,85,0.4)]">
              <h3 className="font-triumvirate text-4xl text-white uppercase mb-8 tracking-wider">Are you sure you want to exit?</h3>
              <div className="flex gap-12">
                <button 
                  onClick={handleExitGame} 
                  className="font-triumvirate text-3xl text-white hover:text-hud-pink hover:scale-110 transition-all duration-200 uppercase drop-shadow-md"
                >
                  YES
                </button>
                <button 
                  onClick={() => { setShowExitConfirm(false); changeTab('start'); }} 
                  className="font-triumvirate text-3xl text-white hover:text-yellow-400 hover:scale-110 transition-all duration-200 uppercase drop-shadow-md"
                >
                  NO
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BACKGROUNDS */}
        <div className={`absolute inset-0 -z-10 transition-opacity duration-700 ${activeTab === 'start' ? 'opacity-100' : 'opacity-0'}`}>
          <Image src="/assets/bg-1.png" alt="Start Background" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent"></div>
        </div>
        
        <div className={`absolute inset-0 -z-10 transition-opacity duration-700 ${activeTab === 'about' ? 'opacity-100' : 'opacity-0'}`}>
          <Image src="/assets/bg-2.jpg" alt="About Background" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        </div>

        <div className={`absolute inset-0 -z-10 transition-opacity duration-700 ${activeTab === 'profile-saud' ? 'opacity-100' : 'opacity-0'}`}>
          <Image src="/assets/bg-3.jpg" alt="Saud Profile Background" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        </div>

        <div className={`absolute inset-0 -z-10 transition-opacity duration-700 ${activeTab === 'profile-rafay' ? 'opacity-100' : 'opacity-0'}`}>
          <Image src="/assets/bg-4.png" alt="Rafay Profile Background" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        </div>

        <div className={`absolute inset-0 -z-10 transition-opacity duration-700 ${activeTab === 'contact' ? 'opacity-100' : 'opacity-0'}`}>
          <Image src="/assets/bg-5.jpg" alt="Contact Background" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
        </div>

        {/* ESC BUTTON */}
        {activeTab !== 'start' && (
          <button 
            onClick={() => { changeTab('start'); setSelectedChar(null); }}
            className="absolute left-12 top-10 z-50 flex cursor-pointer items-center gap-3 font-grillmaster text-white/70 transition-colors hover:text-white"
          >
            <span className="rounded border border-white/30 bg-black/40 px-2 py-0.5 text-sm tracking-widest">ESC</span> 
            <span className="text-xl tracking-widest">BACK TO MENU</span>
          </button>
        )}

        {/* MAIN MENU */}
        <div className={`absolute inset-0 flex flex-col justify-start pl-16 pt-28 transition-all duration-500 ease-in-out ${activeTab === 'start' ? 'translate-x-0 opacity-100 z-20' : '-translate-x-12 opacity-0 pointer-events-none -z-10'}`}>
          
          <div className="mb-6 ml-4">
            <h1 className="font-triumvirate text-6xl leading-[0.85] tracking-tight text-white drop-shadow-2xl">
              VI<br />BUILDS
            </h1>
            <h2 className="font-buttersweet -mt-2 ml-10 text-4xl text-hud-pink drop-shadow-lg">
              Portfolio
            </h2>
          </div>

          <nav className="flex w-72 flex-col gap-0.5">
            {MENU_ITEMS.map((item) => {
              const isActive = checkIsActive(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => changeTab(item.id)}
                  className={`flex w-full cursor-pointer items-center justify-between px-4 py-1.5 transition-all duration-150 ${
                    isActive 
                      ? 'bg-hud-pink shadow-[0_0_15px_rgba(255,0,85,0.4)]' 
                      : 'border-l-4 border-transparent hover:bg-white/10'
                  }`}
                >
                  <span className={`font-gendis text-xl tracking-wider uppercase transition-colors ${isActive ? 'text-white' : 'text-white/70 hover:text-white'}`}>
                    {item.label}
                  </span>
                  {isActive && <span className="font-gendis text-lg text-white">&gt;</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ABOUT US SCREEN */}
        <div className={`absolute inset-0 flex transition-all duration-700 delay-100 ${activeTab === 'about' ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
          <div className="flex w-[55%] flex-col justify-start pl-16 pt-24">
            <div className="mb-6 ml-4">
              <h1 className="font-triumvirate text-6xl leading-[0.9] tracking-tight text-white drop-shadow-2xl uppercase">ABOUT</h1>
              <h2 className="font-buttersweet -mt-3 ml-12 text-5xl text-hud-orange drop-shadow-lg">Us</h2>
            </div>
            <div className="ml-4 w-[480px]">
              {!selectedChar ? (
                <div className="animate-pulse rounded border border-white/10 bg-black/40 p-5 backdrop-blur-sm">
                  <p className="font-gendis text-xl tracking-widest text-hud-pink uppercase">&gt; SELECT A CHARACTER TO VIEW PROFILE</p>
                </div>
              ) : selectedChar === 'saud' ? (
                <div className="animate-[fadeIn_0.3s_ease-out] flex flex-col items-start space-y-3">
                  <p className="font-gendis mb-4 text-sm leading-relaxed text-white/90 uppercase">
                    Hey, I&apos;m Saud. A Full-Stack Engineer (MERN) focused on building secure, data-driven production systems with scalable architectures and optimized APIs.
                  </p>
                  <StatBox label="ROLE" value="Full-Stack Engineer (MERN)" iconColor="bg-hud-orange" />
                  <StatBox label="LOCATION" value="Karachi, Pakistan" iconColor="bg-hud-blue" />
                  <StatBox label="STATUS" value="Building data-driven production systems" iconColor="bg-hud-pink" />
                  
                  <a 
                    href="/assets/Saud_Resume.pdf" 
                    download="Saud_Resume.pdf"
                    className="mt-6 inline-flex cursor-pointer items-center gap-3 bg-gradient-to-r from-hud-pink to-red-600 px-6 py-2 transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,0,85,0.5)]"
                  >
                    <span className="font-triumvirate text-xl tracking-wider text-white uppercase">DOWNLOAD RESUME</span>
                    <span className="font-triumvirate text-lg text-white">&gt;</span>
                  </a>
                </div>
              ) : (
                <div className="animate-[fadeIn_0.3s_ease-out] flex flex-col items-start space-y-3">
                  <p className="font-gendis mb-4 text-sm leading-relaxed text-white/90 uppercase">
                    Hey, I&apos;m Rafay. A Software Engineering graduate combining backend development with software testing to engineer flawless API systems and RAG pipelines.
                  </p>
                  <StatBox label="ROLE" value="Backend Developer & SQA" iconColor="bg-hud-orange" />
                  <StatBox label="LOCATION" value="Karachi, Pakistan" iconColor="bg-hud-blue" />
                  <StatBox label="STATUS" value="Building AI-driven RAG pipelines" iconColor="bg-hud-pink" />
                  
                  <a 
                    href="/assets/Rafay_Resume.pdf" 
                    download="Rafay_Resume.pdf"
                    className="mt-6 inline-flex cursor-pointer items-center gap-3 bg-gradient-to-r from-hud-orange to-yellow-600 px-6 py-2 transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,170,0,0.5)]"
                  >
                    <span className="font-triumvirate text-xl tracking-wider text-white uppercase">DOWNLOAD RESUME</span>
                    <span className="font-triumvirate text-lg text-white">&gt;</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="absolute -bottom-16 right-20 flex h-[100vh] items-end justify-center -space-x-12 z-10">
            <div className={`relative h-[95%] w-[550px] cursor-pointer transition-all duration-300 ease-out hover:z-30 ${selectedChar === 'rafay' ? 'scale-[1.03] brightness-110 drop-shadow-[0_0_25px_rgba(255,170,0,0.6)] z-20' : 'brightness-50 grayscale-[40%] hover:scale-[1.01] hover:brightness-90 hover:grayscale-0 z-10'}`} onClick={() => setSelectedChar('rafay')}>
              <Image src="/assets/img1.png" alt="Rafay" width={900} height={1400} className="h-full w-full object-cover object-top drop-shadow-2xl" />
            </div>
            <div className={`relative h-[95%] w-[550px] cursor-pointer transition-all duration-300 ease-out hover:z-30 ${selectedChar === 'saud' ? 'scale-[1.03] brightness-110 drop-shadow-[0_0_25px_rgba(255,0,85,0.6)] z-20' : 'brightness-50 grayscale-[40%] hover:scale-[1.01] hover:brightness-90 hover:grayscale-0 z-10'}`} onClick={() => setSelectedChar('saud')}>
              <Image src="/assets/img2.png" alt="Saud" width={900} height={1400} className="h-full w-full object-cover object-top drop-shadow-2xl" />
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* DEDICATED PROFILE PAGE: SAUD */}
        {/* ========================================== */}
        <div className={`absolute inset-0 flex transition-all duration-700 delay-100 ${activeTab === 'profile-saud' ? 'translate-y-0 opacity-100 z-20' : 'translate-y-12 opacity-0 pointer-events-none -z-10'}`}>
          <div className="flex w-full flex-col justify-start pl-16 pt-24">
            <div className="mb-12 ml-4">
              <h1 className="font-triumvirate text-6xl leading-[0.9] tracking-tight text-white drop-shadow-2xl uppercase">PROFILE</h1>
              <h2 className="font-buttersweet -mt-3 ml-12 text-5xl text-hud-pink drop-shadow-lg">Saud</h2>
            </div>
            <div className="ml-4 w-[85vw] max-w-[1500px] h-[55vh] overflow-y-auto pr-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex flex-col gap-6 pb-12 pt-8 px-4 -ml-4">
                <div className="w-full">
                  <ProfileBox title="ABOUT ME" accentColor="pink">
                    I AM A FULL-STACK ENGINEER (MERN) WITH HANDS-ON EXPERIENCE BUILDING AND MAINTAINING SECURE, DATA-DRIVEN PRODUCTION SYSTEMS FOR 100+ CONCURRENT USERS. SKILLED IN DESIGNING SCALABLE BACKEND ARCHITECTURE, REST APIS, AND DATABASE SCHEMAS WITH A STRONG FOCUS ON DATA INTEGRITY, PERFORMANCE, AND RELIABILITY IN FAST-PACED ENVIRONMENTS.
                  </ProfileBox>
                </div>
                <div className="flex justify-between w-full gap-12">
                  <div className="flex w-[48%] flex-col gap-6">
                    <ProfileBox title="EXPERIENCE" accentColor="pink">
                      <h4 className="text-white font-bold tracking-wide uppercase">Frontend Engineer</h4>
                      <p className="text-hud-orange text-xs mt-0.5 mb-2 uppercase tracking-wide">Crafty Automation | Jan 2025 - Mar 2026</p>
                      <p className="leading-relaxed text-sm uppercase">CUT AVERAGE PAGE LOAD TIME BY 20% ACROSS 3+ PRODUCTION WEB APPS. REDUCED CLIENT-REPORTED UI BUGS BY 15% BY WRITING JEST UNIT TESTS AND TRANSLATING BUSINESS REQUIREMENTS INTO TYPE-SAFE TYPESCRIPT INTERFACES. MAINTAINED 100% BRAND-SPEC ADHERENCE ACROSS 5+ CLIENT SITES.</p>
                    </ProfileBox>
                    <ProfileBox title="PROJECTS" accentColor="pink">
                      <div className="mb-4 border-b border-white/10 pb-3">
                        <h4 className="text-white font-bold tracking-wide uppercase">HireAI - AI-Enhanced Job Portal</h4>
                        <p className="text-hud-pink text-xs mt-0.5 mb-2 uppercase tracking-wide">Full-Stack Developer | Oct 2025 - Feb 2026</p>
                        <p className="leading-relaxed text-sm uppercase">ARCHITECTED A MONGODB SCHEMA AND REST API LAYER TO SECURELY MANAGE SENSITIVE USER DATA FOR 100+ PROJECTED USERS. CUT BACKEND RESPONSE LATENCY BY 10%+ BY OPTIMIZING NODE.JS/EXPRESS ROUTES.</p>
                      </div>
                      <div>
                        <h4 className="text-white font-bold tracking-wide uppercase">Meridian Bank</h4>
                        <p className="text-hud-pink text-xs mt-0.5 mb-2 uppercase tracking-wide">Full-Stack Developer | 2024</p>
                        <p className="leading-relaxed text-sm uppercase">DESIGNED AND BUILT A FULL-STACK BANKING SYSTEM WITH JWT-BASED AUTHENTICATION, ROLE-BASED ACCESS CONTROL, AND ATOMIC, ALL-OR-NOTHING UPDATES TO KEEP LINKED ACCOUNT BALANCES CONSISTENT.</p>
                      </div>
                    </ProfileBox>
                  </div>
                  <div className="flex w-[48%] flex-col gap-6">
                    <ProfileBox title="SKILLS" accentColor="pink">
                      <div className="space-y-4 uppercase text-sm">
                        <div>
                          <span className="text-hud-pink font-bold tracking-wide text-xs">Languages:</span>
                          <p>JAVASCRIPT, TYPESCRIPT, PYTHON, C#, HTML5, CSS3, SQL</p>
                        </div>
                        <div>
                          <span className="text-hud-pink font-bold tracking-wide text-xs">Frontend:</span>
                          <p>REACT.JS, REDUX TOOLKIT, TAILWIND CSS, BOOTSTRAP</p>
                        </div>
                        <div>
                          <span className="text-hud-pink font-bold tracking-wide text-xs">Backend & Database:</span>
                          <p>NODE.JS, EXPRESS.JS, DJANGO, REST APIS, MONGODB, POSTGRESQL, SQL SERVER, SQLITE</p>
                        </div>
                        <div>
                          <span className="text-hud-pink font-bold tracking-wide text-xs">Testing & Tools:</span>
                          <p>JEST, GIT, POSTMAN, AGILE/SCRUM</p>
                        </div>
                      </div>
                    </ProfileBox>
                    <ProfileBox title="ACHIEVEMENTS" accentColor="pink">
                      <ul className="list-disc pl-4 space-y-2 uppercase text-sm">
                        <li>RUNNER-UP, UNIVERSITY-LEVEL SOFTWARE DEVELOPMENT COMPETITION (MERN STACK WEB APPLICATION).</li>
                        <li>BACHELORS OF SOFTWARE ENGINEERING (2022 - 2026), BAHRIA UNIVERSITY KARACHI CAMPUS.</li>
                      </ul>
                    </ProfileBox>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* DEDICATED PROFILE PAGE: RAFAY */}
        {/* ========================================== */}
        <div className={`absolute inset-0 flex transition-all duration-700 delay-100 ${activeTab === 'profile-rafay' ? 'translate-y-0 opacity-100 z-20' : 'translate-y-12 opacity-0 pointer-events-none -z-10'}`}>
          <div className="flex w-full flex-col justify-start pl-16 pt-24">
            <div className="mb-12 ml-4">
              <h1 className="font-triumvirate text-6xl leading-[0.9] tracking-tight text-white drop-shadow-2xl uppercase">PROFILE</h1>
              <h2 className="font-buttersweet -mt-3 ml-12 text-5xl text-hud-orange drop-shadow-lg">Rafay</h2>
            </div>
            <div className="ml-4 w-[85vw] max-w-[1500px] h-[55vh] overflow-y-auto pr-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex flex-col gap-6 pb-12 pt-8 px-4 -ml-4">
                <div className="w-full">
                  <ProfileBox title="ABOUT ME" accentColor="orange">
                    I AM A SOFTWARE ENGINEERING GRADUATE WITH HANDS-ON EXPERIENCE IN BOTH BACKEND DEVELOPMENT AND SOFTWARE TESTING. I HAVE BUILT PROJECTS IN RESTFUL API DESIGN (C# / .NET), NLP-BASED APPLICATIONS, AND RETRIEVAL-AUGMENTED GENERATION. EXPERIENCED IN AGILE ENVIRONMENTS, API TESTING, AND DEFECT LIFECYCLE MANAGEMENT.
                  </ProfileBox>
                </div>
                <div className="flex justify-between w-full gap-12">
                  <div className="flex w-[48%] flex-col gap-6">
                    <ProfileBox title="EXPERIENCE" accentColor="orange">
                      <h4 className="text-white font-bold tracking-wide uppercase">SQA Intern</h4>
                      <p className="text-hud-pink text-xs mt-0.5 mb-2 uppercase tracking-wide">Paysys Labs Pvt. Ltd. | Oct 2025 - Jan 2026</p>
                      <p className="leading-relaxed text-sm uppercase">DESIGNED AND EXECUTED API TEST CASES TO VALIDATE BACKEND WORKFLOWS AND EDGE-CASE HANDLING ACROSS MULTIPLE MICROSERVICES. TRACKED AND DOCUMENTED SOFTWARE DEFECTS THROUGH A STRUCTURED DEFECT LIFECYCLE IN AN AGILE ENVIRONMENT.</p>
                    </ProfileBox>
                    <ProfileBox title="PROJECTS" accentColor="orange">
                      <div className="mb-4 border-b border-white/10 pb-3">
                        <h4 className="text-white font-bold tracking-wide uppercase">Payroll Management System API</h4>
                        <p className="text-hud-orange text-xs mt-0.5 mb-2 uppercase tracking-wide">C# / .NET, SQL Server | 2025</p>
                        <p className="leading-relaxed text-sm uppercase">BUILT A RESTFUL BACKEND API FOR PAYROLL OPERATIONS WITH ROLE-BASED ACCESS CONTROL AND A NORMALISED SQL SERVER SCHEMA.</p>
                      </div>
                      <div>
                        <h4 className="text-white font-bold tracking-wide uppercase">Medical Report Explainer Chatbot</h4>
                        <p className="text-hud-orange text-xs mt-0.5 mb-2 uppercase tracking-wide">Python, LangChain, FAISS | 2025</p>
                        <p className="leading-relaxed text-sm uppercase">BUILT A STREAMLIT APP THAT CONVERTS MEDICAL REPORTS INTO PLAIN-LANGUAGE SUMMARIES USING A RAG PIPELINE WITH SEMANTIC RETRIEVAL AND PROMPT ENGINEERING.</p>
                      </div>
                    </ProfileBox>
                  </div>
                  <div className="flex w-[48%] flex-col gap-6">
                    <ProfileBox title="SKILLS" accentColor="orange">
                      <div className="space-y-4 uppercase text-sm">
                        <div>
                          <span className="text-hud-orange font-bold tracking-wide text-xs">Languages & Frameworks:</span>
                          <p>PYTHON, C#, ASP.NET CORE, FASTAPI, SQL</p>
                        </div>
                        <div>
                          <span className="text-hud-orange font-bold tracking-wide text-xs">AI, ML & NLP:</span>
                          <p>LANGCHAIN, HUGGING FACE, FAISS, RAG PIPELINES, PROMPT ENGINEERING</p>
                        </div>
                        <div>
                          <span className="text-hud-orange font-bold tracking-wide text-xs">Testing, DevOps & DB:</span>
                          <p>API TESTING, DEFECT LIFECYCLE, DOCKER, GIT, GITHUB ACTIONS, SQL SERVER, SQLITE</p>
                        </div>
                      </div>
                    </ProfileBox>
                    <ProfileBox title="ACHIEVEMENTS" accentColor="orange">
                      <ul className="list-disc pl-4 space-y-2 uppercase text-sm">
                        <li>MACHINE LEARNING SPECIALISATION - DEEPLEARNING.AI / STANFORD UNIVERSITY.</li>
                        <li>GENERATIVE AI - ICODEGURU.</li>
                        <li>DOCKER TRAINING COURSE - KODEKLOUD.</li>
                        <li>BACHELOR OF SOFTWARE ENGINEERING (JUN 2026), BAHRIA UNIVERSITY KARACHI CAMPUS.</li>
                      </ul>
                    </ProfileBox>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* DEDICATED PAGE: CONTACT US                 */}
        {/* ========================================== */}
        <div className={`absolute inset-0 flex transition-all duration-700 delay-100 ${activeTab === 'contact' ? 'translate-y-0 opacity-100 z-20' : 'translate-y-12 opacity-0 pointer-events-none -z-10'}`}>
          <div className="flex h-full w-[800px] flex-col justify-center pl-16 pb-12">
            
            <div className="mb-8 ml-4">
              <h1 className="font-triumvirate text-7xl leading-[0.9] tracking-tight text-white drop-shadow-2xl uppercase italic">CONTACT US</h1>
              <h2 className="font-buttersweet -mt-2 ml-12 text-5xl text-cyan-400 drop-shadow-lg">Let&apos;s Connect</h2>
            </div>

            <div className="ml-4 flex flex-col gap-5">
              
              {/* Dual Email */}
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-cyan-600/30 border border-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.3)]">
                  <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-gendis text-xs text-white/50 tracking-widest uppercase">EMAIL</span>
                  <span className="font-sans text-sm font-medium text-white/90">saudalfaisal65@gmail.com</span>
                  <span className="font-sans text-sm font-medium text-white/90 mt-0.5">sarafay2003@gmail.com</span>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-cyan-600/30 border border-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.3)]">
                  <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-gendis text-xs text-white/50 tracking-widest uppercase">LOCATION</span>
                  <span className="font-sans text-sm font-medium text-white/90">Karachi, Pakistan</span>
                </div>
              </div>

              {/* Dual LinkedIn */}
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-cyan-600/30 border border-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.3)]">
                  <svg className="h-5 w-5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-gendis text-xs text-white/50 tracking-widest uppercase">LINKEDIN</span>
                  <span className="font-sans text-sm font-medium text-white/90">linkedin.com/in/saudalfaisal123</span>
                  <span className="font-sans text-sm font-medium text-white/90 mt-0.5">linkedin.com/in/syed-rafay-a25669324</span>
                </div>
              </div>

              {/* Dual Instagram */}
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-cyan-600/30 border border-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.3)]">
                  <svg className="h-5 w-5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </div>
              <div className="flex flex-col">
                <span className="font-gendis text-xs text-white/50 tracking-widest uppercase">INSTAGRAM</span>
                <span className="font-sans text-sm font-medium text-white/90">@saudd07_</span>
                <span className="font-sans text-sm font-medium text-white/90 mt-0.5">@sarafay2003</span>
              </div>
            </div>
          </div>

          <a 
            href="mailto:saudalfaisal65@gmail.com,sarafay2003@gmail.com"
            className="mt-10 ml-4 inline-flex w-[240px] cursor-pointer items-center justify-between bg-gradient-to-r from-cyan-600/80 to-blue-800/80 px-6 py-3 transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] border border-cyan-400/50 backdrop-blur-sm rounded-sm"
          >
            <span className="font-triumvirate text-xl tracking-wider text-white uppercase">SEND MESSAGE</span>
            <span className="font-triumvirate text-lg text-white">&gt;</span>
          </a>

        </div>
      </div>
    </main>
    </>
  );
}

function StatBox({ label, value, iconColor }: { label: string, value: string, iconColor: string }) {
  return (
    <div className="flex w-full items-center gap-4 bg-black/40 p-2.5 shadow-md border-l border-white/10 backdrop-blur-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-white/10">
        <div className={`h-3 w-3 rotate-45 ${iconColor}`}></div>
      </div>
      <div className="flex flex-col">
        <span className="font-triumvirate text-xl tracking-wider text-white uppercase leading-none">{label}</span>
        <span className="font-gendis text-xs text-white/70 mt-1 uppercase tracking-wide">{value}</span>
      </div>
    </div>
  );
}

function ProfileBox({ title, children, accentColor = 'pink' }: { title: string, children: React.ReactNode, accentColor?: 'pink' | 'orange' }) {
  const isOrange = accentColor === 'orange';
  const hoverBorder = isOrange ? 'hover:border-hud-orange' : 'hover:border-hud-pink';
  const hoverBg = isOrange ? 'hover:bg-hud-orange/10' : 'hover:bg-hud-pink/10';
  const hoverShadow = isOrange ? 'hover:shadow-[0_0_20px_rgba(255,170,0,0.4)]' : 'hover:shadow-[0_0_20px_rgba(255,0,85,0.4)]';
  const titleColor = isOrange ? 'text-hud-orange' : 'text-hud-pink';

  return (
    <div className={`group relative flex flex-col rounded border border-white/20 bg-black/40 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 ${hoverBorder} ${hoverBg} ${hoverShadow}`}>
      <h3 className={`font-triumvirate text-2xl tracking-wider mb-3 uppercase ${titleColor}`}>{title}</h3>
      <div className="font-gendis text-white/80 text-sm leading-relaxed">{children}</div>
    </div>
  );
}