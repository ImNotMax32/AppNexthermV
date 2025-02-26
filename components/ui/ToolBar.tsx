import React from 'react';
import { PaintBucket, Layout } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { themes, layouts } from '@/app/protected/devis/types/devis';

interface ToolBarProps {
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
  selectedLayout: string;
  setSelectedLayout: (layout: string) => void;
}

export const ToolBar: React.FC<ToolBarProps> = ({
  selectedTheme,
  setSelectedTheme,
  selectedLayout,
  setSelectedLayout
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-8 flex gap-4 items-center">
      <div className="flex items-center gap-2">
        <PaintBucket className="h-5 w-5 text-gray-500" />
        <Select value={selectedTheme} onValueChange={setSelectedTheme}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Thème" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(themes).map(([key, theme]) => (
              <SelectItem key={key} value={key}>{theme.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Layout className="h-5 w-5 text-gray-500" />
        <Select value={selectedLayout} onValueChange={setSelectedLayout}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Disposition" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(layouts).map(([key, layout]) => (
              <SelectItem key={key} value={key}>{layout.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};