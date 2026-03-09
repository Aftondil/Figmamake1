import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, Clock, Users, Star, CheckCircle2, User, HelpCircle } from "lucide-react";
import { cn } from "../utils/cn";
import { SERVICES, generateTimeSlots, BookingState } from "../data";
import { format, addDays, startOfToday, isSameDay } from "date-fns";

interface Props {
  booking: BookingState;
  updateBooking: (updates: Partial<BookingState>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export function BookingSteps({ booking, updateBooking, nextStep, prevStep }: Props) {
  const steps = [
    { num: 1, title: "Guest Details" },
    { num: 2, title: "Select Services" },
    { num: 3, title: "Date & Time" },
    { num: 4, title: "Confirm Details" },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Progress Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex space-x-1 sm:space-x-3 text-xs sm:text-sm font-medium text-slate-400">
          {steps.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div
                className={cn(
                  "flex items-center transition-colors duration-300",
                  booking.step >= s.num ? "text-indigo-600" : "text-slate-300"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full border text-[10px] sm:text-xs mr-1.5 sm:mr-2 transition-all duration-300",
                    booking.step === s.num
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold"
                      : booking.step > s.num
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-200 text-slate-400"
                  )}
                >
                  {booking.step > s.num ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
                </span>
                <span className="hidden sm:inline-block">{s.title}</span>
              </div>
              {idx < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 mx-1 sm:mx-2 text-slate-200" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6 sm:p-8 flex-1 min-h-[450px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={booking.step}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="h-full flex flex-col"
          >
            {booking.step === 1 && (
              <Step1Guests booking={booking} updateBooking={updateBooking} />
            )}
            {booking.step === 2 && (
              <Step2Services booking={booking} updateBooking={updateBooking} />
            )}
            {booking.step === 3 && (
              <Step3DateTime booking={booking} updateBooking={updateBooking} />
            )}
            {booking.step === 4 && (
              <Step4Confirm booking={booking} updateBooking={updateBooking} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="px-6 py-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-3xl">
        <button
          onClick={prevStep}
          disabled={booking.step === 1}
          className={cn(
            "flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all",
            booking.step === 1
              ? "opacity-0 pointer-events-none"
              : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
          )}
        >
          <ChevronLeft className="w-4 h-4 mr-1.5" /> Back
        </button>

        <button
          onClick={() => {
            if (booking.step === 2) {
              const hasServices = Object.values(booking.services).some(s => s.length > 0);
              if (!hasServices) {
                alert("Please select at least one service to continue.");
                return;
              }
            }
            if (booking.step === 3 && (!booking.date || !booking.timeSlot)) {
              alert("Please select a date and time to continue.");
              return;
            }

            if (booking.step < 4) nextStep();
            else alert("Booking Submitted Successfully!");
          }}
          className={cn(
            "flex items-center px-6 py-2.5 text-sm font-semibold rounded-xl text-white shadow-sm transition-all",
            booking.step === 4 ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700"
          )}
        >
          {booking.step === 4 ? "Confirm Booking" : "Continue"} <ChevronRight className="w-4 h-4 ml-1.5" />
        </button>
      </div>
    </div>
  );
}

// --- Step 1 ---
function Step1Guests({ booking, updateBooking }: Partial<Props>) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-1">How many people are you booking for?</h2>
        <p className="text-sm text-slate-500">Select the number of guests for this appointment.</p>
      </div>

      <div className="flex flex-wrap gap-4">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => {
              const newServices: Record<number, string[]> = {};
              for (let i = 0; i < num; i++) {
                newServices[i] = booking?.services?.[i] || [];
              }
              updateBooking?.({ partySize: num, services: newServices });
            }}
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-semibold border-2 transition-all",
              booking?.partySize === num
                ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-slate-50"
            )}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}

// --- Step 2 ---
function Step2Services({ booking, updateBooking }: Partial<Props>) {
  const [activeTab, setActiveTab] = useState(0);

  const toggleService = (guestIndex: number, serviceId: string) => {
    const currentGuestServices = booking?.services?.[guestIndex] || [];
    const isSelected = currentGuestServices.includes(serviceId);
    
    let updated;
    if (isSelected) {
      updated = currentGuestServices.filter(id => id !== serviceId);
    } else {
      updated = [...currentGuestServices, serviceId];
    }

    updateBooking?.({
      services: {
        ...(booking?.services || {}),
        [guestIndex]: updated,
      }
    });
  };

  const categories = Array.from(new Set(SERVICES.map(s => s.category)));

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Select your services</h2>
        <p className="text-sm text-slate-500">Choose the treatments for your appointment.</p>
      </div>

      {booking?.partySize! > 1 && (
        <div className="flex space-x-2 border-b border-slate-100 pb-2 overflow-x-auto no-scrollbar">
          {Array.from({ length: booking?.partySize! }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap",
                activeTab === idx
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <User className="w-4 h-4 mr-2" />
              Guest {idx + 1}
              {booking?.services?.[idx]?.length ? (
                <span className="ml-2 bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {booking.services[idx].length}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-2 space-y-8">
        {categories.map(category => (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">{category}</h3>
            <div className="space-y-3">
              {SERVICES.filter(s => s.category === category).map(service => {
                const isSelected = booking?.services?.[activeTab]?.includes(service.id);
                return (
                  <div
                    key={service.id}
                    onClick={() => toggleService(activeTab, service.id)}
                    className={cn(
                      "group flex items-start justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all",
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/20"
                        : "border-slate-100 hover:border-indigo-200 hover:bg-slate-50/50"
                    )}
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={cn("font-medium", isSelected ? "text-indigo-900" : "text-slate-900")}>
                          {service.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">{service.description}</p>
                      <div className="flex items-center space-x-4 text-xs font-medium text-slate-600">
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {service.duration} min
                        </span>
                        <span className="text-indigo-600">${service.price}</span>
                      </div>
                    </div>
                    
                    <div className={cn(
                      "flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-colors",
                      isSelected
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-slate-300 group-hover:border-indigo-400 text-transparent"
                    )}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Step 3 ---
function Step3DateTime({ booking, updateBooking }: Partial<Props>) {
  const today = startOfToday();
  const days = Array.from({ length: 14 }).map((_, i) => addDays(today, i));
  const timeSlots = generateTimeSlots();

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Choose Date & Time</h2>
        <p className="text-sm text-slate-500">Select when you'd like to come in.</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2 text-indigo-500" /> Date
          </h3>
          <span className="text-xs text-slate-500 font-medium">Next 14 days</span>
        </div>
        
        <div className="flex space-x-3 overflow-x-auto pb-4 pt-1 px-1 no-scrollbar">
          {days.map((day, idx) => {
            const isSelected = booking?.date && isSameDay(day, booking.date);
            const isToday = isSameDay(day, today);
            return (
              <button
                key={idx}
                onClick={() => updateBooking?.({ date: day, timeSlot: null })} // reset time on day change
                className={cn(
                  "flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl border transition-all",
                  isSelected
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-slate-50"
                )}
              >
                <span className={cn("text-[10px] font-medium uppercase tracking-widest mb-1", isSelected ? "text-indigo-100" : "text-slate-400")}>
                  {format(day, 'EEE')}
                </span>
                <span className="text-xl font-semibold leading-none mb-1">
                  {format(day, 'd')}
                </span>
                <span className={cn("text-[10px] font-medium", isSelected ? "text-indigo-200" : "text-slate-400")}>
                  {format(day, 'MMM')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center mb-4">
          <Clock className="w-4 h-4 mr-2 text-indigo-500" /> Available Times
        </h3>
        
        {!booking?.date ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl">
            <CalendarIcon className="w-8 h-8 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-600">Please select a date first</p>
            <p className="text-xs text-slate-400 mt-1">Available times will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 overflow-y-auto pr-2 pb-4">
            {timeSlots.map((time, idx) => {
              const isSelected = booking?.timeSlot === time;
              return (
                <button
                  key={idx}
                  onClick={() => updateBooking?.({ timeSlot: time })}
                  className={cn(
                    "py-2.5 px-3 rounded-xl text-sm font-medium border transition-all",
                    isSelected
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-slate-900"
                  )}
                >
                  {time}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Step 4 ---
function Step4Confirm({ booking }: Partial<Props>) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Your Details</h2>
        <p className="text-sm text-slate-500">Almost there! We just need a few details to confirm.</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">First Name</label>
            <input type="text" placeholder="Jane" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Last Name</label>
            <input type="text" placeholder="Doe" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm" />
          </div>
        </div>
        
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Email Address</label>
          <input type="email" placeholder="jane@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Phone Number</label>
          <input type="tel" placeholder="(555) 123-4567" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Special Requests (Optional)</label>
          <textarea rows={3} placeholder="Any specific requirements or notes..." className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm resize-none"></textarea>
        </div>
      </div>
    </div>
  );
}
