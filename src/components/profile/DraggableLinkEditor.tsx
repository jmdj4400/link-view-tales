import { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Link {
  id: string;
  title: string;
  dest_url: string;
  position: number;
  is_active: boolean;
}

interface DraggableLinkEditorProps {
  links: Link[];
  onReorder: () => void;
}

function SortableLink({ link, onToggleActive }: { link: Link; onToggleActive: (id: string, active: boolean) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-4 flex items-center gap-3 bg-card hover:bg-accent/5 transition-colors"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{link.title}</p>
        <p className="text-sm text-muted-foreground truncate">{link.dest_url}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onToggleActive(link.id, !link.is_active)}
        className="shrink-0"
      >
        {link.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </Button>
    </Card>
  );
}

export function DraggableLinkEditor({ links: initialLinks, onReorder }: DraggableLinkEditorProps) {
  const [links, setLinks] = useState(initialLinks);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
