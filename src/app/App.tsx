import React, { useState } from "react";
import { ChevronLeft, Search, Check, Minus, Plus, Calendar, Clock, MapPin, Star } from "lucide-react";
import { cn } from "./utils/cn";

// --- DATA ---
export interface Service {
  id: string;
  name: string;
  duration: string;
  price: number;
  description: string;
}

export const SERVICES: Service[] = [
  {
    id: "s1",
    name: "Soch kesish",
    duration: "01:00",
    price: 500000,
    description: "Sizning imidjingizga mos zamonaviy uslublar!",
  },
  {
    id: "s2",
    name: "Soch bo'yash",
    duration: "02:30",
    price: 150000,
    description: "Tabiiy yoki yorqin ranglar, eng sifatli vositalar bilan!",
  },
  {
    id: "s3",
    name: "Sochni parvarishlash",
    duration: "01:00",
    price: 150000,
    description: "Sochlaringiz uchun maxsus oziqlantiruvchi maskalar.",
  },
];

export const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30",
  "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30"
];

export const generateDates = () => {
  const dates = [];
  const today = new Date();
  const dayNames = ['Yak', 'Du', 'Se', 'Chor', 'Pay', 'Ju', 'Shan'];
  const monthNames = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      dateObj: d,
      dayName: dayNames[d.getDay()],
      dayNum: d.getDate(),
      monthName: monthNames[d.getMonth()],
      id: d.toISOString().split('T')[0]
    });
  }
  return dates;
};

export const DATES = generateDates();

// --- APP COMPONENT ---
export default function App() {
  const [currentScreen, setCurrentScreen] = useState<"profile" | "services">("profile");
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Booking state
  const [partySize, setPartySize] = useState(1);
  const [activeGuest, setActiveGuest] = useState(0);
  const [selectedServices, setSelectedServices] = useState<Record<number, string[]>>({ 0: [] });
  
  // Date & Time state
  const [selectedDate, setSelectedDate] = useState<string>(DATES[0].id);
  const [selectedTime, setSelectedTime] = useState<string>("10:00");

  const toggleService = (guestIdx: number, serviceId: string) => {
    setSelectedServices(prev => {
      const guestServices = prev[guestIdx] || [];
      if (guestServices.includes(serviceId)) {
        return { ...prev, [guestIdx]: guestServices.filter(id => id !== serviceId) };
      } else {
        return { ...prev, [guestIdx]: [...guestServices, serviceId] };
      }
    });
  };

  const updatePartySize = (delta: number) => {
    const newSize = Math.max(1, Math.min(5, partySize + delta));
    setPartySize(newSize);
    
    // Ensure active guest is valid
    if (activeGuest >= newSize) {
      setActiveGuest(newSize - 1);
    }
    
    // Initialize services for new guests
    setSelectedServices(prev => {
      const next = { ...prev };
      for (let i = 0; i < newSize; i++) {
        if (!next[i]) next[i] = [];
      }
      return next;
    });
  };

  const totalServicesCount = Object.values(selectedServices).reduce((sum, arr) => sum + arr.length, 0);
  const totalPrice = Object.values(selectedServices).flatMap(arr => arr).reduce((sum, id) => {
    const s = SERVICES.find(s => s.id === id);
    return sum + (s?.price || 0);
  }, 0);

  return (
    <div className="bg-black min-h-screen flex justify-center items-center font-sans">
      <div className="w-full max-w-[375px] h-[812px] bg-[#18105B] rounded-[32px] overflow-hidden relative shadow-2xl flex flex-col">
        {/* Status Bar Mock */}
        <div className="h-[44px] flex items-center justify-between px-6 text-white text-sm font-medium z-10 relative">
          <span>9:41</span>
          <div className="flex gap-1.5 items-center">
            <div className="w-4 h-3 bg-white mask-signal"></div>
            <div className="w-4 h-3 bg-white mask-wifi"></div>
            <div className="w-6 h-3 border border-white/40 rounded-sm relative">
              <div className="absolute top-[2px] bottom-[2px] left-[2px] right-[4px] bg-white rounded-[1px]"></div>
            </div>
          </div>
        </div>

        {currentScreen === "profile" && (
          <ProviderProfile onBook={() => setCurrentScreen("services")} />
        )}

        {currentScreen === "services" && (
          <div className="flex-1 flex flex-col h-full absolute inset-0 pt-[44px] bg-[#18105B]">
            {/* Header */}
            <div className="h-[48px] flex items-center px-4 relative">
              <button onClick={() => setCurrentScreen("profile")} className="p-2 text-white absolute left-2 z-10">
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-lg font-medium text-white text-center flex-1">Xizamt turlari</h1>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-[#F6F6F6] rounded-t-[20px] mt-4 flex flex-col overflow-hidden">
              
              {/* Party Size Selector */}
              <div className="px-5 pt-6 pb-4 bg-white border-b border-[#E8E8E8]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[#161616] font-medium text-base">Odamlar soni</h2>
                    <p className="text-[#909090] text-xs mt-1">Necha kishi uchun band qilyapsiz?</p>
                  </div>
                  <div className="flex items-center gap-4 bg-[#F9F9F9] rounded-xl p-1 border border-[#EFEFEF]">
                    <button 
                      onClick={() => updatePartySize(-1)}
                      disabled={partySize <= 1}
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        partySize <= 1 ? "text-[#D6D6D6]" : "bg-white text-[#18105B] shadow-sm"
                      )}
                    >
                      <Minus size={18} />
                    </button>
                    <span className="font-medium text-[#18105B] w-4 text-center">{partySize}</span>
                    <button 
                      onClick={() => updatePartySize(1)}
                      disabled={partySize >= 5}
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        partySize >= 5 ? "text-[#D6D6D6]" : "bg-white text-[#18105B] shadow-sm"
                      )}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {partySize > 1 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
                    {Array.from({ length: partySize }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveGuest(idx)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap border",
                          activeGuest === idx 
                            ? "bg-[#18105B] text-white border-[#18105B]" 
                            : "bg-white text-[#707070] border-[#EFEFEF]"
                        )}
                      >
                        Mehmon {idx + 1}
                        {selectedServices[idx]?.length > 0 && (
                          <span className={cn(
                            "ml-2 px-1.5 py-0.5 rounded-full text-[10px]",
                            activeGuest === idx ? "bg-white/20" : "bg-[#18105B]/10 text-[#18105B]"
                          )}>
                            {selectedServices[idx].length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Services List */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 pb-32">
                {SERVICES.map(service => {
                  const isSelected = selectedServices[activeGuest]?.includes(service.id);
                  return (
                    <div 
                      key={service.id} 
                      onClick={() => toggleService(activeGuest, service.id)}
                      className={cn(
                        "bg-white rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] border transition-colors cursor-pointer",
                        isSelected ? "border-[#18105B]" : "border-transparent"
                      )}
                    >
                      <div className="p-4 border-b border-[#EFEFEF] flex justify-between items-center bg-[#F9F9F9]">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded flex items-center justify-center border-2 transition-colors",
                            isSelected ? "bg-[#18105B] border-[#18105B]" : "border-[#18105B]/30"
                          )}>
                            {isSelected && <Check size={14} className="text-white" />}
                          </div>
                          <span className="text-[#161616] font-medium text-[15px]">{service.name}</span>
                        </div>
                        <span className="text-[#18105B] font-medium text-[13px]">{service.price.toLocaleString()} UZS</span>
                      </div>
                      <div className="p-4">
                        <p className="text-[#707070] text-[13px] leading-[18px] mb-3">
                          {service.description}
                        </p>
                        <div className="inline-flex items-center bg-[#18105B]/10 text-[#18105B] text-[12px] px-3 py-1.5 rounded-md font-medium">
                          Xizmat ko'rsatish vaqti {service.duration} Soat
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Footer */}
              <div className="absolute bottom-0 left-0 right-0 bg-[#F4F4F4] border-t border-[#E8E8E8] pt-5 px-5 pb-8 rounded-b-[32px]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[#161616] font-medium text-[15px]">Jami xizmatlar ({totalServicesCount})</span>
                  <span className="text-[#18105B] font-bold text-[16px]">{totalPrice.toLocaleString()} UZS</span>
                </div>
                <button 
                  onClick={() => setShowDatePicker(true)}
                  disabled={totalServicesCount === 0}
                  className={cn(
                    "w-full h-[54px] rounded-xl font-medium text-[15px] flex items-center justify-center transition-colors",
                    totalServicesCount > 0 
                      ? "bg-[#18105B]/10 text-[#18105B] border border-[#18105B]/20 active:bg-[#18105B]/20" 
                      : "bg-[#EFEFEF] text-[#AFAFAF]"
                  )}
                >
                  Davom etish
                </button>
              </div>
            </div>

            {/* Date & Time Bottom Sheet */}
            {showDatePicker && (
              <>
                <div 
                  className="absolute inset-0 bg-black/40 z-20 rounded-[32px]" 
                  onClick={() => setShowDatePicker(false)} 
                />
                <div className="absolute bottom-0 left-0 right-0 bg-white z-30 rounded-t-[20px] rounded-b-[32px] flex flex-col animate-in slide-in-from-bottom-full duration-300">
                  <div className="w-full flex justify-center py-3">
                    <div className="w-[46px] h-[5px] bg-[#E8E8E8] rounded-full"></div>
                  </div>
                  
                  <h2 className="text-center text-lg font-medium text-black mb-4">Band qilish</h2>
                  
                  {/* Horizontal Date Picker */}
                  <div className="mb-6">
                    <h3 className="px-5 text-[#161616] font-medium text-sm mb-3">Sanani tanlang</h3>
                    <div className="flex gap-2 px-5 overflow-x-auto no-scrollbar pb-2">
                      {DATES.map((d) => {
                        const isSelected = selectedDate === d.id;
                        return (
                          <button
                            key={d.id}
                            onClick={() => setSelectedDate(d.id)}
                            className={cn(
                              "flex flex-col items-center justify-center min-w-[64px] h-[72px] rounded-xl border transition-colors flex-shrink-0",
                              isSelected
                                ? "bg-[#18105B] border-[#18105B] text-white shadow-md shadow-[#18105B]/20"
                                : "bg-white border-[#EFEFEF] text-[#161616]"
                            )}
                          >
                            <span className={cn("text-[11px] mb-1 font-medium", isSelected ? "text-white/80" : "text-[#909090]")}>{d.dayName}</span>
                            <span className="text-[18px] font-bold">{d.dayNum}</span>
                            <span className={cn("text-[10px]", isSelected ? "text-white/80" : "text-[#909090]")}>{d.monthName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Grid Time Picker */}
                  <div className="px-5 mb-8">
                    <h3 className="text-[#161616] font-medium text-sm mb-3">Vaqtni tanlang</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {TIME_SLOTS.map((time) => {
                        const isSelected = selectedTime === time;
                        return (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={cn(
                              "h-[42px] rounded-lg text-[14px] font-medium border transition-colors flex items-center justify-center",
                              isSelected
                                ? "bg-[#18105B] border-[#18105B] text-white shadow-sm"
                                : "bg-white border-[#EFEFEF] text-[#161616] hover:border-[#18105B]/30"
                            )}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-[#F4F4F4] border-t border-[#E8E8E8] pt-5 px-5 pb-8 rounded-b-[32px]">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[#161616] font-medium text-[15px]">Jami xizmatlar ({totalServicesCount})</span>
                      <span className="text-[#18105B] font-bold text-[16px]">{totalPrice.toLocaleString()} UZS</span>
                    </div>
                    <button 
                      onClick={() => {
                        alert("So'rov yuborildi!");
                        setShowDatePicker(false);
                        setCurrentScreen("profile");
                      }}
                      className="w-full h-[54px] rounded-xl font-medium text-[15px] flex items-center justify-center bg-[#E6E8EE] text-[#18105B] border border-[#D1D5E5] active:bg-[#D1D5E5]"
                    >
                      So'rov yuborish
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

// --- PROVIDER PROFILE COMPONENT ---
function ProviderProfile({ onBook }: { onBook: () => void }) {
  return (
    <div className="flex-1 flex flex-col h-full relative pt-[44px]">
      {/* Header */}
      <div className="h-[48px] flex items-center px-4 relative">
        <h1 className="text-lg font-medium text-white text-center flex-1">Malika Sattorova</h1>
        <button className="absolute left-4 text-white">
          <Search size={20} />
        </button>
      </div>

      <div className="flex-1 bg-[#F6F6F6] rounded-t-[20px] mt-4 flex flex-col relative overflow-hidden">
        {/* Profile Info */}
        <div className="flex flex-col items-center mt-6 z-10">
          <img 
            src="https://images.unsplash.com/photo-1689600944138-da3b150d9cb8?auto=format&fit=crop&q=80&w=200" 
            alt="Malika" 
            className="w-20 h-20 rounded-full object-cover border-[3px] border-white shadow-sm"
          />
          <h2 className="mt-3 text-[#161616] font-medium text-lg">Malika Sattorova</h2>
          <p className="text-[#909090] text-sm">Ayollar sartaroshi</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 pb-32">
          {/* Description Card */}
          <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#EFEFEF]">
            <div className="px-4 py-3 bg-[#F9F9F9] border-b border-[#EFEFEF] text-[14px] text-[#161616]">
              Tavsif
            </div>
            <div className="p-4 text-[13px] text-black leading-relaxed space-y-1">
              <p>💇‍♀️ Ayollar sartaroshi – 25 yillik tajriba!</p>
              <p>👩‍🎓 200+ muvaffaqiyatli shogirdlar!</p>
              <p>✨ Sizning go'zalligingiz – bizning vazifamiz!</p>
              <p>💎 Soch kesish, stil berish va professional maslahatlar!</p>
              <p>📍 Biz bilan bog'laning va o'zingizni yangilang!</p>
            </div>
          </div>

          {/* Schedule Card */}
          <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#EFEFEF]">
            <div className="px-4 py-3 bg-[#F9F9F9] border-b border-[#EFEFEF] text-[14px] text-[#161616]">
              Ish vaqti
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {['Du', 'Pa', 'Se', 'Ju', 'Ch', 'Sh'].map(day => (
                <div key={day} className="bg-[#18105B]/10 rounded-md py-2 flex justify-center text-[#18105B] text-[12px]">
                  {day} 09:00-22:00
                </div>
              ))}
              <div className="col-span-2 bg-[#FFF5F5] rounded-md py-2 flex justify-center text-[#F75555] text-[12px]">
                Yakshanba (dam olish kuni)
              </div>
            </div>
          </div>

          {/* Portfolio Card */}
          <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#EFEFEF]">
            <div className="px-4 py-3 bg-[#F9F9F9] border-b border-[#EFEFEF] text-[14px] text-[#161616]">
              Portfolio
            </div>
            <div className="p-4 flex gap-2 overflow-x-auto no-scrollbar">
              <img src="https://images.unsplash.com/photo-1712481695743-510ab876c629?auto=format&fit=crop&q=80&w=200" className="w-[100px] h-[120px] rounded-lg object-cover flex-shrink-0" />
              <img src="https://images.unsplash.com/photo-1722350766824-f8520e9676ac?auto=format&fit=crop&q=80&w=200" className="w-[100px] h-[120px] rounded-lg object-cover flex-shrink-0" />
              <img src="https://images.unsplash.com/photo-1707418956289-e830abfa6b44?auto=format&fit=crop&q=80&w=200" className="w-[100px] h-[120px] rounded-lg object-cover flex-shrink-0" />
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#EFEFEF]">
            <div className="px-4 py-3 bg-[#F9F9F9] border-b border-[#EFEFEF] flex justify-between items-center">
              <span className="text-[14px] text-[#161616]">Manzil</span>
              <span className="text-[#6681F8] text-[12px] font-medium flex items-center gap-1">
                <MapPin size={14} /> 7,4 km
              </span>
            </div>
            <div className="p-4">
              <div className="w-full h-[120px] bg-[#E8E8E8] rounded-lg mb-3 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600')] bg-cover bg-center opacity-70"></div>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 bg-[#F8F8F8] rounded-md py-2.5 text-[11px] font-medium">
                  <div className="w-5 h-5 bg-yellow-400 rounded-md flex items-center justify-center font-bold text-xs text-black">Y</div>
                  Yandex taxi
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-[#F8F8F8] rounded-md py-2.5 text-[11px] font-medium">
                  <div className="w-5 h-5 bg-yellow-400 rounded-md flex items-center justify-center font-bold text-xs text-black">N</div>
                  Yandex navigator
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#F4F4F4] border-t border-[#E8E8E8] pt-5 px-5 pb-8 rounded-b-[32px] flex gap-3">
          <button 
            onClick={onBook}
            className="flex-1 h-[54px] bg-[#18105B]/10 rounded-xl text-[#18105B] font-medium text-[15px] border border-[#18105B]"
          >
            Bron qilish
          </button>
          <button className="w-[54px] h-[54px] bg-[#18105B]/10 rounded-xl flex items-center justify-center text-[#18105B] border border-[#18105B]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
