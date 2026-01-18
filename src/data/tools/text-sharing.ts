import { Tool } from '@/types/tool';
import { MessageSquareShare, Edit3, Eye } from 'lucide-react';

export const textSharing: Tool = {
  id: 'text-sharing',
  name: 'Text Sharing',
  description: 'Share text in real-time with anyone using P2P connections',
  category: 'Utilities',
  icon: MessageSquareShare,
  tools: [
    {
      id: 'share-text',
      name: 'Share Text',
      description: 'Create and share text that updates in real-time for viewers',
      path: '/tools/text-sharing/share-text',
      component: () => import('@/components/tools/text-sharing/ShareText'),
      icon: Edit3
    },
    {
      id: 'text-view',
      name: 'View Shared Text',
      description: 'View shared text in real-time',
      path: '/t/:id',
      component: () => import('@/components/tools/text-sharing/ShareTextView'),
      icon: Eye,
      hidden: true
    }
  ]
};
