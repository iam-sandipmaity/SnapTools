import { ReactNode } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme-toggle';

interface BlogLayoutProps {
  children: ReactNode;
}

const BlogLayout = ({ children }: BlogLayoutProps) => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Header />

      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-[100]"
        style={{ scaleX }}
      />

      <main className="flex-grow container max-w-4xl mx-auto px-6 pt-32 pb-40">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/blog')}
          className="group inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all mb-16 bg-transparent border-none cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
            <ArrowLeft size={14} />
          </div>
          Back to Editorial Repository
        </motion.button>

        <article className="prose prose-slate dark:prose-invert max-w-none 
          prose-headings:font-serif prose-headings:font-black prose-headings:tracking-tighter 
          prose-h1:text-5xl md:prose-h1:text-7xl prose-h1:mb-12 prose-h1:leading-[0.9]
          prose-h2:text-3xl md:prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-8
          prose-p:text-xl prose-p:leading-relaxed prose-p:text-muted-foreground/90 prose-p:font-medium
          prose-strong:text-foreground prose-strong:font-black
          prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-bold
          prose-img:rounded-[3rem] prose-img:border prose-img:border-black/5 dark:prose-img:border-white/5 prose-img:shadow-2xl
          prose-ul:list-none prose-ul:pl-0
          prose-li:relative prose-li:pl-0 prose-li:mb-4
          prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:p-8 prose-blockquote:rounded-r-[2rem] prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:text-xl
        ">
          {children}
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogLayout;