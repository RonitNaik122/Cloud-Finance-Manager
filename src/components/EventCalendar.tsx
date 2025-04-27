import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Event } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EventCalendarProps {
  events: Event[];
}

export function EventCalendar({ events }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get the first and last day of the current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Get all days in the current month
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get the day of the week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = getDay(monthStart);
  
  // Create an array of empty cells for days before the first day of the month
  const emptyCells = Array(firstDayOfMonth).fill(null);
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };
  
  // Calculate the color intensity based on the total amount of events for a day
  const getColorIntensity = (dayEvents: Event[]) => {
    if (dayEvents.length === 0) return 0;
    
    // Calculate total amount for the day
    const totalAmount = dayEvents.reduce((sum, event) => sum + Number(event.amount), 0);
    
    // Normalize the amount to a value between 0 and 1
    // Assuming a maximum amount of 10000 for full intensity
    const normalizedAmount = Math.min(totalAmount / 10000, 1);
    
    // Return a value between 0.1 and 1 for color intensity
    return 0.1 + (normalizedAmount * 0.9);
  };
  
  // Get the color for a day based on the events
  const getDayColor = (dayEvents: Event[]) => {
    if (dayEvents.length === 0) return "bg-transparent";
    
    // Check if all events are of the same type
    const allIncome = dayEvents.every(event => event.type === "income");
    const allExpense = dayEvents.every(event => event.type === "expense");
    
    const intensity = getColorIntensity(dayEvents);
    
    if (allIncome) {
      return `bg-green-${Math.round(intensity * 500)}`;
    } else if (allExpense) {
      return `bg-red-${Math.round(intensity * 500)}`;
    } else {
      // Mixed events - use a neutral color
      return `bg-gray-${Math.round(intensity * 500)}`;
    }
  };
  
  // Day names for the calendar header
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {/* Calendar header */}
          {dayNames.map(day => (
            <div key={day} className="text-center font-medium py-2 text-sm text-muted-foreground">
              {day}
            </div>
          ))}
          
          {/* Empty cells for days before the first day of the month */}
          {emptyCells.map((_, index) => (
            <div key={`empty-${index}`} className="h-24 border rounded-md"></div>
          ))}
          
          {/* Days of the month */}
          {daysInMonth.map(day => {
            const dayEvents = getEventsForDay(day);
            const dayColor = getDayColor(dayEvents);
            const isCurrentDay = isToday(day);
            
            return (
              <TooltipProvider key={day.toString()}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={cn(
                        "h-24 border rounded-md p-2 relative transition-colors",
                        dayColor,
                        !isSameMonth(day, currentDate) && "opacity-50",
                        isCurrentDay && "ring-2 ring-primary ring-offset-2"
                      )}
                    >
                      <div className={cn(
                        "text-sm font-medium mb-1",
                        isCurrentDay && "text-primary font-bold"
                      )}>
                        {format(day, "d")}
                      </div>
                      {dayEvents.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs font-medium">
                            {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {dayEvents.slice(0, 3).map((event, idx) => (
                              <div 
                                key={idx} 
                                className={cn(
                                  "w-2 h-2 rounded-full",
                                  event.type === "income" ? "bg-green-500" : "bg-red-500"
                                )}
                              />
                            ))}
                            {dayEvents.length > 3 && (
                              <div className="text-xs text-muted-foreground">
                                +{dayEvents.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="p-2">
                      <p className="font-medium">{format(day, "MMMM d, yyyy")}</p>
                      {dayEvents.length > 0 ? (
                        <div className="mt-2 space-y-1">
                          {dayEvents.map((event, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="truncate max-w-[150px]">{event.title}</span>
                              <span className={cn(
                                "ml-2 font-medium",
                                event.type === "income" ? "text-green-600" : "text-red-600"
                              )}>
                                ${typeof event.amount === 'number' ? event.amount.toFixed(2) : Number(event.amount).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">No events</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
        
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm">Income</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm">Expense</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
            <span className="text-sm">Mixed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 ring-2 ring-primary ring-offset-2 rounded-full mr-2"></div>
            <span className="text-sm">Today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 