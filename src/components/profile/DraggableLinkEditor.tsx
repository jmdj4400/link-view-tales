import { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Eye, EyeOff, TrendingUp, TrendingDown, Minus, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LinkFavicon } from "@/components/links/LinkFavicon";
import { LinkStatusBadge } from "@/components/links/LinkStatusBadge";
import { LinkIntegrityScore } from "@/components/links/LinkIntegrityScore";
import { formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Link {
  id: string;
  title: string;
  dest_url: string;
  position: number;
  is_active: boolean;
  health_status?: string | null;
  current_clicks?: number;
}

interface LinkWithStats extends Link {
  lastClick?: Date;
  clicks24h?: number;
  trend?: 'up' | 'down' | 'stable';
  integrityScore?: number;
}

interface DraggableLinkEditorProps {
  links: Link[];
  onReorder: () => void;
}

function SortableLink({ link, onToggleActive }: { link: LinkWithStats; onToggleActive: (id: string, active: boolean) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatus = (): 'healthy' | 'issues' | 'low-activity' | 'unknown' => {
    if (!link.clicks24h) return 'low-activity';
    if (link.health_status === 'excellent' || link.health_status === 'good') return 'healthy';
    if (link.health_status === 'warning' || link.health_status === 'critical') return 'issues';
    return 'unknown';
  };

  const TrendIcon = link.trend === 'up' ? TrendingUp : link.trend === 'down' ? TrendingDown : Minus;

  const getHealthColor = () => {
    if (!link.integrityScore) return 'bg-muted-foreground/40';
    if (link.integrityScore >= 80) return 'bg-green-500';
    if (link.integrityScore >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getHealthTooltip = () => {
    if (!link.integrityScore) return 'No recent data';
    return `${link.integrityScore}% success rate - Based on recent redirect success inside social in-app browsers.`;
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-2.5 sm:p-3 md:p-4 flex items-start gap-2 sm:gap-3 bg-card hover:bg-accent/5 transition-all duration-200 card-hover overflow-hidden"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing pt-1 shrink-0">
        <GripVertical className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
      </div>
      
      <LinkFavicon url={link.dest_url} size="sm" className="mt-1 shrink-0 hidden sm:block" />
      
      <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${getHealthColor()}`} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{getHealthTooltip()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="font-medium truncate text-xs sm:text-sm md:text-base">{link.title}</p>
            </div>
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">{link.dest_url}</p>
            {link.lastClick && (
              <p className="text-[9px] sm:text-[10px] text-muted-foreground/70 mt-0.5">
                Last arrival: {formatDistanceToNow(link.lastClick, { addSuffix: true })}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <LinkStatusBadge status={getStatus()} />
          {link.integrityScore !== undefined && (
            <LinkIntegrityScore score={link.integrityScore} size="sm" showLabel={false} />
          )}
          
          {link.lastClick && (
            <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-muted-foreground">
              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="hidden md:inline">{formatDistanceToNow(link.lastClick, { addSuffix: true })}</span>
            </div>
          )}
          
          {link.clicks24h !== undefined && (
            <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-mono-data">
              <TrendIcon className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${
                link.trend === 'up' ? 'text-success' : 
                link.trend === 'down' ? 'text-destructive' : 
                'text-muted-foreground'
              }`} />
              <span>{link.clicks24h} <span className="hidden sm:inline">today</span></span>
            </div>
          )}
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onToggleActive(link.id, !link.is_active)}
        className="shrink-0 h-8 w-8 sm:h-9 sm:w-9"
      >
        {link.is_active ? <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
      </Button>
    </Card>
  );
}

export function DraggableLinkEditor({ links: initialLinks, onReorder }: DraggableLinkEditorProps) {
  const [links, setLinks] = useState<LinkWithStats[]>(initialLinks);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch analytics for each link
  useEffect(() => {
    const fetchLinkStats = async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

      const linkIds = initialLinks.map(l => l.id);

      // Fetch events for last 48h
      const { data: events } = await supabase
        .from('events')
        .select('link_id, created_at')
        .eq('event_type', 'click')
        .in('link_id', linkIds)
        .gte('created_at', twoDaysAgo.toISOString());

      // Fetch redirects for integrity score
      const { data: redirects } = await supabase
        .from('redirects')
        .select('link_id, success')
        .in('link_id', linkIds)
        .gte('ts', yesterday.toISOString());

      const enrichedLinks: LinkWithStats[] = initialLinks.map(link => {
        const linkEvents = events?.filter(e => e.link_id === link.id) || [];
        const linkRedirects = redirects?.filter(r => r.link_id === link.id) || [];

        const clicks24h = linkEvents.filter(e => 
          new Date(e.created_at) >= yesterday
        ).length;

        const clicks48h = linkEvents.filter(e => 
          new Date(e.created_at) >= twoDaysAgo && new Date(e.created_at) < yesterday
        ).length;

        const trend = clicks24h > clicks48h ? 'up' : 
                     clicks24h < clicks48h ? 'down' : 'stable';

        const successfulRedirects = linkRedirects.filter(r => r.success).length;
        const integrityScore = linkRedirects.length > 0 
          ? Math.round((successfulRedirects / linkRedirects.length) * 100)
          : undefined;

        const sortedEvents = linkEvents.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const lastClick = sortedEvents[0] ? new Date(sortedEvents[0].created_at) : undefined;

        return {
          ...link,
          lastClick,
          clicks24h,
          trend,
          integrityScore,
        };
      });

      setLinks(enrichedLinks);
    };

    fetchLinkStats();
  }, [initialLinks]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((link) => link.id === active.id);
      const newIndex = links.findIndex((link) => link.id === over.id);

      const newLinks = arrayMove(links, oldIndex, newIndex);
      setLinks(newLinks);

      // Update positions in database
      const updates = newLinks.map((link, index) => ({
        id: link.id,
        position: index,
      }));

      for (const update of updates) {
        await supabase
          .from("links")
          .update({ position: update.position })
          .eq("id", update.id);
      }

      toast.success("Link order updated");
      onReorder();
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    await supabase.from("links").update({ is_active: active }).eq("id", id);
    setLinks((prev) => prev.map((link) => (link.id === id ? { ...link, is_active: active } : link)));
    toast.success(active ? "Link activated" : "Link hidden");
    onReorder();
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {links.map((link) => (
            <SortableLink key={link.id} link={link} onToggleActive={handleToggleActive} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
