'use client';

import { ArrowDown, ArrowUp, Check, Info, PlusCircle, Target, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { GlobalPresetFormData } from '@/hooks/presets/use-global-preset-form';

interface GlobalPresetFormProps {
  formData: GlobalPresetFormData;
  collections: string[];
  forceIncludeInput: string;
  forceIncludePosition: string;
  forceExcludeInput: string;
  stopWordInput: string;
  onFormDataChange: (updates: Partial<GlobalPresetFormData>) => void;
  onForceIncludeInputChange: (value: string) => void;
  onForceIncludePositionChange: (value: string) => void;
  onForceExcludeInputChange: (value: string) => void;
  onStopWordInputChange: (value: string) => void;
  onAddForceInclude: () => void;
  onRemoveForceInclude: (index: number) => void;
  onAddForceExclude: () => void;
  onRemoveForceExclude: (index: number) => void;
  onAddStopWord: () => void;
  onRemoveStopWord: (index: number) => void;
}

export default function GlobalPresetForm({
  formData,
  collections,
  forceIncludeInput,
  forceIncludePosition,
  forceExcludeInput,
  stopWordInput,
  onFormDataChange,
  onForceIncludeInputChange,
  onForceIncludePositionChange,
  onForceExcludeInputChange,
  onStopWordInputChange,
  onAddForceInclude,
  onRemoveForceInclude,
  onAddForceExclude,
  onRemoveForceExclude,
  onAddStopWord,
  onRemoveStopWord,
}: GlobalPresetFormProps) {
  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id">
                Preset ID *
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="ml-1 h-3 w-3 inline" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Unique identifier for this search preset</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) => onFormDataChange({ id: e.target.value })}
                placeholder="e.g., featured-products"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collection">
                Collection *
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="ml-1 h-3 w-3 inline" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The collection this preset applies to</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Select
                value={formData.collection}
                onValueChange={(value) => onFormDataChange({ collection: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select collection" />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((collection) => (
                    <SelectItem key={collection} value={collection}>
                      {collection}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="query">
                Search Query *
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="ml-1 h-3 w-3 inline" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The search query that triggers this preset</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Input
                id="query"
                value={formData.query}
                onChange={(e) => onFormDataChange({ query: e.target.value })}
                placeholder="e.g., apple iphone"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="match">Match Type</Label>
              <Select
                value={formData.match}
                onValueChange={(value) => onFormDataChange({ match: value as 'exact' | 'contains' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="exact">Exact</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="appliesTo">Applies To</Label>
              <Select
                value={formData.appliesTo}
                onValueChange={(value) => onFormDataChange({ appliesTo: value as 'always' | 'on_match' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="always">Always</SelectItem>
                  <SelectItem value="on_match">On Match</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Advanced Configuration */}
        <Tabs defaultValue="includes" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="includes">Force Include</TabsTrigger>
            <TabsTrigger value="excludes">Force Exclude</TabsTrigger>
            <TabsTrigger value="stopwords">Stop Words</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="includes" className="space-y-4">
            <Alert>
              <Target className="h-4 w-4" />
              <AlertDescription>
                Force include specific documents in search results. Optionally specify position.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Input
                placeholder="Document ID"
                value={forceIncludeInput}
                onChange={(e) => onForceIncludeInputChange(e.target.value)}
              />
              <Input
                placeholder="Position (optional)"
                type="number"
                value={forceIncludePosition}
                onChange={(e) => onForceIncludePositionChange(e.target.value)}
                className="w-32"
              />
              <Button onClick={onAddForceInclude} size="sm">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {formData.forceInclude.map((item, index) => (
                <div key={index} className="flex items-center justify-between rounded-md border p-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.id}</Badge>
                    {item.position && (
                      <Badge variant="secondary">Position: {item.position}</Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveForceInclude(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="excludes" className="space-y-4">
            <Alert>
              <X className="h-4 w-4" />
              <AlertDescription>
                Force exclude specific documents from search results.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Input
                placeholder="Document ID to exclude"
                value={forceExcludeInput}
                onChange={(e) => onForceExcludeInputChange(e.target.value)}
              />
              <Button onClick={onAddForceExclude} size="sm">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {formData.forceExclude.map((item, index) => (
                <div key={index} className="flex items-center justify-between rounded-md border p-2">
                  <Badge variant="outline">{item.id}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveForceExclude(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stopwords" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Define stop words that should be ignored during search for this preset.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Input
                placeholder="Stop word"
                value={stopWordInput}
                onChange={(e) => onStopWordInputChange(e.target.value)}
              />
              <Button onClick={onAddStopWord} size="sm">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.stopWords.map((word, index) => (
                <div key={index} className="flex items-center gap-1 rounded-md border px-2 py-1">
                  <span className="text-sm">{word}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveStopWord(index)}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="filterBy">
                  Filter By
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="ml-1 h-3 w-3 inline" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Additional filters to apply (e.g., category:books)</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Textarea
                  id="filterBy"
                  value={formData.filterBy}
                  onChange={(e) => onFormDataChange({ filterBy: e.target.value })}
                  placeholder="e.g., category:electronics && price:>100"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortBy">
                  Sort By
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="ml-1 h-3 w-3 inline" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Custom sorting for this preset (e.g., price:desc)</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  id="sortBy"
                  value={formData.sortBy}
                  onChange={(e) => onFormDataChange({ sortBy: e.target.value })}
                  placeholder="e.g., price:desc, rating:desc"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}