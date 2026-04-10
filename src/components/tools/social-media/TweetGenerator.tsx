import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Twitter, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useTheme } from 'next-themes';

interface TweetPreviewProps {
  username: string;
  handle: string;
  tweetText: string;
  imageUrl?: string;
  profilePicture?: string;
  isVerified?: boolean;
  timestamp?: string;
  likes?: number;
  retweets?: number;
  replies?: number;
  views?: number;
  theme?: 'light' | 'dark';
  forExport?: boolean;
  isLiked?: boolean;
  isReposted?: boolean;
}

// Enhanced TweetPreview component with better alignment and consistency between preview and export
const TweetPreview = React.forwardRef<HTMLDivElement, TweetPreviewProps>(({ username, handle, tweetText, imageUrl, profilePicture, isVerified = false, timestamp = 'now', likes = 0, retweets = 0, replies = 0, views = 0, theme = 'light', forExport = false, isLiked = false, isReposted = false }, ref) => {
  const isDark = theme === 'dark';
  
  return (
    <div 
      ref={ref}
      className={`w-full rounded-xl overflow-hidden ${isDark ? 'bg-zinc-900 text-white' : 'bg-white text-black'}`}
      style={{
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif',
        maxWidth: '550px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        border: isDark ? '1px solid #2F3336' : '1px solid #E1E8ED',
        // Ensure consistent sizing between preview and export
        width: '550px',
        margin: forExport ? '0' : 'auto'
      }}
    >
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          {/* Profile Image */}
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0" style={{ backgroundColor: isDark ? '#333639' : '#E1E8ED' }}>
            {profilePicture ? (
              <img src={profilePicture} alt={username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Twitter className={`w-6 h-6 ${isDark ? 'text-zinc-500' : 'text-gray-400'}`} />
              </div>
            )}
          </div>
          
          {/* Tweet Content */}
          <div className="flex-1 min-w-0">
            {/* User Info */}
            <div className="flex items-center flex-wrap gap-1">
              <span className="font-bold truncate">{username || 'Username'}</span>
              {isVerified && (
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-500 fill-current flex-shrink-0">
                  <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                </svg>
              )}
            </div>
            
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <span>@{handle || 'handle'}</span>
              <span className="mx-1">•</span>
              <span>{timestamp}</span>
            </div>
            
            {/* Tweet Text */}
            <div className={`mt-1 mb-2 text-base break-words whitespace-pre-wrap ${isDark ? 'text-white' : 'text-black'}`}>
              {tweetText || "What's happening?"}
            </div>
            
            {/* Tweet Image */}
            {imageUrl && (
              <div className="mt-3 rounded-xl overflow-hidden border" style={{ borderColor: isDark ? '#333639' : '#E1E8ED' }}>
                <img src={imageUrl} alt="Tweet media" className="w-full h-auto object-cover" />
              </div>
            )}
            
            {/* Tweet Stats */}
            <div className="flex items-center justify-between mt-4 text-gray-500">
              <div className="flex items-center gap-1">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M14.046 2.242l-4.148-.01h-.002c-4.374 0-7.8 3.427-7.8 7.802 0 4.098 3.186 7.206 7.465 7.37v3.828c0 .108.045.286.12.403.142.225.384.347.632.347.138 0 .277-.038.402-.118.264-.168 6.473-4.14 8.088-5.506 1.902-1.61 3.04-3.97 3.043-6.312v-.017c-.006-4.368-3.43-7.788-7.8-7.79zm3.787 12.972c-1.134.96-4.862 3.405-6.772 4.643V16.67c0-.414-.334-.75-.75-.75h-.395c-3.66 0-6.318-2.476-6.318-5.886 0-3.534 2.768-6.302 6.3-6.302l4.147.01h.002c3.532 0 6.3 2.766 6.302 6.296-.003 1.91-.942 3.844-2.514 5.176z" />
                </svg>
                <span>{replies.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg viewBox="0 0 24 24" className={`w-5 h-5 fill-current ${isReposted ? 'text-green-500' : ''}`}>
                  <path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.337-.75-.75-.75z" />
                </svg>
                <span className={isReposted ? 'text-green-500' : ''}>{retweets.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg viewBox="0 0 24 24" className={`w-5 h-5 fill-current ${isLiked ? 'text-red-500' : ''}`}>
                  <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.813-1.148 2.353-2.73 4.644-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12zM7.354 4.225c-2.08 0-3.903 1.988-3.903 4.255 0 5.74 7.034 11.596 8.55 11.658 1.518-.062 8.55-5.917 8.55-11.658 0-2.267-1.823-4.255-3.903-4.255-2.528 0-3.94 2.936-3.952 2.965-.23.562-1.156.562-1.387 0-.014-.03-1.425-2.965-3.954-2.965z" />
                </svg>
                <span className={isLiked ? 'text-red-500' : ''}>{likes.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z" />
                </svg>
                <span>{views.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});


const TweetGenerator = () => {
  const previewRef = useRef(null);
  const exportContainerRef = useRef(null);
  const isMobile = !useMediaQuery('(min-width: 1024px)');
  
  // Get app theme for default
  const { theme: appTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [username, setUsername] = useState('');
  const [handle, setHandle] = useState('');
  const [tweetText, setTweetText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [likes, setLikes] = useState(0);
  const [retweets, setRetweets] = useState(0);
  const [replies, setReplies] = useState(0);
  const [views, setViews] = useState(0);
  // Use app theme as default (with fallback to 'light') - only after mount
  const [theme, setTheme] = useState<'light' | 'dark'>(mounted && appTheme === 'dark' ? 'dark' : 'light');
  const [isExporting, setIsExporting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);

  // Handle file uploads with proper cleanup
  const handleImageUpload = (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clean up previous objectURL if it exists to prevent memory leaks
      if (type === 'tweet' && imageUrl) {
        URL.revokeObjectURL(imageUrl);
      } else if (type === 'profile' && profilePicture) {
        URL.revokeObjectURL(profilePicture);
      }
      
      const url = URL.createObjectURL(file);
      if (type === 'tweet') {
        setImageUrl(url);
      } else {
        setProfilePicture(url);
      }
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      if (profilePicture) URL.revokeObjectURL(profilePicture);
    };
  }, []);

  // Improved download function with proper export container setup
  const downloadPreview = async () => {
    if (!exportContainerRef.current) {
      toast.error('Export container not available');
      return;
    }

    try {
      setIsExporting(true);
      
      // Use a dedicated export container
      const exportNode = exportContainerRef.current;
      
      // Ensure we import html2canvas dynamically only when needed
      const html2canvas = (await import('html2canvas')).default;
      
      // Configure canvas with better settings for quality and alignment
      const canvas = await html2canvas(exportNode, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Enable CORS for images
        allowTaint: true,
        backgroundColor: theme === 'dark' ? '#15202B' : '#FFFFFF',
        logging: false,
        // Make sure these match the actual container dimensions
        width: exportNode.offsetWidth,
        height: exportNode.offsetHeight
      });

      
      // Create download link with proper filename
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const filename = `${handle ? handle : 'tweet'}-${new Date().getTime()}.png`;
      
      link.download = filename;
      link.href = url;
      link.click();
      
      toast.success('Tweet image downloaded successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to download preview: ' + (error.message || 'Unknown error'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form section */}
        <div className="flex-1 space-y-6">
          <Card className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Display Name</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter display name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="handle">Handle</Label>
                <Input
                  id="handle"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="Enter handle without @"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tweet-text">Tweet Text</Label>
                <Textarea
                  id="tweet-text"
                  value={tweetText}
                  onChange={(e) => setTweetText(e.target.value)}
                  placeholder="What's happening?"
                  maxLength={280}
                />
                <div className="text-sm text-muted-foreground text-right">
                  {tweetText.length}/280
                </div>
              </div>

              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'profile')}
                />
              </div>

              <div className="space-y-2">
                <Label>Tweet Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'tweet')}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="verified"
                  checked={isVerified}
                  onCheckedChange={setIsVerified}
                />
                <Label htmlFor="verified">Verified Account</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="liked"
                  checked={isLiked}
                  onCheckedChange={setIsLiked}
                />
                <Label htmlFor="liked">Liked</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="reposted"
                  checked={isReposted}
                  onCheckedChange={setIsReposted}
                />
                <Label htmlFor="reposted">Reposted</Label>
              </div>

              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="theme"
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  />
                  <Label htmlFor="theme">Dark Mode</Label>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-6">
            <h3 className="text-lg font-semibold">Engagement Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="replies">Replies</Label>
                <Input
                  id="replies"
                  type="number"
                  min="0"
                  value={replies}
                  onChange={(e) => setReplies(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retweets">Retweets</Label>
                <Input
                  id="retweets"
                  type="number"
                  min="0"
                  value={retweets}
                  onChange={(e) => setRetweets(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="likes">Likes</Label>
                <Input
                  id="likes"
                  type="number"
                  min="0"
                  value={likes}
                  onChange={(e) => setLikes(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="views">Views</Label>
                <Input
                  id="views"
                  type="number"
                  min="0"
                  value={views}
                  onChange={(e) => setViews(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Preview section */}
        <div className="lg:w-[600px] space-y-4">
          {/* Regular preview with fixed dimensions */}
          <div className="bg-background p-4 rounded-lg flex justify-center" ref={previewRef}>
            <TweetPreview
              username={username}
              handle={handle}
              tweetText={tweetText}
              imageUrl={imageUrl}
              profilePicture={profilePicture}
              isVerified={isVerified}
              likes={likes}
              retweets={retweets}
              replies={replies}
              views={views}
              theme={theme}
              isLiked={isLiked}
              isReposted={isReposted}
            />
          </div>
          
          {/* Export container - now visible but positioned off-screen */}
          <div 
            ref={exportContainerRef} 
            style={{
              position: 'fixed',
              top: '-9999px',
              left: '-9999px',
              width: '550px', // Fixed width that matches preview
              padding: '20px',
              backgroundColor: theme === 'dark' ? '#15202B' : '#FFFFFF',
              borderRadius: '12px', // Match the rounded corners
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <TweetPreview
              username={username}
              handle={handle}
              tweetText={tweetText}
              imageUrl={imageUrl}
              profilePicture={profilePicture}
              isVerified={isVerified}
              likes={likes}
              retweets={retweets}
              replies={replies}
              views={views}
              theme={theme}
              forExport={true} // Special flag for export version
            />
          </div>
          
          <Button
            className="w-full"
            onClick={downloadPreview}
            disabled={isExporting}
          >
            {isExporting ? 'Generating...' : 'Download Preview'}
            {!isExporting && <Download className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};


export default TweetGenerator;