import React from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Link } from 'react-router-dom';
import { Clock, User, Calendar, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

const BlogList = () => {
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);

  const blogPosts = [
    {
      id: 'image-optimization-guide',
      title: 'Advanced Image Optimization Guide',
      description: 'Master the art of image optimization with comprehensive strategies for better web performance.',
      author: 'SnapTools Team',
      date: '2024-01-15',
      tags: ['Image Processing', 'Web Performance', 'Optimization'],
      readTime: '10 min read'
    },
    {
      id: 'pdf-manipulation-techniques',
      title: 'PDF Manipulation Techniques',
      description: 'Learn advanced techniques for manipulating PDF files efficiently and securely.',
      author: 'SnapTools Team',
      date: '2024-01-10',
      tags: ['PDF', 'Document Processing', 'Tutorial'],
      readTime: '8 min read'
    },
    {
      id: 'secure-password-guide',
      title: 'Secure Password Guide',
      description: 'Essential strategies for creating and managing secure passwords in the digital age.',
      author: 'SnapTools Team',
      date: '2024-01-05',
      tags: ['Security', 'Password Management', 'Best Practices'],
      readTime: '12 min read'
    },
    {
      id: 'qr-code-best-practices',
      title: 'QR Code Best Practices',
      description: 'Learn how to create effective QR codes for various purposes and applications.',
      author: 'SnapTools Team',
      date: '2024-01-01',
      tags: ['QR Codes', 'Bar Code', 'Mobile Apps'],
      readTime: '9 min read'
    },
    {
      id: 'unit-conversion-guide',
      title: 'Unit Conversion Guide',
      description: 'Master the art of converting units effortlessly with our comprehensive guide.',
      author: 'SnapTools Team',
      date: '2024-01-05',
      tags: ['Unit Conversion', 'Measurement', 'Tutorial'],
      readTime: '15 min read'
    },
    {
      id: 'developer-tool-kit-guide',
      title: 'Developer Tool Kit Guide',
      description: 'Explore our comprehensive developer tool kit for efficient coding and development.',
      author: 'SnapTools Team',
      date: '2024-01-01',
      tags: ['Developer Tools', 'Coding', 'Tutorial'],
      readTime: '18 min read'
    }

  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow pt-40 pb-20 relative overflow-hidden">
        {/* Architectural Background */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2 -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/3 blur-[120px] rounded-full -translate-x-1/3 translate-y-1/3 -z-10"></div>

        <div className="container max-w-7xl mx-auto px-6">
          {/* Header Section */}
          <header className="mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm"
            >
              Editorial Workspace
            </motion.div>
            <h1 className="text-6xl md:text-9xl font-serif font-black tracking-tighter mb-10 leading-[0.8] bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50">
              Technical <br />
              <em className="italic font-light text-primary">Insights.</em>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground/90 max-w-3xl leading-relaxed font-medium">
              Strategic protocols and deep dives into document infrastructure, imaging fidelity, and cryptographic persistence synthesized by our engineering division.
            </p>
          </header>

          {/* Filter & Search Dashboard */}
          <div className="relative z-10 mb-20 space-y-8">
            <div className="relative group max-w-4xl">
              <div className="absolute inset-0 bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative flex items-center bg-white/50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 backdrop-blur-3xl rounded-[2rem] overflow-hidden p-2 ring-1 ring-black/[0.02]">
                <div className="relative flex-grow">
                  <Input
                    type="text"
                    placeholder="Search technical repository..."
                    className="pl-14 pr-6 py-10 rounded-2xl border-none bg-transparent focus-visible:ring-0 text-xl font-medium placeholder:text-muted-foreground/30 transition-all duration-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-7 h-7 text-muted-foreground/40 group-hover:text-primary transition-colors duration-500" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-8 py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] font-black transition-all duration-500 border ${!selectedTag ? 'bg-primary border-primary text-white shadow-2xl shadow-primary/40' : 'bg-transparent border-black/5 dark:border-white/5 text-muted-foreground hover:border-primary/30 hover:text-primary'}`}
              >
                All Modules
              </button>
              {Array.from(new Set(blogPosts.flatMap(post => post.tags))).sort().map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-6 py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] font-black transition-all duration-500 border ${selectedTag === tag ? 'bg-primary border-primary text-white shadow-2xl shadow-primary/40' : 'bg-transparent border-black/5 dark:border-white/5 text-muted-foreground hover:border-primary/30 hover:text-primary'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
              {blogPosts
                .filter(post => {
                  const matchesTag = !selectedTag || post.tags.includes(selectedTag);
                  const matchesSearch = searchQuery.trim() === '' || [
                    post.title,
                    post.description,
                    ...post.tags,
                    post.author
                  ].some(text =>
                    text.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  return matchesTag && matchesSearch;
                })
                .map((post, index) => (
                  <motion.article
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="group"
                  >
                    <Link to={`/blog/posts/${post.id}`} className="block h-full">
                      <div className="relative h-full p-10 rounded-[3.5rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.01] hover:bg-white dark:hover:bg-white/[0.04] transition-all duration-700 shadow-sm overflow-hidden flex flex-col group-hover:shadow-2xl group-hover:shadow-primary/5 group-hover:-translate-y-3">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                        {/* Status Bar */}
                        <div className="flex items-center justify-between mb-10 relative z-10">
                          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            {post.tags[0]}
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                            v1.0.4
                          </div>
                        </div>

                        <div className="relative mb-8">
                          <h2 className="text-4xl font-serif font-black tracking-tighter leading-[0.9] text-foreground group-hover:text-primary transition-colors duration-700">
                            {post.title}
                          </h2>
                        </div>

                        <p className="text-lg text-muted-foreground/80 font-medium leading-relaxed mb-10 flex-grow">
                          {post.description}
                        </p>

                        <div className="flex items-center justify-between pt-8 border-t border-black/5 dark:border-white/5 relative z-10">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-700">
                                <User className="w-4 h-4" />
                              </div>
                              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{post.author}</span>
                              <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">{post.date}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest">{post.readTime}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
            </div>
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogList;