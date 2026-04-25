import { useState, useMemo, useEffect } from 'react';
import { 
  Menu, Search, Mic, Video, Bell, Play, Pause, SkipForward, Volume2, 
  Subtitles, Settings, Maximize, ThumbsUp, ThumbsDown, Share2, 
  Bookmark, MoreHorizontal, Home, PlaySquare, History, Clock, 
  User, Dot, ListFilter, MoreVertical, Ban, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Comment {
  id: string;
  author: string;
  time: string;
  text: string;
  likes: string;
  avatar: string;
}

interface VideoData {
  id: string;
  title: string;
  channel: string;
  subscribers: string;
  views: string;
  time: string;
  duration: string;
  thumbnail: string;
  description: string;
  likes: string;
}

const INITIAL_VIDEOS: VideoData[] = [
  {
    id: '1',
    title: 'The Ultimate Technical Deep Dive: Next-Gen Systems',
    channel: 'Engineering Masterclass',
    subscribers: '1.5M',
    views: '1.5M',
    time: '2 days ago',
    duration: '12:45',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1280&h=720&fit=crop',
    description: 'In this video, we explore the intricate details of next-generation system architecture. From low-level memory management to high-level cloud abstractions, we cover it all.',
    likes: '84K'
  },
  {
    id: '2',
    title: 'Building a Scalable Microservices Architecture',
    channel: 'Tech Weekly',
    subscribers: '800K',
    views: '200K',
    time: '1 week ago',
    duration: '18:45',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=320&h=180&fit=crop',
    description: 'Learn how to architect systems that scale to millions of users using modern microservice patterns and container orchestration.',
    likes: '12K'
  },
  {
    id: '3',
    title: 'Modern Frontend State Management Patterns',
    channel: 'Code Insights',
    subscribers: '450K',
    views: '89K',
    time: '3 days ago',
    duration: '12:12',
    thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=320&h=180&fit=crop',
    description: 'Comparing Redux, Recoil, and Context API in 2024. Which one should you pick for your next large-scale project?',
    likes: '5.2K'
  },
  {
    id: '4',
    title: 'The Future of Web Security',
    channel: 'CyberSec Network',
    subscribers: '2.1M',
    views: '1.2M',
    time: '1 month ago',
    duration: '24:00',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=320&h=180&fit=crop',
    description: 'An in-depth look at emerging threats in web technologies and how to stay ahead using Zero Trust principles.',
    likes: '110K'
  },
  {
    id: '5',
    title: 'Understanding the Rust Borrow Checker',
    channel: 'Rust Lab',
    subscribers: '120K',
    views: '45K',
    time: '12 hours ago',
    duration: '15:30',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=320&h=180&fit=crop',
    description: 'Rust can be tricky! We break down the borrow checker concepts into simple visual mental models.',
    likes: '3.1K'
  },
  {
    id: '6',
    title: 'AI in Software Development: 2024 Outlook',
    channel: 'Engineering Masterclass',
    subscribers: '1.5M',
    views: '2.1M',
    time: '2 weeks ago',
    duration: '21:10',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=320&h=180&fit=crop',
    description: 'How generative AI is changing the way we write, test, and deploy software in production environments.',
    likes: '95K'
  }
];

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'c1',
    author: '@dev_master',
    time: '1 hour ago',
    text: 'The explanation of concurrent data structures was absolutely brilliant. Best tech video this year!',
    likes: '1.2K',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
  },
  {
    id: 'c2',
    author: '@system_fan',
    time: '5 hours ago',
    text: 'Finally someone talks about the performance overhead of virtualization in a way that makes sense.',
    likes: '432',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop'
  }
];

export default function App() {
  const [currentVideo, setCurrentVideo] = useState<VideoData>(INITIAL_VIDEOS[0]);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBlockToast, setShowBlockToast] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [blockedChannels, setBlockedChannels] = useState<Set<string>>(new Set());
  const [showBlockedList, setShowBlockedList] = useState(false);

  const isCurrentChannelBlocked = blockedChannels.has(currentVideo.channel);

  // Recommendations filtered by search query and blocked status
  const filteredVideos = useMemo(() => {
    return INITIAL_VIDEOS.filter(v => 
      v.id !== currentVideo.id && 
      !blockedChannels.has(v.channel) &&
      (v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       v.channel.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [currentVideo.id, searchQuery, blockedChannels]);

  const toggleBlock = () => {
    const channel = currentVideo.channel;
    setBlockedChannels(prev => {
      const next = new Set(prev);
      if (next.has(channel)) {
        next.delete(channel);
      } else {
        next.add(channel);
      }
      return next;
    });
    
    if (!blockedChannels.has(channel)) {
      setShowBlockToast(true);
      setTimeout(() => setShowBlockToast(false), 5000);
    }
  };

  const handleVideoSelect = (video: VideoData) => {
    setCurrentVideo(video);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Reset interaction states for new video simulation
    setIsSubscribed(false);
    setUserVote(null);
    setIsSaved(false);
  };

  const handleAddComment = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      author: '@me',
      time: 'Just now',
      text: newComment,
      likes: '0',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-sans overflow-x-hidden selection:bg-primary/20">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between px-4 z-[100]">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Menu className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
          </button>
          <div 
            onClick={() => handleVideoSelect(INITIAL_VIDEOS[0])}
            className="flex items-center gap-1 text-xl font-bold tracking-tighter text-zinc-900 dark:text-white cursor-pointer group"
          >
            <PlaySquare className="w-8 h-8 text-primary fill-primary group-hover:scale-110 transition-transform" />
            <span>YouTube</span>
          </div>
        </div>

        <div className="flex-1 max-w-2xl px-4 md:px-8 flex items-center">
          <form 
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full items-center"
          >
            <div className="flex-1 flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-l-full px-4 h-10 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
              <input 
                type="text" 
                placeholder="Search videos..." 
                className="bg-transparent border-none outline-none w-full text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="bg-zinc-100 dark:bg-zinc-800 border border-l-0 border-zinc-200 dark:border-zinc-800 rounded-r-full px-5 h-10 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              <Search className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </button>
          </form>
          <button className="ml-4 p-2 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors hidden sm:flex">
            <Mic className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
          </button>
        </div>

        <div className="flex items-center gap-1 md:gap-3">
          <button className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors hidden sm:flex">
            <Video className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
          </button>
          <button className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative">
            <Bell className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-zinc-950" />
          </button>
          <button className="ml-2 w-8 h-8 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <img 
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </nav>

      {/* Sidebar - Animated Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed left-0 top-0 bottom-0 w-[280px] bg-white dark:bg-zinc-950 shadow-2xl z-[150] p-4 flex flex-col"
          >
            <div className="flex items-center gap-4 mb-4">
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <Menu className="w-6 h-6" />
              </button>
              <div 
                onClick={() => { handleVideoSelect(INITIAL_VIDEOS[0]); setIsSidebarOpen(false); }}
                className="flex items-center gap-1 text-xl font-bold tracking-tighter text-zinc-900 dark:text-white cursor-pointer group"
              >
                <PlaySquare className="w-8 h-8 text-primary fill-primary group-hover:scale-110 transition-transform" />
                <span>YouTube</span>
              </div>
            </div>
            <nav className="space-y-1">
              <FullSidebarItem 
                icon={<Home />} 
                label="Home" 
                active={!showBlockedList} 
                onClick={() => { setShowBlockedList(false); setIsSidebarOpen(false); }} 
              />
              <FullSidebarItem 
                icon={<PlaySquare />} 
                label="Subscriptions" 
                onClick={() => { setShowBlockedList(false); setIsSidebarOpen(false); }}
              />
              <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-4" />
              <FullSidebarItem 
                icon={<History />} 
                label="History" 
                onClick={() => { setShowBlockedList(false); setIsSidebarOpen(false); }}
              />
              <FullSidebarItem 
                icon={<Clock />} 
                label="Watch Later" 
                onClick={() => { setShowBlockedList(false); setIsSidebarOpen(false); }}
              />
              <FullSidebarItem 
                icon={<Ban className="text-error" />} 
                label="Blocked Channels" 
                active={showBlockedList}
                onClick={() => { setShowBlockedList(true); setIsSidebarOpen(false); }}
              />
              <FullSidebarItem 
                icon={<ThumbsUp />} 
                label="Liked Videos" 
                onClick={() => { setShowBlockedList(false); setIsSidebarOpen(false); }}
              />
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Overlay for Sidebar */}
      {isSidebarOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 z-[140] backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Mini - Fixed for Desktop */}
      <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-[72px] bg-white dark:bg-zinc-950 border-r border-zinc-100 dark:border-zinc-800 hidden md:flex flex-col items-center py-2 space-y-1 z-40">
        <SidebarItem icon={<Home className="w-6 h-6" />} label="Home" active />
        <SidebarItem icon={<PlaySquare className="w-6 h-6" />} label="Subscriptions" />
        <SidebarItem icon={<History className="w-6 h-6" />} label="History" />
        <SidebarItem icon={<Clock className="w-6 h-6" />} label="Watch Later" />
      </aside>

      {/* Main Content */}
      <main className="md:ml-[72px] pt-20 px-4 md:px-6 lg:px-8 max-w-[1800px] mx-auto flex flex-col lg:flex-row gap-6 pb-20 md:pb-8">
        {/* Left Side: Player, Info, Comments */}
        <div className="flex-1 min-w-0">
          <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative group shadow-2xl">
            <motion.img 
              key={currentVideo.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              src={currentVideo.thumbnail} 
              alt="Video Background" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Play/Pause indicator on click */}
            <div 
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {!isPlaying && (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-20 h-20 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm shadow-2xl"
                >
                  <Play className="w-10 h-10 text-white fill-white ml-1" />
                </motion.div>
              )}
            </div>

            {/* Video Controls Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-3 relative group/progress">
                <div className="absolute top-0 left-0 h-full w-1/3 bg-primary rounded-full transition-all" />
                <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-3 h-3 bg-primary rounded-full scale-0 group-hover/progress:scale-100 transition-transform shadow-lg" />
              </div>
              
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsPlaying(!isPlaying)} className="hover:scale-110 transition-transform">
                    {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}
                  </button>
                  <button className="hover:scale-110 transition-transform"><SkipForward className="w-6 h-6 fill-white" /></button>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setIsMuted(!isMuted)}>
                      <Volume2 className="w-6 h-6" />
                    </button>
                    <span className="text-xs font-bold tracking-tight">4:20 / {currentVideo.duration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="hover:text-primary transition-colors"><Subtitles className="w-5 h-5" /></button>
                  <button className="hover:rotate-45 transition-transform duration-300"><Settings className="w-5 h-5" /></button>
                  <button className="hover:scale-110 transition-transform"><Maximize className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          </div>

          {/* Video Metadata */}
          <div className=" mt-4">
            <h1 className="text-xl md:text-2xl font-bold text-on-surface mb-3 tracking-tight">{currentVideo.title}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img 
                  src={currentVideo.id === '1' ? INITIAL_VIDEOS[0].thumbnail : currentVideo.thumbnail} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-sm"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-sm md:text-base text-on-surface truncate leading-tight hover:underline cursor-pointer">{currentVideo.channel}</h3>
                  <p className="text-xs text-on-surface-variant font-medium">{currentVideo.subscribers} subscribers</p>
                </div>
                <div className="flex items-center gap-2 md:ml-4">
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsSubscribed(!isSubscribed)}
                    className={`${isSubscribed ? 'bg-zinc-100 dark:bg-zinc-800 text-on-background' : 'bg-on-surface text-surface'} transition-all px-4 py-2 rounded-full text-sm font-bold hover:opacity-90 active:scale-95 whitespace-nowrap shadow-sm`}
                  >
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </motion.button>
                  <button 
                    onClick={toggleBlock}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all text-sm font-bold ${
                      isCurrentChannelBlocked 
                        ? 'bg-error text-white border-error shadow-lg shadow-error/20' 
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-error'
                    }`}
                  >
                    <Ban className="w-4 h-4" />
                    <span className="hidden sm:inline">{isCurrentChannelBlocked ? 'Blocked' : 'Block'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                <div className="flex bg-surface-container-high dark:bg-zinc-900 rounded-full items-center h-9 shadow-sm">
                  <button 
                    onClick={() => setUserVote(userVote === 'up' ? null : 'up')}
                    className={`flex items-center gap-2 px-4 h-full hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-l-full transition-all text-sm font-bold ${userVote === 'up' ? 'text-primary' : ''}`}
                  >
                    <ThumbsUp className={`w-5 h-5 ${userVote === 'up' ? 'fill-primary' : ''}`} /> {currentVideo.likes}
                  </button>
                  <div className="w-[1px] h-5 bg-zinc-300 dark:bg-zinc-700" />
                  <button 
                    onClick={() => setUserVote(userVote === 'down' ? null : 'down')}
                    className={`flex items-center px-4 h-full hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-r-full transition-all ${userVote === 'down' ? 'text-primary' : ''}`}
                  >
                    <ThumbsDown className={`w-5 h-5 ${userVote === 'down' ? 'fill-primary' : ''}`} />
                  </button>
                </div>
                <button className="bg-surface-container-high dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full flex items-center gap-2 px-4 h-9 text-sm font-bold transition-all shadow-sm">
                  <Share2 className="w-5 h-5" /> <span className="hidden md:inline">Share</span>
                </button>
                <button 
                  onClick={() => setIsSaved(!isSaved)}
                  className={`bg-surface-container-high dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full flex items-center gap-2 px-4 h-9 text-sm font-bold transition-all shadow-sm ${isSaved ? 'text-primary' : ''}`}
                >
                  <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-primary' : ''}`} /> <span className="hidden md:inline">Save</span>
                </button>
                <button className="bg-surface-container-high dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full w-9 h-9 flex items-center justify-center transition-all shadow-sm">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Description Card */}
            <motion.div 
              layout
              className="mt-4 bg-surface-container-low hover:bg-surface-container dark:bg-zinc-900/50 dark:hover:bg-zinc-900 rounded-2xl p-4 cursor-pointer transition-colors shadow-sm group/desc"
            >
              <div className="flex flex-wrap gap-x-2 font-bold text-sm mb-2">
                <span>{currentVideo.views} views</span>
                <span className="text-zinc-500 items-center hidden sm:inline"><Dot className="w-4 h-4" /></span>
                <span>{currentVideo.time}</span>
                <div className="flex gap-2">
                  <span className="text-secondary hover:underline transition-all">#tech</span>
                  <span className="text-secondary hover:underline transition-all">#innovation</span>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
                {currentVideo.description}
                <span className="block mt-2 font-bold text-on-surface group-hover/desc:text-primary transition-colors">Show more</span>
              </p>
            </motion.div>
          </div>

          {/* Comments Section */}
          <div className="mt-8">
            <div className="flex items-center gap-6 mb-6">
              <h2 className="text-lg md:text-xl font-bold tracking-tight">{comments.length} Comments</h2>
              <button className="flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-black dark:hover:text-white transition-colors">
                <ListFilter className="w-5 h-5" /> Sort by
              </button>
            </div>
            
            <form onSubmit={handleAddComment} className="flex gap-4 mb-8">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" 
                alt="Me" 
                className="w-10 h-10 rounded-full flex-shrink-0 animate-pulse-slow"
              />
              <div className="flex-1 flex flex-col gap-2">
                <div className="border-b border-zinc-200 dark:border-zinc-800">
                  <input 
                    type="text" 
                    placeholder="Add a comment..." 
                    className="w-full bg-transparent outline-none py-2 text-sm font-medium focus:border-primary transition-all pb-3"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                </div>
                {newComment && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-end gap-3 mt-1"
                  >
                    <button 
                      type="button" 
                      onClick={() => setNewComment('')}
                      className="px-4 py-2 rounded-full text-sm font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="bg-primary text-white px-4 py-2 rounded-full text-sm font-bold hover:brightness-110 flex items-center gap-2 active:scale-95 transition-all shadow-lg"
                    >
                      <Send className="w-4 h-4" /> Comment
                    </button>
                  </motion.div>
                )}
              </div>
            </form>

            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {comments.map((comment, index) => (
                  <CommentItem key={comment.id} comment={comment} isNew={index === 0 && comment.author === '@me'} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Side: Recommendations or Blocked List */}
        <div className="w-full lg:w-[400px] flex-shrink-0">
          {showBlockedList ? (
            <div className="bg-surface-container-low dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <Ban className="w-5 h-5 text-error" /> Blocked Channels
                </h2>
                <button 
                  onClick={() => setShowBlockedList(false)}
                  className="text-primary text-xs font-bold hover:underline"
                >
                  Close
                </button>
              </div>
              
              {blockedChannels.size === 0 ? (
                <div className="text-center py-10">
                  <p className="text-zinc-500 text-sm font-medium">You haven't blocked any channels yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.from(blockedChannels).map(channel => (
                    <motion.div 
                      key={channel}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-white dark:bg-black rounded-xl border border-zinc-100 dark:border-zinc-800"
                    >
                      <span className="font-bold text-sm">{channel}</span>
                      <button 
                        onClick={() => {
                          setBlockedChannels(prev => {
                            const next = new Set(prev);
                            next.delete(channel);
                            return next;
                          });
                        }}
                        className="text-primary text-xs font-bold hover:bg-primary/10 px-3 py-1.5 rounded-full transition-colors"
                      >
                        Unblock
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide py-1">
                <FilterChip label="All" active />
                <FilterChip label="Computer Science" />
                <FilterChip label="Live" />
                <FilterChip label="Latest" />
                <FilterChip label="Mixed" />
              </div>

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredVideos.map(video => (
                    <RecommendationCard 
                      key={video.id}
                      video={video}
                      onSelect={handleVideoSelect}
                    />
                  ))}
                </AnimatePresence>
                {filteredVideos.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-20 text-center text-zinc-500 font-bold border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl"
                  >
                    No videos found matching your search.
                  </motion.div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {showBlockToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 z-[200] w-[90%] max-w-md border border-white/10 backdrop-blur-md"
          >
            <div className="flex-1 font-bold text-sm leading-tight">
              Channel "{currentVideo.channel}" has been blocked and will be removed from your feed.
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowBlockToast(false)}
                className="text-inverse-primary font-black text-xs uppercase tracking-widest hover:brightness-125 transition-all"
              >
                Undo
              </button>
              <button onClick={() => setShowBlockToast(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                <Ban className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-around z-[100] px-4">
        <MobileNavItem icon={<Home />} label="Home" active />
        <MobileNavItem icon={<PlaySquare />} label="Shorts" />
        <button className="flex items-center justify-center p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full -mt-8 shadow-xl active:scale-90 transition-transform">
          <Play className="w-6 h-6 fill-black dark:fill-white ml-0.5" />
        </button>
        <MobileNavItem icon={<History />} label="Sub" />
        <MobileNavItem icon={<User />} label="You" />
      </nav>
    </div>
  );
}

function SidebarItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex flex-col items-center justify-center py-4 px-1 rounded-xl transition-all group active:scale-90 ${active ? 'bg-zinc-100 dark:bg-zinc-900 text-primary' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'}`}>
      <div className={`mb-1 group-hover:scale-110 transition-transform ${active ? 'text-primary' : 'group-hover:text-zinc-900 dark:group-hover:text-zinc-100'}`}>{icon}</div>
      <span className={`text-[10px] font-bold truncate w-full text-center ${active ? 'text-primary' : 'group-hover:text-zinc-900 dark:group-hover:text-zinc-100'}`}>{label}</span>
    </button>
  );
}

function FullSidebarItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all active:scale-[0.98] ${active ? 'bg-zinc-100 dark:bg-zinc-900 text-primary' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-on-surface'}`}
    >
      <div className={`w-6 h-6 ${active ? 'text-primary fill-primary/20' : ''}`}>{icon}</div>
      <span className={`text-sm font-bold truncate ${active ? 'text-primary' : ''}`}>{label}</span>
    </button>
  );
}

function FilterChip({ label, active = false }: { label: string, active?: boolean }) {
  return (
    <button className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all shadow-sm ${active ? 'bg-black dark:bg-white text-white dark:text-black active:scale-95' : 'bg-surface-container-high dark:bg-zinc-800 text-on-surface hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 hover:shadow-md'}`}>
      {label}
    </button>
  );
}

function MobileNavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-90 ${active ? 'text-primary' : 'text-zinc-500 font-medium'}`}>
      <div className={`w-6 h-6 ${active ? 'fill-primary' : ''}`}>{icon}</div>
      <span className="text-[10px] font-black">{label}</span>
    </button>
  );
}

function RecommendationCard({ video, onSelect }: { video: VideoData, onSelect: (v: VideoData) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      layout
      className="flex gap-3 group cursor-pointer"
      whileTap={{ scale: 0.96 }}
      onClick={() => onSelect(video)}
    >
      <div className="w-40 md:w-44 h-24 rounded-xl overflow-hidden flex-shrink-0 relative shadow-md">
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-95 group-hover:brightness-105" 
        />
        <span className="absolute bottom-1 right-2 bg-black/80 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-lg backdrop-blur-sm">
          {video.duration}
        </span>
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-start py-0.5">
        <h3 className="text-sm font-bold text-on-surface line-clamp-2 leading-tight group-hover:text-primary transition-colors pr-4">
          {video.title}
        </h3>
        <p className="text-[11px] font-bold text-on-surface-variant mt-1.5 hover:text-on-surface transition-colors">{video.channel}</p>
        <p className="text-[11px] font-medium text-on-surface-variant">{video.views} views • {video.time}</p>
      </div>
      <button className="opacity-0 group-hover:opacity-100 p-1 flex-shrink-0 self-start transition-opacity hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
        <MoreVertical className="w-4 h-4 text-on-surface-variant" />
      </button>
    </motion.div>
  );
}

function CommentItem({ comment, isNew = false }: { comment: Comment, isNew?: boolean }) {
  return (
    <motion.div 
      initial={isNew ? { opacity: 0, y: -20, height: 0 } : false}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      className="flex gap-4 group overflow-hidden"
    >
      <img 
        src={comment.avatar} 
        alt={comment.author} 
        className="w-10 h-10 rounded-full flex-shrink-0 border border-zinc-100 dark:border-zinc-800 shadow-sm" 
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-black text-on-surface hover:underline cursor-pointer tracking-tight">{comment.author}</span>
          <span className="text-[10px] text-zinc-500 font-bold">{comment.time}</span>
        </div>
        <p className="text-sm text-on-surface leading-relaxed font-medium mb-3 break-words">{comment.text}</p>
        <div className="flex items-center gap-5 text-on-surface-variant">
          <button className="flex items-center gap-1.5 hover:text-primary transition-all active:scale-110">
            <ThumbsUp className="w-4 h-4" />
            <span className="text-xs font-black">{comment.likes}</span>
          </button>
          <button className="hover:text-primary transition-all active:scale-110">
            <ThumbsDown className="w-4 h-4" />
          </button>
          <button className="text-xs font-black hover:text-on-surface dark:hover:text-white transition-colors">Reply</button>
        </div>
      </div>
      <button className="opacity-0 group-hover:opacity-100 p-1 self-start transition-opacity hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
        <MoreVertical className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
