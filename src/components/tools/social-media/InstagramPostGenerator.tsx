import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Download, Heart, MessageCircle, Bookmark, Share2, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useTheme } from 'next-themes';

interface InstagramPostPreviewProps {
  username: string;
  caption: string;
  imageUrl?: string;
  profilePicture?: string;
  isVerified?: boolean;
  likes?: number;
  comments?: number;
  location?: string;
  timestamp?: string;
  theme?: 'light' | 'dark';
  forExport?: boolean;
  isLiked?: boolean;
  isSaved?: boolean;
  hasStory?: boolean;
  hasTaggedUsers?: boolean;
}

const InstagramPostPreview = React.forwardRef<HTMLDivElement, InstagramPostPreviewProps>(
  ({ 
    username,
    caption,
    imageUrl,
    profilePicture,
    isVerified = false,
    likes = 0,
    comments = 0,
    location = '',
    timestamp = false,
    theme = 'light',
    forExport = false,
    isLiked = false,
    isSaved = false,
    hasStory = false,
    hasTaggedUsers = false
  }, ref) => {
    const isDark = theme === 'dark';
    
    return (
      <div 
        ref={ref}
        className={`w-full rounded-lg overflow-hidden ${isDark ? 'bg-zinc-900 text-white' : 'bg-white text-black'}`}
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          maxWidth: '470px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
          border: isDark ? '1px solid #2F3336' : '1px solid #dbdbdb',
          width: '470px',
          margin: forExport ? '0' : 'auto'
        }}
      >
        {/* Header */}
        <div className="p-3 flex items-center justify-between border-b" style={{ borderColor: isDark ? '#2F3336' : '#dbdbdb' }}>
          <div className="flex items-center gap-3" style={{ lineHeight: 1 }}>
            <div className={`relative w-8 h-8 flex-shrink-0 ${hasStory ? 'p-[2px]' : ''}`} style={{ minWidth: '32px', minHeight: '32px' }}>
              {hasStory && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500" style={{ padding: '2px' }}>
                  <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900" />
                </div>
              )}
              <div className={`${hasStory ? 'absolute inset-0 m-[2px]' : 'w-full h-full'} rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center`} style={{ backgroundColor: isDark ? '#333639' : '#FAFAFA' }}>
                {profilePicture ? (
                  <img src={profilePicture} alt={username} className="w-full h-full object-cover" style={{ display: 'block' }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-400">
                      <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-sm leading-none">{username || 'username'}</span>
                {isVerified && (
                  <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 40 40">
                    <path fill="currentColor" d="M20.0001 3.33337L25.1501 8.50004L32.0001 9.83337L32.8334 16.75L37.0001 22.5L32.8334 28.25L32.0001 35.1667L25.1501 36.5L20.0001 41.6667L14.8501 36.5L8.00008 35.1667L7.16675 28.25L3.00008 22.5L7.16675 16.75L8.00008 9.83337L14.8501 8.50004L20.0001 3.33337ZM17.6834 25.8334L12.5167 20.6667L14.6667 18.5167L17.6834 21.5334L25.3334 13.8834L27.4834 16.0334L17.6834 25.8334Z"/>
                  </svg>
                )}
                <span className="text-sm text-gray-500">• {timestamp}</span>
              </div>
              {location && <div className="text-xs">{location}</div>}
            </div>
          </div>
          <button className="p-1">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Image */}
        <div className="aspect-square bg-gray-100 relative">
          {imageUrl ? (
            <div className="relative w-full h-full">
              <img src={imageUrl} alt="Post" className="w-full h-full object-cover" />
              {hasTaggedUsers && (
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 rounded-full p-2">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
              <svg className="w-12 h-12" viewBox="0 0 24 24">
                <path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <button className="p-1">
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
              <button className="p-1">
                <MessageCircle className="w-6 h-6" />
              </button>
              <button className="p-1">
                <Share2 className="w-6 h-6" />
              </button>
            </div>
            <button className="p-1">
              <Bookmark className={`w-6 h-6 ${isSaved ? (isDark ? 'fill-white' : 'fill-black') : ''} ${isDark ? 'text-white' : 'text-gray-700'}`} />
            </button>
          </div>

          {/* Likes */}
          <div className="font-semibold text-sm mb-1">
            {likes.toLocaleString()} likes
          </div>

          {/* Caption */}
          <div className="text-sm mb-1">
            <span className="font-semibold mr-1">{username}</span>
            {caption}
          </div>

          

          
          {/* Comments */}
          {comments > 0 && (
                  <button className="text-gray-500 text-sm mb-1">
                    View all {comments.toLocaleString()} comments
                  </button>
                )}
                
                {/* Add Comment */}
                <div className="text-sm text-gray-500">Add a comment...</div>
        </div>
      </div>
    );
  }
);

const InstagramPostGenerator = () => {
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
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState(0);
  const [location, setLocation] = useState('');
  // Use app theme as default (with fallback to 'light') - only after mount
  const [theme, setTheme] = useState<'light' | 'dark'>(mounted && appTheme === 'dark' ? 'dark' : 'light');
  const [isExporting, setIsExporting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasStory, setHasStory] = useState(false);
  const [hasTaggedUsers, setHasTaggedUsers] = useState(false);
  const [timestamp, setTimestamp] = useState('1h');

  // Handle file uploads with proper cleanup
  const handleImageUpload = (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'post' && imageUrl) {
        URL.revokeObjectURL(imageUrl);
      } else if (type === 'profile' && profilePicture) {
        URL.revokeObjectURL(profilePicture);
      }
      
      const url = URL.createObjectURL(file);
      if (type === 'post') {
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

  // Download function
  const downloadPreview = async () => {
    if (!exportContainerRef.current) {
      toast.error('Export container not available');
      return;
    }

    try {
      setIsExporting(true);
      toast.loading('Preparing export...');

      // Helper function to wait for images to load and validate content
      const waitForImagesLoad = async (container: HTMLElement) => {
        const images = container.getElementsByTagName('img');
        const imagePromises = Array.from(images).map(async (img: HTMLImageElement) => {
          // Handle blob URLs and force image reload to ensure proper loading
          const currentSrc = img.src;
          if (currentSrc.startsWith('blob:')) {
            // For blob URLs, create a new blob URL to ensure fresh loading
            try {
              const response = await fetch(currentSrc);
              if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
              const blob = await response.blob();
              const newBlobUrl = URL.createObjectURL(blob);
              img.src = newBlobUrl;
              // Clean up the old blob URL
              URL.revokeObjectURL(currentSrc);
            } catch (error) {
              console.error('Error reloading blob URL:', error);
              // Try original source as fallback
              img.src = currentSrc;
            }
          } else {
            // For regular URLs, use standard reload technique
            img.src = '';
            img.src = currentSrc;
          }
          
          return new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              console.error(`Image load timeout for: ${img.src}`);
              if (img.src.startsWith('blob:')) {
                // For blob URLs that timeout, try to reload directly
                const originalSrc = img.src;
                img.src = originalSrc;
                // Clean up the blob URL if it's different from the original
                if (originalSrc !== currentSrc) {
                  URL.revokeObjectURL(originalSrc);
                }
              }
              reject(new Error(`Image load timeout: ${img.src}`));
            }, 15000);
      
            const checkImage = () => {
              if (img.complete && img.naturalWidth > 0) {
                clearTimeout(timeout);
                resolve();
              } else if (img.complete) {
                clearTimeout(timeout);
                reject(new Error(`Image failed to load properly: ${img.src}`));
              } else {
                requestAnimationFrame(checkImage);
              }
            };
      
            img.onload = () => {
              clearTimeout(timeout);
              if (img.naturalWidth === 0) {
                reject(new Error(`Image failed to load properly: ${img.src}`));
              } else {
                resolve();
              }
            };
      
            img.onerror = () => {
              clearTimeout(timeout);
              reject(new Error(`Failed to load image: ${img.src}`));
            };
      
            checkImage();
          });
        });
      
        await Promise.all(imagePromises);
      
        // Additional validation for container visibility
        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          throw new Error('Container has no dimensions');
        }
      };

      // Wait for initial images to load
      await waitForImagesLoad(exportContainerRef.current);

      // Force a small delay to ensure DOM updates are complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const exportNode = exportContainerRef.current;
      const html2canvas = (await import('html2canvas')).default;

      // Calculate the actual dimensions of the post with mobile considerations
      const postRect = exportNode.getBoundingClientRect();
      const width = isMobile ? Math.min(470, window.innerWidth - 32) : 470; // Adjust width for mobile
      const height = Math.max(
        postRect.height,
        exportNode.scrollHeight,
        exportNode.offsetHeight,
        width // Ensure minimum height matches width for aspect ratio
      );

      // Create a temporary container with fixed dimensions and proper styling
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: ${width}px;
        height: ${height}px;
        background-color: ${theme === 'dark' ? '#15202B' : '#FFFFFF'};
        opacity: 0;
        visibility: hidden;
        display: block;
        pointer-events: none;
        overflow: visible;
        transform: translateY(-100%);
        z-index: -1;
        max-width: 100vw;
        max-height: 100vh;
        transform-origin: top left;
        ${isMobile ? 'transform: scale(1);' : ''}
      `;

      // Add necessary styles to ensure proper rendering
      const style = document.createElement('style');
      style.textContent = `
        .aspect-square { aspect-ratio: 1/1 !important; }
        img { image-rendering: -webkit-optimize-contrast; }
        * { max-height: none !important; }
      `;
      document.head.appendChild(style);
      document.body.appendChild(tempContainer);
      
      // Move the export node to temp container
      const originalParent = exportNode.parentNode;
      const originalStyle = exportNode.style.cssText;
      tempContainer.appendChild(exportNode);

      // Force a repaint and ensure visibility
      tempContainer.offsetHeight;
      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => setTimeout(resolve, 500)); // Give extra time for rendering

      try {
        // Wait for images in the new container
        await waitForImagesLoad(exportNode);
      } catch (error) {
        console.error('Error loading images:', error);
        toast.error('Failed to load all images. Please try again.');
        // Cleanup
        if (exportNode && originalParent) {
          originalParent.appendChild(exportNode);
        }
        if (tempContainer && tempContainer.parentNode === document.body) {
          document.body.removeChild(tempContainer);
        }
        setIsExporting(false);
        return;
      }

      try {
        // Create a container for measuring full content height
        const measureContainer = document.createElement('div');
        measureContainer.style.cssText = `
          position: absolute;
          visibility: hidden;
          width: 470px;
          height: auto;
          overflow: visible;
        `;
        document.body.appendChild(measureContainer);

        // Clone the node and prepare it for rendering
        const clonedNode = exportNode.cloneNode(true) as HTMLElement;
        measureContainer.appendChild(clonedNode);
        
        // Position the node with proper dimensions and styling
        clonedNode.style.cssText = `
          width: 470px !important;
          height: auto !important;
          opacity: 1;
          visibility: visible;
          display: block;
          background-color: ${theme === 'dark' ? '#15202B' : '#FFFFFF'};
          overflow: visible;
          max-height: none;
        `;

        // Force layout recalculation and get actual dimensions
        void clonedNode.offsetHeight;

        // Ensure all child elements have proper dimensions
        const allElements = clonedNode.getElementsByTagName('*');
        for (let i = 0; i < allElements.length; i++) {
          const el = allElements[i] as HTMLElement;
          if (el.style.height === '100%') {
            el.style.height = 'auto';
          }
          if (el.classList.contains('aspect-square')) {
            el.style.aspectRatio = '1/1';
          }
        }

        // Get actual dimensions after layout stabilizes
        const actualHeight = Math.max(
          clonedNode.scrollHeight,
          clonedNode.offsetHeight,
          clonedNode.getBoundingClientRect().height
        );

        // Update height
        clonedNode.style.height = `${actualHeight}px`;
        
        // Validate content
        if (!clonedNode.offsetWidth || !actualHeight) {
          throw new Error('Preview container has no dimensions');
        }

        // Ensure all images are loaded
        const allImages = clonedNode.getElementsByTagName('img');
        if (allImages.length > 0 && !Array.from(allImages).every(img => img.complete && img.naturalWidth > 0)) {
          throw new Error('Not all images are fully loaded');
        }

        // Clean up any existing blob URLs before creating new ones
        const cleanupBlobUrls = () => {
          const images = clonedNode.getElementsByTagName('img');
          Array.from(images).forEach(img => {
            if (img.src.startsWith('blob:')) {
              URL.revokeObjectURL(img.src);
            }
          });
        };

        // Ensure all images are properly loaded before canvas creation
        await new Promise((resolve, reject) => {
          const images = clonedNode.getElementsByTagName('img');
          let loadedImages = 0;
          const totalImages = images.length;

          if (totalImages === 0) resolve(void 0);

          Array.from(images).forEach(img => {
            if (img.complete) {
              loadedImages++;
              if (loadedImages === totalImages) resolve(void 0);
            } else {
              img.onload = () => {
                loadedImages++;
                if (loadedImages === totalImages) resolve(void 0);
              };
              img.onerror = () => {
                console.error(`Failed to load image: ${img.src}`);
                // Try to reload the image once before failing
                const currentSrc = img.src;
                img.src = '';
                setTimeout(() => {
                  img.src = currentSrc;
                }, 100);
              };
            }
          });

          // Set a timeout for the entire loading process
          setTimeout(() => {
            reject(new Error('Timeout waiting for images to load'));
          }, 20000);
        });

        const canvas = await html2canvas(clonedNode, {
          scale: isMobile ? window.devicePixelRatio || 1 : 2,
          useCORS: true,
          allowTaint: true,
          windowWidth: width,
          windowHeight: height,
          backgroundColor: theme === 'dark' ? '#15202B' : '#FFFFFF',
          logging: true,
          width: width,
          height: height,
          foreignObjectRendering: false,
          removeContainer: false,
          x: window.scrollX,
          y: window.scrollY,
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.querySelector('[data-html2canvas-clone="true"]') as HTMLElement;
            if (clonedElement) {
              clonedElement.style.visibility = 'visible';
              clonedElement.style.opacity = '1';
            }
            const style = clonedDoc.createElement('style');
            style.innerHTML = `
              * { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important; }
              img { image-rendering: -webkit-optimize-contrast; }
              .aspect-square { aspect-ratio: 1 / 1; }
            `;
            clonedDoc.head.appendChild(style);
          }
        });

        // Clean up the cloned node if it exists and is a child of document.body
        if (clonedNode && clonedNode.parentNode === document.body) {
          document.body.removeChild(clonedNode);
        }

        // Verify canvas content with enhanced validation
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let hasContent = false;
        let totalPixels = 0;
        let nonEmptyPixels = 0;

        for (let i = 0; i < pixels.length; i += 4) {
          totalPixels++;
          const alpha = pixels[i + 3];
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          
          if (alpha > 0 && (r > 0 || g > 0 || b > 0)) {
            nonEmptyPixels++;
            if (nonEmptyPixels > totalPixels * 0.01) { // At least 1% of pixels should have content
              hasContent = true;
              break;
            }
          }
        }

        if (!hasContent) {
          throw new Error('Generated canvas is empty - no visible content detected');
        }

        // Verify canvas content
        if (canvas.width === 0 || canvas.height === 0) {
          throw new Error('Generated canvas has zero dimensions');
        }

        // Create and download the image with enhanced blob handling
        const downloadPromise = new Promise((resolve, reject) => {
          canvas.toBlob(async (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob from canvas'));
              return;
            }

            if (blob.size < 1000) {
              reject(new Error('Generated image is too small - possible empty or corrupt image'));
              return;
            }

            try {
              // Create a new blob with proper MIME type
              const validBlob = new Blob([blob], { type: 'image/png' });
              const url = URL.createObjectURL(validBlob);

              // Validate blob URL before creating download link
              const validateImage = () => new Promise((resolveValidation, rejectValidation) => {
                const img = new Image();
                const timeout = setTimeout(() => {
                  URL.revokeObjectURL(url);
                  rejectValidation(new Error('Image validation timeout'));
                }, 5000);

                img.onload = () => {
                  clearTimeout(timeout);
                  if (img.width > 0 && img.height > 0) {
                    resolveValidation(void 0);
                  } else {
                    URL.revokeObjectURL(url);
                    rejectValidation(new Error('Invalid image dimensions'));
                  }
                };

                img.onerror = () => {
                  clearTimeout(timeout);
                  URL.revokeObjectURL(url);
                  rejectValidation(new Error('Failed to validate image'));
                };

                img.src = url;
              });

              await validateImage();

              const link = document.createElement('a');
              link.href = url;
              link.download = `instagram-post-${Date.now()}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              resolve(true);
            } catch (err) {
              console.error('Download error:', err);
              reject(new Error(`Failed to process image: ${err.message}`));
            }
          }, 'image/png', 1.0);
        });

        await downloadPromise;
        toast.success('Post image exported successfully!');
      } finally {
        // Restore DOM state
        originalParent.appendChild(exportNode);
        document.body.removeChild(tempContainer);
        exportNode.style.cssText = originalStyle;
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export post. Please try again.');
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
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (optional)</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add location"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="caption">Caption</Label>
                <Textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  className="min-h-[100px]"
                />
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
                <Label htmlFor="timestamp">Post Age</Label>
                <Input
                  id="timestamp"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  placeholder="e.g. 1m, 1h, 1d, 1w, 1y"
                />
              </div>

              <div className="space-y-2">
                <Label>Post Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'post')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
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
                      id="saved"
                      checked={isSaved}
                      onCheckedChange={setIsSaved}
                    />
                    <Label htmlFor="saved">Saved</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="story"
                      checked={hasStory}
                      onCheckedChange={setHasStory}
                    />
                    <Label htmlFor="story">Has Story</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="tagged"
                      checked={hasTaggedUsers}
                      onCheckedChange={setHasTaggedUsers}
                    />
                    <Label htmlFor="tagged">Tagged Users</Label>
                  </div>

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
            </div>
          </Card>

          <Card className="p-6 space-y-6">
            <h3 className="text-lg font-semibold">Engagement Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="comments">Comments</Label>
                <Input
                  id="comments"
                  type="number"
                  min="0"
                  value={comments}
                  onChange={(e) => setComments(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Preview section */}
        <div className="lg:w-[520px] space-y-4">
          <div className="bg-background p-4 rounded-lg flex justify-center" ref={previewRef}>
            <InstagramPostPreview
              username={username}
              caption={caption}
              imageUrl={imageUrl}
              profilePicture={profilePicture}
              isVerified={isVerified}
              likes={likes}
              comments={comments}
              location={location}
              theme={theme}
              isLiked={isLiked}
              isSaved={isSaved}
              hasStory={hasStory}
              hasTaggedUsers={hasTaggedUsers}
              timestamp={timestamp}
            />
          </div>
          
          <div 
            ref={exportContainerRef} 
            style={{
              position: 'fixed',
              top: '-9999px',
              left: '-9999px',
              width: '470px',
              padding: '20px',
              backgroundColor: theme === 'dark' ? '#15202B' : '#FFFFFF',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <InstagramPostPreview
              username={username}
              caption={caption}
              imageUrl={imageUrl}
              profilePicture={profilePicture}
              isVerified={isVerified}
              likes={likes}
              comments={comments}
              location={location}
              theme={theme}
              forExport={true}
              isLiked={isLiked}
              isSaved={isSaved}
              hasStory={hasStory}
              hasTaggedUsers={hasTaggedUsers}
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

export default InstagramPostGenerator;