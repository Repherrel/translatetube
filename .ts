[1mdiff --git a/App.tsx b/App.tsx[m
[1mindex 16178f7..608a348 100644[m
[1m--- a/App.tsx[m
[1m+++ b/App.tsx[m
[36m@@ -3,7 +3,7 @@[m [mimport Header from './components/Header';[m
 import VideoCard from './components/VideoCard';[m
 import Loader from './components/Loader';[m
 import MonetizationModal from './components/MonetizationModal';[m
[31m-import { Video, GeminiSearchResponse, User } from './types';[m
[32m+[m[32mimport { Video, GeminiSearchResponse, User, SearchStatus } from './types';[m
 import { translateAndSearch } from './services/geminiService';[m
 import * as authService from './services/authService';[m
 import { FREE_SEARCH_LIMIT } from './constants';[m
[36m@@ -13,7 +13,7 @@[m [mimport SearchExamples from './components/SearchExamples';[m
 const App: React.FC = () => {[m
   const [query, setQuery] = useState<string>('');[m
   const [videos, setVideos] = useState<Video[]>([]);[m
[31m-  const [loading, setLoading] = useState<boolean>(false);[m
[32m+[m[32m  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle');[m
   const [error, setError] = useState<string | null>(null);[m
   const [searchCount, setSearchCount] = useState<number>(0);[m
   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);[m
[36m@@ -40,7 +40,7 @@[m [mconst App: React.FC = () => {[m
       return;[m
     }[m
 [m
[31m-    setLoading(true);[m
[32m+[m[32m    setSearchStatus('pending');[m
     setError(null);[m
     setSearchInfo(null);[m
     setQuery(searchQuery);[m
[36m@@ -49,18 +49,18 @@[m [mconst App: React.FC = () => {[m
       const result: GeminiSearchResponse = await translateAndSearch(searchQuery);[m
       setVideos(result.videos);[m
       setSearchInfo({ detected: result.detectedLanguage, translated: result.translatedQuery });[m
[32m+[m[32m      setSearchStatus('success');[m
       if (!isSubscribed) {[m
           setSearchCount(prevCount => prevCount + 1);[m
       }[m
     } catch (err: unknown) {[m
[32m+[m[32m      setSearchStatus('error');[m
       if (err instanceof Error) {[m
         setError(err.message);[m
       } else {[m
         setError("An unknown error occurred.");[m
       }[m
       setVideos([]);[m
[31m-    } finally {[m
[31m-      setLoading(false);[m
     }[m
   }, [searchCount, isSubscribed]);[m
 [m
[36m@@ -82,7 +82,7 @@[m [mconst App: React.FC = () => {[m
     setVideos([]);[m
     setError(null);[m
     setSearchInfo(null);[m
[31m-    setLoading(false);[m
[32m+[m[32m    setSearchStatus('idle');[m
   };[m
 [m
   const WelcomeScreen = () => ([m
[36m@@ -111,7 +111,7 @@[m [mconst App: React.FC = () => {[m
         query={query}[m
         setQuery={setQuery}[m
         onSearch={handleSearch} [m
[31m-        loading={loading} [m
[32m+[m[32m        loading={searchStatus === 'pending'}[m[41m [m
         searchCount={searchCount}[m
         user={user}[m
         isSubscribed={isSubscribed}[m
[36m@@ -120,7 +120,7 @@[m [mconst App: React.FC = () => {[m
         onGoHome={handleGoHome}[m
       />[m
       <main className="container mx-auto p-4 sm:p-6 lg:p-8">[m
[31m-        {loading ? ([m
[32m+[m[32m        {searchStatus === 'pending' ? ([m
           <Loader message="Translating and finding videos..." />[m
         ) : ([m
           <>[m
[36m@@ -139,9 +139,9 @@[m [mconst App: React.FC = () => {[m
                     <VideoCard key={video.id} video={video} />[m
                 ))}[m
                 </div>[m
[31m-            ) : !error && !loading && searchInfo ? ([m
[32m+[m[32m            ) : (searchStatus === 'error' || (searchStatus === 'success' && searchInfo)) ? ([m
                 <NoResults />[m
[31m-            ) : !error && !loading && !searchInfo ? ([m
[32m+[m[32m            ) : searchStatus === 'idle' ? ([m
                 <WelcomeScreen />[m
             ) : null}[m
           </>[m
