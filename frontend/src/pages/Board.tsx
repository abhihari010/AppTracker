import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState } from "react";
import api from "../api";
import { Nav } from "../components/Nav";
import { ApplicationCard } from "../components/ApplicationCard";

const STATUSES = [
  { id: "WISHLIST", label: "Wishlist", color: "bg-gray-100" },
  { id: "APPLIED", label: "Applied", color: "bg-blue-100" },
  {
    id: "ONLINE_ASSESSMENT",
    label: "Online Assessment",
    color: "bg-purple-100",
  },
  { id: "INTERVIEWED", label: "Interviewed", color: "bg-yellow-100" },
  { id: "OFFER", label: "Offer", color: "bg-green-100" },
  { id: "REJECTED", label: "Rejected", color: "bg-red-100" },
  { id: "ACCEPTED", label: "Accepted", color: "bg-emerald-100" },
  { id: "DECLINED", label: "Declined", color: "bg-orange-100" },
  { id: "GHOSTED", label: "Ghosted", color: "bg-slate-100" },
];

export default function Board() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const response = await api.get("/api/applications");
      return response.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await api.put(`/api/applications/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const applicationId = active.id as number;
      const newStatus = over.id as string;

      updateStatusMutation.mutate({ id: applicationId, status: newStatus });
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const getApplicationsByStatus = (status: string) => {
    return applications.filter((app: any) => app.status === status);
  };

  const activeApplication = applications.find(
    (app: any) => app.id === activeId
  );

  if (isLoading) {
    return (
      <div>
        <Nav />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Kanban Board
          </h1>

          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="flex gap-4 overflow-x-auto pb-4">
              {STATUSES.map((status) => (
                <Column
                  key={status.id}
                  status={status}
                  applications={getApplicationsByStatus(status.id)}
                  onCardClick={(id) => navigate(`/applications/${id}`)}
                />
              ))}
            </div>

            <DragOverlay>
              {activeId && activeApplication ? (
                <ApplicationCard
                  application={activeApplication}
                  className="rotate-3 opacity-90"
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
}

import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";

function Column({ status, applications, onCardClick }: any) {
  const { setNodeRef } = useDroppable({
    id: status.id,
  });

  return (
    <div className="flex-shrink-0 w-80">
      <div className={`${status.color} rounded-lg p-3 mb-3`}>
        <h3 className="font-semibold text-gray-900 flex items-center justify-between">
          <span>{status.label}</span>
          <span className="text-sm font-normal text-gray-600">
            {applications.length}
          </span>
        </h3>
      </div>

      <div
        ref={setNodeRef}
        className="space-y-3 min-h-[200px] bg-gray-100 rounded-lg p-3"
      >
        {applications.map((application: any) => (
          <DraggableCard
            key={application.id}
            application={application}
            onClick={() => onCardClick(application.id)}
          />
        ))}
        {applications.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            Drop cards here
          </p>
        )}
      </div>
    </div>
  );
}

function DraggableCard({ application, onClick }: any) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: application.id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ApplicationCard application={application} onClick={onClick} />
    </div>
  );
}
