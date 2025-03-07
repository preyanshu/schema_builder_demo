import { FC, memo, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical } from "lucide-react";
import { SortableListProps } from '../types';

export const SortableList: FC<SortableListProps> = memo(({ items, onReorder }) => {
    const handleDragEnd = useCallback(
      (result:any) => {
        if (!result.destination) return;
        const newItems = Array.from(items);
        const [removed] = newItems.splice(result.source.index, 1);
        newItems.splice(result.destination.index, 0, removed);
        onReorder(newItems);
      },
      [items, onReorder]
    );
    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="field-order">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {items.map((item, index) => (
                <Draggable
                  key={`${item}-${index}`}
                  draggableId={`${item}-${index}`}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center gap-2 p-2 bg-muted/50 rounded border overflow-x-hidden max-w-[${100-40}%]`}

                    >
                      <div
                        {...provided.dragHandleProps}
                        className="cursor-move p-1 rounded"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="flex-1 text-sm">{item}</span>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  });