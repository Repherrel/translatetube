import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import VideoCard from './components/VideoCard';
import Loader from './components/Loader';
import MonetizationModal from './components/MonetizationModal';
import { Video, GeminiSearchResponse, User, SearchStatus } from './types';
import { translateAndSearch } from './services/geminiService';
import * as authService from './services/authService';
import { FREE_SEARCH_LIMIT } from './constants';
import { MeTubeLogoIcon } from './components/icons';
import SearchExamples from './components/SearchExamples';

const App: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [searchCount, setSearchCount] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchInfo, setSearchInfo] = useState<{ detected: string; translated: string } | null>(null);
  
  const [user, setUser] = useState<User | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  useEffect(() => {
    authService.initGoogleSignIn();
    
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsSubscribed(authService.isSubscribed());
    });
    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    if (!isSubscribed && searchCount >= FREE_SEARCH_LIMIT) {
      setIsModalOpen(true);
      return;
    }

    setSearchStatus('pending');
    setError(null);
    setSearchInfo(null);
    setQuery(searchQuery);

    try {
      const result: GeminiSearchResponse = await translateAndSearch(searchQuery);
      setVideos(result.videos);
      setSearchInfo({ detected: result.detectedLanguage, translated: result.translatedQuery });
      setSearchStatus('success');
      if (!isSubscribed) {
          setSearchCount(prevCount => prevCount + 1);
      }
    } catch (err: unknown) {
      setSearchStatus('error');
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
      setVideos([]);
    }
  }, [searchCount, isSubscribed]);

  const handleSignOut = () => {
    authService.signOut();
  };

  const handleSubscribe = () => {
    authService.subscribe();
    setIsModalOpen(false);
  };

  const handleExampleClick = (exampleQuery: string) => {
    handleSearch(exampleQuery);
  };

  const handleGoHome = () => {
    setQuery('');
    setVideos([]);
    setError(null);
    setSearchInfo(null);
    setSearchStatus('idle');
  };

  const WelcomeScreen = () => (
    <div className="text-center py-20 px-4">
      <MeTubeLogoIcon className="h-20 w-auto mx-auto text-zinc-700" />
      <h2 className="mt-6 text-2xl font-semibold text-zinc-400">Welcome to MeTube</h2>
      <p className="mt-2 text-zinc-500">
        Type in any language to discover videos. Your query will be automatically translated to English.
      </p>
      <SearchExamples onExampleClick={handleExampleClick} />
    </div>
  );
  
  const NoResults = () => (
     <div className="text-center py-20 px-4">
        <h2 className="text-xl font-semibold text-zinc-400">No results found</h2>
        <p className="mt-2 text-zinc-500">
          Try searching for something else.
        </p>
     </div>
  );

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <Header 
        query={query}
        setQuery={setQuery}
        onSearch={handleSearch} 
        loading={searchStatus === 'pending'} 
        searchCount={searchCount}
        user={user}
        isSubscribed={isSubscribed}
        onSignOut={handleSignOut}
        onSubscribe={handleSubscribe}
        onGoHome={handleGoHome}
      />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {searchStatus === 'pending' ? (
          <Loader message="Translating and finding videos..." />
        ) : (
          <>
            {error && <p className="text-center text-red-500 bg-red-900/50 p-3 rounded-md">{error}</p>}
            
            {searchInfo && (
              <div className="mb-6 p-3 bg-zinc-800 rounded-lg text-sm text-zinc-300">
                <span>Detected Language: <strong className="text-white">{searchInfo.detected}</strong>. </span>
                <span>Showing results for: <strong className="text-white">"{searchInfo.translated}"</strong></span>
              </div>
            )}
            
            {videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                {videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                ))}
                </div>
            ) : (searchStatus === 'error' || (searchStatus === 'success' && searchInfo)) ? (
                <NoResults />
            ) : searchStatus === 'idle' ? (
                <WelcomeScreen />
            ) : null}
          </>
        )}
      </main>
      <MonetizationModal 
        isOpen={isModalOpen} 
        user={user}
        onClose={() => setIsModalOpen(false)}
        onSubscribe={handleSubscribe}
      />
    </div>
  );
};

export default App;