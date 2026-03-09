import React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Users, MapPin, Receipt, Star, ArrowRight } from "lucide-react";
import { Service, BookingState } from "../data";
import { cn } from "../utils/cn";

interface Props {
  booking: BookingState;
  selectedServices: (Service & { guestIndex: number })[];
  totalPrice: number;
  totalDuration: number;
}

export function BookingSummary({ booking, selectedServices, totalPrice, totalDuration }: Props) {
  return (
    <div className="bg-white rounded-3xl shadow-[0_2px_40px_rgba(0,0,0,0.04)] ring-1 ring-slate-200/50 overflow-hidden flex flex-col h-full">
      <div className="p-6 bg-slate-900 text-white">
        <h2 className="text-lg font-semibold tracking-tight">Booking Summary</h2>
        <p className="text-slate-400 text-xs mt-1">Review your selections below</p>
      </div>

      <div className="p-6 flex-1 space-y-6">
        {/* Date & Time Section */}
        <div className="space-y-4 pb-6 border-b border-slate-100">
          <div className="flex items-start space-x-3 text-sm">
            <CalendarIcon className="w-5 h-5 text-indigo-500 mt-0.5" />
            <div>
              <p className="font-medium text-slate-900">
                {booking.date ? format(booking.date, "EEEE, MMMM do, yyyy") : "Date pending"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {booking.timeSlot ? `At ${booking.timeSlot}` : "Time pending"}
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 text-sm">
            <MapPin className="w-5 h-5 text-indigo-500 mt-0.5" />
            <div>
              <p className="font-medium text-slate-900">Studio Elegance</p>
              <p className="text-xs text-slate-500 mt-0.5">123 Wellness Blvd, Suite 100</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-sm">
            <Users className="w-5 h-5 text-indigo-500 mt-0.5" />
            <div>
              <p className="font-medium text-slate-900">{booking.partySize} {booking.partySize === 1 ? "Person" : "People"}</p>
              <p className="text-xs text-slate-500 mt-0.5">Group booking size</p>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Services</h3>
            {totalDuration > 0 && (
              <span className="text-xs font-medium text-slate-500 flex items-center bg-slate-100 px-2 py-1 rounded-md">
                <Clock className="w-3.5 h-3.5 mr-1" /> {totalDuration} min
              </span>
            )}
          </div>

          {selectedServices.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Receipt className="w-6 h-6 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No services selected</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {selectedServices.map((service, idx) => (
                <li key={`${service.id}-${idx}`} className="flex justify-between items-start text-sm group">
                  <div className="pr-4">
                    <p className="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">{service.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                      {booking.partySize > 1 ? `For Guest ${service.guestIndex + 1}` : service.category}
                    </p>
                  </div>
                  <span className="font-medium text-slate-900">${service.price}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Total Section */}
      <div className="p-6 bg-slate-50 border-t border-slate-100 mt-auto">
        <div className="flex items-center justify-between mb-2 text-sm text-slate-500">
          <span>Subtotal</span>
          <span>${totalPrice}</span>
        </div>
        <div className="flex items-center justify-between mb-4 text-sm text-slate-500">
          <span>Taxes & Fees (10%)</span>
          <span>${(totalPrice * 0.1).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <span className="text-base font-semibold text-slate-900">Total</span>
          <span className="text-2xl font-bold text-slate-900">${(totalPrice * 1.1).toFixed(2)}</span>
        </div>

        {booking.step === 4 && (
           <p className="text-[10px] text-slate-400 text-center mt-4">
             By completing this booking, you agree to our terms and cancellation policy.
           </p>
        )}
      </div>
    </div>
  );
}
