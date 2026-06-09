import React, { useState } from 'react';
import { 
  BookOpen, 
  MapPin, 
  MessageSquare, 
  ShoppingCart, 
  Tag, 
  ArrowRight,
  Info,
  Search,
  HelpCircle as QuestionIcon,
  Bot,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface UserGuideProps {
  onGoToConsult: () => void;
}

export default function UserGuide({ onGoToConsult }: UserGuideProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const steps = [
    {
      number: "01",
      title: "Chọn chi nhánh",
      icon: MapPin,
      iconBg: "bg-blue-50 text-blue-600",
      description: "Khi vào app, chọn chi nhánh gần bạn nhất để AI tư vấn đúng sản phẩm còn hàng tại đó."
    },
    {
      number: "02",
      title: "Nhập yêu cầu",
      icon: MessageSquare,
      iconBg: "bg-blue-50 text-blue-600",
      description: "Gõ yêu cầu bằng tiếng Việt tự nhiên. VD: 'Tai nghe chống ồn dưới 2 triệu dùng văn phòng'"
    },
    {
      number: "03",
      title: "Nhận gợi ý từ AI",
      icon: Bot,
      iconBg: "bg-blue-50 text-blue-600",
      description: "AI phân tích yêu cầu và gợi ý top 3 sản phẩm phù hợp nhất kèm giá và lý do cụ thể."
    },
    {
      number: "04",
      title: "Đặt hàng ngay",
      icon: ShoppingCart,
      iconBg: "bg-blue-50 text-blue-600",
      description: "Nhấn 'Thêm giỏ' hoặc 'Đặt ngay' trên sản phẩm AI gợi ý để đặt hàng online trong vài giây."
    }
  ];



  const faqs = [
    {
      question: "AI có tư vấn sai không?",
      answer: "AI REMIX.AI chỉ tư vấn dựa trên dữ liệu sản phẩm thực tế của cửa hàng, không bịa thông tin hay giá. Tỷ lệ chính xác đạt 98%."
    },
    {
      question: "Sản phẩm AI gợi ý có thể đặt hàng online không?",
      answer: "Có! Nhấn nút 'Đặt ngay' trên bất kỳ sản phẩm nào AI gợi ý để đặt hàng và thanh toán trực tiếp trong app."
    },
    {
      question: "AI hết hàng tại chi nhánh tôi chọn thì sao?",
      answer: "AI sẽ tự động thông báo và gợi ý chi nhánh gần nhất còn hàng, kèm địa chỉ và số điện thoại để bạn liên hệ."
    },
    {
      question: "Lịch sử tư vấn có được lưu không?",
      answer: "Có, mọi cuộc hội thoại được lưu trong phần Lịch sử ở sidebar trái. Bạn có thể xem lại, tiếp tục hoặc xóa bất kỳ lúc nào."
    },
    {
      question: "Tôi có thể đổi chi nhánh giữa chừng không?",
      answer: "Có, nhấn vào badge tên chi nhánh ở header chat hoặc vào Cài đặt để đổi chi nhánh bất cứ lúc nào."
    },
    {
      question: "App có miễn phí không?",
      answer: "Gói cơ bản miễn phí hoàn toàn với 10 lượt tư vấn/ngày. Nâng cấp lên Pro để tư vấn không giới hạn."
    },
    {
      question: "Tôi muốn hỏi những gì AI không biết?",
      answer: "AI chỉ tư vấn về sản phẩm điện tử trong hệ thống. Với các câu hỏi khác, vui lòng liên hệ hotline 1800-xxxx."
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-grow flex flex-col bg-gray-50/50 overflow-y-auto font-sans">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#0C447C] to-[#185FA5] text-white py-10 px-6 sm:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold tracking-wider uppercase text-[#E6F1FB]">
            <BookOpen size={12} />
            Cẩm nang trải nghiệm
          </div>
          <div className="space-y-1">
            <h1 className="text-[24px] font-bold tracking-tight">
              Hướng dẫn sử dụng
            </h1>
            <p className="text-[#E6F1FB]/90 text-sm font-medium">
              Mọi thứ bạn cần biết về REMIX.AI
            </p>
          </div>
          
          {/* Real-time Search Box */}
          <div className="max-w-md pt-2">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white/60">
                <Search size={16} />
              </span>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm câu hỏi..."
                className="w-full pl-10 pr-4 py-2 bg-white/15 border border-white/25 rounded-xl text-sm text-white placeholder-white/65 focus:outline-none focus:ring-2 focus:ring-white/45 transition-all shadow-inner"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 py-8 sm:px-6 space-y-8">
        {/* Dynamic Search Results Status */}
        {searchQuery && (
          <div className="bg-[#E6F1FB] border border-[#B5D4F4] text-[#0C447C] rounded-xl px-4 py-3 text-xs font-bold flex items-center justify-between">
            <span>Tìm thấy {filteredFaqs.length} câu hỏi phù hợp cho từ khóa "{searchQuery}"</span>
            <button 
              onClick={() => setSearchQuery('')}
              className="text-[#185FA5] hover:underline hover:text-[#0C447C]"
            >
              Reset bộ lọc
            </button>
          </div>
        )}

        {/* Quick Start Guide Section (Only show if not filtering actively or if preferred) */}
        {!searchQuery && (
          <>
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                  Quy Trình Mua Sắm 4 Bước
                </h2>
                <div className="h-[1px] bg-gray-200 flex-grow" />
              </div>

              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div 
                    key={index} 
                    className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 hover:shadow-lg hover:shadow-gray-200/40 hover:border-blue-100 transition-all duration-300 text-left"
                  >
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-3xl sm:text-4xl font-extrabold text-blue-100 tracking-tighter font-mono select-none">
                        {step.number}
                      </span>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${step.iconBg}`}>
                        <step.icon size={22} className="shrink-0" />
                      </div>
                    </div>
                    <div className="space-y-1 flex-grow">
                      <span className="text-[10px] font-black text-[#185FA5] uppercase tracking-widest block">
                        KHỞI ĐỘNG NHANH
                      </span>
                      <h3 className="text-sm font-bold text-gray-900">
                        {step.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* AI Tips Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-1.5">
                  <span>💡</span> Mẹo để AI tư vấn chính xác hơn
                </h2>
                <div className="h-[1px] bg-gray-200 flex-grow" />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <div className="grid gap-3 sm:grid-cols-1">
                  
                  <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all text-left">
                    <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 select-none mt-0.5">
                      ✓
                    </span>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-gray-900 uppercase tracking-tight">Nói rõ ngân sách</p>
                      <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                        Nhập khoảng tiền cụ thể phù hợp với yêu cầu: <span className="font-extrabold text-[#0C447C] bg-[#E6F1FB] px-1.5 py-0.5 rounded">"Tầm 1.5 triệu"</span> thay vì "rẻ rẻ".
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all text-left">
                    <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 select-none mt-0.5">
                      ✓
                    </span>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-gray-900 uppercase tracking-tight">Nói mục đích dùng</p>
                      <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                        Nêu rõ nhu cầu thực tế: <span className="font-extrabold text-[#0C447C] bg-[#E6F1FB] px-1.5 py-0.5 rounded">"Nghe nhạc khi chạy bộ"</span>, <span className="font-extrabold text-[#0C447C] bg-[#E6F1FB] px-1.5 py-0.5 rounded">"Làm việc văn phòng"</span> để AI tối ưu tham số cấu hình.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all text-left">
                    <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 select-none mt-0.5">
                      ✓
                    </span>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-gray-900 uppercase tracking-tight">Hỏi so sánh</p>
                      <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                        Yêu cầu so sánh chéo để xem ưu nhược điểm: <span className="font-extrabold text-[#0C447C] bg-[#E6F1FB] px-1.5 py-0.5 rounded">"So sánh Sony WH-CH520 và JBL Tune 770"</span>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all text-left">
                    <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 select-none mt-0.5">
                      ✓
                    </span>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-gray-900 uppercase tracking-tight">Hỏi khoảng giá</p>
                      <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                        Thu hẹp phạm vi đề xuất: <span className="font-extrabold text-[#0C447C] bg-[#E6F1FB] px-1.5 py-0.5 rounded">"Laptop tầm 15 triệu cho sinh viên"</span>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all text-left">
                    <span className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs shrink-0 select-none mt-0.5">
                      ✕
                    </span>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-gray-900 uppercase tracking-tight">Tránh hỏi quá chung</p>
                      <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                        Hạn chế những câu rỗng: <span className="font-extrabold text-red-700 bg-red-50/50 px-1.5 py-0.5 rounded border border-red-200">"Cho tôi xem laptop"</span> (AI sẽ phải hỏi lại để xác nhận nhu cầu của bạn).
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* Tips & Promo Banner */}
            <section className="bg-[#E6F1FB] border border-[#B5D4F4] rounded-2xl p-6 flex flex-col sm:flex-row gap-5 items-center justify-between">
              <div className="flex gap-4 items-start text-left">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#185FA5] shrink-0 shadow-sm">
                  <Tag size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#0C447C]">
                    Mẹo siêu tiết kiệm cho khách hàng mới!
                  </h3>
                  <p className="text-xs text-[#185FA5] font-medium leading-relaxed max-w-xl">
                    Hãy dùng thử mã giảm giá <span className="font-extrabold text-[#0C447C] bg-white px-1.5 py-0.5 rounded border border-[#B5D4F4]">GEMINI</span> trong cuộc hội thoại thử nghiệm hoặc khi đặt hàng để được giảm ngay 500k cho đơn hàng công nghệ đầu tiên.
                  </p>
                </div>
              </div>
              <button 
                onClick={onGoToConsult}
                className="px-5 py-2.5 bg-[#0C447C] hover:bg-[#185FA5] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap shrink-0 flex items-center gap-1.5"
              >
                Trải nghiệm ngay
                <ArrowRight size={14} />
              </button>
            </section>
          </>
        )}

        {/* FAQs Section (Filtered by query) */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
              Câu hỏi thường gặp
            </h2>
            <div className="h-[1px] bg-gray-200 flex-grow" />
          </div>

          <div className="space-y-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div 
                    key={index}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-blue-200 hover:shadow-sm transition-all duration-300 text-left"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-5 text-left focus:outline-none focus:ring-2 focus:ring-[#185FA5]/10"
                    >
                      <div className="flex items-center gap-3 pr-4">
                        <span className={`w-6 h-6 rounded-lg font-bold text-xs shrink-0 flex items-center justify-center transition-colors duration-300 ${
                          isOpen ? "bg-[#185FA5] text-white" : "bg-blue-50 text-blue-600"
                        }`}>
                          Q
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 transition-colors duration-300">
                          {faq.question}
                        </h4>
                      </div>
                      <span className="text-gray-400 shrink-0">
                        {isOpen ? <ChevronUp size={18} className="text-[#185FA5]" /> : <ChevronDown size={18} />}
                      </span>
                    </button>
                    
                    {/* Collapsible Answer */}
                    <div 
                      className={`transition-all duration-300 ease-in-out border-t border-gray-50 bg-gray-50/30 ${
                        isOpen ? 'max-h-[500px] opacity-100 p-5' : 'max-h-0 opacity-0 overflow-hidden'
                      }`}
                    >
                      <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 space-y-2">
                <QuestionIcon size={32} className="mx-auto text-gray-300" />
                <p className="text-sm font-bold">Không tìm thấy câu hỏi phù hợp với từ khóa của bạn</p>
                <p className="text-xs">Hãy thử tìm kiếm với các từ khóa ngắn như "GEMINI", "đặt hàng", "showroom"...</p>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 4: LIÊN HỆ HỖ TRỢ */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
              Liên hệ hỗ trợ
            </h2>
            <div className="h-[1px] bg-gray-200 flex-grow" />
          </div>

          <div className="bg-[#E6F1FB] border border-[#B5D4F4] rounded-2xl p-6 space-y-6">
            <h4 className="text-sm font-black text-[#0C447C] uppercase tracking-normal text-left">
              Cần thêm hỗ trợ?
            </h4>
            
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center text-left w-full">
              <div className="flex items-center gap-3 text-xs font-semibold text-gray-600">
                <span className="text-lg">📞</span>
                <div>
                  <p className="font-extrabold text-gray-900">Hotline</p>
                  <p className="text-xs text-gray-500">1800-xxxx (miễn phí, 8:00-21:00)</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-xs font-semibold text-gray-600">
                <span className="text-lg">📧</span>
                <div>
                  <p className="font-extrabold text-gray-900">Email</p>
                  <p className="text-xs text-gray-500">support@remix.ai</p>
                </div>
              </div>
              
              <div className="flex items-start md:items-center gap-3 text-xs font-semibold text-gray-600">
                <span className="text-lg mt-1 md:mt-0">💬</span>
                <div>
                  <p className="font-extrabold text-gray-900 mb-1">Chat trực tiếp</p>
                  <button className="px-4 py-2 bg-[#185FA5] hover:bg-[#0C447C] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap">
                    Chat với nhân viên
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Back Button */}
        <div className="flex justify-center pt-4">
          <button 
            onClick={onGoToConsult}
            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 hover:text-[#185FA5] hover:border-blue-200 text-sm font-bold rounded-2xl transition-all shadow-sm active:scale-95 flex items-center gap-2"
          >
            <span>←</span>
            Quay về tư vấn
          </button>
        </div>
      </div>
    </div>
  );
}

