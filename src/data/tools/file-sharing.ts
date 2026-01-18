import { Tool } from '@/types/tool';
import { Share2, Upload, Download } from 'lucide-react';

export const fileSharing: Tool = {
  id: 'file-sharing',
  name: 'File Sharing',
  description: 'Share files securely with anyone using unique links and QR codes',
  category: 'Utilities',
  icon: Share2,
  tools: [
    {
      id: 'share-file',
      name: 'Share File',
      description: 'Upload and share files with anyone through unique links or QR codes',
      path: '/tools/file-sharing/share-file',
      component: () => import('@/components/tools/file-sharing/ShareFile'),
      icon: Upload
    },
    {
      id: 'share-view',
      name: 'View Shared File',
      description: 'View and download shared files',
      path: '/s/:id',
      component: () => import('@/components/tools/file-sharing/ShareFileView'),
      icon: Download,
      hidden: true
    }
  ]
};