import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { useLoading } from "../../contexts/LoadingContext";
import { 
  Search, ShieldAlert, Lock, BarChart3, TrendingUp, 
  Users, Flame, ArrowUpRight, MapPin, Sparkles, CheckCircle2, ChevronLeft, ChevronRight
} from "lucide-react";
import ChatBox from "../../components/chat/ChatBox";
import { io } from "socket.io-client";

export default function Chat() {
  const { userId: urlThreadId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [search, setSearch] = useState("");
  const [isRestricted, setIsRestricted] = useState(false);
  const [restrictionMessage, setRestrictionMessage] = useState("");
  
  const [allCreators, setAllCreators] = useState([]);
  const [virtualPartner, setVirtualPartner] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const isBrand = user?.role === 'brand' || user?.user_type === 'brand';

  // Fetch all creators for contact list when viewer is brand
  useEffect(() => {
    if (isBrand && user) {
      api.get("/creators")
        .then(({ data }) => {
          if (data && Array.isArray(data)) {
            setAllCreators(data);
          }
        })
        .catch(err => console.error("Error loading creators for contact list:", err));
    }
  }, [isBrand, user]);

  // Fetch virtual partner profile (when thread isNew)
  useEffect(() => {
    if (activeThread?.isNew) {
      const partnerId = isBrand ? activeThread.creator_id : activeThread.brand_id;
      if (isBrand && partnerId) {
        api.get(`/creators/${partnerId}`)
          .then(({ data }) => {
            if (data) {
              setVirtualPartner({
                user_id: partnerId,
                name: data.name,
                profile_picture_url: data.photo || data.picture,
                logo_url: data.photo || data.picture,
                profile: data
              });
            }
          })
          .catch(err => {
            console.error("Error fetching creator for virtual thread:", err);
          });
      }
    } else {
      setVirtualPartner(null);
    }
  }, [activeThread?.id, isBrand]);

  // Real-time socket connection for user online presence and message listeners
  useEffect(() => {
    if (!user) return;

    const socket = io(window.location.origin, {
      transports: ["websocket"]
    });

    socket.on("connect", () => {
      socket.emit("register_user", user.user_id || user.id);
      socket.emit("get_online_users");
    });

    socket.on("online_users_list", (users) => {
      setOnlineUsers(users || []);
    });

    socket.on("user_status_change", ({ userId, status }) => {
      setOnlineUsers(prev => {
        if (status === "online") {
          if (prev.includes(userId)) return prev;
          return [...prev, userId];
        } else {
          return prev.filter(id => id !== userId);
        }
      });
    });

    socket.on("thread_updated", () => {
      api.get("/chat/v2/threads").then(({ data }) => {
        if (data) setThreads(data);
      }).catch(err => console.error("Socket thread update error:", err));
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (threads.length === 0) {
      loadThreads();
    } else {
      if (urlThreadId) {
        let t = threads.find((x) => String(x.id) === String(urlThreadId));
        if (!t) {
          t = threads.find(x => String(x.creator_id) === String(urlThreadId) || String(x.brand_id) === String(urlThreadId));
        }
        if (!t && urlThreadId.startsWith("new_")) {
          const actualId = urlThreadId.replace("new_", "");
          t = threads.find(x => String(x.creator_id) === String(actualId) || String(x.brand_id) === String(actualId));
        }

        if (t) {
          setActiveThread(t);
        } else if (urlThreadId.length > 0) {
          const actualId = urlThreadId.startsWith("new_") ? urlThreadId.replace("new_", "") : urlThreadId;
          setActiveThread({
            id: `new_${actualId}`,
            creator_id: isBrand ? actualId : user.user_id,
            brand_id: isBrand ? user.user_id : actualId,
            status: 'NEGOTIATING',
            isNew: true
          });
        }
      } else {
        // When urlThreadId is missing (e.g. /inbox), reset the active thread to null
        setActiveThread(null);
      }
    }
  }, [user, urlThreadId, threads]);

  const loadThreads = async () => {
    if (!user) return;
    startLoading();
    try {
      const { data } = await api.get("/chat/v2/threads");
      setThreads(data || []);
      setIsRestricted(false);
      
      if (urlThreadId) {
        let t = data?.find((x) => String(x.id) === String(urlThreadId));
        if (!t) {
          t = data?.find(x => String(x.creator_id) === String(urlThreadId) || String(x.brand_id) === String(urlThreadId));
        }
        if (!t && urlThreadId.startsWith("new_")) {
          const actualId = urlThreadId.replace("new_", "");
          t = data?.find(x => String(x.creator_id) === String(actualId) || String(x.brand_id) === String(actualId));
        }

        if (t) {
          setActiveThread(t);
        } else if (urlThreadId.length > 0) {
          const actualId = urlThreadId.startsWith("new_") ? urlThreadId.replace("new_", "") : urlThreadId;
          setActiveThread({
            id: `new_${actualId}`,
            creator_id: isBrand ? actualId : user.user_id,
            brand_id: isBrand ? user.user_id : actualId,
            status: 'NEGOTIATING',
            isNew: true
          });
        }
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403 && err.response?.data?.restricted) {
        setIsRestricted(true);
        setRestrictionMessage(err.response.data.detail);
      }
    } finally {
      stopLoading();
    }
  };

  // Merge actual threads with active virtual and default seeded creators
  const displayThreads = [...threads];
  
  if (activeThread && activeThread.isNew) {
    const virtualThreadWithPartner = {
      ...activeThread,
      creator: isBrand ? virtualPartner : activeThread.creator,
      brand: !isBrand ? virtualPartner : activeThread.brand,
      updated_at: activeThread.updated_at || new Date().toISOString()
    };
    if (!threads.some(t => t.id === activeThread.id || t.creator_id === activeThread.creator_id)) {
      displayThreads.push(virtualThreadWithPartner);
    }
  }

  // Pre-populate other active creators in sidebar so brand is never stuck with empty inbox
  if (isBrand && allCreators.length > 0) {
    allCreators.forEach(creator => {
      if (!displayThreads.some(t => t.creator_id === creator.user_id)) {
        displayThreads.push({
          id: `new_${creator.user_id}`,
          creator_id: creator.user_id,
          brand_id: user.user_id,
          status: 'NEGOTIATING',
          isNew: true,
          creator: {
            user_id: creator.user_id,
            name: creator.name,
            profile_picture_url: creator.photo || creator.picture,
            logo_url: creator.photo || creator.picture,
            profile: creator
          },
          updated_at: creator.created_at || new Date().toISOString()
        });
      }
    });
  }

  const filteredThreads = displayThreads.filter(t => {
    const opp = isBrand ? t.creator : t.brand;
    if (!opp) return true;
    return (opp.name || '').toLowerCase().includes(search.toLowerCase());
  });

  const displayActiveThread = activeThread?.isNew && virtualPartner ? {
    ...activeThread,
    creator: isBrand ? virtualPartner : activeThread.creator,
    brand: !isBrand ? virtualPartner : activeThread.brand
  } : activeThread;

  if (isRestricted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[var(--bg-base)] relative overflow-hidden min-h-[500px] h-full">
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[120%] h-[120%] absolute bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTMwIDBMMCAwaDB2MzBoMzBWMHptLTEgMXYyOEgxVjFoMjh6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDcpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] [mask-image:radial-gradient(circle_at_center,black_0%,transparent_50%)] opacity-40"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center max-w-md px-6 py-12 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-2xl">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20 shadow-lg animate-pulse">
               <ShieldAlert size={40} className="text-rose-500" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[var(--violet)] text-white rounded-xl flex items-center justify-center shadow-md">
               <Lock size={16} />
            </div>
          </div>
          
          <h3 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-3">Inbox Locked 🔒</h3>
          <p className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed">
            {restrictionMessage || "Please apply to at least one campaign to unlock your chat and inbox section!"}
          </p>

          <Link to="/campaigns" className="px-6 py-3.5 bg-[var(--violet)] hover:bg-[#6b3deb] text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg hover:scale-105 transform duration-200">
             Explore Campaigns &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[var(--bg-card)] h-full overflow-hidden border-t border-[var(--border-default)] text-slate-100">
      
      {/* 2. Sidebar - Inbox List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-[var(--border-default)] flex flex-col bg-[var(--bg-base)] shrink-0 ${activeThread ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-5 border-b border-[var(--border-default)] h-20 shrink-0 flex items-center">
          <h2 className="text-xl font-display font-bold text-[var(--text-primary)]">Inbox</h2>
        </div>
        
        <div className="p-4 border-b border-[var(--border-default)] bg-[var(--bg-card)] shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--violet)] transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {filteredThreads.map(t => {
            const isActive = activeThread?.id === t.id;
            const partner = isBrand ? t.creator : t.brand;
            const isPartnerOnline = partner && onlineUsers.includes(partner.user_id || partner.id);

            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveThread(t);
                  navigate(`/chat/${t.id}`, { replace: true });
                }}
                className={`w-full text-left p-4 border-b border-[var(--border-default)] transition-colors flex items-center gap-3 hover:bg-[var(--bg-elevated)] ${isActive ? 'bg-[var(--bg-elevated)] border-l-4 ' + (isBrand ? 'border-l-[var(--violet)]' : 'border-l-emerald-500') : 'border-l-4 border-l-transparent'}`}
              >
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-full overflow-hidden bg-[var(--bg-elevated)] shrink-0 border-2 transition-all duration-300 ${isPartnerOnline ? 'border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] scale-105' : 'border-[var(--border-default)]'}`}>
                    {(partner?.profile_picture_url || partner?.logo_url) ? (
                      <img src={partner.profile_picture_url || partner.logo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[var(--bg-elevated)]" />
                    )}
                  </div>
                  {isPartnerOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[var(--bg-base)] rounded-full animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-[var(--text-primary)] text-sm truncate">{partner?.name || 'Unknown'}</span>
                    <span className="text-[10px] text-[var(--text-tertiary)] shrink-0 ml-2">
                       {new Date(t.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] truncate flex items-center gap-2">
                    <span className="bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">{t.status === 'NEGOTIATING' ? 'Neg...' : t.status}</span>
                    <span className="truncate">{t.campaigns?.title || 'Direct Deal'}</span>
                  </div>
                </div>
              </button>
            )
          })}
          {filteredThreads.length === 0 && (
            <div className="p-8 text-center text-[var(--text-tertiary)] text-sm">
              No conversations found.
            </div>
          )}
        </div>
      </div>

      {/* 3. Main Chat Area */}
      <div className={`flex-1 flex flex-col ${!activeThread ? 'hidden md:flex' : 'flex'}`}>
        <ChatBox thread={displayActiveThread} user={user} onlineUsers={onlineUsers} />
      </div>
    </div>
  );
}
